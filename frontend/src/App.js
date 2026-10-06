import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LangProvider } from "@/lib/i18n";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Home from "@/pages/Home";
import AdoptPage from "@/pages/AdoptPage";
import AdoptFlow from "@/pages/AdoptFlow";
import CertificatePage from "@/pages/CertificatePage";
import CoralProfile from "@/pages/CoralProfile";
import MyCoral from "@/pages/MyCoral";
import Business from "@/pages/Business";
import Idol from "@/pages/Idol";
import Science from "@/pages/Science";
import Visit from "@/pages/Visit";
import About from "@/pages/About";

const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

function App() {
  return (
    <div className="App">
      <LangProvider>
        <BrowserRouter>
          <ScrollManager />
          <Nav />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/adopt" element={<AdoptPage />} />
              <Route path="/adopt/:coralId" element={<AdoptFlow />} />
              <Route path="/certificate/:adoptionId" element={<CertificatePage />} />
              <Route path="/coral/:coralId" element={<CoralProfile />} />
              <Route path="/my-coral" element={<MyCoral />} />
              <Route path="/business" element={<Business />} />
              <Route path="/idol" element={<Idol />} />
              <Route path="/science" element={<Science />} />
              <Route path="/visit" element={<Visit />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </LangProvider>
    </div>
  );
}

export default App;
