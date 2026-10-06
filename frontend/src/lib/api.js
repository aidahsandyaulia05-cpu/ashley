import axios from "axios";

export const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const api = axios.create({ baseURL: `${BACKEND}/api`, withCredentials: true });

export const mediaSrc = (u) => (u?.startsWith("/api/") ? `${BACKEND}${u}` : u);

export const INSTAGRAM_URL = "https://www.instagram.com/reefora/";
export const INSTAGRAM_HANDLE = "@reefora";

export const errMsg = (e) => e?.response?.data?.detail?.toString?.() || e?.message || "Something went wrong";

export const idr = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (iso, lang = "en") =>
  iso ? new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

export const profileUrl = (coralId) => `${window.location.origin}/coral/${coralId}`;
