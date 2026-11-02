"""Remove status column from users

Revision ID: 7a8b9c0d1e2f
Revises: 55fa8b045be4
Create Date: 2026-11-01 19:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, Sequence[str], None] = '55fa8b045be4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: drop status column from users."""
    op.drop_column('users', 'status')


def downgrade() -> None:
    """Downgrade schema: re-add status column to users."""
    op.add_column('users', sa.Column('status', sa.String(), nullable=True))

