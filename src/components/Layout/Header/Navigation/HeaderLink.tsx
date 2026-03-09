"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderItem } from "../../../../types/menu";
import { usePathname } from "next/navigation";

const HeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const isLinkActive = (path === item.href || (item.submenu && item.submenu.some(subItem => path === subItem.href))) ?? false;
    setIsActive(isLinkActive);
  }, [path, item.href, item.submenu]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If item has submenu, render button with dropdown
  if (item.submenu) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`text-lg flex items-center gap-1 hover:text-black relative ${
            isActive ? "text-black after:absolute after:w-8 after:h-1 after:bg-primary after:rounded-full after:-bottom-1" : "text-grey"
          }`}
        >
          {item.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m7 10l5 5l5-5"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute py-2 left-0 mt-1 w-60 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
            {item.submenu.map((subItem, index) => {
              const isSubItemActive = path === subItem.href;
              return (
                <Link
                  key={index}
                  href={subItem.href}
                  className={`block px-4 py-2 ${
                    isSubItemActive ? "bg-gradient-to-r from-blue-600 to-green-500 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Regular link without submenu
  return (
    <Link
      href={item.href}
      className={`text-lg hover:text-black relative ${
        isActive ? "text-black after:absolute after:w-8 after:h-1 after:bg-primary after:rounded-full after:-bottom-1" : "text-grey"
      }`}
    >
      {item.label}
    </Link>
  );
};

export default HeaderLink;