# AI Courtroom

AI Courtroom is a fun web application where someone submits an everyday personal situation and receives a fictional courtroom-style response. Future versions will include a prosecutor, a defense lawyer, and a judge, but this first milestone creates only the project foundation.

## Current status

Milestone 2A is complete: the FastAPI backend can be configured to test a connection to the local PostgreSQL database. There are no database tables, migrations, AI features, authentication, frontend application, or deployment configuration yet.

## Technology stack

- **Frontend:** Next.js, TypeScript, and Tailwind CSS (not initialized yet)
- **Backend:** Python and FastAPI
- **Database:** PostgreSQL and SQLAlchemy
- **Migrations:** Alembic (planned for a later milestone)
- **AI:** An external AI API called only by the backend (planned for a later milestone)

## Database connection

PostgreSQL is the database that will store completed courtroom cases in a later milestone. SQLAlchemy is the Python library that lets the backend connect to PostgreSQL using Python code. This milestone only tests the connection; it does not create tables.

`DATABASE_URL` is the connection address used by the backend. It identifies the database type, PostgreSQL username, password, server address, port, and database name. Keep it in the untracked `backend/.env` file, never in Git.

```text
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@localhost:5432/ai_courtroom
```

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

Create your local configuration file from the safe template:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace `USERNAME` and `PASSWORD` with your PostgreSQL login details. Do not commit this file.

Install the dependencies and start the FastAPI development server:

```powershell
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

The server runs at `http://127.0.0.1:8000`.

## Available endpoints

- `GET /` returns a welcome message from the backend.
- `GET /health` returns `{"status": "ok"}` to confirm that the backend is running.
- `GET /health/db` opens a connection and runs `SELECT 1` to confirm PostgreSQL is reachable.
- `GET /docs` opens FastAPI's automatic interactive API documentation.
