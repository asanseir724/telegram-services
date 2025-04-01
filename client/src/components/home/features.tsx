import { 
  Zap, 
  Shield, 
  Headphones, 
  Tag 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Fast Delivery",
      description: "Get your Telegram Stars or Premium subscription activated within minutes after purchase."
    },
    {
      icon: <Shield size={24} />,
      title: "Secure Process",
      description: "We only collect minimal information needed for the service, ensuring your privacy."
    },
    {
      icon: <Headphones size={24} />,
      title: "24/7 Support",
      description: "Our customer service team is always available to assist you with any questions."
    },
    {
      icon: <Tag size={24} />,
      title: "Best Prices",
      description: "We offer the most competitive prices for Telegram Stars and Premium subscriptions."
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-[#0088CC] font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Why Choose TelegramPlus
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
            We offer the most reliable and fast service for Telegram Stars and Premium subscriptions.
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
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
