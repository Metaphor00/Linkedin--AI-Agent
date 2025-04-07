import { Link, useLocation } from "wouter";
import { FaPlus, FaHistory, FaCalendarAlt, FaCog } from "react-icons/fa";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: FaPlus, text: "Create New Post", href: "/" },
    { icon: FaHistory, text: "Post History", href: "/history" },
    { icon: FaCalendarAlt, text: "Scheduled Posts", href: "/scheduled" },
    { icon: FaCog, text: "Settings", href: "/settings" },
  ];

  return (
    <aside className="bg-white shadow-md w-full md:w-64 flex-shrink-0 md:flex flex-col md:h-screen overflow-y-auto scrollbar-hide">
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[#0077B5] rounded-sm flex items-center justify-center text-white text-lg font-bold">
            LI
          </div>
          <h1 className="ml-2 text-lg font-semibold">Post Assistant</h1>
        </div>
        <button className="md:hidden text-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-grow">
        <ul className="py-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a className={cn(
                  "flex items-center py-3 px-4 transition-colors duration-150",
                  location === item.href 
                    ? "text-[#0077B5] bg-blue-50" 
                    : "text-neutral-600 hover:bg-neutral-50"
                )}>
                  <item.icon className="w-6" />
                  <span className="ml-2">{item.text}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-700">JD</span>
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">User</div>
            <div className="text-xs text-neutral-600">user@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
