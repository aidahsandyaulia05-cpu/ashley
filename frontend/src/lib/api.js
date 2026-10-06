import axios from "axios";

export const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

export const errMsg = (e) => e?.response?.data?.detail?.toString?.() || e?.message || "Something went wrong";

export const idr = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (iso, lang = "en") =>
  iso ? new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

export const profileUrl = (coralId) => `${window.location.origin}/coral/${coralId}`;
