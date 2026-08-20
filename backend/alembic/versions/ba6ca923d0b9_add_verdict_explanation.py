"""add verdict explanation

Revision ID: ba6ca923d0b9
Revises: b2f660eed053
Create Date: 2026-08-20 10:30:45.485924

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ba6ca923d0b9"
down_revision: Union[str, Sequence[str], None] = "b2f660eed053"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "cases",
        sa.Column(
            "verdict_explanation",
            sa.Text(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "cases",
        "verdict_explanation",
    )