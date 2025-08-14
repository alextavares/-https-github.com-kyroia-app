import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET!;

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !MERCADOPAGO_WEBHOOK_SECRET) return false;
  const hmac = crypto
    .createHmac("sha256", MERCADOPAGO_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

// Proxy route for compatibility - all webhook traffic is handled by the canonical route
// This exists only to maintain backward compatibility with existing integrations and tests
// The canonical implementation is at /api/mercadopago/webhook/route.ts

export { POST } from "@/app/api/mercadopago/webhook/route"