import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { QUIZZES } from '../content/quizzes';
import { LANDFORMS, LANDFORM_TYPES, landformName, type Landform, type LandformType } from '../content/landforms';
import { COUNTRIES, GRATICULE } from '../content/worldGeo';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import CommonsPhoto from './CommonsPhoto';
import QuizPanel from './QuizPanel';
import Speak from './Speak';

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

const typeOf = (l: Landform) => LANDFORM_TYPES.find((t) => t.id === l.type)!;

/** 지도 이름표에 쓸 짧은 이름 */
const SHORT: Record<string, string> = { iceland: '아이슬란드', reef: '그레이트배리어리프' };

/** 이름표 위치(px): 가까운 곳끼리 겹치지 않게 */
const LABEL: Record<string, [number, number, 'start' | 'end']> = {
  alps: [-8, 12, 'end'],
  fjord: [8, 4, 'start'],
  iceland: [-8, -6, 'end'],
  sahara: [-8, 4, 'end'],
  nile: [8, 4, 'start'],
  reef: [-8, -8, 'end'],
  himalaya: [8, 12, 'start'],
  steppe: [8, -4, 'start'],
};

function PhotoBox({ l }: { l: Landform }) {
  return <CommonsPhoto photo={l.photo} alt={`${l.name} 사진`} fallback={typeOf(l).emoji} />;
}

/** [6사10-01] 세계의 지형 경관: 지도에서 지형을 찾고, 그곳 사람들의 생활을 알아봐요 */
export default function LandformActivity(props: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<LandformType | 'all'>('all');
  const proj = useMemo(() => geoMercator().scale(SCALE).translate([MW / 2, MH / 2 + 40]), []);
  const path = useMemo(() => geoPath(proj), [proj]);
  const land = useMemo(() => COUNTRIES.map((c) => path(c)).filter(Boolean).join(' '), [path]);
  const lf = LANDFORMS.find((l) => l.id === selected);
  const shown = LANDFORMS.filter((l) => filter === 'all' || l.type === filter);

  return (
    <>
      <div className="work-area">
        <div className="lf-filter" role="group" aria-label="지형 종류로 골라 보기">
          <button type="button" className={`chip-btn ${filter === 'all' ? 'chip-btn--on' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            모두
          </button>
          {LANDFORM_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip-btn ${filter === t.id ? 'chip-btn--on' : ''}`}
              aria-pressed={filter === t.id}
              onClick={() => setFilter(t.id)}
            >
              <i className="zone-dot" style={{ background: t.color }} /> {t.emoji} {t.name}
            </button>
          ))}
        </div>
        <figure className="globe-fig globe-fig--map worldclimate-map landform-map">
          <svg viewBox={`0 0 ${MW} ${MH}`} className="merc-svg" role="group" aria-label="세계 지형 지도. 점을 눌러 지형을 살펴보세요.">
            <rect width={MW} height={MH} className="ocean" />
            <path d={path(GRATICULE) ?? ''} className="graticule" />
            <path d={land} className="land-plain" />
            {shown.map((l) => {
              const [x, y] = proj([l.lng, l.lat])!;
              const t = typeOf(l);
              const on = l.id === selected;
              const [dx, dy, anchor] = LABEL[l.id] ?? [8, 4, 'start'];
              return (
                <g
                  key={l.id}
                  className={`wc-city ${on ? 'wc-city--on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${l.name} (${t.name})`}
                  aria-pressed={on}
                  data-lf={l.id}
                  onClick={() => setSelected(l.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(l.id);
                    }
                  }}
                >
                  <circle cx={x} cy={y} r={14} className="wc-city__hit" />
                  <circle cx={x} cy={y} r={on ? 8 : 6} fill={t.color} className="wc-city__dot" />
                  <text x={x + dx} y={y + dy} textAnchor={anchor} className="wc-city__label lf-label">
                    {SHORT[l.id] ?? l.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>

        <section className="country-card lf-card" aria-live="polite">
          {lf ? (
            <>
              <PhotoBox key={lf.id} l={lf} />
              <div className="lf-text">
                <p>
                  <strong>{lf.name}</strong> <span className="hint">{lf.where}</span>{' '}
                  <span className="zone-chip" style={{ background: typeOf(lf).color }}>
                    {typeOf(lf).emoji} {typeOf(lf).name}
                  </span>
                </p>
                <p>
                  {lf.about} <Speak text={`${lf.name}. ${lf.about} ${lf.life.join(' ')}`} />
                </p>
                <h4>🧑‍🤝‍🧑 이곳 사람들의 생활</h4>
                <ul className="life-list">
                  {lf.life.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="hint">지도의 점이나 아래 이름을 누르면 사진과 설명, 그곳 사람들의 생활이 나와요.</p>
          )}
        </section>

        <div className="lf-list">
          {shown.map((l) => (
            <button key={l.id} type="button" className={`linkish ${l.id === selected ? 'linkish--on' : ''}`} onClick={() => setSelected(l.id)}>
              {typeOf(l).emoji} {l.name}
            </button>
          ))}
        </div>
        <p className="source">지도: Natural Earth. 사진: 위키미디어 공용의 자유 라이선스 사진(사진마다 작가와 라이선스를 적었어요).</p>
      </div>
      <QuizPanel
        {...props}
        activity="landform"
        set={QUIZZES.landform!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={landformName}
        targetWord="지형"
      />
    </>
  );
}
