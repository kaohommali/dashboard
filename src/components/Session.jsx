import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── ALL BACKEND CONSTANTS UNCHANGED ──────────────────────────────────────
const FLASK_API   = "https://tkikrata.pythonanywhere.com";
const STORAGE_KEY = "ft_recs";
// ──────────────────────────────────────────────────────────────────────────

function saveRec(rec) {
  try {
    const recs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([rec, ...recs]));
  } catch {}
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode = "Normal", resistance = 5, sets = 3, reps = 10 } = location.state || {};

  const [isRunning, setIsRunning]   = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startMsRef = useRef(null);
  const intervalRef = useRef(null);

  const [showHomePopup, setShowHomePopup] = useState(false);

  // ── Timer logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      startMsRef.current = Date.now() - elapsedSec * 1000;
      intervalRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startMsRef.current) / 1000));
      }, 250);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // ── API CALLS UNCHANGED ──────────────────────────────────────────────────

  async function startSession() {
    try {
      const res = await fetch(`${FLASK_API}/start`, { method: "POST" });
      if (res.ok) setIsRunning(true);
    } catch {
      alert("Failed to start session");
    }
  }

  async function stopAndSave() {
    setIsRunning(false);
    const durationSec = elapsedSec;
    try {
      const res  = await fetch(`${FLASK_API}/stop`, { method: "POST" });
      const data = await res.json();
      console.log("Session Data:", data);

      // Backend may return result array or single record
      if (Array.isArray(data.result)) {
        data.result.forEach(r => saveRec(r));
      } else if (data.result) {
        saveRec(data.result);
      } else {
        // fallback: save a local record so the session isn't lost
        saveRec({
          id: Date.now(),
          mode, resistance, sets, reps,
          duration_sec: durationSec,
          date: new Date().toISOString(),
          max_angle: data.max_angle ?? null,
        });
      }
    } catch (err) {
      console.error("Error processing session data:", err);
      // still save locally on network error
      saveRec({
        id: Date.now(),
        mode, resistance, sets, reps,
        duration_sec: durationSec,
        date: new Date().toISOString(),
        max_angle: null,
      });
    }
    navigate("/history");
  }

  function resetTimer() {
    setIsRunning(false);
    setElapsedSec(0);
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

  const R = 120;
  const circumference = 2 * Math.PI * R;
  const progress = Math.min(elapsedSec / 300, 1); // fills over 5 min
  const dashOffset = circumference * (1 - progress);

  const modeLabel = mode === "Auto" ? "Auto Resistance" : "Normal";

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

      {/* ── Session body ── */}
      <div className="session-body">
        <div className="session-center">
          <div className="timer-full-page">

            {/* Mode + stats */}
            <div className="session-info-rows">
              <div className="session-info-pill">{modeLabel}</div>
              <div className="session-info-stats">
                <div className="session-stat-chip">
                  <span className="chip-value">{resistance}</span>
                  <span className="chip-label">Resistance</span>
                </div>
                <div className="session-stat-chip">
                  <span className="chip-value">{sets}</span>
                  <span className="chip-label">Sets</span>
                </div>
                <div className="session-stat-chip">
                  <span className="chip-value">{reps}</span>
                  <span className="chip-label">Reps/Set</span>
                </div>
              </div>
            </div>

            {/* Circle stopwatch */}
            <div className="timer-circle-container">
              <svg className="timer-circle" viewBox="0 0 300 300">
                {/* Track */}
                <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
                {/* Progress */}
                <circle
                  cx="150" cy="150" r={R}
                  fill="none"
                  stroke={isRunning ? "var(--neon-orange)" : "rgba(255,255,255,0.2)"}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="timer-progress"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              </svg>
              <div className={`timer-value-circle${isRunning ? " running" : ""}`}>
                {fmt(elapsedSec)}
              </div>
            </div>

            {/* Buttons */}
            <div className="session-buttons">
              {!isRunning ? (
                <>
                  {/* Before session starts */}
                  <button
                    className="btn-session-cancel"
                    onClick={() => navigate("/settings", { state: { mode, resistance } })}
                  >
                    ← Back
                  </button>
                  <button className="btn-session-start" onClick={startSession}>
                    Start
                  </button>
                </>
              ) : (
                <>
                  {/* While running */}
                  <button className="btn-session-cancel" onClick={resetTimer}>
                    Reset
                  </button>
                  <button className="btn-session-stop" onClick={stopAndSave}>
                    Stop &amp; Save
                  </button>
                </>
              )}
            </div>

            {/* Reset Machine shortcut */}
            <button
              className="btn-reset"
              style={{ marginTop: 16, fontSize: 13, padding: "8px 20px" }}
              onClick={() => setShowHomePopup(true)}
            >
              ↺ Reset Machine
            </button>

          </div>
        </div>
      </div>

      {/* ── Reset Confirm Popup ── */}
      {showHomePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Machine Reset</h2>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Are you sure you want to reset the machine?</p>
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