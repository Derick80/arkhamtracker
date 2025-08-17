// app/api/visitors/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/prisma";

export async function GET() {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitorId")?.value;

  if (!visitorId) {
    // First‐time visitor: assign ID and create record
    visitorId = uuidv4();
    await prisma.visitor.create({
      data: { cookieId: visitorId, firstVisit: new Date() },
    });
  } else {
    // Returning visitor: update timestamp
    await prisma.visitor.update({
      where: { cookieId: visitorId },
      data: { lastVisit: new Date() },
    });
  }

  // Total number of distinct visitors:
  const count = await prisma.visitor.count();
  console.log("Total visitors:", count);
  // Return JSON + set the cookie if new
  const res = NextResponse.json({ count });
  res.cookies.set("visitorId", visitorId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}
