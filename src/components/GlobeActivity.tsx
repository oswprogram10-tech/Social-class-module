import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { geoArea, geoCentroid, geoContains, geoMercator, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo';
import { COUNTRIES, EARTH_R, EQUATOR, GRATICULE, PRIME, countryName, type Country } from '../content/worldGeo';
import { QUIZZES } from '../content/quizzes';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import CountryPicker from './CountryPicker';
import QuizPanel from './QuizPanel';

function latLngText([lng, lat]: [number, number]): string {
  const la = Math.round(lat);
  const lo = Math.round(lng);
  return `${la >= 0 ? '북위' : '남위'} ${Math.abs(la)}°, ${lo >= 0 ? '동경' : '서경'} ${Math.abs(lo)}°`;
}

function findCountry(pt: [number, number]): Country | undefined {
  return COUNTRIES.find((c) => geoContains(c, pt));
}

const GW = 340;
const MW = 520;
const MH = 340;
const MERC_SCALE = MW / (2 * Math.PI);

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

/** [6사09-01·02] 지구본과 세계지도: 돌려 보고 비교하고, 위도·경도로 나라를 찾습니다. */
export default function GlobeActivity(props: Props) {
  const [rotate, setRotate] = useState<[number, number]>([-127, -25]);
  const [selected, setSelected] = useState<string | null>(null);
  const [point, setPoint] = useState<[number, number] | null>(null);
  const drag = useRef<{ x: number; y: number; r: [number, number]; moved: boolean } | null>(null);

  const globe = useMemo(
    () => geoOrthographic().scale(GW / 2 - 6).translate([GW / 2, GW / 2]).rotate([rotate[0], rotate[1], 0]).clipAngle(90),
    [rotate],
  );
  const merc = useMemo(() => geoMercator().scale(MERC_SCALE).translate([MW / 2, MH / 2]), []);
  const gPath = useMemo(() => geoPath(globe), [globe]);
  const mPath = useMemo(() => geoPath(merc), [merc]);

  const sel = COUNTRIES.find((c) => String(c.id) === selected);
  const info = useMemo(() => {
    if (!sel) return null;
    const sr = geoArea(sel);
    const km2 = sr * EARTH_R * EARTH_R;
    const inflate = mPath.area(sel) / (sr * MERC_SCALE * MERC_SCALE);
    return { km2, inflate };
  }, [sel, mPath]);

  function pick(proj: GeoProjection, x: number, y: number) {
    const ll = proj.invert?.([x, y]);
    if (!ll || Number.isNaN(ll[0])) return;
    const pt: [number, number] = [ll[0], ll[1]];
    setPoint(pt);
    const c = findCountry(pt);
    setSelected(c ? String(c.id) : null);
  }

  function pickFromList(id: string) {
    const c = COUNTRIES.find((x) => String(x.id) === id);
    if (!c) return;
    const [lng, lat] = geoCentroid(c);
    setPoint([lng, lat]);
    setSelected(id);
    setRotate([-lng, Math.max(-80, Math.min(80, -lat))]);
  }

  function svgXY(e: PointerEvent<SVGSVGElement>, w: number, h: number): [number, number] {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h];
  }

  function onGlobeDown(e: PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, r: rotate, moved: false };
  }
  function onGlobeMove(e: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) setRotate([d.r[0] + dx * 0.4, Math.max(-80, Math.min(80, d.r[1] - dy * 0.4))]);
  }
  function onGlobeUp(e: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      const [x, y] = svgXY(e, GW, GW);
      pick(globe, x, y);
    }
  }
  function onGlobeKey(e: KeyboardEvent<SVGSVGElement>) {
    const step = 10;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    setRotate(([a, b]) => [a + m[0], Math.max(-80, Math.min(80, b + m[1]))]);
  }

  const countryPaths = (path: typeof gPath) =>
    COUNTRIES.map((c) => {
      const d = path(c);
      if (!d) return null;
      return <path key={String(c.id)} d={d} className={`land ${String(c.id) === selected ? 'land--on' : ''}`} />;
    });

  return (
    <>
      <div className="work-area">
        <div className="globe-wrap">
          <figure className="globe-fig">
            <figcaption>🌏 지구본 (끌어서 돌리기 · 방향키)</figcaption>
            <svg
              viewBox={`0 0 ${GW} ${GW}`}
              className="globe-svg"
              role="application"
              tabIndex={0}
              aria-label="지구본. 끌거나 방향키로 돌리고, 눌러서 나라를 고르세요."
              onPointerDown={onGlobeDown}
              onPointerMove={onGlobeMove}
              onPointerUp={onGlobeUp}
              onKeyDown={onGlobeKey}
            >
              <circle cx={GW / 2} cy={GW / 2} r={GW / 2 - 6} className="ocean" />
              <path d={gPath(GRATICULE) ?? ''} className="graticule" />
              {countryPaths(gPath)}
              <path d={gPath(EQUATOR) ?? ''} className="equator" />
              <path d={gPath(PRIME) ?? ''} className="prime" />
              {point && (() => {
                const p = globe(point);
                const visible = p && gPath({ type: 'Point', coordinates: point });
                return visible ? <circle cx={p[0]} cy={p[1]} r={5} className="pick-dot" /> : null;
              })()}
            </svg>
          </figure>
          <figure className="globe-fig globe-fig--map">
            <figcaption>🗺️ 세계지도 (메르카토르 도법)</figcaption>
            <svg
              viewBox={`0 0 ${MW} ${MH}`}
              className="merc-svg"
              role="application"
              aria-label="세계지도. 눌러서 나라를 고르세요."
              onPointerUp={(e) => {
                const [x, y] = svgXY(e, MW, MH);
                pick(merc, x, y);
              }}
            >
              <rect width={MW} height={MH} className="ocean" />
              <path d={mPath(GRATICULE) ?? ''} className="graticule" />
              {countryPaths(mPath)}
              <path d={mPath(EQUATOR) ?? ''} className="equator" />
              <path d={mPath(PRIME) ?? ''} className="prime" />
              {point && (() => {
                const p = merc(point);
                return p ? <circle cx={p[0]} cy={p[1]} r={4} className="pick-dot" /> : null;
              })()}
            </svg>
          </figure>
        </div>
        <CountryPicker selected={selected} onPick={pickFromList} />
        <div className="globe-legend">
          <span>
            <i className="swatch swatch--equator" /> 적도 (위도 0°)
          </span>
          <span>
            <i className="swatch swatch--prime" /> 본초 자오선 (경도 0°)
          </span>
          <span>가는 선: 위선·경선 10°마다</span>
        </div>
        <section className="country-card" aria-live="polite">
          {point ? (
            <>
              <p>
                📍 누른 곳: <strong>{latLngText(point)}</strong>
              </p>
              {sel && info ? (
                <>
                  <p>
                    나라: <strong>{countryName(String(sel.id))}</strong> · 실제 넓이 약 {Math.round(info.km2 / 10000).toLocaleString('ko-KR')}만 ㎢
                  </p>
                  <p className="hint">
                    세계지도(메르카토르)에서는 실제보다 약 <strong>{info.inflate.toFixed(1)}배</strong> 크게 그려져요.
                    {info.inflate > 3 && ' 적도에서 멀수록 크게 늘어나요!'}
                  </p>
                </>
              ) : (
                <p className="hint">바다를 눌렀어요.</p>
              )}
            </>
          ) : (
            <p className="hint">지구본이나 세계지도의 나라를 눌러 보세요. 위도·경도와 넓이를 알려 줘요.</p>
          )}
        </section>
        <p className="source">지도 자료: Natural Earth (퍼블릭 도메인), 1:1억 1천만 축척</p>
      </div>
      <QuizPanel
        {...props}
        activity="globe"
        set={QUIZZES.globe!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={countryName}
        targetWord="나라"
      />
    </>
  );
}
