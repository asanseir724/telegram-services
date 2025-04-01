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
import { useTranslation } from "react-i18next";

export default function ServicePage() {
  const params = useParams<{ type: string }>();
  const [location, navigate] = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const { t } = useTranslation();
  
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
  
  // Service benefits and features keys (for translations)
  const starsBenefitsKeys = [
    'service.stars.benefits.visibility',
    'service.stars.benefits.forwarded', 
    'service.stars.benefits.ranking',
    'service.stars.benefits.standout',
    'service.stars.benefits.credibility'
  ];
  
  const starsFeaturesKeys = [
    'service.stars.features.appearance',
    'service.stars.features.more',
    'service.stars.features.visible',
    'service.stars.features.attract'
  ];
  
  const premiumBenefitsKeys = [
    'service.premium.benefits.upload',
    'service.premium.benefits.follow',
    'service.premium.benefits.folders',
    'service.premium.benefits.pin',
    'service.premium.benefits.links'
  ];
  
  const premiumFeaturesKeys = [
    'service.premium.features.stickers',
    'service.premium.features.ads',
    'service.premium.features.profile',
    'service.premium.features.badges',
    'service.premium.features.voice'
  ];
  
  // Service details with translations
  const serviceDetails = {
    stars: {
      title: t('home.services.stars.title'),
      description: t('home.services.stars.desc'),
      icon: <Star className="h-10 w-10 text-white" />,
      benefits: starsBenefitsKeys.map(key => t(key)),
      features: starsFeaturesKeys.map(key => t(key))
    },
    premium: {
      title: t('home.services.premium.title'),
      description: t('home.services.premium.desc'),
      icon: <Crown className="h-10 w-10 text-white" />,
      benefits: premiumBenefitsKeys.map(key => t(key)),
      features: premiumFeaturesKeys.map(key => t(key))
    }
  };
  
  const details = isStars ? serviceDetails.stars : serviceDetails.premium;
  
  return (
    <>
      <Helmet>
        <title>{details.title} - {t('common.appName')}</title>
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
                    <div className="flex-shrink-0 bg-[#0088CC] rounded-md p-3 rtl:ml-4 ltr:mr-4">
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
                      {isStars ? t('home.services.stars.buyButton') : t('home.services.premium.buyButton')}
                    </Button>
                  </div>
                </div>
                <div className="mt-8 md:mt-0 md:w-2/5 flex justify-center">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xs w-full">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                      {isStars ? t('service.stars.packages') : t('service.premium.options')}
                    </h3>
                    {isLoading ? (
                      <p>{t('common.loading')}</p>
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
                  {t('home.features.title')}
                </h2>
                <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                  {isStars ? t('service.stars.whyMatter') : t('service.premium.benefitsTitle')}
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
                  {isStars 
                    ? t('service.stars.enhance') 
                    : t('service.premium.unlock')}
                </p>
              </div>
              
              <div className="mt-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isStars ? t('service.stars.benefitsTitle') : t('service.premium.advantagesTitle')}
                      </h3>
                      <ul className="space-y-3">
                        {details.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCheck className="h-5 w-5 text-[#0088CC] rtl:ml-2 ltr:mr-2 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {isStars ? t('service.stars.howWork') : t('service.premium.exclusiveTitle')}
                      </h3>
                      <ul className="space-y-3">
                        {details.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCheck className="h-5 w-5 text-[#0088CC] rtl:ml-2 ltr:mr-2 flex-shrink-0" />
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
                  {isStars ? t('service.stars.buyNow') : t('service.premium.getNow')}
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
