import { MotionConfig } from "framer-motion";
import useLenis from "./hooks/useLenis.ts";
import ScrollProgress from "./components/ScrollProgress.tsx";
import Navbar from "./components/Navbar.tsx";
import Hero from "./components/Hero.tsx";
import TrustBar from "./components/TrustBar.tsx";
import CreditSolutions from "./components/CreditSolutions.tsx";
import About from "./components/About.tsx";
import Simulator from "./components/Simulator.tsx";
import ContactSection from "./components/ContactSection.tsx";
import Testimonials from "./components/Testimonials.tsx";
import Faq from "./components/Faq.tsx";
import LocationSection from "./components/LocationSection.tsx";
import Disclaimer from "./components/Disclaimer.tsx";
import Footer from "./components/Footer.tsx";

export default function App() {
  useLenis();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Navbar />
      <main id="inicio">
        <Hero />
        <TrustBar />
        <CreditSolutions />
        <About />
        <Simulator />
        <ContactSection />
        <Testimonials />
        <Faq />
        <LocationSection />
        <Disclaimer />
      </main>
      <Footer />
    </MotionConfig>
  );
}
