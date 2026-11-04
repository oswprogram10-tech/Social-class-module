import { useEffect, useMemo, useState } from 'react';
import { QUIZZES } from '../content/quizzes';
import {
  CITIES,
  CLIMATE_SOURCE,
  POP_SOURCE,
  POP_YEARS,
  PROVINCES,
  capitalShare,
  fmtPop,
  totalPop,
  type City,
} from '../content/korea-data';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import KoreaMap, { type MapAreas, type MapPoint } from './KoreaMap';
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

/** 가까이 붙어 있는 곳의 이름표 위치를 조금씩 옮깁니다(px) */
const CITY_LABEL_OFFSET: Record<string, [number, number]> = {
  cheongju: [10, -12],
  daejeon: [26, 4],
  jeonju: [-24, 4],
  daegu: [18, -6],
};
const PROVINCE_LABEL_OFFSET: Record<string, [number, number]> = {
  seoul: [0, -13],
  incheon: [-26, 10],
  gyeonggi: [24, 14],
  sejong: [-14, -10],
  chungnam: [-22, 10],
  daejeon: [12, 10],
  gwangju: [-10, -9],
  jeonnam: [8, 10],
  ulsan: [12, -4],
  busan: [4, 10],
  daegu: [-6, 8],
};

/** 기온 → 색 (추우면 파랑, 더우면 빨강) */
function tempColor(t: number): string {
  const x = Math.max(0, Math.min(1, (t + 5) / 35));
  const hue = 230 - 230 * x;
  return `hsl(${hue}, 80%, 55%)`;
}

/** 기후 그래프: 막대 = 강수량, 꺾은선 = 기온 */
export function ClimateChart({
  city,
  tMin = -5,
  tMax = 30,
  maxRain = 450,
}: {
  city: Pick<City, 'name' | 'temp' | 'rain'>;
  /** 기온 축 범위(℃): 10℃ 단위로 맞춰 주세요 */
  tMin?: number;
  tMax?: number;
  /** 강수량 축 최댓값(㎜) */
  maxRain?: number;
}) {
  const W = 360;
  const H = 200;
  const pad = { l: 34, r: 34, t: 12, b: 24 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (iw / 12) * (i + 0.5);
  const yRain = (v: number) => pad.t + ih - (v / maxRain) * ih;
  const yTemp = (v: number) => pad.t + ih - ((v - tMin) / (tMax - tMin)) * ih;
  const line = city.temp.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${yTemp(t)}`).join(' ');
  const yearRain = city.rain.reduce((s, v) => s + v, 0);
  const avgTemp = city.temp.reduce((s, v) => s + v, 0) / 12;
  return (
    <figure className="climate-chart">
      <figcaption>
        <strong>{city.name}</strong>의 기후 그래프 · 1년 강수량 <strong>{yearRain.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}㎜</strong> ·
        연평균 기온 <strong>{avgTemp.toFixed(1)}℃</strong>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${city.name} 월별 기온과 강수량 그래프`}>
        {Array.from({ length: Math.floor(maxRain / 100) + 1 }, (_, i) => i * 100).map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={yRain(v)} y2={yRain(v)} className="grid" />
            <text x={pad.l - 4} y={yRain(v) + 3} textAnchor="end" className="axis axis--rain">
              {v}
            </text>
          </g>
        ))}
        {Array.from({ length: Math.floor(tMax / 10) - Math.ceil(tMin / 10) + 1 }, (_, i) => (Math.ceil(tMin / 10) + i) * 10).map((v) => (
          <text key={v} x={W - pad.r + 4} y={yTemp(v) + 3} className="axis axis--temp">
            {v}℃
          </text>
        ))}
        {city.rain.map((v, i) => (
          <rect key={i} x={x(i) - 9} y={yRain(v)} width={18} height={pad.t + ih - yRain(v)} className="bar" rx={3}>
            <title>{`${i + 1}월 강수량 ${v}㎜`}</title>
          </rect>
        ))}
        <path d={line} className="tline" />
        {city.temp.map((t, i) => (
          <circle key={i} cx={x(i)} cy={yTemp(t)} r={3.5} className="tdot">
            <title>{`${i + 1}월 기온 ${t}℃`}</title>
          </circle>
        ))}
        {city.temp.map((_, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="axis">
            {i + 1}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <span>
          <i className="swatch swatch--bar" /> 강수량(㎜, 왼쪽)
        </span>
        <span>
          <i className="swatch swatch--line" /> 기온(℃, 오른쪽)
        </span>
      </div>
    </figure>
  );
}

export function ClimateActivity(props: Props) {
  const [month, setMonth] = useState(0);
  const [mode, setMode] = useState<'temp' | 'rain'>('temp');
  const [selected, setSelected] = useState<string | null>(null);

  const points = useMemo<MapPoint[]>(
    () =>
      CITIES.map((c) =>
        mode === 'temp'
          ? {
              id: c.id,
              lat: c.lat,
              lng: c.lng,
              radius: 16,
              color: tempColor(c.temp[month]),
              label: `${c.name} ${c.temp[month]}℃`,
              labelOffset: CITY_LABEL_OFFSET[c.id],
            }
          : {
              id: c.id,
              lat: c.lat,
              lng: c.lng,
              radius: 6 + Math.sqrt(c.rain[month]) * 1.4,
              color: '#38bdf8',
              label: `${c.name} ${c.rain[month]}㎜`,
              labelOffset: CITY_LABEL_OFFSET[c.id],
            },
      ),
    [month, mode],
  );
  const city = CITIES.find((c) => c.id === selected);

  return (
    <>
      <div className="work-area work-area--map">
        <div className="map-controls">
          <div className="seg" role="group" aria-label="보기">
            <button type="button" aria-pressed={mode === 'temp'} className={mode === 'temp' ? 'on' : ''} onClick={() => setMode('temp')}>
              🌡️ 기온
            </button>
            <button type="button" aria-pressed={mode === 'rain'} className={mode === 'rain' ? 'on' : ''} onClick={() => setMode('rain')}>
              ☔ 강수량
            </button>
          </div>
          <label className="slider">
            <span>
              <strong>{month + 1}월</strong>
            </span>
            <input type="range" min={0} max={11} value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="달 고르기" aria-valuetext={`${month + 1}월`} />
          </label>
        </div>
        <div className="map-box">
          <KoreaMap points={points} selectedId={selected} onSelect={setSelected} ariaLabel="우리나라 도시별 기후 지도" />
        </div>
        {city ? <ClimateChart city={city} /> : <p className="hint">도시를 누르면 기후 그래프가 나와요.</p>}
        <p className="source">자료: {CLIMATE_SOURCE}</p>
      </div>
      <QuizPanel
        {...props}
        activity="climate"
        set={QUIZZES.climate!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={(id) => CITIES.find((c) => c.id === id)?.name ?? id}
        targetWord="도시"
      />
    </>
  );
}

/** 인구 증감률 단계 (감소 = 붉은색, 증가 = 파란색) */
const CHANGE_CLASSES = [
  { max: -20, color: '#b91c1c', label: '20% 넘게 줄었어요' },
  { max: -5, color: '#fca5a5', label: '5~20% 줄었어요' },
  { max: 5, color: '#f1f5f9', label: '거의 그대로(±5%)' },
  { max: 20, color: '#93c5fd', label: '5~20% 늘었어요' },
  { max: Infinity, color: '#1d4ed8', label: '20% 넘게 늘었어요' },
];

function changeColor(pct: number): string {
  return CHANGE_CLASSES.find((c) => pct < c.max)!.color;
}

function pctText(pct: number): string {
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

type PopMode = 'circle' | 'change';

export function PopulationActivity(props: Props) {
  const [yearIdx, setYearIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<PopMode>('circle');
  const [baseIdx, setBaseIdx] = useState(0);
  const [geo, setGeo] = useState<MapAreas['geo'] | null>(null);
  const [geoError, setGeoError] = useState(false);
  const maxPop = 14_000_000;

  // 시도 경계는 색칠 지도를 처음 켤 때만 불러옵니다.
  useEffect(() => {
    if (mode !== 'change' || geo) return;
    import('../content/korea-provinces.geo.json')
      .then((m) => setGeo(m.default as unknown as MapAreas['geo']))
      .catch(() => setGeoError(true));
  }, [mode, geo]);

  const change = (id: string) => {
    const p = PROVINCES.find((x) => x.id === id)!;
    return ((p.pop[yearIdx] - p.pop[baseIdx]) / p.pop[baseIdx]) * 100;
  };
  const canCompare = baseIdx < yearIdx;
  const points = useMemo<MapPoint[]>(
    () =>
      PROVINCES.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        radius: mode === 'circle' ? 4 + Math.sqrt(p.pop[yearIdx] / maxPop) * 34 : 0,
        color: p.capital ? '#f97316' : '#6366f1',
        label: p.name,
        labelOffset: PROVINCE_LABEL_OFFSET[p.id],
      })),
    [yearIdx, mode],
  );
  const ranked = useMemo(
    () => (canCompare ? PROVINCES.map((p) => ({ p, c: ((p.pop[yearIdx] - p.pop[baseIdx]) / p.pop[baseIdx]) * 100 })).sort((a, b) => a.c - b.c) : []),
    [yearIdx, baseIdx, canCompare],
  );
  const maxAbs = Math.max(1, ...ranked.map((x) => Math.min(100, Math.abs(x.c))));
  const areas = useMemo<MapAreas | undefined>(() => {
    if (mode !== 'change' || !geo) return undefined;
    const fill: Record<string, string> = {};
    PROVINCES.forEach((p) => (fill[p.id] = canCompare ? changeColor(((p.pop[yearIdx] - p.pop[baseIdx]) / p.pop[baseIdx]) * 100) : '#f1f5f9'));
    return { geo, fill };
  }, [mode, geo, yearIdx, baseIdx, canCompare]);
  const prov = PROVINCES.find((p) => p.id === selected);
  const share = capitalShare(yearIdx);
  const maxOfProv = prov ? Math.max(...prov.pop) : 1;

  return (
    <>
      <div className="work-area work-area--map">
        <div className="map-controls">
          <label className="slider">
            <span>
              <strong>{POP_YEARS[yearIdx]}년</strong>
            </span>
            <input
              type="range"
              min={0}
              max={POP_YEARS.length - 1}
              value={yearIdx}
              onChange={(e) => setYearIdx(Number(e.target.value))}
              aria-label="연도 고르기"
              aria-valuetext={`${POP_YEARS[yearIdx]}년`}
            />
          </label>
          <div className="stat">
            전국 {fmtPop(totalPop(yearIdx))} · <span className="stat__cap">수도권 {(share * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="map-controls">
          <div className="seg" role="group" aria-label="지도 보기">
            <button type="button" className={mode === 'circle' ? 'on' : ''} aria-pressed={mode === 'circle'} onClick={() => setMode('circle')}>
              ⚪ 인구 수(원)
            </button>
            <button
              type="button"
              className={mode === 'change' ? 'on' : ''}
              aria-pressed={mode === 'change'}
              onClick={() => {
                setMode('change');
                if (yearIdx === 0) setYearIdx(POP_YEARS.length - 1);
              }}
            >
              🎨 늘고 줄기(색칠)
            </button>
          </div>
          {mode === 'change' && (
            <label className="base-year">
              비교할 해{' '}
              <select value={baseIdx} onChange={(e) => setBaseIdx(Number(e.target.value))} aria-label="비교할 해">
                {POP_YEARS.map((y, i) => (
                  <option key={y} value={i}>
                    {y}년
                  </option>
                ))}
              </select>{' '}
              → {POP_YEARS[yearIdx]}년
            </label>
          )}
        </div>
        {mode === 'change' && (
          <div className="pop-legend change-legend">
            {canCompare ? (
              CHANGE_CLASSES.map((c) => (
                <span key={c.label}>
                  <i style={{ background: c.color }} /> {c.label}
                </span>
              ))
            ) : (
              <span className="hint">위의 연도를 “비교할 해”보다 뒤로 옮겨 주세요.</span>
            )}
            {geoError && <span className="error">경계 지도를 불러오지 못했어요.</span>}
          </div>
        )}
        <div className="share-bar" aria-label={`수도권 인구 비율 ${(share * 100).toFixed(1)}%`}>
          <span style={{ width: `${share * 100}%` }}>수도권(서울·인천·경기)</span>
        </div>
        <div className="map-box">
          <KoreaMap points={points} areas={areas} selectedId={selected} onSelect={setSelected} ariaLabel="우리나라 시도별 인구 지도" />
        </div>
        {prov ? (
          <section className="pop-card">
            <h3>
              {prov.name} {prov.capital && <span className="tag">수도권</span>}
            </h3>
            {mode === 'change' && canCompare && (
              <p className="hint">
                {POP_YEARS[baseIdx]}년 → {POP_YEARS[yearIdx]}년: <strong>{pctText(change(prov.id))}</strong> ({fmtPop(prov.pop[baseIdx])} →{' '}
                {fmtPop(prov.pop[yearIdx])})
              </p>
            )}
            <ul className="bars">
              {POP_YEARS.map((y, i) => (
                <li key={y}>
                  <span className="bars__label">{y}년</span>
                  <span className="bars__track">
                    <span className="bars__fill" style={{ width: `${(prov.pop[i] / maxOfProv) * 100}%` }} />
                  </span>
                  <span className="bars__n bars__n--wide">{fmtPop(prov.pop[i])}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="hint">
            {mode === 'circle'
              ? '원의 크기가 인구예요. 시도를 누르면 연도별 인구가 나와요.'
              : '두 해 사이에 인구가 늘었으면 파란색, 줄었으면 붉은색이에요. 시도를 누르면 연도별 인구가 나와요.'}
          </p>
        )}
        {mode === 'change' && ranked.length > 0 && (
          <section className="pop-card">
            <h3>
              {POP_YEARS[baseIdx]}년 → {POP_YEARS[yearIdx]}년 인구 변화 (줄어든 곳부터)
            </h3>
            <ul className="change-list">
              {ranked.map(({ p, c }) => (
                <li key={p.id}>
                  <button type="button" className={`linkish ${p.id === selected ? 'linkish--on' : ''}`} onClick={() => setSelected(p.id)}>
                    {p.name}
                  </button>
                  <span className="change-list__track">
                    <span
                      className={`change-list__bar ${c < 0 ? 'change-list__bar--down' : 'change-list__bar--up'}`}
                      style={{ width: `${(Math.min(100, Math.abs(c)) / maxAbs) * 50}%` }}
                    />
                  </span>
                  <span className="change-list__n">{pctText(c)}</span>
                </li>
              ))}
            </ul>
            <p className="hint">100%보다 많이 늘어난 곳은 막대를 끝까지만 그렸어요.</p>
          </section>
        )}
        <p className="source">
          자료: {POP_SOURCE}
          {mode === 'change' && ' · 시도 경계: Natural Earth(퍼블릭 도메인, 1:1천만 축척이라 경계는 대략이에요)'}
        </p>
      </div>
      <QuizPanel
        {...props}
        activity="population"
        set={QUIZZES.population!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={(id) => PROVINCES.find((p) => p.id === id)?.name ?? id}
        targetWord="시도"
      />
    </>
  );
}
