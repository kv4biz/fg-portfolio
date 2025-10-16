"use client";
import React, { useState, useEffect } from "react";
import { ImageWithFallback } from "./ImageWithFallBack";

interface AboutData {
  title: string;
  description: string;
  aboutImage: string | null;
  lists: AboutList[];
  stats: AboutStat[];
}

interface AboutList {
  id: string;
  title: string | null;
  items: AboutListItem[];
}

interface AboutListItem {
  id: string;
  mainText: string;
  subText: string | null;
}

interface AboutStat {
  id: string;
  number: number;
  text: string;
}

const About = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch about data on component mount
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await fetch("/api/about");
      if (res.ok) {
        const data = await res.json();
        setAboutData(data.about);
      } else {
        // Fallback to default data if API fails
        setAboutData({
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
        });
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
      // Fallback to default data
      setAboutData({
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
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side - Loading */}
            <div className="order-2 lg:order-1 space-y-6">
              <div className="h-12 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-px bg-gray-200 w-24"></div>

              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Side - Loading */}
            <div className="order-1 lg:order-2">
              <div className="aspect-[3/4] bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return null;
  }

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-6">{aboutData.title}</h2>
            <div className="w-24 h-px bg-black opacity-60 mb-8"></div>

            <p className="text-gray-700 mb-8 leading-relaxed">{aboutData.description}</p>

            <div className="space-y-8">
              {aboutData.lists.map((list) => (
                <div key={list.id}>
                  {list.title && <h3 className="text-black tracking-wide mb-4">{list.title}</h3>}
                  <div className="space-y-4">
                    {list.items.map((item) => (
                      <div key={item.id} className="border-l-2 border-gray-200 pl-4">
                        <h4 className="text-black font-medium mb-1">{item.mainText}</h4>
                        {item.subText && <p className="text-xs text-gray-500">{item.subText}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {aboutData.stats.length > 0 && (
              <div className="mt-12 flex space-x-8 text-sm text-gray-600">
                {aboutData.stats.map((stat) => (
                  <div key={stat.id}>
                    <span className="block text-2xl font-thin text-black">{stat.number}+</span>
                    <span className="tracking-wide">{stat.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="aspect-[3/4] overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={aboutData.aboutImage || "/placeholder-about.jpg"}
                alt="Professional Portrait"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
