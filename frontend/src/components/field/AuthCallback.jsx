import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, errMsg } from "@/lib/api";

export default function AuthCallback() {
  const location = useLocation();
  const nav = useNavigate();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const sid = new URLSearchParams(location.hash.slice(1)).get("session_id");
    api.post("/auth/session", { session_id: sid })
      .then((r) => nav("/field", { replace: true, state: { user: r.data } }))
      .catch((e) => nav("/field", { replace: true, state: { authError: errMsg(e) } }));
  }, [location.hash, nav]);
  return <div className="min-h-screen bg-abyss" />;
}
