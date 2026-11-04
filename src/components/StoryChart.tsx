import type { StoryChart as Chart } from '../content/sorts';

const W = 560;
const H = 220;
const PAD = { top: 26, right: 8, bottom: 30, left: 8 };

const fmt = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

/** 공식 통계 막대그래프: 막대 위에 값을 적고, 화면 읽기 프로그램용 표도 함께 둡니다. */
export default function StoryChart({ chart }: { chart: Chart }) {
  const max = Math.max(...chart.points.map((p) => p.value));
  const n = chart.points.length;
  const slot = (W - PAD.left - PAD.right) / n;
  const barW = Math.min(56, slot * 0.62);
  const ih = H - PAD.top - PAD.bottom;
  return (
    <figure className="story-chart">
      <figcaption>
        <strong>{chart.title}</strong> <span className="hint">(단위: {chart.unit})</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="story-chart__svg">
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} className="story-chart__axis" />
        {chart.points.map((p, i) => {
          const h = max > 0 ? (p.value / max) * ih : 0;
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const y = H - PAD.bottom - h;
          return (
            <g key={p.label}>
              <rect x={x} y={y} width={barW} height={h} rx={4} className="story-chart__bar" />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="story-chart__value">
                {fmt(p.value)}
              </text>
              <text x={x + barW / 2} y={H - PAD.bottom + 18} textAnchor="middle" className="story-chart__label">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>
          {chart.title} (단위: {chart.unit})
        </caption>
        <tbody>
          {chart.points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>
                {fmt(p.value)} {chart.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="source">
        자료: {chart.source}
        {chart.note && ` · ${chart.note}`}
      </p>
    </figure>
  );
}
