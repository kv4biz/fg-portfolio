// app/api/admin/about/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

// Define proper TypeScript interfaces
interface AboutListItemData {
  mainText: string;
  subText: string | null;
}

interface AboutListData {
  title: string;
  items: AboutListItemData[];
}

interface AboutStatData {
  number: number;
  text: string;
}

interface AboutRequestData {
  title: string;
  description: string;
  aboutImage: string | null;
  lists: AboutListData[];
  stats: AboutStatData[];
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      include: {
        about: {
          include: {
            lists: {
              include: {
                items: true,
              },
            },
            stats: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      about: user.about || {
        id: "",
        title: "ABOUT",
        description: "",
        aboutImage: null,
        lists: [],
        stats: [],
      },
    });
  } catch (err) {
    console.error("About fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const requestData: AboutRequestData = await req.json();
    const { title, description, aboutImage, lists, stats } = requestData;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Get the first user with about data
    const user = await prisma.user.findFirst({
      include: {
        about: {
          include: {
            lists: {
              include: {
                items: true,
              },
            },
            stats: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let about;

    if (user.about) {
      // Delete existing lists and stats
      await prisma.aboutListItem.deleteMany({
        where: {
          list: {
            aboutId: user.about.id,
          },
        },
      });

      await prisma.aboutList.deleteMany({
        where: {
          aboutId: user.about.id,
        },
      });

      await prisma.aboutStat.deleteMany({
        where: {
          aboutId: user.about.id,
        },
      });

      // Update existing about
      about = await prisma.about.update({
        where: { id: user.about.id },
        data: {
          title,
          description,
          aboutImage,
          lists: {
            create: lists.map((list) => ({
              title: list.title,
              items: {
                create: list.items.map((item) => ({
                  mainText: item.mainText,
                  subText: item.subText,
                })),
              },
            })),
          },
          stats: {
            create: stats.map((stat) => ({
              number: stat.number,
              text: stat.text,
            })),
          },
        },
        include: {
          lists: {
            include: {
              items: true,
            },
          },
          stats: true,
        },
      });
    } else {
      // Create new about
      about = await prisma.about.create({
        data: {
          title,
          description,
          aboutImage,
          userId: user.id,
          lists: {
            create: lists.map((list) => ({
              title: list.title,
              items: {
                create: list.items.map((item) => ({
                  mainText: item.mainText,
                  subText: item.subText,
                })),
              },
            })),
          },
          stats: {
            create: stats.map((stat) => ({
              number: stat.number,
              text: stat.text,
            })),
          },
        },
        include: {
          lists: {
            include: {
              items: true,
            },
          },
          stats: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      about,
    });
  } catch (err) {
    console.error("About update error:", err);
    return NextResponse.json({ error: "Failed to update about section" }, { status: 500 });
  }
}
