import { 
  Zap, 
  Shield, 
  Headphones, 
  Tag 
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Zap size={24} />,
      titleKey: "home.features.fastDelivery.title",
      descriptionKey: "home.features.fastDelivery.desc"
    },
    {
      icon: <Shield size={24} />,
      titleKey: "home.features.secure.title",
      descriptionKey: "home.features.secure.desc"
    },
    {
      icon: <Headphones size={24} />,
      titleKey: "home.features.support.title",
      descriptionKey: "home.features.support.desc"
    },
    {
      icon: <Tag size={24} />,
      titleKey: "home.features.prices.title",
      descriptionKey: "home.features.prices.desc"
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-[#0088CC] font-semibold tracking-wide uppercase">{t('home.features.title')}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('home.features.subtitle')}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            {t('home.features.desc')}
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#0088CC] text-white">
                    {feature.icon}
                  </div>
                  <p className="rtl:mr-16 ltr:ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{t(feature.titleKey)}</p>
                </dt>
                <dd className="mt-2 rtl:mr-16 ltr:ml-16 text-base text-gray-500 dark:text-gray-300">
                  {t(feature.descriptionKey)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
