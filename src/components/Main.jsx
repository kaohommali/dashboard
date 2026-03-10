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
            <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="machine-svg">
              <rect x="30"  y="170" width="200" height="18" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,100,0,0.4)" strokeWidth="1.5"/>
              <rect x="118" y="60"  width="24"  height="115" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,100,0,0.35)" strokeWidth="1.5"/>
              <rect x="80"  y="56"  width="100" height="18"  rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,100,0,0.4)" strokeWidth="1.5"/>
              <ellipse cx="90"  cy="185" rx="28" ry="10" fill="rgba(255,80,0,0.18)" stroke="rgba(255,100,0,0.5)" strokeWidth="2"/>
              <ellipse cx="170" cy="185" rx="28" ry="10" fill="rgba(255,80,0,0.18)" stroke="rgba(255,100,0,0.5)" strokeWidth="2"/>
              <circle cx="130" cy="40" r="22" fill="rgba(255,255,255,0.05)" stroke="rgba(255,100,0,0.5)" strokeWidth="2"/>
              <circle cx="130" cy="40" r="10" fill="rgba(255,80,0,0.3)"    stroke="rgba(255,100,0,0.8)" strokeWidth="1.5"/>
              <line x1="130" y1="22" x2="130" y2="30" stroke="rgba(255,120,0,0.9)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="90"  y1="65" x2="90"  y2="175" stroke="rgba(255,100,0,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
              <line x1="170" y1="65" x2="170" y2="175" stroke="rgba(255,100,0,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
            </svg>
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