import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { geoArea, geoCentroid, geoMercator, geoPath, geoRotation, type GeoPermissibleObjects } from 'd3-geo';
import type { Geometry, Position } from 'geojson';
import { eulReul } from '../content/josa';
import { QUIZZES } from '../content/quizzes';
import { COUNTRIES, EARTH_R, EQUATOR, GRATICULE, countryName } from '../content/worldGeo';

type Country = (typeof COUNTRIES)[number];
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
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
const MH = 460;
const MAX_LAT = 72;

/** 옮겨 볼 나라 (Natural Earth 이름 기준) */
const PICKS = ['대한민국', '일본', '그린란드', '브라질', '인도', '오스트레일리아', '콩고 민주 공화국', '멕시코'];

const latText = (lat: number) => (Math.round(lat) === 0 ? '적도' : `${lat > 0 ? '북위' : '남위'} ${Math.abs(Math.round(lat))}°`);

/** 나라 모양을 지구 위에서 그대로(넓이 그대로) 다른 위도로 옮깁니다. */
function moveTo(f: Country, lat1: number): Country {
  const [lng0, lat0] = geoCentroid(f);
  const r1 = geoRotation([-lng0, 0, 0]);
  const r2 = geoRotation([0, lat1 - lat0, 0]);
  const r3 = geoRotation([lng0, 0, 0]);
  const tx = (p: Position): Position => r3(r2(r1(p as [number, number])));
  const map = (c: unknown): unknown => (typeof (c as number[])[0] === 'number' ? tx(c as Position) : (c as unknown[]).map(map));
  const g = f.geometry as Geometry & { coordinates: unknown };
  return { ...f, geometry: { ...g, coordinates: map(g.coordinates) } as Geometry };
}

/** [6사09-01] 실제 크기 비교: 메르카토르 지도에서 나라를 다른 위도로 옮겨 크기가 어떻게 달라 보이는지 살펴봐요. */
export default function TrueSizeActivity(props: Props) {
  const choices = useMemo(
    () =>
      PICKS.map((n) => COUNTRIES.find((c) => countryName(String(c.id)) === n)).filter((c): c is Country => !!c),
    [],
  );
  const [id, setId] = useState(String(choices[0]?.id ?? ''));
  const country = choices.find((c) => String(c.id) === id) ?? choices[0]!;
  const home = useMemo(() => geoCentroid(country)[1], [country]);
  const [lat, setLat] = useState(home);
  const [withGreenland, setWithGreenland] = useState(true);
  const drag = useRef<{ y: number; lat: number } | null>(null);

  const proj = useMemo(() => geoMercator().scale(MW / (2 * Math.PI)).translate([MW / 2, MH / 2]), []);
  const path = useMemo(() => geoPath(proj), [proj]);
  const land = useMemo(() => COUNTRIES.map((c) => path(c)).filter(Boolean).join(' '), [path]);
  const moved = useMemo(() => moveTo(country, lat), [country, lat]);
  const km2 = geoArea(country) * EARTH_R * EARTH_R;
  const ratio = (path.area(moved as GeoPermissibleObjects) || 0) / (path.area(country) || 1);
  const greenland = choices.find((c) => countryName(String(c.id)) === '그린란드');

  function pick(nextId: string) {
    const c = choices.find((x) => String(x.id) === nextId);
    if (!c) return;
    setId(nextId);
    setLat(geoCentroid(c)[1]);
  }
  const clamp = (v: number) => Math.max(-MAX_LAT, Math.min(MAX_LAT, v));

  function onDown(e: PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, lat };
  }
  function onMove(e: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dy = ((e.clientY - d.y) / r.height) * MH;
    // 메르카토르 y를 위도로 바꿔 끈 만큼 옮깁니다.
    const [, y0] = proj([0, d.lat])!;
    const ll = proj.invert?.([0, y0 + dy]);
    if (ll) setLat(clamp(ll[1]));
  }

  const name = countryName(String(country.id));
  const summary = `${eulReul(name)} ${latText(lat)} 자리에 옮겼어요. 실제 넓이는 약 ${Math.round(km2 / 10000).toLocaleString('ko-KR')}만 제곱킬로미터로 그대로이고, 지도에서는 원래 자리의 ${ratio.toFixed(1)}배 크기로 보여요.`;

  return (
    <>
      <div className="work-area">
        <div className="lf-filter" role="group" aria-label="옮겨 볼 나라">
          {choices.map((c) => (
            <button
              key={String(c.id)}
              type="button"
              className={`chip-btn ${String(c.id) === id ? 'chip-btn--on' : ''}`}
              aria-pressed={String(c.id) === id}
              onClick={() => pick(String(c.id))}
            >
              {countryName(String(c.id))}
            </button>
          ))}
        </div>

        <figure className="globe-fig globe-fig--map truesize-map">
          <svg
            viewBox={`0 0 ${MW} ${MH}`}
            className="merc-svg"
            role="img"
            aria-label={`메르카토르 세계지도. ${summary} 지도를 위아래로 끌거나 아래 막대로 옮겨요.`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <rect width={MW} height={MH} className="ocean" />
            <path d={path(GRATICULE) ?? ''} className="graticule" />
            <path d={land} className="land-plain" />
            <path d={path(EQUATOR) ?? ''} className="equator" />
            {withGreenland && greenland && String(greenland.id) !== id && <path d={path(greenland) ?? ''} className="truesize-ref" />}
            <path d={path(country) ?? ''} className="truesize-home" />
            <path d={path(moved as GeoPermissibleObjects) ?? ''} className="truesize-moved" />
          </svg>
        </figure>

        <div className="truesize-controls">
          <label className="slider">
            <span>
              <strong>{name}</strong>의 위치: <strong>{latText(lat)}</strong>
            </span>
            <input
              type="range"
              min={-MAX_LAT}
              max={MAX_LAT}
              step={1}
              value={Math.round(lat)}
              onChange={(e) => setLat(Number(e.target.value))}
              aria-label={`${eulReul(name)} 옮길 위도`}
              aria-valuetext={latText(lat)}
            />
          </label>
          <div className="row">
            <button type="button" className="btn btn--small" onClick={() => setLat(0)}>
              적도로
            </button>
            <button type="button" className="btn btn--small" onClick={() => setLat(home)}>
              원래 자리로
            </button>
            <button type="button" className="btn btn--small" onClick={() => setLat(MAX_LAT)}>
              북쪽 끝으로 (북위 {MAX_LAT}°)
            </button>
            <label className="check">
              <input type="checkbox" checked={withGreenland} onChange={(e) => setWithGreenland(e.target.checked)} /> 그린란드 함께 보기
            </label>
          </div>
        </div>

        <section className="country-card" aria-live="polite">
          <p>
            <strong>{name}</strong> · 실제 넓이 약 <strong>{Math.round(km2 / 10000).toLocaleString('ko-KR')}만 ㎢</strong> (어디로 옮겨도 그대로)
          </p>
          <p>
            지도에서 보이는 크기: 원래 자리의 <strong>{ratio.toFixed(1)}배</strong>
            {ratio > 1.5 ? ' — 실제보다 크게 그려져요!' : ratio < 0.7 ? ' — 원래 자리보다 작게 그려져요.' : ''} <Speak text={summary} />
          </p>
          <p className="hint">
            <span className="swatch truesize-swatch--home" /> 원래 자리 <span className="swatch truesize-swatch--moved" /> 옮긴 모양
            {withGreenland && ' · 연두색 테두리: 그린란드'}
          </p>
        </section>
        <p className="source">지도: Natural Earth(퍼블릭 도메인), 메르카토르 도법. 넓이는 지도 자료로 계산한 대략값이에요.</p>
      </div>
      <QuizPanel
        {...props}
        activity="truesize"
        set={QUIZZES.truesize!}
        record={props.myRecords[0]}
        selection={id}
        nameOf={countryName}
        targetWord="나라"
      />
    </>
  );
}
