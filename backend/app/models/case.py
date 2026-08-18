from datetime import datetime

from sqlalchemy import DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    situation: Mapped[str] = mapped_column(Text, nullable=False)

    legal_issue: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    claimant_arguments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    respondent_arguments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    evidence: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reasoning: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    arguments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    verdict: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )