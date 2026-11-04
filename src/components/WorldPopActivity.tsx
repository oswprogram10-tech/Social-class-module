import { useMemo, useState, type PointerEvent } from 'react';
import { geoContains, geoMercator, geoPath } from 'd3-geo';
import { QUIZZES } from '../content/quizzes';
import {
  CONTINENTS,
  CONTINENT_POP,
  COUNTRY_POP,
  POP_NOTES,
  WORLD_POP_SOURCE,
  WORLD_TOTAL_2023,
  type CountryPop,
} from '../content/world-pop';
import { COUNTRIES, GRATICULE, countryName } from '../content/worldGeo';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import CountryPicker from './CountryPicker';
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

const POP_BY_ID = new Map<string, CountryPop>(COUNTRY_POP.map((c) => [c.id, c]));

type Mode = 'pop' | 'density';

const CLASSES: Record<Mode, { max: number; label: string }[]> = {
  pop: [
    { max: 10_000_000, label: '1천만 명 미만' },
    { max: 50_000_000, label: '1천만~5천만' },
    { max: 100_000_000, label: '5천만~1억' },
    { max: 300_000_000, label: '1억~3억' },
    { max: Infinity, label: '3억 명 이상' },
  ],
  density: [
    { max: 10, label: '10명 미만' },
    { max: 50, label: '10~50명' },
    { max: 100, label: '50~100명' },
    { max: 300, label: '100~300명' },
    { max: Infinity, label: '300명 이상' },
  ],
};
const COLORS = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#172554'];

function classOf(mode: Mode, c: CountryPop): number {
  const v = mode === 'pop' ? c.pop : c.pop / c.area;
  return CLASSES[mode].findIndex((k) => v < k.max);
}

function people(n: number): string {
  if (n >= 100_000_000) return `약 ${(n / 100_000_000).toFixed(1)}억 명`;
  if (n >= 10_000) return `약 ${Math.round(n / 10_000).toLocaleString('ko-KR')}만 명`;
  return `${n.toLocaleString('ko-KR')}명`;
}

/** [6사12-01] 세계 인구 분포: 나라별 인구·인구 밀도 지도, 대륙별 비율, 탐구 질문 */
export default function WorldPopActivity(props: Props) {
  const [mode, setMode] = useState<Mode>('pop');
  const [selected, setSelected] = useState<string | null>(null);
  const proj = useMemo(() => geoMercator().scale(SCALE).translate([MW / 2, MH / 2 + 40]), []);
  const path = useMemo(() => geoPath(proj), [proj]);

  function onClick(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * MW;
    const y = ((e.clientY - r.top) / r.height) * MH;
    const ll = proj.invert?.([x, y]);
    if (!ll) return;
    const c = COUNTRIES.find((f) => geoContains(f, ll));
    setSelected(c ? String(c.id) : null);
  }

  const sel = selected ? POP_BY_ID.get(selected) : undefined;
  const top = useMemo(() => [...COUNTRY_POP].sort((a, b) => b.pop - a.pop).slice(0, 10), []);
  const maxCont = Math.max(...Object.values(CONTINENT_POP));

  return (
    <>
      <div className="work-area">
        <div className="map-controls">
          <div className="seg" role="group" aria-label="보기">
            <button type="button" className={mode === 'pop' ? 'on' : ''} aria-pressed={mode === 'pop'} onClick={() => setMode('pop')}>
              👥 인구
            </button>
            <button type="button" className={mode === 'density' ? 'on' : ''} aria-pressed={mode === 'density'} onClick={() => setMode('density')}>
              🏘️ 인구 밀도
            </button>
          </div>
          <span className="hint">{mode === 'pop' ? '나라 전체에 사는 사람 수' : '1㎢(가로세로 1km 땅)에 사는 사람 수'}</span>
        </div>
        <figure className="globe-fig globe-fig--map worldpop-map">
          <svg viewBox={`0 0 ${MW} ${MH}`} className="merc-svg" role="application" aria-label="세계 인구 지도. 나라를 눌러 고르세요." onPointerUp={onClick}>
            <rect width={MW} height={MH} className="ocean" />
            <path d={path(GRATICULE) ?? ''} className="graticule" />
            {COUNTRIES.map((c) => {
              const d = path(c);
              if (!d) return null;
              const id = String(c.id);
              const p = POP_BY_ID.get(id);
              const fill = p ? COLORS[classOf(mode, p)] : '#e5e7eb';
              return <path key={id} d={d} fill={fill} className={`land-pop ${id === selected ? 'land-pop--on' : ''}`} />;
            })}
          </svg>
          <div className="pop-legend">
            {CLASSES[mode].map((k, i) => (
              <span key={k.label}>
                <i style={{ background: COLORS[i] }} /> {k.label}
              </span>
            ))}
            <span>
              <i style={{ background: '#e5e7eb' }} /> 자료 없음
            </span>
          </div>
        </figure>

        <CountryPicker selected={selected} onPick={setSelected} />
        <section className="country-card" aria-live="polite">
          {selected ? (
            sel ? (
              <>
                <p>
                  <strong>{countryName(selected)}</strong> ({CONTINENTS.find((c) => c.id === sel.c)?.name})
                </p>
                <p>
                  인구 <strong>{people(sel.pop)}</strong> · 세계 인구의 {((sel.pop / WORLD_TOTAL_2023) * 100).toFixed(1)}%
                </p>
                <p className="hint">
                  넓이 약 {Math.round(sel.area / 10000).toLocaleString('ko-KR')}만 ㎢ · 인구 밀도 약{' '}
                  {Math.round(sel.pop / sel.area).toLocaleString('ko-KR')}명/㎢
                </p>
              </>
            ) : (
              <p>
                <strong>{countryName(selected)}</strong>: {POP_NOTES[selected] ?? '이 지도에서는 인구 자료가 없어요.'}
              </p>
            )
          ) : (
            <p className="hint">나라를 누르면 인구와 인구 밀도가 나와요.</p>
          )}
        </section>

        <div className="worldpop-side">
          <section className="pop-card">
            <h3>대륙별 인구</h3>
            <ul className="bars">
              {CONTINENTS.map((c) => (
                <li key={c.id} className="bars__row--wide">
                  <span className="bars__label">{c.name}</span>
                  <span className="bars__track">
                    <span className="bars__fill" style={{ width: `${(CONTINENT_POP[c.id] / maxCont) * 100}%` }} />
                  </span>
                  <span className="bars__n bars__n--wide">{((CONTINENT_POP[c.id] / WORLD_TOTAL_2023) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="pop-card">
            <h3>인구가 많은 나라 10곳</h3>
            <ol className="top-list">
              {top.map((c) => (
                <li key={c.id}>
                  <button type="button" className={`linkish ${c.id === selected ? 'linkish--on' : ''}`} onClick={() => setSelected(c.id)}>
                    {countryName(c.id)}
                  </button>{' '}
                  <span className="hint">{people(c.pop)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <p className="source">
          자료: {WORLD_POP_SOURCE} (세계 인구 약 80억 9천만 명). 넓이는 지도 자료로 계산한 대략값이에요. 지도: Natural Earth
        </p>
      </div>
      <QuizPanel
        {...props}
        activity="worldpop"
        set={QUIZZES.worldpop!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={countryName}
        targetWord="나라"
      />
    </>
  );
}
