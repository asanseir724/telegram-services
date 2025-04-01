import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="/">
              <a className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Home
              </a>
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link href="/#services">
              <a className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Services
              </a>
            </Link>
          </div>

          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Privacy
            </a>
          </div>

          <div className="px-5 py-2">
            <a href="#" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Terms
            </a>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span className="sr-only">Telegram</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221L15.9 18.424c-.142.636-.536.8-1.085.496l-3-2.21-1.446 1.394a.757.757 0 0 1-.603.28h-.039a.95.95 0 0 1-.255-.317l-.989-3.157-2.699-1.017c-.586-.172-.6-.586.124-.9l10.614-4.242c.5-.197.957.124.772.77z" />
            </svg>
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-500 dark:text-gray-300">
          &copy; {new Date().getFullYear()} TelegramPlus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
