import Link from "next/link";
import Logo from "../Header/Logo";
import { Icon } from "@iconify/react/dist/iconify.js";
import { headerData } from "../Header/Navigation/menuData";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-800 to-slate-700 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 py-16">
        <div className="grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">
          {/* Logo and social */}
          <div className='col-span-4 md:col-span-12 lg:col-span-4'>
            <Logo /> {/* Assumes Logo adapts to dark background */}
            <p className="mt-4 text-gray-300 text-sm">
              Empowering pharmacy students with curated resources and tools.
            </p>
            <div className='flex items-center gap-4 mt-6'>
              <Link href="#" className='hover:text-blue-400 text-gray-300 text-2xl transition-colors'>
                <Icon icon="tabler:brand-facebook" />
              </Link>
              <Link href="#" className='hover:text-blue-400 text-gray-300 text-2xl transition-colors'>
                <Icon icon="tabler:brand-twitter" />
              </Link>
              <Link href="#" className='hover:text-blue-400 text-gray-300 text-2xl transition-colors'>
                <Icon icon="tabler:brand-instagram" />
              </Link>
              <Link href="#" className='hover:text-blue-400 text-gray-300 text-2xl transition-colors'>
                <Icon icon="tabler:brand-linkedin" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-2">
            <h3 className="mb-4 text-xl font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {headerData.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-2">
            <h3 className="mb-4 text-xl font-semibold text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-300 hover:text-white transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className='col-span-4 md:col-span-4 lg:col-span-4'>
            <h3 className="mb-4 text-xl font-semibold text-white">Contact Us</h3>
            <div className="flex items-start gap-3 mb-4">
              <Icon icon="tabler:map-pin" className="text-blue-400 text-xl flex-shrink-0 mt-1" />
              <p className="text-gray-300 text-sm">925 Filbert Street, Pennsylvania 18072</p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="tabler:phone" className="text-blue-400 text-xl" />
              <p className="text-gray-300 text-sm">+45 3411-4411</p>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="tabler:mail" className="text-blue-400 text-xl" />
              <p className="text-gray-300 text-sm">info@pharmawallah.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-16 pt-8 border-t border-white/20 flex flex-col lg:flex-row items-center justify-between gap-4'>
          <p className='text-gray-400 text-sm text-center lg:text-left'>
            © 2026 PharmaWallah. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className='text-gray-400 text-sm hover:text-white transition-colors'>
              Privacy Policy
            </Link>
            <Link href="/terms" className='text-gray-400 text-sm hover:text-white transition-colors'>
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;