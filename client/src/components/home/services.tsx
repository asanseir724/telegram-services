import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Crown, CheckCheck, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";

export default function Services() {
  const { data: starsServices, isLoading: loadingStars } = useQuery<Service[]>({
    queryKey: ["/api/services", "stars"],
    queryFn: async () => {
      const response = await fetch("/api/services?type=stars");
      if (!response.ok) throw new Error("Failed to fetch stars services");
      return response.json();
    },
  });

  const { data: premiumServices, isLoading: loadingPremium } = useQuery<Service[]>({
    queryKey: ["/api/services", "premium"],
    queryFn: async () => {
      const response = await fetch("/api/services?type=premium");
      if (!response.ok) throw new Error("Failed to fetch premium services");
      return response.json();
    },
  });

  // Get the smallest package of each type to display on the cards
  const starsBasicPackage = starsServices?.find(service => service.quantity === 100);
  const premiumBasicPackage = premiumServices?.find(service => service.quantity === 1);

  return (
    <section id="services" className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-[#0088CC] font-semibold tracking-wide uppercase">Services</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Choose Your Service
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            Select one of our premium services to enhance your Telegram experience.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Telegram Stars Card */}
            <Card className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-[#0088CC] rounded-md p-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      Telegram Stars
                    </h3>
                    {!loadingStars && starsBasicPackage && (
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-[#0088CC]">
                          ${starsBasicPackage.price.toFixed(2)}
                        </p>
                        <p className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                          per 100 stars
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Boost your channel visibility with Telegram Stars. Get more engagement and reach a wider audience.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Increase channel visibility
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Boost engagement
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Higher rankings in recommendations
                      </p>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
                <Link href="/services/stars">
                  <Button variant="link" className="w-full text-[#0088CC] hover:text-[#0088CC]/80 dark:hover:text-white/80 flex justify-center items-center">
                    Buy Telegram Stars <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Telegram Premium Card */}
            <Card className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-[#0088CC] rounded-md p-3">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      Telegram Premium
                    </h3>
                    {!loadingPremium && premiumBasicPackage && (
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-[#0088CC]">
                          ${premiumBasicPackage.price.toFixed(2)}
                        </p>
                        <p className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                          per month
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Unlock exclusive features with Telegram Premium. Get enhanced messaging experience and additional benefits.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Upload larger files
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Follow more channels
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="flex-shrink-0 h-5 w-5 text-[#0088CC]" />
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Exclusive stickers and reactions
                      </p>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-6">
                <Link href="/services/premium">
                  <Button variant="link" className="w-full text-[#0088CC] hover:text-[#0088CC]/80 dark:hover:text-white/80 flex justify-center items-center">
                    Subscribe to Premium <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
