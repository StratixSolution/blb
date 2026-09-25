#!/usr/bin/env python3
"""
BLB WordPress -> Next.js full order migration workflow.

Accepts either a .wpress archive or a raw database.sql dump.
When given a .wpress file the SQL is extracted automatically.

Steps performed:
  1. Extract database.sql from .wpress (if needed)
  2. Backup local.db with a timestamp suffix
  3. Parse orders, addresses, line items, and coupons from the SQL dump
  4. Clear existing orders / order_items / order_notes / customers / pending_orders
  5. Insert migrated data preserving original WC order IDs as order numbers
  6. Print a verification summary

Order numbers:
  Imported WC orders keep their original WooCommerce order ID (e.g. "215") as
  the order_number. New orders placed via the Next.js app will use BLB_YYMMNN.

Usage:
    python3 scripts/migrate-wp-orders.py <file.wpress|database.sql> [options]

Options:
    --db       Path to local.db  (default: ../local.db relative to this script)
    --dry-run  Parse and summarise without touching the database
    --no-backup  Skip the database backup step

WooCommerce -> BLB status mapping:
    wc-completed  -> delivered
    wc-processing -> processing
    wc-pending    -> pending
    wc-on-hold    -> pending
    wc-cancelled  -> cancelled
    wc-failed     -> cancelled
    wc-refunded   -> cancelled
"""

import sys, os, shutil, argparse, sqlite3
from datetime import datetime
from collections import defaultdict

# ── Constants ───────────────────────────────────────────────────────────────────

STATUS_MAP = {
    "wc-completed":  "delivered",
    "wc-processing": "pending",     # confirmed order, not yet acted on in BLB
    "wc-pending":    "processing",  # payment awaited but seller acting on it
    "wc-on-hold":    "pending",
    "wc-cancelled":  "cancelled",
    "wc-failed":     "cancelled",
    "wc-refunded":   "cancelled",
}

# ── .wpress extraction (mirrors extract-wpress.py) ─────────────────────────────

_HEADER_SIZE = 4096
_CHUNK       = 256 * 1024


def _extract_sql_from_wpress(wpress_path: str, out_path: str) -> str:
    """Extract database.sql from a .wpress archive into out_path. Returns out_path."""
    needle = b'database.sql'
    overlap = len(needle) - 1

    header_offset = None
    file_size     = None

    print(f"Scanning .wpress file for database.sql …")
    with open(wpress_path, 'rb') as f:
        offset   = 0
        leftover = b''
        while True:
            chunk = f.read(_CHUNK)
            if not chunk:
                break
            buf = leftover + chunk
            idx = buf.find(needle)
            if idx != -1:
                abs_pos = offset - len(leftover) + idx
                f.seek(abs_pos)
                header = f.read(_HEADER_SIZE)
                if len(header) < _HEADER_SIZE:
                    break
                name = header[:255].rstrip(b'\x00').decode('utf-8', errors='replace')
                size_raw = header[255:269].rstrip(b'\x00').decode('ascii', errors='replace').strip()
                if name == 'database.sql' and size_raw.isdigit():
                    header_offset = abs_pos
                    file_size     = int(size_raw)
                    break
            leftover = buf[-overlap:]
            offset  += len(chunk)

    if header_offset is None:
        sys.exit("ERROR: database.sql not found inside .wpress archive")

    print(f"  Found at byte {header_offset:,}  ({file_size / 1024 / 1024:.1f} MB)")

    data_offset = header_offset + _HEADER_SIZE
    with open(wpress_path, 'rb') as src, open(out_path, 'wb') as dst:
        src.seek(data_offset)
        # Strip leading null bytes + optional 8-char hex hash
        prefix = src.read(min(512, file_size))
        start  = 0
        for i, b in enumerate(prefix):
            if b == 0 or b == 0x20:
                continue
            seg = prefix[i:]
            if len(seg) >= 10 and seg[8:10] == b'--':
                try:
                    int(seg[:8], 16)
                    start = i + 8
                except ValueError:
                    start = i
            else:
                start = i
            break
        dst.write(prefix[start:])
        remaining = file_size - len(prefix)
        while remaining > 0:
            chunk = src.read(min(_CHUNK, remaining))
            if not chunk:
                break
            dst.write(chunk)
            remaining -= len(chunk)

    print(f"  Extracted -> {out_path}")
    return out_path


# ── SQL dump parser ─────────────────────────────────────────────────────────────

def _parse_value_token(s: str, pos: int):
    while pos < len(s) and s[pos] in (' ', '\t'):
        pos += 1
    if pos >= len(s):
        return None, pos
    if s[pos:pos+4] == 'NULL':
        return None, pos + 4
    if s[pos] == "'":
        pos += 1
        buf = []
        while pos < len(s):
            ch = s[pos]
            if ch == '\\':
                pos += 1
                esc = {'n': '\n', 'r': '\r', 't': '\t', "'": "'",
                       '"': '"', '\\': '\\', '0': '\x00', 'Z': '\x1a'}
                buf.append(esc.get(s[pos], s[pos]))
                pos += 1
            elif ch == "'":
                pos += 1
                if pos < len(s) and s[pos] == "'":
                    buf.append("'")
                    pos += 1
                else:
                    break
            else:
                buf.append(ch)
                pos += 1
        return ''.join(buf), pos
    end = pos
    while end < len(s) and s[end] not in (',', ')'):
        end += 1
    raw = s[pos:end].strip()
    if '.' in raw:
        try:
            return float(raw), end
        except ValueError:
            pass
    try:
        return int(raw), end
    except ValueError:
        return raw, end


def _parse_row(s: str) -> list:
    s = s.strip().lstrip('(').rstrip(')')
    tokens, pos = [], 0
    while pos < len(s):
        while pos < len(s) and s[pos] in (' ', '\t', '\n'):
            pos += 1
        if pos >= len(s):
            break
        val, pos = _parse_value_token(s, pos)
        tokens.append(val)
        while pos < len(s) and s[pos] in (' ', '\t'):
            pos += 1
        if pos < len(s) and s[pos] == ',':
            pos += 1
    return tokens


def parse_table(sql_path: str, table: str) -> list[list]:
    """Return all rows inserted into `table` from the SQL dump."""
    prefix = f"INSERT INTO `{table}` VALUES"
    rows   = []
    with open(sql_path, 'r', errors='replace') as f:
        for line in f:
            line = line.rstrip('\n')
            if not line.startswith(prefix):
                continue
            values_part = line[len(prefix):].strip().rstrip(';').strip()
            depth, start = 0, None
            for i, ch in enumerate(values_part):
                if ch == '(' and depth == 0:
                    depth, start = 1, i
                elif ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                    if depth == 0 and start is not None:
                        rows.append(_parse_row(values_part[start:i+1]))
                        start = None
    return rows


# ── WordPress site path -> SQL dump via direct MySQL ───────────────────────────

def _dump_from_wp_path(wp_path: str, out_path: str) -> str:
    """
    Dump the WooCommerce tables from a Local by Flywheel WordPress site
    into a SQL file by querying MySQL directly.
    Returns out_path.
    """
    try:
        import mysql.connector  # type: ignore
    except ImportError:
        sys.exit("ERROR: mysql-connector-python not installed.\n"
                 "Run: pip3 install mysql-connector-python")

    # Read wp-config.php for DB credentials
    config_path = os.path.join(wp_path, 'wp-config.php')
    if not os.path.exists(config_path):
        sys.exit(f"ERROR: wp-config.php not found at {config_path}")

    import re
    config_text = open(config_path).read()

    def get_const(name):
        m = re.search(rf"define\s*\(\s*['\"]DB_{name}['\"]\s*,\s*['\"]([^'\"]*)['\"]", config_text)
        return m.group(1) if m else None

    db_host   = get_const('HOST') or '127.0.0.1'
    db_name   = get_const('NAME') or 'local'
    db_user   = get_const('USER') or 'root'
    db_pass   = get_const('PASSWORD') or 'root'
    db_prefix = re.search(r"\$table_prefix\s*=\s*['\"]([^'\"]+)['\"]", config_text)
    db_prefix = db_prefix.group(1) if db_prefix else 'wp_'

    # Local by Flywheel uses a socket
    socket_path = None
    if 'localhost' in db_host or '127.0.0.1' in db_host:
        import glob
        sockets = glob.glob('/Users/*/Library/Application Support/Local/run/*/mysql/mysqld.sock')
        if sockets:
            socket_path = sockets[0]

    print(f"Connecting to MySQL  db={db_name}  prefix={db_prefix} …")
    conn_args = dict(database=db_name, user=db_user, password=db_pass)
    if socket_path:
        conn_args['unix_socket'] = socket_path
    else:
        conn_args['host'] = db_host

    try:
        cnx = mysql.connector.connect(**conn_args)
    except Exception as e:
        sys.exit(f"ERROR: MySQL connection failed: {e}")

    tables = [
        f"{db_prefix}wc_orders",
        f"{db_prefix}wc_order_addresses",
        f"{db_prefix}woocommerce_order_items",
        f"{db_prefix}woocommerce_order_itemmeta",
    ]

    with open(out_path, 'w') as f:
        cur = cnx.cursor()
        for tbl in tables:
            # Use SERVMASK_PREFIX_ so existing parse_table works unchanged
            bare = tbl[len(db_prefix):]
            servmask_name = f"SERVMASK_PREFIX_{bare}"
            try:
                cur.execute(f"SELECT * FROM `{tbl}`")
                rows = cur.fetchall()
                if not rows:
                    continue
                cols = [d[0] for d in cur.description]
                for row in rows:
                    vals = []
                    for v in row:
                        if v is None:
                            vals.append('NULL')
                        elif isinstance(v, (int, float)):
                            vals.append(str(v))
                        else:
                            escaped = str(v).replace('\\', '\\\\').replace("'", "\\'")
                            vals.append(f"'{escaped}'")
                    f.write(f"INSERT INTO `{servmask_name}` VALUES ({','.join(vals)});\n")
                print(f"  {tbl}: {len(rows)} rows")
            except Exception as e:
                print(f"  WARNING: could not read {tbl}: {e}")
        cur.close()
    cnx.close()
    print(f"  Dumped -> {out_path}")
    return out_path


# ── Migration ───────────────────────────────────────────────────────────────────

def migrate(sql_path: str, db_path: str, dry_run: bool):

    # wc_orders column indices
    WCO  = dict(id=0, status=1, currency=2, type=3, tax_amount=4,
                total_amount=5, customer_id=6, billing_email=7,
                date_created_gmt=8, date_updated_gmt=9, parent_order_id=10,
                payment_method=11, payment_method_title=12, transaction_id=13,
                ip_address=14, user_agent=15, customer_note=16)

    # wc_order_addresses column indices
    WCOA = dict(id=0, order_id=1, address_type=2, first_name=3, last_name=4,
                company=5, address_1=6, address_2=7, city=8, state=9,
                postcode=10, country=11, email=12, phone=13)

    print("\nParsing tables from SQL dump …")
    raw_orders  = parse_table(sql_path, "SERVMASK_PREFIX_wc_orders")
    raw_addr    = parse_table(sql_path, "SERVMASK_PREFIX_wc_order_addresses")
    raw_items   = parse_table(sql_path, "SERVMASK_PREFIX_woocommerce_order_items")
    raw_meta    = parse_table(sql_path, "SERVMASK_PREFIX_woocommerce_order_itemmeta")
    print(f"  {len(raw_orders)} orders | {len(raw_addr)} address rows | "
          f"{len(raw_items)} item rows | {len(raw_meta)} itemmeta rows")

    # Build billing address lookup
    billing: dict[int, dict] = {}
    for row in raw_addr:
        if row[WCOA['address_type']] == 'billing':
            oid = int(row[WCOA['order_id']])
            billing[oid] = {k: (row[WCOA[k]] or '') for k in
                            ('first_name','last_name','address_1','address_2',
                             'city','state','postcode','email','phone')}

    # Build item meta lookup
    item_meta: dict[int, dict] = defaultdict(dict)
    for row in raw_meta:
        iid, key, val = int(row[1]), row[2], row[3]
        if key:
            item_meta[iid][key] = val

    # Build per-order line items and coupon info
    order_line_items: dict[int, list]  = defaultdict(list)
    order_coupons:    dict[int, tuple] = {}

    for row in raw_items:
        iid, name, itype, oid = int(row[0]), row[1] or '', row[2] or '', int(row[3])
        meta = item_meta.get(iid, {})

        if itype == 'line_item':
            qty        = int(float(meta.get('_qty',         1) or 1))
            line_total = float(meta.get('_line_total', 0) or 0)
            unit_price = round(line_total / qty, 2) if qty else line_total
            order_line_items[oid].append({
                'productName': name,
                'wpProductId': int(meta.get('_product_id', 0) or 0),
                'price':       unit_price,
                'quantity':    qty,
            })

        elif itype == 'coupon':
            disc = float(meta.get('discount_amount', 0) or 0)
            if oid in order_coupons:
                c, d = order_coupons[oid]
                order_coupons[oid] = (c, d + disc)
            else:
                order_coupons[oid] = (name, disc)

    # Filter to top-level shop_orders only
    shop_orders = [
        r for r in raw_orders
        if r[WCO['type']] == 'shop_order' and (r[WCO['parent_order_id']] or 0) == 0
    ]
    shop_orders.sort(key=lambda r: r[WCO['date_created_gmt']] or '1970-01-01')

    print(f"\n  {len(shop_orders)} top-level shop orders to migrate")
    status_counts: dict[str, int] = defaultdict(int)
    for r in shop_orders:
        wc  = r[WCO['status']] or 'unknown'
        blb = STATUS_MAP.get(wc, 'pending')
        status_counts[f"{wc} -> {blb}"] += 1
    print("\nStatus mapping:")
    for k, v in sorted(status_counts.items()):
        print(f"  {k}: {v}")

    if dry_run:
        print("\n[DRY RUN] No changes written.")
        return

    # Load product name -> id map
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur  = conn.cursor()
    cur.execute("SELECT id, name FROM products")
    product_map = {p['name'].lower().strip(): p['id'] for p in cur.fetchall()}

    def lookup_product(name: str) -> int:
        return product_map.get(name.lower().strip(), 0)

    # Clear existing transactional data
    print("\nClearing existing orders, order_items, order_notes, customers, pending_orders …")
    for tbl in ('order_notes', 'order_items', 'orders', 'customers', 'pending_orders'):
        cur.execute(f"DELETE FROM {tbl}")
    conn.commit()

    # Insert
    inserted_orders = inserted_items = skipped = 0
    customer_stats: dict[str, dict] = {}

    for row in shop_orders:
        wc_id        = int(row[WCO['id']])
        blb_id       = f"wc_{wc_id}"
        status       = STATUS_MAP.get(row[WCO['status']] or '', 'pending')
        total        = float(row[WCO['total_amount']] or 0)
        created      = str(row[WCO['date_created_gmt']] or datetime.utcnow().isoformat())
        txn          = row[WCO['transaction_id']] or ''
        payment_id   = txn if txn else f"wc_txn_{wc_id}"
        order_number = f"WP-{wc_id}"  # preserve original WC order number with WP prefix

        addr    = billing.get(wc_id, {})
        name    = f"{addr.get('first_name','')} {addr.get('last_name','')}".strip() or 'Unknown'
        email   = addr.get('email') or row[WCO['billing_email']] or ''
        phone   = addr.get('phone', '')
        address = ', '.join(filter(None, [addr.get('address_1',''), addr.get('address_2','')]))
        city    = addr.get('city', '')
        state   = addr.get('state', '')
        pincode = addr.get('postcode', '')

        coupon_code, discount = order_coupons.get(wc_id, (None, 0))
        line_items = order_line_items.get(wc_id, [])

        if not line_items:
            skipped += 1
            continue

        try:
            cur.execute(
                """INSERT INTO orders
                   (id, payment_id, status, order_number,
                    customer_name, customer_email, customer_phone,
                    address, city, state, pincode,
                    total, discount, coupon_code, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (blb_id, payment_id, status, order_number,
                 name, email, phone, address, city, state, pincode,
                 total, round(discount, 2), coupon_code, created)
            )
        except sqlite3.IntegrityError as e:
            print(f"  SKIP order wc_{wc_id}: {e}")
            skipped += 1
            continue

        for item in line_items:
            cur.execute(
                """INSERT INTO order_items
                   (order_id, product_id, product_name, price, quantity)
                   VALUES (?,?,?,?,?)""",
                (blb_id, lookup_product(item['productName']),
                 item['productName'], item['price'], item['quantity'])
            )
            inserted_items += 1

        inserted_orders += 1

        if email:
            if email not in customer_stats:
                customer_stats[email] = dict(
                    name=name, phone=phone, address=address,
                    city=city, state=state, pincode=pincode,
                    count=0, spend=0.0, last_at=created
                )
            cs = customer_stats[email]
            cs['count'] += 1
            cs['spend']  = round(cs['spend'] + total, 2)
            if created > cs['last_at']:
                cs.update(last_at=created, name=name, phone=phone,
                          address=address, city=city, state=state, pincode=pincode)

    conn.commit()

    for email, cs in customer_stats.items():
        try:
            cur.execute(
                """INSERT INTO customers
                   (name, email, phone, address, city, state, pincode,
                    order_count, total_spend, last_order_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (cs['name'], email, cs['phone'], cs['address'],
                 cs['city'], cs['state'], cs['pincode'],
                 cs['count'], cs['spend'], cs['last_at'])
            )
        except sqlite3.IntegrityError as e:
            print(f"  SKIP customer {email}: {e}")

    conn.commit()
    conn.close()

    # ── Verification summary ────────────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("VERIFICATION")
    print("─" * 50)
    conn2 = sqlite3.connect(db_path)
    conn2.row_factory = sqlite3.Row
    cur2  = conn2.cursor()

    cur2.execute("SELECT status, COUNT(*) as cnt FROM orders GROUP BY status ORDER BY cnt DESC")
    rows = cur2.fetchall()
    total_orders = sum(r['cnt'] for r in rows)
    print(f"Orders ({total_orders} total):")
    for r in rows:
        print(f"  {r['status']:<12} {r['cnt']}")

    cur2.execute("SELECT COUNT(*) as n FROM order_items")
    print(f"Order items:   {cur2.fetchone()['n']}")

    cur2.execute("SELECT COUNT(*) as n FROM customers")
    print(f"Customers:     {cur2.fetchone()['n']}")

    cur2.execute("SELECT order_number, customer_name, status, total FROM orders ORDER BY created_at LIMIT 5")
    print("\nEarliest 5 orders:")
    for r in cur2.fetchall():
        print(f"  {r['order_number']}  {r['customer_name']:<25} {r['status']:<12} ₹{r['total']}")

    cur2.execute("SELECT order_number, customer_name, status, total FROM orders ORDER BY created_at DESC LIMIT 5")
    print("\nLatest 5 orders:")
    for r in cur2.fetchall():
        print(f"  {r['order_number']}  {r['customer_name']:<25} {r['status']:<12} ₹{r['total']}")

    conn2.close()
    print("─" * 50)
    if skipped:
        print(f"Skipped {skipped} orders (no line items or duplicate ID)")


# ── Entry point ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Full BLB WP -> Next.js order migration workflow'
    )
    parser.add_argument('source',
                        help='Path to .wpress archive, database.sql dump, or WordPress site root (wp-config.php directory)')
    parser.add_argument('--db', default=None,
                        help='Path to local.db (default: next to this script\'s parent)')
    parser.add_argument('--dry-run',    action='store_true',
                        help='Summarise without writing to DB')
    parser.add_argument('--no-backup',  action='store_true',
                        help='Skip database backup')
    args = parser.parse_args()

    source  = os.path.abspath(args.source)
    scripts = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(args.db) if args.db else os.path.join(scripts, '..', 'local.db')

    if not os.path.exists(source):
        sys.exit(f"ERROR: Source file not found: {source}")
    if not os.path.exists(db_path):
        sys.exit(f"ERROR: Database not found: {db_path}")

    print(f"Source:   {source}")
    print(f"Database: {db_path}")

    # Step 1 — Resolve source to a SQL dump
    import tempfile
    if source.endswith('.wpress'):
        tmp_dir  = tempfile.mkdtemp(prefix='blb_migration_')
        sql_path = os.path.join(tmp_dir, 'database.sql')
        _extract_sql_from_wpress(source, sql_path)
    elif os.path.isdir(source) and os.path.exists(os.path.join(source, 'wp-config.php')):
        tmp_dir  = tempfile.mkdtemp(prefix='blb_migration_')
        sql_path = os.path.join(tmp_dir, 'database.sql')
        _dump_from_wp_path(source, sql_path)
    else:
        sql_path = source

    # Step 2 — Backup
    if not args.dry_run and not args.no_backup:
        stamp   = datetime.now().strftime('%Y%m%d-%H%M%S')
        backup  = f"{db_path}.backup-{stamp}"
        shutil.copy2(db_path, backup)
        print(f"\nBackup:   {backup}")

    # Step 3-6 — Migrate + verify
    migrate(sql_path, db_path, args.dry_run)


if __name__ == '__main__':
    main()
