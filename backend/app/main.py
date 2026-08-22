from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.cases import router as cases_router

from app.db.session import Base, engine
from app.models.case import Case


app = FastAPI(
    title="AI Courtroom API",
    description="AI-powered educational case analysis API",
    version="1.0.0",
)

if engine:
    Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-courtroom-2.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------

app.include_router(cases_router)


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Courtroom API",
    }


@app.get("/")
async def root():
    return {
        "message": "AI Courtroom API is running",
        "status": "online",
    }