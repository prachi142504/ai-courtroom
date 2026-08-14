# AI Courtroom

AI Courtroom is a fun web application where someone submits an everyday personal situation and receives a fictional courtroom-style response. Future versions will include a prosecutor, a defense lawyer, and a judge, but this first milestone creates only the project foundation.

## Current status

Milestone 1 is complete: the project folders and a minimal FastAPI backend are in place. There is no courtroom interface, AI integration, database connection, authentication, or deployment configuration yet.

## Technology stack

- **Frontend:** Next.js, TypeScript, and Tailwind CSS (not initialized yet)
- **Backend:** Python and FastAPI
- **Database:** PostgreSQL, SQLAlchemy, and Alembic (planned for a later milestone)
- **AI:** An external AI API called only by the backend (planned for a later milestone)

## Project structure

```text
ai-courtroom/
├── frontend/              # Reserved for the future Next.js application
├── backend/
│   ├── app/
│   │   ├── api/           # Future API route modules
│   │   ├── schemas/       # Future Pydantic data models
│   │   ├── models/        # Future SQLAlchemy database models
│   │   ├── services/      # Future business and AI logic
│   │   ├── db/            # Future database configuration
│   │   ├── core/          # Future shared application configuration
│   │   └── main.py        # FastAPI application entry point
│   ├── tests/             # Future backend tests
│   ├── .env.example       # Safe configuration template
│   └── requirements.txt   # Python dependencies for this milestone
├── docs/                  # Future project documentation
├── .gitignore
└── README.md
```

## Start the backend

Open PowerShell in the `backend` folder, then create and activate a virtual environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, run this once for the current terminal session and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Install the dependencies and start the FastAPI development server:

```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The server runs at `http://127.0.0.1:8000`.

## Available endpoints

- `GET /` returns a welcome message from the backend.
- `GET /health` returns `{"status": "ok"}` to confirm that the backend is running.
- `GET /docs` opens FastAPI's automatic interactive API documentation.
