import { useState } from "react";
import Link from "next/link";
import { HeaderItem } from "../../../../types/menu";
import { usePathname } from "next/navigation";

const MobileHeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const path = usePathname();

  const handleToggle = () => {
    if (item.submenu) {
      setSubmenuOpen(!submenuOpen);
    }
  };

  const isActive = path === item.href;

  return (
    <div className="relative w-full">
      <button
        onClick={handleToggle}
        className={`flex items-center justify-between w-full py-2 px-3 rounded-lg transition-colors ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white"
            : "text-gray-700 hover:bg-white/50"
        }`}
      >
        <span>{item.label}</span>
        {item.submenu && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            className={`transition-transform ${submenuOpen ? "rotate-180" : ""}`}
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
        )}
      </button>
      {submenuOpen && item.submenu && (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 mt-1 space-y-1">
          {item.submenu.map((subItem, index) => {
            const isSubActive = path === subItem.href;
            return (
              <Link
                key={index}
                href={subItem.href}
                className={`block py-2 px-3 rounded-md transition-colors ${
                  isSubActive
                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white"
                    : "text-gray-600 hover:bg-white/70"
                }`}
              >
                {subItem.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileHeaderLink;