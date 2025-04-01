import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import LanguageSwitcher from "@/components/common/language-switcher";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Set RTL direction based on language on first load
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
  }, [i18n.language]);

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

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-[#0088CC] dark:text-white font-bold text-xl cursor-pointer">
                  {t('common.appName')}
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <span className={`${
                  location === "/" 
                    ? "border-[#0088CC] text-gray-900 dark:text-white" 
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                  {t('nav.home')}
                </span>
              </Link>
              <Link href="/#services">
                <span className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                  {t('nav.services')}
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 mx-2"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="ml-3 relative">
              {user?.isAdmin ? (
                <div className="flex items-center space-x-2">
                  <Link href="/admin">
                    <Button variant="outline" className="text-[#0088CC] dark:text-white">
                      {t('nav.admin')}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {t('common.logout')}
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    className="text-[#0088CC] dark:text-white bg-[#EEF6FC] dark:bg-[#0088CC]/20 hover:bg-[#0088CC] hover:text-white dark:hover:bg-[#0088CC]"
                  >
                    {t('common.login')}
                  </Button>
                </Link>
              )}
            </div>
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
            <Link href="/">
              <span className={`${
                location === "/" 
                  ? "bg-[#EEF6FC] dark:bg-[#0088CC]/20 border-[#0088CC] text-[#0088CC] dark:text-white" 
                  : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}
                onClick={() => setMobileMenuOpen(false)}>
                {t('nav.home')}
              </span>
            </Link>
            <Link href="/#services">
              <span className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer"
                 onClick={() => setMobileMenuOpen(false)}>
                {t('nav.services')}
              </span>
            </Link>
            {user?.isAdmin ? (
              <>
                <Link href="/admin">
                  <span className="border-transparent text-[#0088CC] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-[#0088CC] dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer"
                     onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.admin')}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="border-transparent text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-red-700 block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  disabled={logoutMutation.isPending}
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link href="/auth">
                <span className="mt-1 border-transparent text-[#0088CC] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-[#0088CC] dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer"
                   onClick={() => setMobileMenuOpen(false)}>
                  {t('common.login')}
                </span>
              </Link>
            )}
            <button
              onClick={() => {
                toggleDarkMode();
                setMobileMenuOpen(false);
              }}
              className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              {isDarkMode ? 
                <Sun size={16} className="rtl:ml-2 ltr:mr-2" /> : 
                <Moon size={16} className="rtl:ml-2 ltr:mr-2" />
              }
              {isDarkMode ? t('common.lightMode') : t('common.darkMode')}
            </button>
            
            {/* Language options in mobile menu */}
            <div className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    i18n.changeLanguage('fa');
                    document.documentElement.dir = 'rtl';
                    setMobileMenuOpen(false);
                  }}
                  className={`${i18n.language === 'fa' ? 'font-bold text-[#0088CC]' : ''}`}
                >
                  فارسی
                </button>
                <button 
                  onClick={() => {
                    i18n.changeLanguage('en');
                    document.documentElement.dir = 'ltr';
                    setMobileMenuOpen(false);
                  }}
                  className={`${i18n.language === 'en' ? 'font-bold text-[#0088CC]' : ''}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
