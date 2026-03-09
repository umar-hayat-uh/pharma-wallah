import Link from "next/link";
import Logo from "../Header/Logo";
import { Icon } from "@iconify/react";
import { headerData } from "../Header/Navigation/menuData";
import {
  BookOpen, Library, Layers, FileText, Scan, Sparkles,
  MapPin, Phone, Mail,
} from "lucide-react";

const resourceLinks = [
  { label: "Study Material",  href: "/material",       Icon: BookOpen  },
  { label: "Books Library",   href: "/books",           Icon: Library   },
  { label: "Flashcards",      href: "/flashcards",      Icon: Layers    },
  { label: "MCQ Bank",        href: "/mcqs",            Icon: FileText  },
  { label: "Slide Spotting",  href: "/slide-spotting",  Icon: Scan      },
  { label: "AI Guide",        href: "/ai-guide",        Icon: Sparkles  },
];

const companyLinks = [
  { label: "About Us",    href: "/about-us"  },
  { label: "Our Mentors", href: "/mentor"    },
  { label: "Careers",     href: "/careers"   },
  { label: "FAQ's",       href: "/faqs"      },
  { label: "Contact",     href: "/contact"   },
];

const socials = [
  { icon: "tabler:brand-facebook",  href: "#", label: "Facebook"  },
  { icon: "tabler:brand-twitter",   href: "#", label: "Twitter"   },
  { icon: "tabler:brand-instagram", href: "#", label: "Instagram" },
  { icon: "tabler:brand-linkedin",  href: "#", label: "LinkedIn"  },
];

const Footer = () => (
  <footer className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-green-500">
    {/* Subtle decorative blobs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white/5 blur-3xl" />
    </div>

    {/* Top white divider line */}
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/30" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
      {/* ── MOBILE LAYOUT (hidden on sm and up) ── */}
      <div className="sm:hidden py-16 flex flex-col gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl px-4 py-3 inline-flex w-fit shadow-sm">
            <Logo />
          </div>
          <p className="text-white/90 text-sm leading-relaxed font-medium">
            Empowering pharmacy students across Pakistan with curated academic resources, MCQ banks, and AI-powered learning tools.
          </p>
          <div className="flex items-center gap-2.5">
            {socials.map(({ icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <Icon icon={icon} className="text-lg" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links + Resources side by side */}
        <div className="grid grid-cols-2 gap-6">
          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Quick Links</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-2.5">
              {headerData.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Resources</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-2.5">
              {resourceLinks.map(({ label, href, Icon: IconComp }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <IconComp className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Company</h3>
            <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
          </div>
          <ul className="list-none flex flex-col gap-2.5">
            {companyLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Contact Us</h3>
            <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
          </div>
          <ul className="list-none flex flex-col gap-4">
            {[
              { Icon: MapPin, text: "Dept. of Pharmacy, University of Karachi", align: "items-start" },
              { Icon: Phone,  text: "+92 300 1234567",          align: "items-center" },
              { Icon: Mail,   text: "info@pharmawallah.com",    align: "items-center" },
            ].map(({ Icon: IconComp, text, align }) => (
              <li key={text} className={`flex ${align} gap-3`}>
                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/85 leading-snug">{text}</span>
              </li>
            ))}
          </ul>
          {/* Newsletter */}
          <div className="mt-2 rounded-2xl bg-white/15 border border-white/20 p-4">
            <p className="text-xs font-bold text-white/90 mb-3 uppercase tracking-wide">Weekly Updates</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white text-xs placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button className="px-3 py-2 rounded-xl bg-white text-blue-600 text-xs font-extrabold hover:bg-blue-50 transition shrink-0 shadow-sm">
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP/TABLET LAYOUT (hidden on mobile) ── */}
      <div className="hidden sm:block py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <div className="bg-white rounded-2xl px-4 py-3 inline-flex w-fit shadow-sm">
              <Logo />
            </div>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              Empowering pharmacy students across Pakistan with curated academic resources, MCQ banks, and AI-powered learning tools.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
                >
                  <Icon icon={icon} className="text-lg" />
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Quick Links</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-2.5">
              {headerData.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Resources */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Resources</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-2.5" style={{ listStyleType: "none" }}> 
              {resourceLinks.map(({ label, href, Icon: IconComp }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <IconComp className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Company */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Company</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-2.5">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Contact */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">Contact Us</h3>
              <div className="mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            </div>
            <ul className="list-none flex flex-col gap-4">
              {[
                { Icon: MapPin, text: "Dept. of Pharmacy, University of Karachi", align: "items-start" },
                { Icon: Phone,  text: "+92 300 1234567",          align: "items-center" },
                { Icon: Mail,   text: "info@pharmawallah.com",    align: "items-center" },
              ].map(({ Icon: IconComp, text, align }) => (
                <li key={text} className={`flex ${align} gap-3`}>
                  <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/85 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
            {/* Newsletter */}
            <div className="mt-2 rounded-2xl bg-white/15 border border-white/20 p-4">
              <p className="text-xs font-bold text-white/90 mb-3 uppercase tracking-wide">Weekly Updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white text-xs placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button className="px-3 py-2 rounded-xl bg-white text-blue-600 text-xs font-extrabold hover:bg-blue-50 transition shrink-0 shadow-sm">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar (shared) ── */}
      <div className="py-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/70 text-xs font-medium text-center sm:text-left">
          © {new Date().getFullYear()} <span className="text-white font-extrabold">PharmaWallah</span>. All rights reserved. Pakistan's #1 Pharmacy eLearning Platform.
        </p>
        <div className="flex items-center gap-5">
          {[["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"]].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
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