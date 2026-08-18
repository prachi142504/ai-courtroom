from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.cases import router as cases_router

app = FastAPI(
    title="AI Courtroom",
    description="AI-powered courtroom case analysis system",
    version="1.0.0",
)

# Allow the Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(cases_router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}