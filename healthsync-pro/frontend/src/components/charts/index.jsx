import React, { useEffect, useMemo, useRef, useState } from "react";

/* Chart palette — navy/teal/sky family, distinguishable in sequence. */
export const PALETTE = ["#0d9488", "#2b4580", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b", "#14b8a6"];

/** Measure container width so SVG charts stay crisp at any size. */
function useWidth(initial = 600) {
  const ref = useRef(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(v) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function ticks(min, max, count = 4) {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

const fmt = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : Number.isInteger(v) ? v : v.toFixed(1));

export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.label}><i style={{ background: it.color }} />{it.label}</span>
      ))}
    </div>
  );
}

/**
 * LineChart — multi-series line/area chart with hover crosshair + tooltip.
 * series: [{ label, data: number[], color?, area?, dashed? }]
 * bands: optional [{ from, to, color }] horizontal reference bands
 */
export function LineChart({ labels, series, height = 240, yMin, yMax, unit = "", bands = [], showLegend = true }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 12, r: 12, b: 26, l: 38 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const all = series.flatMap((s) => s.data);
  const lo = yMin ?? Math.min(0, ...all);
  const hi = yMax ?? niceMax(Math.max(...all) * 1.08);
  const x = (i) => pad.l + (labels.length === 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
  const y = (v) => pad.t + ih - ((v - lo) / (hi - lo)) * ih;
  const step = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(iw / 64))));

  const path = (d) => d.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - pad.l) / iw) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };

  return (
    <div>
      {showLegend && series.length > 1 && <div style={{ marginBottom: 10 }}><Legend items={series.map((s, i) => ({ label: s.label, color: s.color || PALETTE[i] }))} /></div>}
      <div className="chart-box" ref={ref}>
        <svg className="chart" width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={series.map((s) => s.label).join(", ") + " trend chart"}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={i} id={`g-${s.label.replace(/\W/g, "")}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color || PALETTE[i]} stopOpacity="0.22" />
                <stop offset="100%" stopColor={s.color || PALETTE[i]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {bands.map((b, i) => (
            <rect key={i} x={pad.l} width={iw} y={y(Math.min(hi, b.to))} height={Math.max(0, y(Math.max(lo, b.from)) - y(Math.min(hi, b.to)))} fill={b.color} />
          ))}
          {ticks(lo, hi).map((t) => (
            <g key={t}>
              <line className="grid-line" x1={pad.l} x2={pad.l + iw} y1={y(t)} y2={y(t)} />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => (i % step === 0 || i === labels.length - 1) && (
            <text key={i} x={x(i)} y={height - 6} textAnchor="middle">{l}</text>
          ))}
          {series.map((s, i) => {
            const c = s.color || PALETTE[i];
            return (
              <g key={s.label}>
                {s.area && <path d={`${path(s.data)}L${x(s.data.length - 1)},${y(lo)}L${x(0)},${y(lo)}Z`} fill={`url(#g-${s.label.replace(/\W/g, "")}-${i})`} />}
                <path d={path(s.data)} fill="none" stroke={c} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? "5 5" : undefined} />
              </g>
            );
          })}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#94a3b8" strokeDasharray="3 3" />
              {series.map((s, i) => (
                <circle key={i} cx={x(hover)} cy={y(s.data[hover])} r="4.5" fill="#fff" stroke={s.color || PALETTE[i]} strokeWidth="2.25" />
              ))}
            </g>
          )}
        </svg>
        {hover != null && (
          <div className="chart-tip" style={{ left: x(hover), top: Math.min(...series.map((s) => y(s.data[hover]))) }}>
            <b>{labels[hover]}</b>
            {series.map((s, i) => (
              <div className="row" key={i}><i style={{ background: s.color || PALETTE[i] }} />{s.label}: <strong>{s.data[hover]}{unit}</strong></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BarChart — grouped or stacked vertical bars.
 * series: [{ label, data: number[], color? }]
 */
export function BarChart({ labels, series, height = 240, stacked = false, unit = "", showLegend = true }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 12, r: 8, b: 26, l: 36 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const totals = labels.map((_, i) => (stacked ? series.reduce((a, s) => a + s.data[i], 0) : Math.max(...series.map((s) => s.data[i]))));
  const hi = niceMax(Math.max(...totals) * 1.05);
  const band = iw / labels.length;
  const groupW = Math.min(band * 0.68, stacked ? 34 : 18 * series.length + 6);
  const y = (v) => pad.t + ih - (v / hi) * ih;

  return (
    <div>
      {showLegend && series.length > 1 && <div style={{ marginBottom: 10 }}><Legend items={series.map((s, i) => ({ label: s.label, color: s.color || PALETTE[i] }))} /></div>}
      <div className="chart-box" ref={ref}>
        <svg className="chart" width={width} height={height} onMouseLeave={() => setHover(null)} role="img" aria-label="bar chart">
          {ticks(0, hi).map((t) => (
            <g key={t}>
              <line className="grid-line" x1={pad.l} x2={pad.l + iw} y1={y(t)} y2={y(t)} />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => {
            const cx = pad.l + band * i + band / 2;
            let acc = 0;
            return (
              <g key={l} onMouseEnter={() => setHover(i)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={ih} fill={hover === i ? "rgba(15,30,61,0.04)" : "transparent"} />
                {series.map((s, si) => {
                  const c = s.color || PALETTE[si];
                  const v = s.data[i];
                  if (stacked) {
                    const y0 = y(acc), y1 = y(acc + v);
                    acc += v;
                    const isTop = si === series.length - 1;
                    return <rect key={si} x={cx - groupW / 2} width={groupW} y={y1} height={Math.max(0, y0 - y1)} fill={c} rx={isTop ? 4 : 0} />;
                  }
                  const bw = (groupW - 2 * (series.length - 1)) / series.length;
                  return <rect key={si} x={cx - groupW / 2 + si * (bw + 2)} width={bw} y={y(v)} height={Math.max(0, y(0) - y(v))} fill={c} rx="3" />;
                })}
                <text x={cx} y={height - 6} textAnchor="middle">{l}</text>
              </g>
            );
          })}
        </svg>
        {hover != null && (
          <div className="chart-tip" style={{ left: pad.l + band * hover + band / 2, top: y(totals[hover]) }}>
            <b>{labels[hover]}</b>
            {series.map((s, i) => (
              <div className="row" key={i}><i style={{ background: s.color || PALETTE[i] }} />{s.label}: <strong>{s.data[hover]}{unit}</strong></div>
            ))}
            {stacked && series.length > 1 && <div className="row" style={{ marginTop: 3, opacity: 0.8 }}>Total: <strong>{totals[hover]}{unit}</strong></div>}
          </div>
        )}
      </div>
    </div>
  );
}

/** DonutChart — part-to-whole with interactive legend. */
export function DonutChart({ data, size = 180, thickness = 26, centerLabel = "Total" }) {
  const [hl, setHl] = useState(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 4;
  const ir = r - thickness;
  const arcs = useMemo(() => {
    let a0 = -Math.PI / 2;
    return data.map((d, i) => {
      const a1 = a0 + (d.value / total) * Math.PI * 2;
      const gap = 0.012;
      const s = a0 + gap, e = a1 - gap;
      const large = e - s > Math.PI ? 1 : 0;
      const P = (ang, rad) => [size / 2 + rad * Math.cos(ang), size / 2 + rad * Math.sin(ang)];
      const [x0, y0] = P(s, r), [x1, y1] = P(e, r), [x2, y2] = P(e, ir), [x3, y3] = P(s, ir);
      const path = `M${x0},${y0}A${r},${r} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${ir},${ir} 0 ${large} 0 ${x3},${y3}Z`;
      a0 = a1;
      return { path, color: d.color || PALETTE[i % PALETTE.length], ...d };
    });
  }, [data, size, r, ir, total]);
  const active = hl != null ? arcs[hl] : null;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} role="img" aria-label="distribution chart" style={{ flex: "none" }}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} opacity={hl == null || hl === i ? 1 : 0.3} onMouseEnter={() => setHl(i)} onMouseLeave={() => setHl(null)} style={{ transition: "opacity .15s" }} />
        ))}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" style={{ fontSize: 24, fontWeight: 700, fill: "#0f172a" }}>{active ? active.value : total}</text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: "#7b8799" }}>{active ? `${Math.round((active.value / total) * 100)}% · ${active.label}` : centerLabel}</text>
      </svg>
      <div className="donut-legend">
        {arcs.map((a, i) => (
          <div key={a.label} className={hl === i ? "hl" : ""} onMouseEnter={() => setHl(i)} onMouseLeave={() => setHl(null)}>
            <i style={{ background: a.color }} />{a.label}<b>{a.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal progress bars (e.g. bed occupancy by unit). */
export function HBarList({ rows, format = (r) => `${r.pct}%` }) {
  return (
    <div>
      {rows.map((r) => {
        const color = r.pct >= 95 ? "#dc2626" : r.pct >= 85 ? "#f59e0b" : "#0d9488";
        return (
          <div className="bar-row" key={r.label} title={`${r.label}: ${format(r)}`}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, r.pct)}%`, background: color }} /></div>
            <b className="num" style={{ fontWeight: 600 }}>{format(r)}</b>
          </div>
        );
      })}
    </div>
  );
}

export function Sparkline({ data, width = 96, height = 28, color = "#0d9488" }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const x = (i) => (i / (data.length - 1)) * (width - 4) + 2;
  const y = (v) => height - 3 - ((v - lo) / (hi - lo || 1)) * (height - 6);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  return (
    <svg className="spark" width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2.5" fill={color} />
    </svg>
  );
}

/** Radial gauge (0–100). */
export function Ring({ value, size = 120, stroke = 10, color = "#0d9488", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="timeout-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#edf1f6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, value)) / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
      <div>{children}</div>
    </div>
  );
}
