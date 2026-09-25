#!/usr/bin/env python3
"""
BLB WordPress -> Next.js order migration script.

Reads an AI1WM .wpress SQL dump and migrates WooCommerce HPOS orders
into the BLB Next.js SQLite database.

Usage:
    python3 scripts/migrate-wp-orders.py <database.sql> [--db <local.db>] [--dry-run]

Status mapping (WC -> BLB):
    wc-completed  -> delivered
    wc-processing -> processing
    wc-pending    -> pending
    wc-on-hold    -> pending
    wc-cancelled  -> cancelled
    wc-failed     -> cancelled
    wc-refunded   -> cancelled
"""

import sys, re, os, sqlite3, argparse
from datetime import datetime
from collections import defaultdict

# ── Config ─────────────────────────────────────────────────────────────────────

STATUS_MAP = {
    "wc-completed":  "delivered",
    "wc-processing": "processing",
    "wc-pending":    "pending",
    "wc-on-hold":    "pending",
    "wc-cancelled":  "cancelled",
    "wc-failed":     "cancelled",
    "wc-refunded":   "cancelled",
}

# ── SQL dump parser ─────────────────────────────────────────────────────────────

def _parse_value_token(s: str, pos: int):
    """Parse one MySQL value token starting at pos. Returns (value, next_pos)."""
    while pos < len(s) and s[pos] in (' ', '\t'):
        pos += 1
    if pos >= len(s):
        return None, pos
    c = s[pos]
    if s[pos:pos+4] == 'NULL':
        return None, pos + 4
    if c == "'":
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
                if pos < len(s) and s[pos] == "'":  # doubled quote
                    buf.append("'")
                    pos += 1
                else:
                    break
            else:
                buf.append(ch)
                pos += 1
        return ''.join(buf), pos
    # number or unquoted
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


def _parse_row(s: str):
    """Parse a VALUES tuple string (val1, 'str', NULL, ...) into a list."""
    s = s.strip()
    if s.startswith('('):
        s = s[1:]
    if s.endswith(')'):
        s = s[:-1]
    tokens = []
    pos = 0
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
    """
    Stream through the SQL file and return all rows inserted into `table`.
    Handles both single-row and multi-row INSERT statements.
    """
    prefix = f"INSERT INTO `{table}` VALUES"
    rows = []
    with open(sql_path, 'r', errors='replace') as f:
        for line in f:
            line = line.rstrip('\n')
            if not line.startswith(prefix):
                continue
            # strip the prefix and trailing semicolon
            values_part = line[len(prefix):].strip().rstrip(';').strip()
            # split multi-row: (...), (...)
            # Walk character by character to split top-level tuples
            depth = 0
            start = None
            for i, ch in enumerate(values_part):
                if ch == '(' and depth == 0:
                    depth = 1
                    start = i
                elif ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                    if depth == 0 and start is not None:
                        rows.append(_parse_row(values_part[start:i+1]))
                        start = None
    return rows


# ── Order number generator ──────────────────────────────────────────────────────

def make_order_numbers(dates: list[str]) -> list[str]:
    """
    Given a list of ISO datetime strings, return BLB_YYMMNN order numbers.
    NN is a zero-padded sequence per month, starting at 01.
    Preserves input order.
    """
    month_seq: dict[str, int] = defaultdict(int)
    result = []
    for d in dates:
        try:
            dt = datetime.fromisoformat(d.replace(' ', 'T'))
        except Exception:
            dt = datetime.utcnow()
        yy = dt.strftime('%y')
        mm = dt.strftime('%m')
        prefix = f"BLB_{yy}{mm}"
        month_seq[prefix] += 1
        result.append(f"{prefix}{month_seq[prefix]:02d}")
    return result


# ── Main migration ──────────────────────────────────────────────────────────────

def migrate(sql_path: str, db_path: str, dry_run: bool):
    print(f"Reading SQL dump: {sql_path}")

    # ── Parse tables ────────────────────────────────────────────────────────────
    print("Parsing wc_orders …")
    raw_orders = parse_table(sql_path, "SERVMASK_PREFIX_wc_orders")
    print(f"  {len(raw_orders)} orders found")

    print("Parsing wc_order_addresses …")
    raw_addresses = parse_table(sql_path, "SERVMASK_PREFIX_wc_order_addresses")

    print("Parsing woocommerce_order_items …")
    raw_items = parse_table(sql_path, "SERVMASK_PREFIX_woocommerce_order_items")

    print("Parsing woocommerce_order_itemmeta …")
    raw_meta = parse_table(sql_path, "SERVMASK_PREFIX_woocommerce_order_itemmeta")

    # ── wc_orders columns:
    # id, status, currency, type, tax_amount, total_amount, customer_id,
    # billing_email, date_created_gmt, date_updated_gmt, parent_order_id,
    # payment_method, payment_method_title, transaction_id, ip_address, user_agent, customer_note
    WCO = {
        'id': 0, 'status': 1, 'currency': 2, 'type': 3, 'tax_amount': 4,
        'total_amount': 5, 'customer_id': 6, 'billing_email': 7,
        'date_created_gmt': 8, 'date_updated_gmt': 9, 'parent_order_id': 10,
        'payment_method': 11, 'payment_method_title': 12, 'transaction_id': 13,
        'ip_address': 14, 'user_agent': 15, 'customer_note': 16,
    }

    # ── wc_order_addresses columns:
    # id, order_id, address_type, first_name, last_name, company,
    # address_1, address_2, city, state, postcode, country, email, phone
    WCOA = {
        'id': 0, 'order_id': 1, 'address_type': 2, 'first_name': 3, 'last_name': 4,
        'company': 5, 'address_1': 6, 'address_2': 7, 'city': 8, 'state': 9,
        'postcode': 10, 'country': 11, 'email': 12, 'phone': 13,
    }

    # ── Build address lookup: order_id -> billing address dict ──────────────────
    billing: dict[int, dict] = {}
    for row in raw_addresses:
        if row[WCOA['address_type']] == 'billing':
            oid = int(row[WCOA['order_id']])
            billing[oid] = {
                'first_name': row[WCOA['first_name']] or '',
                'last_name':  row[WCOA['last_name']]  or '',
                'address_1':  row[WCOA['address_1']]  or '',
                'address_2':  row[WCOA['address_2']]  or '',
                'city':       row[WCOA['city']]       or '',
                'state':      row[WCOA['state']]      or '',
                'postcode':   row[WCOA['postcode']]   or '',
                'email':      row[WCOA['email']]      or '',
                'phone':      row[WCOA['phone']]      or '',
            }

    # ── Build item meta lookup: item_id -> {meta_key: meta_value} ───────────────
    item_meta: dict[int, dict] = defaultdict(dict)
    for row in raw_meta:
        # meta_id, order_item_id, meta_key, meta_value
        item_id  = int(row[1])
        meta_key = row[2]
        meta_val = row[3]
        if meta_key:
            item_meta[item_id][meta_key] = meta_val

    # ── Build per-order items: order_id -> [line items], coupon info ────────────
    order_line_items: dict[int, list] = defaultdict(list)
    order_coupons: dict[int, tuple] = {}  # order_id -> (code, discount)

    for row in raw_items:
        # order_item_id, order_item_name, order_item_type, order_id
        item_id   = int(row[0])
        item_name = row[1] or ''
        item_type = row[2] or ''
        order_id  = int(row[3])

        if item_type == 'line_item':
            meta = item_meta.get(item_id, {})
            qty  = int(float(meta.get('_qty', 1) or 1))
            line_total = float(meta.get('_line_total', 0) or 0)
            unit_price = round(line_total / qty, 2) if qty else line_total
            wp_product_id = int(meta.get('_product_id', 0) or 0)
            order_line_items[order_id].append({
                'productName': item_name,
                'wpProductId': wp_product_id,
                'price':       unit_price,
                'quantity':    qty,
            })

        elif item_type == 'coupon':
            meta = item_meta.get(item_id, {})
            discount = float(meta.get('discount_amount', 0) or 0)
            if order_id not in order_coupons:
                order_coupons[order_id] = (item_name, discount)
            else:
                # multiple coupons: accumulate discount, keep first code
                existing = order_coupons[order_id]
                order_coupons[order_id] = (existing[0], existing[1] + discount)

    # ── Load product name -> id map from our SQLite ─────────────────────────────
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT id, name FROM products")
    product_name_map: dict[str, int] = {}
    for p in cur.fetchall():
        product_name_map[p['name'].lower().strip()] = p['id']

    def lookup_product_id(name: str) -> int:
        return product_name_map.get(name.lower().strip(), 0)

    # ── Filter: only process shop_order type, skip sub-orders ──────────────────
    shop_orders = [
        r for r in raw_orders
        if r[WCO['type']] == 'shop_order' and (r[WCO['parent_order_id']] or 0) == 0
    ]
    print(f"  {len(shop_orders)} top-level shop orders to migrate")

    # ── Sort by created date and generate order numbers ─────────────────────────
    shop_orders.sort(key=lambda r: r[WCO['date_created_gmt']] or '1970-01-01')
    dates = [str(r[WCO['date_created_gmt']] or '1970-01-01') for r in shop_orders]
    order_numbers = make_order_numbers(dates)

    # ── Print summary ────────────────────────────────────────────────────────────
    status_counts: dict[str, int] = defaultdict(int)
    for r in shop_orders:
        wc_status = r[WCO['status']] or 'unknown'
        blb_status = STATUS_MAP.get(wc_status, 'pending')
        status_counts[f"{wc_status} -> {blb_status}"] += 1
    print("\nStatus mapping summary:")
    for k, v in sorted(status_counts.items()):
        print(f"  {k}: {v}")

    if dry_run:
        print("\n[DRY RUN] No changes written to database.")
        conn.close()
        return

    # ── Clear existing data ──────────────────────────────────────────────────────
    print("\nClearing existing orders, order_items, order_notes, customers, pending_orders …")
    cur.execute("DELETE FROM order_notes")
    cur.execute("DELETE FROM order_items")
    cur.execute("DELETE FROM orders")
    cur.execute("DELETE FROM customers")
    cur.execute("DELETE FROM pending_orders")
    conn.commit()

    # ── Insert orders and items ─────────────────────────────────────────────────
    inserted_orders = 0
    inserted_items  = 0
    skipped_orders  = 0
    customer_stats: dict[str, dict] = {}  # email -> {name, phone, address, city, state, pincode, count, spend, last_at}

    for idx, row in enumerate(shop_orders):
        wc_id     = int(row[WCO['id']])
        blb_id    = f"wc_{wc_id}"
        wc_status = row[WCO['status']] or 'wc-pending'
        status    = STATUS_MAP.get(wc_status, 'pending')
        total     = float(row[WCO['total_amount']] or 0)
        created   = str(row[WCO['date_created_gmt']] or datetime.utcnow().isoformat())
        txn_id    = row[WCO['transaction_id']] or ''
        payment_id = txn_id if txn_id else f"wc_txn_{wc_id}"
        order_number = order_numbers[idx]

        addr = billing.get(wc_id, {})
        name = f"{addr.get('first_name', '')} {addr.get('last_name', '')}".strip() or 'Unknown'
        email = addr.get('email') or row[WCO['billing_email']] or ''
        phone = addr.get('phone', '')
        address_1 = addr.get('address_1', '')
        address_2 = addr.get('address_2', '')
        address   = ', '.join(filter(None, [address_1, address_2]))
        city      = addr.get('city', '')
        state     = addr.get('state', '')
        pincode   = addr.get('postcode', '')

        coupon_code, discount = order_coupons.get(wc_id, (None, 0))

        line_items = order_line_items.get(wc_id, [])
        if not line_items:
            skipped_orders += 1
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
                 name, email, phone,
                 address, city, state, pincode,
                 total, round(discount, 2), coupon_code, created)
            )
        except sqlite3.IntegrityError as e:
            print(f"  SKIP order wc_{wc_id}: {e}")
            skipped_orders += 1
            continue

        for item in line_items:
            product_id = lookup_product_id(item['productName'])
            cur.execute(
                """INSERT INTO order_items
                   (order_id, product_id, product_name, price, quantity)
                   VALUES (?,?,?,?,?)""",
                (blb_id, product_id, item['productName'],
                 item['price'], item['quantity'])
            )
            inserted_items += 1

        inserted_orders += 1

        # ── Aggregate customer stats ───────────────────────────────────────────
        if email:
            if email not in customer_stats:
                customer_stats[email] = {
                    'name': name, 'phone': phone,
                    'address': address, 'city': city,
                    'state': state, 'pincode': pincode,
                    'count': 0, 'spend': 0.0, 'last_at': created,
                }
            cs = customer_stats[email]
            cs['count'] += 1
            cs['spend']  = round(cs['spend'] + total, 2)
            if created > cs['last_at']:
                cs['last_at']  = created
                cs['name']     = name
                cs['phone']    = phone
                cs['address']  = address
                cs['city']     = city
                cs['state']    = state
                cs['pincode']  = pincode

    conn.commit()

    # ── Insert customers ─────────────────────────────────────────────────────────
    for email, cs in customer_stats.items():
        try:
            cur.execute(
                """INSERT INTO customers
                   (name, email, phone, address, city, state, pincode,
                    order_count, total_spend, last_order_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (cs['name'], email, cs['phone'],
                 cs['address'], cs['city'], cs['state'], cs['pincode'],
                 cs['count'], cs['spend'], cs['last_at'])
            )
        except sqlite3.IntegrityError as e:
            print(f"  SKIP customer {email}: {e}")

    conn.commit()
    conn.close()

    print(f"\n✓ Inserted {inserted_orders} orders, {inserted_items} line items")
    print(f"✓ Inserted {len(customer_stats)} unique customers")
    if skipped_orders:
        print(f"  Skipped {skipped_orders} orders (no line items or duplicate ID)")


# ── Entry point ─────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Migrate WooCommerce orders to BLB Next.js SQLite DB')
    parser.add_argument('sql', help='Path to the AI1WM database.sql dump')
    parser.add_argument('--db', default=os.path.join(os.path.dirname(__file__), '..', 'local.db'),
                        help='Path to local.db (default: ../local.db relative to this script)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Parse and summarise without writing to DB')
    args = parser.parse_args()

    sql_path = os.path.abspath(args.sql)
    db_path  = os.path.abspath(args.db)

    if not os.path.exists(sql_path):
        sys.exit(f"ERROR: SQL file not found: {sql_path}")
    if not os.path.exists(db_path):
        sys.exit(f"ERROR: DB file not found: {db_path}")

    print(f"Database: {db_path}")
    migrate(sql_path, db_path, args.dry_run)
