import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { put } from "@vercel/blob";
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 500 },
    );
  }

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

  const filename = `products/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${detected.ext}`;

  try {
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: detected.mime,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Blob upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
