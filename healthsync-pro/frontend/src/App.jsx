import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { LuLogIn, LuShieldCheck } from "react-icons/lu";
import { Sidebar, Topbar, NAV, Logo } from "./components/Layout.jsx";
import { PageSkeleton, Toast, useDemoLoad, EmptyState } from "./components/ui.jsx";

const pages = {
  dashboard: lazy(() => import("./pages/Dashboard.jsx")),
  patients: lazy(() => import("./pages/Patients.jsx")),
  clinical: lazy(() => import("./pages/Clinical.jsx")),
  respiratory: lazy(() => import("./pages/Respiratory.jsx")),
  staff: lazy(() => import("./pages/Staff.jsx")),
  reports: lazy(() => import("./pages/Reports.jsx")),
  security: lazy(() => import("./pages/Security.jsx")),
  settings: lazy(() => import("./pages/Settings.jsx")),
};

const DEFAULT_SETTINGS = {
  timeout: 15, mfaExport: true, maskMrn: false, notifCritical: true, notifLabs: true, notifBeds: false,
  notifSecurity: true, compact: false, reduceMotion: false, units: "C",
};

/** Minimal hash router: #/patients?open=P-10421 */
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, qs] = raw.split("?");
  const params = new URLSearchParams(qs || "");
  return { route: pages[path] ? path : "dashboard", params, known: !path || !!pages[path], path };
}

export default function App() {
  const [loc, setLoc] = useState(parseHash);
  const [navOpen, setNavOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [signedOut, setSignedOut] = useState(false);
  const ready = useDemoLoad(loc.route + loc.params.toString());

  useEffect(() => {
    const on = () => { setLoc(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    const so = () => setSignedOut(true);
    window.addEventListener("hs:signout", so);
    return () => { window.removeEventListener("hashchange", on); window.removeEventListener("hs:signout", so); };
  }, []);

  useEffect(() => {
    const label = NAV.find((n) => n.path === loc.route)?.label || "Dashboard";
    document.title = `${label} · HealthSync Pro`;
  }, [loc.route]);

  const navigate = useCallback((path, params) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    window.location.hash = `#/${path}${qs}`;
  }, []);
  const notify = useCallback((m) => setToast(m), []);
  const clearToast = useCallback(() => setToast(""), []);
  const openPatient = useCallback((id) => navigate("patients", { open: id }), [navigate]);

  if (signedOut) {
    return (
      <div className="boot">
        <div className="boot-inner" style={{ maxWidth: 380, padding: 24 }}>
          <Logo />
          <h2 style={{ color: "#fff", fontSize: 20 }}>You've been signed out</h2>
          <p style={{ color: "#9fb0cf", margin: "8px 0 20px" }}>This is a demonstration. No credentials are collected or verified.</p>
          <button className="btn primary" onClick={() => setSignedOut(false)}><LuLogIn size={15} />Return to demo</button>
          <p style={{ color: "#6b7ca0", fontSize: 12, marginTop: 20, display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}><LuShieldCheck size={13} />Smarter Healthcare. Connected Care. Secure Operations.</p>
        </div>
      </div>
    );
  }

  const Page = pages[loc.route];
  const props = {
    navigate, notify, openPatient, settings, setSettings,
    globalQuery, clearGlobalQuery: () => setGlobalQuery(""),
    openPatientId: loc.params.get("open"), timeoutMinutes: settings.timeout, maskMrn: settings.maskMrn,
  };

  return (
    <div className={`shell ${settings.compact ? "compact" : ""} ${settings.reduceMotion ? "reduce-motion" : ""}`}>
      <Sidebar route={loc.route} navigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <Topbar onMenu={() => setNavOpen(true)} navigate={navigate} onSearch={setGlobalQuery} />
        <main id="content">
          {!loc.known ? (
            <div className="page"><div className="card"><EmptyState title="Page not found" message={`There is no “${loc.path}” view in this demo.`} action={<button className="btn primary" onClick={() => navigate("dashboard")}>Go to dashboard</button>} /></div></div>
          ) : (
            <Suspense fallback={<PageSkeleton />}>
              {ready ? <Page key={loc.route} {...props} /> : <PageSkeleton />}
            </Suspense>
          )}
        </main>
        <footer className="footer">
          <span>© 2026 HealthSync Pro · Demonstration build · All data fictional</span>
          <span>Smarter Healthcare. Connected Care. Secure Operations.</span>
        </footer>
      </div>
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
