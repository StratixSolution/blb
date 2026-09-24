import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

function detectImageType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return { ext: "jpg", mime: "image/jpeg" };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return { ext: "webp", mime: "image/webp" };
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return { ext: "gif", mime: "image/gif" };
  return null;
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) {
    return NextResponse.json({ error: "Invalid image file. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
  }

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${detected.ext}`;
  const dest = path.join(process.cwd(), "public", "images", "products", filename);

  await writeFile(dest, buffer);

  return NextResponse.json({ url: `/images/products/${filename}` });
}
