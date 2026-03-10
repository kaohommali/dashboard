import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── ALL BACKEND CONSTANTS UNCHANGED ──────────────────────────────────────
const FLASK_API = "https://tkikrata.pythonanywhere.com";
const RES_KEY   = "ft_resistance";
// ──────────────────────────────────────────────────────────────────────────

const MODES = [
  { id: "Normal", label: "Normal", desc: "Standard workout at a fixed resistance level. Best for building strength steadily." },
  { id: "Auto",   label: "Auto Resistance", desc: "Machine auto-adjusts resistance based on your angle and performance." },
];

function Stepper({ value, onChange, min = 1, max = 20 }) {
  return (
    <div className="number-stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="stepper-value">{value}</span>
      <button className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

export default function SessionSettings() {
  const navigate = useNavigate();

  const [mode, setMode]                   = useState("Normal");
  const [sets, setSets]                   = useState(3);
  const [reps, setReps]                   = useState(10);
  const [resistance, setResistance]       = useState(() => Number(localStorage.getItem(RES_KEY) || 5));
  const [confirmedRes, setConfirmedRes]   = useState(null);
  const [confirming, setConfirming]       = useState(false);
  const [showHomePopup, setShowHomePopup] = useState(false);

  // ─── API CALLS UNCHANGED ─────────────────────────────────────────────────

  async function confirmResistance() {
    setConfirming(true);
    try {
      await fetch(`${FLASK_API}/resis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resistance }),
      });
      localStorage.setItem(RES_KEY, String(resistance));
      setConfirmedRes(resistance);
    } catch {
      alert("Failed to send resistance");
    }
    setConfirming(false);
  }

  async function sendSession() {
    try {
      await fetch(`${FLASK_API}/mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
    } catch {
      alert("Failed to set workout mode");
      return;
    }
    navigate("/session", {
      state: { mode, resistance: confirmedRes ?? resistance, sets, reps, timerType: "stopwatch" },
    });
  }

  async function sendHome() {
    try {
      await fetch(`${FLASK_API}/home`, { method: "POST" });
      alert("Machine reset started");
      setShowHomePopup(false);
    } catch {
      alert("Failed to reset machine");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  const isResConfirmed = confirmedRes !== null && confirmedRes === resistance;

  return (
    <div className="main-page">

      {/* ── Navbar ── */}
      <nav className="main-nav">
        <div className="nav-brand"><span className="nav-logo">Droppy</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/main")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/history")}>History</button>
        </div>
      </nav>

      {/* ── Page Body ── */}
      <div className="settings-page-new">

        <div className="settings-page-header">
          <div className="hero-tag">Session Setup</div>
          <h1 className="settings-page-title">configuration</h1>
          <p className="settings-page-subtitle">Choose your workout mode, volume, and resistance before starting.</p>
        </div>

        <div className="settings-layout">

          {/* ══ LEFT COLUMN ══ */}
          <div className="settings-left">

            {/* Mode selection */}
            <div className="settings-section">
              <div className="settings-section-label">Workout Mode</div>
              <div className="mode-cards">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    className={`mode-card${mode === m.id ? " active" : ""}`}
                    onClick={() => setMode(m.id)}
                  >
                    <div className="mode-card-name">{m.label}</div>
                    <div className="mode-card-desc">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sets + Reps steppers */}
            <div className="settings-section">
              <div className="settings-section-label">Volume</div>
              <div className="volume-row">
                <div className="volume-field">
                  <div className="volume-label">Sets</div>
                  <Stepper value={sets} onChange={setSets} min={1} max={20} />
                </div>
                <div className="volume-divider" />
                <div className="volume-field">
                  <div className="volume-label">Reps / Set</div>
                  <Stepper value={reps} onChange={setReps} min={1} max={30} />
                </div>
              </div>
            </div>

            {/* Reset Machine */}
            <div className="settings-section">
              <div className="settings-section-label">Machine Reset</div>
              <p className="settings-hint">Run homing sequence before starting a session if the machine has been moved.</p>
              <button className="btn-reset" onClick={() => setShowHomePopup(true)}>
                ↺ Reset Machine
              </button>
            </div>

          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="settings-right">

            {/* Resistance control */}
            <div className="settings-section">
              <div className="settings-section-label">Resistance Level</div>

              {/* Big number */}
              <div className="resistance-display">
                <span className="resistance-big">{resistance}</span>
                <span className="resistance-unit">/ 10</span>
              </div>

              {/* Colour slider */}
              <input
                type="range"
                className="res-slider"
                min={0} max={10} step={1}
                value={resistance}
                onChange={e => { setResistance(Number(e.target.value)); setConfirmedRes(null); }}
                style={{ marginTop: 12, marginBottom: 4 }}
              />

              {/* Clickable tick buttons */}
              <div className="res-ticks">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    className={`res-tick${resistance === i ? " active" : ""}`}
                    onClick={() => { setResistance(i); setConfirmedRes(null); }}
                  >
                    {i}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="resistance-status" style={{ margin: "14px 0 10px" }}>
                {isResConfirmed
                  ? <span className="resistance-confirmed">✓ Confirmed at level {confirmedRes}</span>
                  : <span className="resistance-unconfirmed">Not confirmed — tap confirm to send to machine</span>
                }
              </div>

              <button
                className="btn-confirm-resistance"
                onClick={confirmResistance}
                disabled={isResConfirmed || confirming}
              >
                {confirming ? "Sending…" : isResConfirmed ? "✓ Confirmed" : "Confirm Resistance"}
              </button>
            </div>

            {/* Session Preview */}
            <div className="session-preview">
              <div className="session-preview-label">Session Preview</div>
              <div className="session-preview-row">
                <span>Mode</span>
                <span>{MODES.find(m => m.id === mode)?.label ?? mode}</span>
              </div>
              <div className="session-preview-row">
                <span>Sets</span>
                <span>{sets}</span>
              </div>
              <div className="session-preview-row">
                <span>Reps / Set</span>
                <span>{reps}</span>
              </div>
              <div className="session-preview-row">
                <span>Resistance</span>
                <span style={{ color: isResConfirmed ? "#4ecb71" : "var(--muted)" }}>
                  {isResConfirmed ? confirmedRes : `${resistance} (unconfirmed)`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="settings-actions">
              <button className="btn-session-cancel" onClick={() => navigate("/main")}>← Cancel</button>
              <button className="btn-hero-start" onClick={sendSession} style={{ flex: 1 }}>
                Start Session →
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Reset Confirm Popup ── */}
      {showHomePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Machine Reset</h2>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Are you sure you want to reset (home) the machine?</p>
            <p style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6 }}>⚠ Ensure the patient's foot is removed first.</p>
            <div className="modal-actions">
              <button className="btn-session-cancel" onClick={() => setShowHomePopup(false)}>Cancel</button>
              <button className="btn-session-stop" style={{ padding: "12px 28px", fontSize: 14 }} onClick={sendHome}>Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
