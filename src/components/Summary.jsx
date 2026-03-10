import React from "react";

export default function Summary({ recs, compact }) {
  const total = recs.length;
  const totalMin = recs.reduce((s, r) => s + (r.duration_sec || 0), 0) / 60;
  const avgRes = total
    ? (recs.reduce((s, r) => s + (r.resistance || 0), 0) / total).toFixed(1)
    : "—";
  const maxAngle = total
    ? Math.max(...recs.map(r => r.max_angle ?? 0))
    : null;

  // streak: consecutive days with at least one session
  const days = [...new Set(recs.map(r => r.date?.slice(0, 10)))].sort();
  let streak = 0;
  if (days.length) {
    streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const diff = (new Date(days[i]) - new Date(days[i - 1])) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }

  if (compact) {
    // compact version for hero right panel
    if (total === 0) {
      return (
        <div className="summary-compact empty-state">
          <div className="compact-stat-label" style={{ opacity: 0.5 }}>No sessions yet</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Complete a session to see your stats here.</div>
        </div>
      );
    }
    return (
      <div className="summary-compact">
        <div className="summary-compact-streak">{streak} day streak 🔥</div>
        <div className="summary-compact-grid">
          <div className="compact-stat">
            <div className="compact-stat-value">{total}</div>
            <div className="compact-stat-label">Sessions</div>
          </div>
          <div className="compact-stat">
            <div className="compact-stat-value">{totalMin.toFixed(0)}m</div>
            <div className="compact-stat-label">Total Time</div>
          </div>
          <div className="compact-stat">
            <div className="compact-stat-value">{avgRes}</div>
            <div className="compact-stat-label">Avg Resistance</div>
          </div>
          <div className="compact-stat">
            <div className="compact-stat-value">{maxAngle !== null ? `${maxAngle}°` : "—"}</div>
            <div className="compact-stat-label">Max Angle</div>
          </div>
        </div>
      </div>
    );
  }

  // full version
  return (
    <div>
      {streak > 0 && <p className="streak">{streak} day streak 🔥</p>}
      <div className="summary-grid">
        <div className="stat">
          <div className="label">Sessions</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat">
          <div className="label">Total Time</div>
          <div className="value">{totalMin.toFixed(0)} min</div>
        </div>
        <div className="stat">
          <div className="label">Avg Resistance</div>
          <div className="value">{avgRes}</div>
        </div>
        <div className="stat">
          <div className="label">Max Angle</div>
          <div className="value">{maxAngle !== null ? `${maxAngle}°` : "—"}</div>
        </div>
      </div>
    </div>
  );
}