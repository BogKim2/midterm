"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('google_id', sa.String(255), nullable=False, unique=True),
        sa.Column('display_name', sa.String(255)),
        sa.Column('avatar_url', sa.String),
        sa.Column('is_admin', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_google_id', 'users', ['google_id'])

    op.create_table(
        'refresh_tokens',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_token_hash', 'refresh_tokens', ['token_hash'])

    op.create_table(
        'refrigerators',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('name', sa.String(255), default='내 냉장고'),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    op.create_table(
        'ingredients',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('refrigerator_id', UUID(as_uuid=True), sa.ForeignKey('refrigerators.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('original_name', sa.String(255)),
        sa.Column('quantity', sa.Numeric(10, 2)),
        sa.Column('unit', sa.String(50)),
        sa.Column('expiry_date', sa.Date),
        sa.Column('category', sa.String(50), default='other'),
        sa.Column('source', sa.String(50), default='manual'),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_ingredients_refrigerator_id', 'ingredients', ['refrigerator_id'])

    op.create_table(
        'monthly_usage',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('year_month', sa.String(7), nullable=False),
        sa.Column('feature', sa.String(50), nullable=False),
        sa.Column('usage_count', sa.Integer, default=0),
        sa.Column('limit_count', sa.Integer, default=5),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.UniqueConstraint('user_id', 'year_month', 'feature', name='uq_user_year_month_feature'),
    )
    op.create_index('ix_monthly_usage_user_id', 'monthly_usage', ['user_id'])


def downgrade() -> None:
    op.drop_table('monthly_usage')
    op.drop_table('ingredients')
    op.drop_table('refrigerators')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
