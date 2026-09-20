import Link from "next/link";
import Image from "next/image";
import Wordmark from "./Wordmark";
import { Icon } from "@iconify/react";
import { headerData } from "../Header/Navigation/menuData";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

/*
 * Every href below was checked against src/app on 2026-09-13. Five of the seven
 * resource links used to 404 on every page (/material, /books, /flashcards,
 * /mcqs, /slide-spotting) — they now point at the routes that exist.
 */
const resourceLinks = [
  { label: "Study material", href: "/courses" },
  { label: "Flashcards", href: "/flash-cards" },
  { label: "MCQ bank", href: "/mcqs-bank" },
  { label: "Slide spotting", href: "/spotting" },
  { label: "AI Guide", href: "/ai-guide" },
  { label: "Android app", href: "/download" },
];

const companyLinks = [
  { label: "About us", href: "/about-us" },
  { label: "Our mentors", href: "/mentor" },
  { label: "Careers", href: "/careers" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

// "Resources" is a menu heading with href "#", not a destination.
const quickLinks = headerData.filter((item) => item.href && item.href !== "#");

const contact = [
  { Icon: MapPin, text: "Dept. of Pharmacy, University of Karachi" },
  { Icon: Phone, text: "+92 300 1234567" },
  { Icon: Mail, text: "info@pharmawallah.com" },
];

const socials = [
  { icon: "tabler:brand-facebook", href: "#", label: "Facebook" },
  { icon: "tabler:brand-twitter", href: "#", label: "Twitter" },
  { icon: "tabler:brand-instagram", href: "#", label: "Instagram" },
  { icon: "tabler:brand-linkedin", href: "#", label: "LinkedIn" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/90">{title}</h3>
      {/* div + role="list": globals.css styles every ul/li with bullets and a grey colour. */}
      <div role="list" className="mt-5 flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div role="listitem">
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-[15px] text-white/90 transition-colors duration-300 hover:text-white"
      >
        {children}
        <ArrowUpRight
          className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

/*
 * The brand blue→green (tailwind.config.ts brandBlue → brandGreen), restored at
 * the user's request on 2026-09-13 after a same-day redesign had swapped it for
 * an ink ground. The ink scrim layered on top is for legibility, not mood:
 * white on raw brandGreen is 2.61:1. With a 40% scrim, white/90 (every link,
 * label and the bottom bar) is 4.95:1 even at the greenest corner, and the
 * large white/65 statement is 3.38:1 — so keep small text at /90 or above.
 * No blurred blobs — the old gradient footer's three blobs stay gone.
 */
const FOOTER_BG =
  "linear-gradient(rgba(6,18,36,.40), rgba(6,18,36,.40)), linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)";

/**
 * The site footer, on every route.
 *
 * Redesigned 2026-09-13 in the landing page's language: mono column labels,
 * hairline rules, and the wordmark as a filled ghost, on the brand gradient.
 * One responsive grid, replacing a markup tree that duplicated every column
 * once for mobile and once for desktop.
 */
const Footer = () => (
  <footer className="relative overflow-hidden text-white" style={{ background: FOOTER_BG }}>
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      {/* Lead row: the brand statement, and the one action worth offering here. */}
      <div className="flex flex-col gap-8 border-b border-white/20 py-14 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <Link href="/" aria-label="PharmaWallah home" className="inline-flex rounded-2xl bg-white px-4 py-3">
            <Image src="/images/logo/logo.svg" alt="PharmaWallah" width={180} height={48} className="h-10 w-auto" />
          </Link>
          <p className="mt-7 text-[1.65rem] font-bold leading-[1.12] tracking-[-0.03em] [text-wrap:balance] sm:text-4xl">
            Empowering pharmacy students across Pakistan
            <span className="text-white/65"> with curated resources, MCQ banks and AI-powered learning tools.</span>
          </p>
        </div>

        <Link
          href="/calculation-tools"
          className="group inline-flex min-h-[56px] w-full items-center justify-between gap-6 rounded-full bg-white pl-7 pr-2 font-semibold text-[#0b0c0e] shadow-lg shadow-black/10 transition-colors duration-500 hover:bg-[#0b0c0e] hover:text-white sm:w-auto"
        >
          Open the calculators
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0b0c0e]/10 transition-transform duration-500 group-hover:-rotate-45">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-4">
        <Column title="Explore">
          {quickLinks.map((item) => (
            <FooterLink key={item.label} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </Column>

        <Column title="Resources">
          {resourceLinks.map(({ label, href }) => (
            <FooterLink key={label} href={href}>
              {label}
            </FooterLink>
          ))}
        </Column>

        <Column title="Company">
          {companyLinks.map(({ label, href }) => (
            <FooterLink key={label} href={href}>
              {label}
            </FooterLink>
          ))}
        </Column>

        <div className="col-span-2 md:col-span-1">
          <Column title="Contact">
            {contact.map(({ Icon: IconComp, text }) => (
              <div role="listitem" key={text} className="flex items-start gap-3 text-[15px] leading-snug text-white/90">
                <IconComp className="mt-0.5 h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
                {text}
              </div>
            ))}
          </Column>

          <div className="mt-8 flex items-center gap-2">
            {socials.map(({ icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/35 text-white/90 transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#1C7BD9]"
              >
                <Icon icon={icon} className="text-lg" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Wordmark />

      {/* Bottom bar */}
      <div className="flex flex-col items-start justify-between gap-3 border-t border-white/20 py-6 sm:flex-row sm:items-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/90">
          © {new Date().getFullYear()} PharmaWallah · Pharm-D · Pakistan
        </p>
        <div className="flex items-center gap-6">
          {[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/90 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
