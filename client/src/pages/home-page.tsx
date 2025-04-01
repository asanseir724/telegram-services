import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Services from "@/components/home/services";

export default function HomePage() {
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
        <title>TelegramPlus - Buy Telegram Stars & Premium</title>
        <meta name="description" content="Get Telegram Stars to boost your channel visibility or upgrade to Telegram Premium for an enhanced messaging experience." />
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
