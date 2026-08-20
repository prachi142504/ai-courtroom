from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    situation: str


class CaseResponse(BaseModel):
    id: int
    situation: str

    legal_issue: str | None = None
    claimant_arguments: str | None = None
    respondent_arguments: str | None = None
    evidence: str | None = None
    reasoning: str | None = None
    arguments: str | None = None
    verdict: str | None = None
    verdict_explanation: str | None = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)