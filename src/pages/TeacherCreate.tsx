import { useState, type FormEvent } from 'react';

type Preventable = { preventDefault(): void };
import MapView, { type LatLng } from '../components/MapView';
import { LIMITS } from '../data/common';
import { go, rememberClass, useStore, usePageTitle } from '../hooks';
import { ModeBanner } from './Home';

// 처음 지도 위치: 서울시청 (학교를 검색하거나 지도를 눌러 바꿉니다)
const DEFAULT_CENTER: LatLng = { lat: 37.5663, lng: 126.9779 };

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function TeacherCreate() {
  usePageTitle('학급 만들기');
  const { store, error } = useStore();
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [pos, setPos] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [radius, setRadius] = useState(1000);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function search(e: Preventable) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchMsg('');
    try {
      // OpenStreetMap 무료 검색(Nominatim). 많이 쓰면 제한될 수 있어 버튼을 눌렀을 때만 검색합니다.
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=kr&accept-language=ko&limit=5&q=${encodeURIComponent(
        query,
      )}`;
      const res = await fetch(url);
      const list = (await res.json()) as SearchResult[];
      setResults(list);
      if (list.length === 0) setSearchMsg('찾지 못했어요. 지도를 움직여 학교를 직접 눌러 주세요.');
    } catch {
      setSearchMsg('검색에 실패했어요. 지도를 움직여 학교를 직접 눌러 주세요.');
    } finally {
      setSearching(false);
    }
  }

  function pick(r: SearchResult) {
    const p = { lat: Number(r.lat), lng: Number(r.lon) };
    setPos(p);
    setCenter(p);
    setResults([]);
    if (!schoolName) setSchoolName(r.display_name.split(',')[0]);
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!store) return;
    if (!pos) {
      setMsg('지도에서 학교 위치를 눌러 주세요.');
      return;
    }
    setSaving(true);
    try {
      const cls = await store.createClass({
        name: name.trim() || '우리 반',
        schoolName: schoolName.trim(),
        lat: pos.lat,
        lng: pos.lng,
        radius,
        activeActivity: 'feel',
        requireApproval: false,
        showOthers: true,
      });
      rememberClass(cls.code, cls.name);
      go(`/teacher/${cls.code}`);
    } catch (err) {
      console.error(err);
      setMsg('학급을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <ModeBanner />
      <header className="topbar">
        <a href="#/" className="topbar__back" aria-label="처음으로">
          ←
        </a>
        <h1>학급 만들기</h1>
      </header>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <form className="panel" onSubmit={create}>
          <label className="field">
            <span>학급 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 3학년 2반"
              maxLength={LIMITS.className}
            />
          </label>
          <label className="field">
            <span>학교 이름</span>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="예: 행복초등학교"
              maxLength={LIMITS.className}
            />
          </label>

          <fieldset className="field">
            <legend>학교 위치</legend>
            <div className="search-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="학교 이름이나 주소로 찾기"
                aria-label="학교 검색어"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') search(e);
                }}
              />
              <button type="button" className="btn" onClick={search} disabled={searching}>
                {searching ? '찾는 중…' : '찾기'}
              </button>
            </div>
            {searchMsg && <p className="hint">{searchMsg}</p>}
            {results.length > 0 && (
              <ul className="results">
                {results.map((r) => (
                  <li key={`${r.lat},${r.lon}`}>
                    <button type="button" onClick={() => pick(r)}>
                      {r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="hint">{pos ? '✅ 학교 위치를 정했어요. 지도를 다시 누르면 바뀌어요.' : '지도에서 학교를 눌러 위치를 정해 주세요.'}</p>
          </fieldset>

          <label className="field">
            <span>탐색 범위</span>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
              <option value={500}>학교 주변 500m</option>
              <option value={1000}>학교 주변 1km</option>
              <option value={2000}>학교 주변 2km</option>
              <option value={3000}>학교 주변 3km</option>
            </select>
          </label>

          {msg && <p className="error">{msg}</p>}
          <button type="submit" className="btn btn--primary btn--block" disabled={!store || saving}>
            {saving ? '만드는 중…' : '학급 만들기'}
          </button>
        </form>
        <div className="map-area">
          <MapView
            center={pos ?? center}
            radius={pos ? radius : undefined}
            schoolName={pos ? schoolName || '학교' : undefined}
            onMapClick={setPos}
            ariaLabel="학교 위치를 고르는 지도"
          />
        </div>
      </div>
    </div>
  );
}
