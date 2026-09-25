#!/usr/bin/env python3
"""
Extract a file from an AI1WM .wpress archive.

The .wpress format is a custom streaming archive where each entry has a
4096-byte header (filename in first 255 bytes, file size in next 14 bytes)
followed immediately by the raw file data.

Usage:
    python3 scripts/extract-wpress.py <file.wpress> [<entry-name>] [--out <output-path>]

    entry-name defaults to "database.sql"

Examples:
    # Extract the SQL dump (default)
    python3 scripts/extract-wpress.py backup.wpress

    # Extract to a specific path
    python3 scripts/extract-wpress.py backup.wpress database.sql --out /tmp/dump.sql
"""

import sys, os, argparse

HEADER_SIZE  = 4096
NAME_FIELD   = 255   # bytes 0-254
SIZE_FIELD   = 14    # bytes 255-268
CHUNK        = 256 * 1024  # 256 KB read chunks


def find_entry(wpress_path: str, entry_name: str) -> tuple[int, int]:
    """
    Scan the .wpress file for an entry whose filename matches entry_name.
    Returns (header_offset, file_size).
    Raises FileNotFoundError if not found.
    """
    needle = entry_name.encode()
    overlap = len(needle) - 1

    with open(wpress_path, 'rb') as f:
        offset = 0
        leftover = b''
        while True:
            chunk = f.read(CHUNK)
            if not chunk:
                break
            buf = leftover + chunk
            idx = buf.find(needle)
            if idx != -1:
                abs_pos = offset - len(leftover) + idx
                # Read the full header starting at abs_pos
                f.seek(abs_pos)
                header = f.read(HEADER_SIZE)
                if len(header) < HEADER_SIZE:
                    break
                name = header[:NAME_FIELD].rstrip(b'\x00').decode('utf-8', errors='replace')
                size_raw = header[NAME_FIELD:NAME_FIELD + SIZE_FIELD].rstrip(b'\x00').decode('ascii', errors='replace').strip()
                if name == entry_name and size_raw.isdigit():
                    return abs_pos, int(size_raw)
                # Partial match inside content - keep scanning
            leftover = buf[-overlap:] if overlap > 0 else b''
            offset += len(chunk)

    raise FileNotFoundError(f"Entry '{entry_name}' not found in {wpress_path}")


def extract_entry(wpress_path: str, header_offset: int, file_size: int, out_path: str) -> int:
    """
    Extract file_size bytes starting at header_offset + HEADER_SIZE,
    stripping any leading null/hash prefix (AI1WM internal overhead).
    Returns the number of bytes written.
    """
    data_offset = header_offset + HEADER_SIZE

    with open(wpress_path, 'rb') as src, open(out_path, 'wb') as dst:
        src.seek(data_offset)

        # Skip leading null bytes and optional 8-char hex hash
        prefix = src.read(min(512, file_size))
        start = 0
        for i, b in enumerate(prefix):
            if b == 0 or b == 0x20:
                continue
            # Skip 8-char hex hash if present (format: adba0ba3--)
            segment = prefix[i:]
            if len(segment) >= 10 and segment[8:10] == b'--':
                try:
                    int(segment[:8], 16)  # valid hex
                    start = i + 8
                except ValueError:
                    start = i
            else:
                start = i
            break

        # Write the first chunk (after skip) then the rest
        first = prefix[start:]
        dst.write(first)
        written = len(first)

        remaining = file_size - len(prefix)
        while remaining > 0:
            chunk = src.read(min(CHUNK, remaining))
            if not chunk:
                break
            dst.write(chunk)
            written += len(chunk)
            remaining -= len(chunk)

    return written


def main():
    parser = argparse.ArgumentParser(
        description='Extract a file from an AI1WM .wpress archive'
    )
    parser.add_argument('wpress',      help='Path to the .wpress archive')
    parser.add_argument('entry',       nargs='?', default='database.sql',
                        help='Entry to extract (default: database.sql)')
    parser.add_argument('--out', '-o', default=None,
                        help='Output file path (default: <entry> in current dir)')
    args = parser.parse_args()

    wpress_path = os.path.abspath(args.wpress)
    if not os.path.exists(wpress_path):
        sys.exit(f"ERROR: File not found: {wpress_path}")

    out_path = os.path.abspath(args.out) if args.out else os.path.join(os.getcwd(), args.entry)

    print(f"Scanning {os.path.basename(wpress_path)} ({os.path.getsize(wpress_path)/1024/1024:.0f} MB) for '{args.entry}' …")
    header_offset, file_size = find_entry(wpress_path, args.entry)
    print(f"Found at byte {header_offset:,}  ({file_size/1024/1024:.1f} MB)")

    written = extract_entry(wpress_path, header_offset, file_size, out_path)
    print(f"Extracted {written:,} bytes -> {out_path}")
    return out_path


if __name__ == '__main__':
    main()
