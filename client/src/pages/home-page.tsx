import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Services from "@/components/home/services";

export default function HomePage() {
  const { t } = useTranslation();
  
  // Scroll to services section if hash in URL
  useEffect(() => {
    if (window.location.hash === "#services") {
      const element = document.getElementById("services");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('common.appName')} - {t('home.seo.title')}</title>
        <meta name="description" content={t('home.seo.description')} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Features />
          <Services />
        </main>
        <Footer />
      </div>
    </>
  );
}
