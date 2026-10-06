import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("reefora-lang") || "en");
  useEffect(() => {
    localStorage.setItem("reefora-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const L = useCallback((en, id) => (lang === "id" ? id : en), [lang]);
  return <LangCtx.Provider value={{ lang, setLang, L }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export const TYPE_LABEL = {
  individual: ["Individual", "Individu"],
  corporate: ["Corporate CSR", "CSR Korporat"],
  idol: ["Idol / Artist / Creator", "Idola / Artis / Kreator"],
  tourism: ["Tourism Partner", "Mitra Pariwisata"],
};

export const HEALTH_LABEL = {
  Healthy: ["Healthy", "Sehat"],
  Monitoring: ["Monitoring", "Dalam Pantauan"],
  Bleaching: ["Bleaching", "Memutih"],
  Recovering: ["Recovering", "Pemulihan"],
  Active: ["Active", "Aktif"],
  "At Risk": ["At Risk", "Berisiko"],
  Lost: ["Lost", "Hilang"],
};

export const STATUS_LABEL = {
  available: ["Available for Adoption", "Tersedia untuk Adopsi"],
  adopted: ["Adopted", "Sudah Diadopsi"],
  reserved: ["Reserved", "Dipesan"],
  Nursery: ["Nursery", "Pembibitan"],
  Transplanted: ["Transplanted", "Ditransplantasi"],
  Growing: ["Growing", "Bertumbuh"],
  Established: ["Established", "Mapan"],
};
