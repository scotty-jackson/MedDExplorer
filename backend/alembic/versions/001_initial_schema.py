"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create drug_classes table
    op.create_table(
        'drug_classes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_drug_classes_id', 'drug_classes', ['id'], unique=False)
    op.create_index('ix_drug_classes_name', 'drug_classes', ['name'], unique=True)

    # Create drugs table
    op.create_table(
        'drugs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('generic_name', sa.String(length=500), nullable=False),
        sa.Column('brand_name', sa.String(length=500), nullable=True),
        sa.Column('ndc', sa.String(length=50), nullable=True),
        sa.Column('hcpcs_code', sa.String(length=50), nullable=True),
        sa.Column('drug_class_id', sa.Integer(), nullable=True),
        sa.Column('slug', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['drug_class_id'], ['drug_classes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_drugs_id', 'drugs', ['id'], unique=False)
    op.create_index('ix_drugs_generic_name', 'drugs', ['generic_name'], unique=False)
    op.create_index('ix_drugs_brand_name', 'drugs', ['brand_name'], unique=False)
    op.create_index('ix_drugs_drug_class_id', 'drugs', ['drug_class_id'], unique=False)
    op.create_index('ix_drugs_slug', 'drugs', ['slug'], unique=True)

    # Create drug_year_stats table
    op.create_table(
        'drug_year_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('drug_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('total_spending', sa.Float(), nullable=False),
        sa.Column('total_claims', sa.Integer(), nullable=False),
        sa.Column('beneficiaries_count', sa.Integer(), nullable=True),
        sa.Column('spending_per_claim', sa.Float(), nullable=True),
        sa.Column('spending_per_beneficiary', sa.Float(), nullable=True),
        sa.Column('yoy_spending_growth', sa.Float(), nullable=True),
        sa.Column('yoy_beneficiary_growth', sa.Float(), nullable=True),
        sa.Column('yoy_claims_growth', sa.Float(), nullable=True),
        sa.Column('avg_cost_per_unit', sa.Float(), nullable=True),
        sa.Column('total_dosage_units', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['drug_id'], ['drugs.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('drug_id', 'year', name='uq_drug_year')
    )
    op.create_index('ix_drug_year_stats_id', 'drug_year_stats', ['id'], unique=False)
    op.create_index('ix_drug_year_stats_drug_id', 'drug_year_stats', ['drug_id'], unique=False)
    op.create_index('ix_drug_year_stats_year', 'drug_year_stats', ['year'], unique=False)
    op.create_index('idx_year_stats_year_spending', 'drug_year_stats', ['year', sa.text('total_spending DESC')], unique=False)
    op.create_index('idx_year_stats_year_growth', 'drug_year_stats', ['year', sa.text('yoy_spending_growth DESC')], unique=False)
    op.create_index('idx_year_stats_drug_year', 'drug_year_stats', ['drug_id', 'year'], unique=False)

    # Enable pg_trgm extension for fuzzy text search (PostgreSQL only)
    # This is optional but recommended for better search performance
    try:
        op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    except Exception:
        # If extension creation fails (e.g., insufficient permissions), continue
        pass


def downgrade() -> None:
    op.drop_table('drug_year_stats')
    op.drop_table('drugs')
    op.drop_table('drug_classes')
