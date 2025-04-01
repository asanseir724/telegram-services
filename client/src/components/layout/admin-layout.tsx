import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Type
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { path: "/admin/pricing", label: "Pricing", icon: <DollarSign size={20} /> },
    { path: "/admin/text-editor", label: "Text Editor", icon: <Type size={20} /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin">
                  <span className="text-[#0088CC] dark:text-white font-bold text-xl cursor-pointer">
                    TelegramPlus Admin
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link href={item.path} key={item.path}>
                    <span className={`${
                      location === item.path 
                        ? "border-[#0088CC] text-gray-900 dark:text-white" 
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button 
                onClick={toggleDarkMode} 
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 mr-3"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link href="/">
                <Button variant="outline" size="sm" className="mr-2">
                  View Site
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-[#0088CC] dark:text-white bg-[#EEF6FC] dark:bg-[#0088CC]/20 hover:bg-[#0088CC] hover:text-white dark:hover:bg-[#0088CC]"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0088CC]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link href={item.path} key={item.path}>
                  <span className={`${
                    location === item.path 
                      ? "bg-[#EEF6FC] dark:bg-[#0088CC]/20 border-[#0088CC] text-[#0088CC] dark:text-white" 
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    } flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}
                    onClick={() => setMobileMenuOpen(false)}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
                </Link>
              ))}
              <Link href="/">
                <span className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer"
                   onClick={() => setMobileMenuOpen(false)}>
                  View Site
                </span>
              </Link>
              <button
                onClick={() => {
                  toggleDarkMode();
                  setMobileMenuOpen(false);
                }}
                className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full"
              >
                {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="border-transparent text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-red-700 flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full"
                disabled={logoutMutation.isPending}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
