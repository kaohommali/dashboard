import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const STORAGE_KEY = "ft_recs";
const RES_KEY     = "ft_resistance";

function loadRecs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveRecs(recs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(recs)); }

function formatDuration(s) {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const sec = Math.round(s) % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
}
function randomFrom(list) { return list[Math.floor(Math.random() * list.length)]; }

const MODES = ["Normal", "Auto"];

const MODE_COLORS = {
  "Normal": { bg: "rgba(255,100,0,0.12)",  color: "#ff8c42" },
  "Auto":   { bg: "rgba(50,200,100,0.12)", color: "#4ecb71" },
};

export default function History() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [recs, setRecs]     = useState(loadRecs);
  const [filter, setFilter] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);

  function simulate() {
    const r = {
      id: Date.now(),
      mode: randomFrom(MODES),
      resistance: Number(localStorage.getItem(RES_KEY) || 5),
      reps: Math.floor(Math.random() * 12) + 5,
      rounds: Math.floor(Math.random() * 5) + 2,
      duration_sec: Math.floor(Math.random() * 180) + 30,
      max_angle: Math.floor(Math.random() * 46),
      date: new Date().toISOString(),
    };
    const updated = [r, ...recs];
    setRecs(updated); saveRecs(updated);
  }

  function clearAll() {
    if (!window.confirm("Clear all session records?")) return;
    setRecs([]); saveRecs([]);
  }

  const last = recs[0] ?? null;

  const filtered = recs
    .filter(r => filter === "All" || r.mode === filter)
    .sort((a, b) => sortDesc
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date));

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

      <div className="history-page">

        {/* Page header */}
        <div className="history-header">
          <div className="history-header-left">
            <div className="hero-tag">Session Log</div>
            <h1 className="history-title">history</h1>
            <p className="history-subtitle">{recs.length} sessions recorded</p>
          </div>
          <div className="history-header-actions">
            <button className="btn small" onClick={simulate}>+ Simulate</button>
            <button className="btn btn-danger small" onClick={clearAll}>Clear All</button>
          </div>
        </div>

        {/* Last session card */}
        <div className="last-session-card">
          <div className="last-session-label">Last Session</div>
          {last ? (
            <div className="last-session-body">
              <div className="last-session-left">
                <span className="mode-badge" style={{ background: (MODE_COLORS[last.mode] || MODE_COLORS.Normal).bg, color: (MODE_COLORS[last.mode] || MODE_COLORS.Normal).color }}>
                  {last.mode}
                </span>
                <div className="last-session-date">
                  {new Date(last.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {new Date(last.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
              </div>
              <div className="last-session-stats">
                <div className="last-session-stat">
                  <span className="last-session-stat-value">{formatDuration(last.duration_sec)}</span>
                  <span className="last-session-stat-label">Duration</span>
                </div>
                <div className="last-session-stat">
                  <span className="last-session-stat-value">{last.resistance ?? "—"}</span>
                  <span className="last-session-stat-label">Resistance</span>
                </div>
                <div className="last-session-stat">
                  <span className="last-session-stat-value">{last.rounds ?? "—"}</span>
                  <span className="last-session-stat-label">Sets</span>
                </div>
                <div className="last-session-stat">
                  <span className="last-session-stat-value">{last.reps ?? "—"}</span>
                  <span className="last-session-stat-label">Reps/Set</span>
                </div>
                <div className="last-session-stat">
                  <span className="last-session-stat-value">{last.max_angle != null ? `${last.max_angle}°` : "—"}</span>
                  <span className="last-session-stat-label">Max Angle</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="last-session-empty"><p>No sessions yet.</p></div>
          )}
        </div>

        {/* Filter + sort */}
        <div className="history-toolbar">
          <div className="history-filters">
            {["All", ...MODES].map(m => (
              <button key={m} className={`filter-chip${filter === m ? " active" : ""}`} onClick={() => setFilter(m)}>{m}</button>
            ))}
          </div>
          <button className="sort-btn" onClick={() => setSortDesc(d => !d)}>
            {sortDesc ? "↓ Newest first" : "↑ Oldest first"}
          </button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">📋</div>
            <p>No sessions{filter !== "All" ? ` for mode "${filter}"` : " yet"}.</p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Mode</th>
                  <th>Resistance</th>
                  <th>Sets</th>
                  <th>Reps/Set</th>
                  <th>Duration</th>
                  <th>Max Angle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const mc = MODE_COLORS[r.mode] || { bg: "rgba(163,163,163,0.1)", color: "#a3a3a3" };
                  return (
                    <tr key={r.id} className="history-row" style={{ animationDelay: `${i * 25}ms` }}>
                      <td>
                        <div className="history-date">
                          {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="history-time">
                          {new Date(r.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </div>
                      </td>
                      <td><span className="mode-badge" style={{ background: mc.bg, color: mc.color }}>{r.mode}</span></td>
                      <td className="mono">{r.resistance ?? "—"}</td>
                      <td className="mono">{r.rounds ?? "—"}</td>
                      <td className="mono">{r.reps ?? "—"}</td>
                      <td className="mono">{formatDuration(r.duration_sec)}</td>
                      <td className="mono">{r.max_angle != null ? `${r.max_angle}°` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}