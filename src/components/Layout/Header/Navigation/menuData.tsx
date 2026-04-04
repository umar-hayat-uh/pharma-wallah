import { HeaderItem } from "@/types/menu";

export const headerData: HeaderItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Resources",
    href: "#",
    submenu: [
      { label: "Material", href: "/courses" },
      { label: "MCQ's Bank", href: "/mcqs-bank" },
      { label: "Slide Spotting", href: "/spotting" },
      { label: "Flashcards", href: "/flash-cards" },
      { label: "Books Library", href: "/books-library" },
    ],
  },
  { label: "Pharmacopedia", href: "/encyclopedia" },
  { label: "Calculation Tools", href: "/calculation-tools" },
  { label: "Blog", href: "/blog" },          // ← New blog link
  { label: "About Us", href: "/about-us" },
];