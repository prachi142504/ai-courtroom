from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseResponse
from app.services.ai_service import analyze_case

router = APIRouter(
    prefix="/cases",
    tags=["Cases"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=CaseResponse)
def create_case(
    case: CaseCreate,
    db: Session = Depends(get_db),
):
    new_case = Case(
        situation=case.situation
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return new_case


@router.get("/")
def get_cases(db: Session = Depends(get_db)):
    return db.query(Case).all()


@router.post("/{case_id}/analyze", response_model=CaseResponse)
def analyze_existing_case(
    case_id: int,
    db: Session = Depends(get_db),
):
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    try:
        result = analyze_case(case.situation)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(exc)}",
        )

    case.legal_issue = result.get("legal_issue")
    case.claimant_arguments = result.get("claimant_arguments", [])
    case.respondent_arguments = result.get("respondent_arguments", [])
    case.evidence = result.get("evidence", [])
    case.reasoning = result.get("reasoning")
    case.verdict = result.get("verdict")

    db.commit()
    db.refresh(case)

    return case