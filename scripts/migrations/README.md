# Turso Migrations

Incremental, forward-only SQL migrations to apply on top of an existing Turso
database. `scripts/turso-ddl.sql` is the full, current schema (for fresh DBs);
the files here are the ALTER statements to bring an **existing** DB up to date.

## Naming

`NNN-descriptive-name.sql` — 3-digit zero-padded, dash-separated, lowercase.
Numbers are sequential and never reused.

## Running a migration

```bash
turso db shell <db-name> < scripts/migrations/001-add-product-visible.sql
```

## Rules

- Each migration must be safe to run exactly once, in order.
- `ALTER TABLE ... ADD COLUMN` is **not** idempotent in SQLite. Before running,
  verify the column does not already exist:

  ```bash
  turso db shell <db-name> \
    "SELECT name FROM pragma_table_info('<table>') WHERE name='<column>';"
  ```

  Only run the ALTER if that returns no rows.
- When adding a migration here, also update `scripts/turso-ddl.sql` so the full
  schema stays in sync for fresh databases.

## Applied migrations

| #   | File                            | Description                              |
| --- | ------------------------------- | ---------------------------------------- |
| 001 | `001-add-product-visible.sql`   | Add `visible` column to `products` (Show/Hide on site) |
