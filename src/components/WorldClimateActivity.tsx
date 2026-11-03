import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { QUIZZES } from '../content/quizzes';
import {
  WORLD_CITIES,
  WORLD_CLIMATE_SOURCE,
  ZONES,
  avgTemp,
  coldest,
  warmest,
  worldCityName,
  yearRain,
  type WorldCity,
} from '../content/world-climate';
import { COUNTRIES, GRATICULE } from '../content/worldGeo';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import { ClimateChart } from './KoreaActivities';
import QuizPanel from './QuizPanel';

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

const MW = 640;
const MH = 400;
const SCALE = MW / (2 * Math.PI);
/** 북회귀선·남회귀선, 북극권·남극권 위도 */
const TROPIC = 23.44;
const POLAR = 66.56;

const zoneOf = (c: WorldCity) => ZONES.find((z) => z.id === c.zone)!;
const fmt = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

function latText(lat: number) {
  return `${lat >= 0 ? '북위' : '남위'} ${Math.abs(lat).toFixed(1)}°`;
}

/** 이름표 위치 조정(px): 가까운 도시끼리 겹치지 않게 */
const LABEL_DX: Record<string, [number, number, 'start' | 'end']> = {
  london: [-8, -6, 'end'],
  moscow: [8, -6, 'start'],
  cairo: [8, 4, 'start'],
  seoul: [8, 4, 'start'],
  singapore: [8, 4, 'start'],
  utqiagvik: [8, 4, 'start'],
  quito: [8, 4, 'start'],
};

/** [6사10-02] 세계의 다양한 기후: 기후대별 도시의 기후 그래프와 생활 모습 */
export default function WorldClimateActivity(props: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const proj = useMemo(() => geoMercator().scale(SCALE).translate([MW / 2, MH / 2 + 40]), []);
  const path = useMemo(() => geoPath(proj), [proj]);
  const land = useMemo(() => COUNTRIES.map((c) => path(c)).filter(Boolean).join(' '), [path]);
  const city = selected ? WORLD_CITIES.find((c) => c.id === selected) : undefined;

  const latLine = (lat: number) => {
    const y = proj([0, lat])![1];
    return y;
  };
  const lines = [
    { lat: 0, label: '적도', cls: 'lat-line lat-line--eq' },
    { lat: TROPIC, label: '북회귀선', cls: 'lat-line' },
    { lat: -TROPIC, label: '남회귀선', cls: 'lat-line' },
    { lat: POLAR, label: '북극권', cls: 'lat-line' },
    { lat: -POLAR, label: '남극권', cls: 'lat-line' },
  ];

  return (
    <>
      <div className="work-area">
        <figure className="globe-fig globe-fig--map worldclimate-map">
          <svg viewBox={`0 0 ${MW} ${MH}`} className="merc-svg" role="group" aria-label="세계 기후 지도. 도시를 눌러 기후 그래프를 보세요.">
            <rect width={MW} height={MH} className="ocean" />
            <path d={path(GRATICULE) ?? ''} className="graticule" />
            <path d={land} className="land-plain" />
            {lines.map((l) => {
              const y = latLine(l.lat);
              if (y < 0 || y > MH) return null;
              return (
                <g key={l.label}>
                  <line x1={0} x2={MW} y1={y} y2={y} className={l.cls} />
                  <text x={4} y={y - 3} className="lat-label">
                    {l.label}
                  </text>
                </g>
              );
            })}
            {WORLD_CITIES.map((c) => {
              const [x, y] = proj([c.lng, c.lat])!;
              const z = zoneOf(c);
              const [dx, dy, anchor] = LABEL_DX[c.id] ?? [8, 4, 'start'];
              const on = c.id === selected;
              return (
                <g
                  key={c.id}
                  className={`wc-city ${on ? 'wc-city--on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name} (${z.name})`}
                  aria-pressed={on}
                  data-city={c.id}
                  onClick={() => setSelected(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(c.id);
                    }
                  }}
                >
                  <circle cx={x} cy={y} r={14} className="wc-city__hit" />
                  <circle cx={x} cy={y} r={on ? 8 : 6} fill={z.color} className="wc-city__dot" />
                  <text x={x + dx} y={y + dy} textAnchor={anchor} className="wc-city__label">
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="pop-legend">
            {ZONES.map((z) => (
              <span key={z.id}>
                <i style={{ background: z.color, borderRadius: '50%' }} /> {z.name}
              </span>
            ))}
          </div>
        </figure>

        <section className="country-card wc-card" aria-live="polite">
          {city ? (
            <>
              <p>
                <strong>{city.name}</strong> ({city.country}) ·{' '}
                <span className="zone-chip" style={{ background: zoneOf(city).color }}>
                  {zoneOf(city).name}
                </span>
              </p>
              <p className="hint">
                {latText(city.lat)} · 해발 약 {city.elevation.toLocaleString('ko-KR')}m · {zoneOf(city).feature}
              </p>
              <ClimateChart city={city} tMin={-30} tMax={30} maxRain={450} />
              <ul className="life-list">
                {city.life.map((l) => (
                  <li key={l.title}>
                    <span aria-hidden>{l.icon}</span> <strong>{l.title}</strong> {l.text}
                  </li>
                ))}
              </ul>
              <p className="source">자료: {city.source}</p>
            </>
          ) : (
            <p className="hint">지도나 아래 표에서 도시를 누르면 기후 그래프와 사람들의 생활 모습이 나와요.</p>
          )}
        </section>

        <section className="pop-card">
          <h3>도시별 기후 비교</h3>
          <div className="table-wrap">
            <table className="wc-table">
              <thead>
                <tr>
                  <th>도시</th>
                  <th>기후</th>
                  <th>연평균 기온</th>
                  <th>가장 더운 달</th>
                  <th>가장 추운 달</th>
                  <th>1년 강수량</th>
                </tr>
              </thead>
              <tbody>
                {WORLD_CITIES.map((c) => (
                  <tr key={c.id} className={c.id === selected ? 'row--on' : ''}>
                    <td>
                      <button type="button" className={`linkish ${c.id === selected ? 'linkish--on' : ''}`} onClick={() => setSelected(c.id)}>
                        {c.name}
                      </button>
                    </td>
                    <td>
                      <i className="zone-dot" style={{ background: zoneOf(c).color }} /> {zoneOf(c).name.replace(' 기후', '')}
                    </td>
                    <td>{fmt(avgTemp(c))}℃</td>
                    <td>{fmt(warmest(c))}℃</td>
                    <td>{fmt(coldest(c))}℃</td>
                    <td>{fmt(yearRain(c))}㎜</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="source">자료: {WORLD_CLIMATE_SOURCE}. 지도: Natural Earth</p>
      </div>
      <QuizPanel
        {...props}
        activity="worldclimate"
        set={QUIZZES.worldclimate!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={worldCityName}
        targetWord="도시"
      />
    </>
  );
}
