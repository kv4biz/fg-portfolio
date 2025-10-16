// app/api/about/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get the first about data (assuming one user/about for now)
    const about = await prisma.about.findFirst({
      select: {
        title: true,
        description: true,
        aboutImage: true,
        lists: {
          select: {
            id: true,
            title: true,
            items: {
              select: {
                id: true,
                mainText: true,
                subText: true,
              },
              orderBy: {
                id: "asc",
              },
            },
          },
          orderBy: {
            id: "asc",
          },
        },
        stats: {
          select: {
            id: true,
            number: true,
            text: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        updatedAt: true,
      },
    });

    if (!about) {
      // Return default about data if none exist
      return NextResponse.json({
        about: {
          title: "ABOUT",
          description:
            "With over a decade of experience in photography and cinematography, I combine creative vision with business expertise to deliver exceptional visual storytelling. My approach blends technical precision with artistic innovation to create compelling content that elevates brands and captures meaningful moments.",
          aboutImage:
            "https://images.unsplash.com/photo-1662333085102-f6ae3be21c91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBob3RvZ3JhcGhlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTg1OTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          lists: [
            {
              id: "1",
              title: "EXPERIENCE",
              items: [
                {
                  id: "1",
                  mainText: "Founder, Photographer & Cinematographer @ Dash Media",
                  subText: "2014 - Present",
                },
                {
                  id: "2",
                  mainText: "Photographer & Cinematographer @ Corporate Studios",
                  subText: "2021 - 2022",
                },
                {
                  id: "3",
                  mainText: "Photographer @ Emirates Airline Festival of Literature",
                  subText: "2016 - 2017",
                },
                {
                  id: "4",
                  mainText: "Photographer (Media coverage team) @ Shabab Al-Ahli Football Club",
                  subText: "2015 - 2016",
                },
              ],
            },
            {
              id: "2",
              title: "EDUCATION",
              items: [
                {
                  id: "1",
                  mainText: "Diploma, Online Business Management",
                  subText: "Trebas Institute, Quebec - 2023",
                },
                {
                  id: "2",
                  mainText: "Professional Certificate, Cinematography",
                  subText: "PEFTI Film Institute, Lagos - 2021",
                },
                {
                  id: "3",
                  mainText: "Bachelors, Media (Screen Production)",
                  subText: "University of Mudrich, Dubai - 2017",
                },
              ],
            },
          ],
          stats: [
            { id: "1", number: 10, text: "YEARS" },
            { id: "2", number: 500, text: "PROJECTS" },
            { id: "3", number: 100, text: "CLIENTS" },
          ],
        },
      });
    }

    return NextResponse.json({ about });
  } catch (err) {
    console.error("About data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}
