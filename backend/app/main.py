from fastapi import FastAPI


app = FastAPI(
    title="AI Courtroom API",
    description="Backend API for the AI Courtroom project.",
    version="0.1.0",
)


@app.get("/")
def read_root() -> dict[str, str]:
    """Provide a friendly starting response for the API."""
    return {"message": "Welcome to the AI Courtroom API"}


@app.get("/health")
def read_health() -> dict[str, str]:
    """Confirm that the backend server is running."""
    return {"status": "ok"}
