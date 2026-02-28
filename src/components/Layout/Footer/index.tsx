import Link from "next/link";
import Logo from "../Header/Logo";
import { Icon } from "@iconify/react/dist/iconify.js";
import { headerData } from "../Header/Navigation/menuData";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient background with stronger blue, subtle green */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/75 to-green-500/30 backdrop-blur-md" />
      
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer pointer-events-none" />
      
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 lg:max-w-screen-xl md:max-w-screen-md z-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Logo & Social */}
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 text-white/90 text-sm leading-relaxed font-medium">
              Empowering pharmacy students with curated resources and tools.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link href="#" className="text-white/80 hover:text-white text-2xl transition-colors">
                <Icon icon="tabler:brand-facebook" />
              </Link>
              <Link href="#" className="text-white/80 hover:text-white text-2xl transition-colors">
                <Icon icon="tabler:brand-twitter" />
              </Link>
              <Link href="#" className="text-white/80 hover:text-white text-2xl transition-colors">
                <Icon icon="tabler:brand-instagram" />
              </Link>
              <Link href="#" className="text-white/80 hover:text-white text-2xl transition-colors">
                <Icon icon="tabler:brand-linkedin" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {headerData.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/mentor" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Our Mentors
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  FAQ's
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Icon icon="tabler:map-pin" className="text-white/70 text-xl flex-shrink-0 mt-1" />
                <p className="text-white/90 text-sm font-medium">Dept. of Pharmacy, University of Karachi</p>
              </div>
              <div className="flex items-center gap-3">
                <Icon icon="tabler:phone" className="text-white/70 text-xl" />
                <p className="text-white/90 text-sm font-medium">+91 1234567890</p>
              </div>
              <div className="flex items-center gap-3">
                <Icon icon="tabler:mail" className="text-white/70 text-xl" />
                <p className="text-white/90 text-sm font-medium">info@pharmawallah.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-sm text-center md:text-left font-medium">
            © {new Date().getFullYear()} PharmaWallah. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/70 hover:text-white text-sm transition-colors font-medium">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;