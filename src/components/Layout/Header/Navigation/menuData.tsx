import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Resources",
    href: "#",
    submenu: [
      { label: "Material", href: "/material" },
      { label: "MCQ's Bank", href: "/mcqs-bank" },
      { label: "Slide Spotting", href: "/spotting" },
      { label: "Flashcards", href: "/flash-cards" },
      { label: "Books Library", href: "/books-library" },
    ],
  },
  { label: "Pharmacopedia", href: "/encyclopedia" },
  { label: "Calculation Tools", href: "/calculation-tools" },
  { label: "About Us", href: "/about-us" },
];