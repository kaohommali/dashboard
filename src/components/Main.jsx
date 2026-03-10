import React, { useEffect, useState } from "react";
import Summary from "./Summary";
import { useNavigate, useLocation } from "react-router-dom";

const STORAGE_KEY = "ft_recs";
const RES_KEY     = "ft_resistance";

function loadRecs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export default function Main() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [recs]    = useState(loadRecs);
  const resistance = Number(localStorage.getItem(RES_KEY) || 5);

  function goSettings() {
    navigate("/settings", { state: { resistance, confirmedRes: null } });
  }

  return (
    <div className="main-page">

      {/* ── Navbar ── */}
      <nav className="main-nav">
        <div className="nav-brand"><span className="nav-logo">Droppy</span></div>
        <div className="nav-links">
          <button className={`nav-link${location.pathname === "/main"    ? " active" : ""}`} onClick={() => navigate("/main")}>Dashboard</button>
          <button className={`nav-link${location.pathname === "/history" ? " active" : ""}`} onClick={() => navigate("/history")}>History</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">

        {/* Left — branding + illustration */}
        <div className="hero-left">
          <div className="hero-tag">rehabilitation Dashboard</div>
          <h1 className="hero-title">foot Drop<br />rehab machine</h1>
          <p className="hero-subtitle">
            Track your recovery. Monitor resistance, angle, and session duration over time.
          </p>
          <div className="hero-feature-row">
            <div className="hero-feature"><span className="hero-feature-icon">⚡</span><span>Auto Resistance</span></div>
            <div className="hero-feature"><span className="hero-feature-icon">📐</span><span>Angle Tracking</span></div>
            <div className="hero-feature"><span className="hero-feature-icon">📊</span><span>Session Records</span></div>
          </div>
          <div className="hero-machine-visual">
            <div className="machine-glow" />
            
          </div>
        </div>

        {/* Right — stats + CTA */}
        <div className="hero-right">
          <Summary recs={recs} compact />

          <div className="hero-cta-panel">
            <div className="cta-label">Ready to train?</div>
            <button className="btn-hero-start" onClick={goSettings}>
              Start Session →
            </button>
            <p className="cta-hint">Configure mode &amp; resistance before starting</p>
          </div>
        </div>
      </section>

    </div>
  );
}
