import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Crown, CheckCheck } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StarsForm from "@/components/forms/stars-form";
import PremiumForm from "@/components/forms/premium-form";

export default function ServicePage() {
  const params = useParams<{ type: string }>();
  const [location, navigate] = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  
  const serviceType = params.type;
  
  // Redirect if invalid service type
  if (serviceType !== "stars" && serviceType !== "premium") {
    navigate("/");
    return null;
  }
  
  const isStars = serviceType === "stars";
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", serviceType],
    queryFn: async () => {
      const response = await fetch(`/api/services?type=${serviceType}`);
      if (!response.ok) throw new Error(`Failed to fetch ${serviceType} services`);
      return response.json();
    },
  });
  
  // Service details
  const serviceDetails = {
    stars: {
      title: "Telegram Stars",
      description: "Telegram Stars help increase channel visibility. They're shown next to your channel name in shared messages, searches, and the chat list.",
      icon: <Star className="h-10 w-10 text-white" />,
      benefits: [
        "Increase channel visibility in Telegram search",
        "Get displayed prominently in forwarded messages",
        "Gain higher ranking in recommendations",
        "Stand out in the chat list of subscribers",
        "Improve credibility of your channel"
      ],
      features: [
        "Stars appear next to your channel name",
        "More stars mean more prominence",
        "Stars are visible to all Telegram users",
        "Attract more subscribers to your channel"
      ]
    },
    premium: {
      title: "Telegram Premium",
      description: "Upgrade your Telegram experience with Premium. Get access to exclusive features and capabilities that enhance your messaging experience.",
      icon: <Crown className="h-10 w-10 text-white" />,
      benefits: [
        "Upload files up to 4GB (vs 2GB for non-premium)",
        "Follow up to 1000 channels (vs 500 for non-premium)",
        "Create up to 20 folders with 200 chats each",
        "Pin up to 10 chats in your main list",
        "Reserve up to 10 public t.me links"
      ],
      features: [
        "Access to exclusive stickers and reactions",
        "No ads in public channels",
        "Animated profile pictures",
        "Premium badges next to your name",
        "Voice-to-text conversion for voice messages"
      ]
    }
  };
  
  const details = isStars ? serviceDetails.stars : serviceDetails.premium;
  
  return (
    <>
      <Helmet>
        <title>{details.title} - TelegramPlus</title>
        <meta name="description" content={details.description} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 dark:bg-gray-900">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-[#EEF6FC] via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:w-3/5">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-[#0088CC] rounded-md p-3 mr-4">
                      {details.icon}
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
                      {details.title}
                    </h1>
                  </div>
                  <p className="mt-3 text-xl text-gray-500 dark:text-gray-300 max-w-3xl">
                    {details.description}
                  </p>
                  <div className="mt-8">
                    <Button 
                      size="lg" 
                      onClick={() => setFormOpen(true)}
                      className="px-8 py-3"
                    >
                      {isStars ? "Buy Telegram Stars" : "Subscribe to Premium"}
                    </Button>
                  </div>
                </div>
                <div className="mt-8 md:mt-0 md:w-2/5 flex justify-center">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xs w-full">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                      {isStars ? "Available Packages" : "Subscription Options"}
                    </h3>
                    {isLoading ? (
                      <p>Loading packages...</p>
                    ) : (
                      <ul className="space-y-2">
                        {services?.map((service) => (
                          <li key={service.id} className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200">
                              {service.name}
                            </span>
                            <span className="font-semibold text-[#0088CC]">
                              ${service.price.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-12 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-base text-[#0088CC] font-semibold tracking-wide uppercase">
                  Features
                </h2>
                <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                  {isStars ? "Why Telegram Stars Matter" : "Premium Benefits"}
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
                  {isStars 
                    ? "Enhance your channel's visibility and growth with Telegram Stars" 
                    : "Unlock all the exclusive features Telegram Premium has to offer"}
                </p>
              </div>
              
              <div className="mt-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isStars ? "Benefits of Stars" : "Premium Advantages"}
                      </h3>
                      <ul className="space-y-3">
                        {details.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCheck className="h-5 w-5 text-[#0088CC] mr-2 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isStars ? "How Stars Work" : "Exclusive Features"}
                      </h3>
                      <ul className="space-y-3">
                        {details.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCheck className="h-5 w-5 text-[#0088CC] mr-2 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <Button 
                  size="lg" 
                  onClick={() => setFormOpen(true)}
                  className="px-8 py-3"
                >
                  {isStars ? "Buy Telegram Stars Now" : "Get Telegram Premium Now"}
                </Button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
        
        {/* Forms */}
        {isStars ? (
          <StarsForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
        ) : (
          <PremiumForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
        )}
      </div>
    </>
  );
}
