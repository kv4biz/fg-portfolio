import About from "@/components/About";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import React from "react";

const page = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="">
        <Hero />
        <About />
        <Portfolio />
        <Services />
        <Blog />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default page;
