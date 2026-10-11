-- Migration 002: Ground coffee selectable options (Weight + Brewing Equipment)
--
-- Adds:
--   products.weight_options            JSON array of {label, price} weight variants
--   products.brewing_equipment_options JSON array of brewing-equipment strings
--   order_items.selected_weight        chosen weight variant label (per line)
--   order_items.brewing_equipment      chosen brewing equipment (per line)
--
-- These power the admin-configurable Weight + Brewing Equipment dropdowns shown
-- for ground-coffee products. The selected weight variant's price is reflected
-- in order_items.price, so no separate price column is stored here.
--
-- Run directly on Turso:
--   turso db shell <db-name> < scripts/migrations/002-add-ground-coffee-options.sql
--
-- Note: SQLite ALTER TABLE ADD COLUMN is not idempotent. If a column may already
-- exist, check first and only run the ALTER if it returns nothing, e.g.:
--   turso db shell <db-name> \
--     "SELECT name FROM pragma_table_info('products') WHERE name='weight_options';"

ALTER TABLE products ADD COLUMN weight_options TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN brewing_equipment_options TEXT NOT NULL DEFAULT '[]';

ALTER TABLE order_items ADD COLUMN selected_weight TEXT;
ALTER TABLE order_items ADD COLUMN brewing_equipment TEXT;
