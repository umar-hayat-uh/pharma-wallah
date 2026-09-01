import React from "react";
import { headers } from "next/headers";
import Hero from "@/components/Home/Hero";
import Companies from "@/components/Home/Companies";
import Features from "@/components/Home/Features";
import ContactForm from "@/components/Home/ContactForm";
import Courses from "@/components/Home/Courses";
import { OfficialLaunchBanner } from "@/components/Home/tournament";
import ClinicalLandingPage from "@/components/Clinical/ClinicalLandingPage";


export default function Home() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");
  const isClinical = subdomain === "clinical";

  if (isClinical) {
    return <ClinicalLandingPage />;
  }

  return (
    <main className="bg-white">
      <OfficialLaunchBanner />
      <Hero />
      <Companies />
      <Courses />
      <Features />
      <ContactForm />
    </main>
  );
}