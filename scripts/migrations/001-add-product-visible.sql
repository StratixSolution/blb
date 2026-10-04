-- Migration 001: Add `visible` column to products (Show / Hide on site)
--
-- Run directly on Turso:
--   turso db shell <db-name> < scripts/migrations/001-add-product-visible.sql
--
-- Note: SQLite ALTER TABLE ADD COLUMN is not idempotent. If this column may
-- already exist, check first:
--   turso db shell <db-name> "SELECT name FROM pragma_table_info('products') WHERE name='visible';"
-- and only run the ALTER if it returns nothing.

ALTER TABLE products ADD COLUMN visible INTEGER NOT NULL DEFAULT 1;
