// app/api/admin/portfolio/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { PortfolioType, ReferenceType } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      include: {
        portfolios: {
          include: {
            images: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({ success: true, portfolioItems: user?.portfolios || [] });
  } catch (err) {
    console.error("Portfolio fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { type, title, category, description, videoUrl, posterUrl } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Type is required" }, { status: 400 });

    const userId = decoded.userId;
    const referenceType = ReferenceType.PORTFOLIO;

    // First create the portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        type,
        title,
        category,
        description,
        videoUrl,
        posterUrl,
        userId,
      },
      include: { images: true },
    });

    // Handle photography: move temporary images to permanent
    if (type === PortfolioType.PHOTOGRAPHY) {
      const moveResult = await MediaService.moveTempImagesToPermanent({
        userId,
        referenceType,
        portfolioType: type,
        title,
        portfolioId: portfolio.id,
      });

      if (!moveResult.success) {
        console.warn("Failed to move temp images:", moveResult.error);
        // Continue even if temp images fail
      } else {
        // Return updated portfolio with images
        const updatedPortfolio = await prisma.portfolio.findFirst({
          where: { id: portfolio.id },
          include: { images: true },
        });

        return NextResponse.json({ success: true, portfolio: updatedPortfolio });
      }
    }

    return NextResponse.json({ success: true, portfolio });
  } catch (err) {
    console.error("Portfolio creation error:", err);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
