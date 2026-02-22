import React from "react";
import Hero from "@/components/Home/Hero";
import Companies from "@/components/Home/Companies";
import Features from "@/components/Home/Features";
import Mentor from "@/components/Home/Mentor";
import Testimonial from "@/components/Home/Testimonials";
import Blog from "@/components/Home/Blog"; // replace Newsletter with Blog
import ContactForm from "@/components/Home/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PharmaWallah | Pharmacy eLearning Platform",
  description: "Master Pharmacy and Pharmaceutical Sciences with comprehensive study materials, MCQs, tools, and community support.",
};

export default function Home() {
  return (
    <main className=" bg-white">
      <Hero />
      <Companies />
      <Features />
      <Mentor />
      <Testimonial />
      <Blog />
      <ContactForm />
    </main>
  );
}