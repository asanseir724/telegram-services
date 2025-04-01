import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#EEF6FC] via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Enhance Your Telegram</span>
            <span className="block text-[#0088CC]">Stars & Premium</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get Telegram Stars to boost your channel visibility or upgrade to Telegram Premium for an enhanced messaging experience.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/#services">
                <Button size="lg" className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                  Get Started <ChevronRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link href="/services/stars">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10 text-[#0088CC] bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
