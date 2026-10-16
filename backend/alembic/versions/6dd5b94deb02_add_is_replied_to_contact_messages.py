"""add_is_replied_to_contact_messages

Revision ID: 6dd5b94deb02
Revises: 22f950e50934
Create Date: 2026-10-16 14:47:13.535455

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dd5b94deb02'
down_revision: Union[str, Sequence[str], None] = '22f950e50934'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    """Adiciona is_replied se a coluna ainda não existir."""
    op.execute("""
        ALTER TABLE contact_messages
        ADD COLUMN IF NOT EXISTS is_replied BOOLEAN NOT NULL DEFAULT FALSE
    """)


def downgrade() -> None:
    """Remove is_replied, se existir."""
    op.execute("""
        ALTER TABLE contact_messages
        DROP COLUMN IF EXISTS is_replied
    """)
