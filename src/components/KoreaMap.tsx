import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection, Geometry } from 'geojson';
import { baseLayers } from './MapView';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  /** 원의 반지름(px) */
  radius: number;
  color: string;
  label: string;
  /** 이름표가 겹치지 않도록 옮길 거리(px) */
  labelOffset?: [number, number];
}

/** 시도 경계 색칠(단계구분도) */
export interface MapAreas {
  geo: FeatureCollection<Geometry, { id: string }>;
  /** 시도 ID → 채울 색 */
  fill: Record<string, string>;
}

/** 독도: 경계 자료(1:1천만)에는 너무 작아 빠져 있어 따로 표시합니다. 경상북도 울릉군 */
const DOKDO: L.LatLngExpression = [37.2417, 131.8647];

const KOREA_BOUNDS: L.LatLngBoundsExpression = [
  [33.0, 124.6],
  [38.7, 131.9],
];

/** 우리나라 전체 지도 위에 도시·시도 원을 그립니다 (기후·인구 탐구용) */
export default function KoreaMap({
  points,
  areas,
  selectedId,
  onSelect,
  ariaLabel,
}: {
  points: MapPoint[];
  areas?: MapAreas;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const areaRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { zoomSnap: 0.25 });
    map.fitBounds(KOREA_BOUNDS, { animate: false });
    const layers = baseLayers();
    layers[Object.keys(layers)[0]].addTo(map);
    areaRef.current = L.layerGroup().addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // 그래프가 나타나 지도 크기가 바뀌어도 우리나라 전체(제주 포함)가 보이도록 다시 맞춥니다.
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      map.fitBounds(KOREA_BOUNDS, { animate: false });
    });
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      map.stop();
      map.remove();
    };
  }, []);

  useEffect(() => {
    const layer = areaRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!areas) return;
    const geo = L.geoJSON(areas.geo, {
      style: (f) => {
        const id = f?.properties.id as string;
        const on = id === selectedId;
        return { color: on ? '#f59e0b' : '#334155', weight: on ? 3.5 : 1, fillColor: areas.fill[id] ?? '#e5e7eb', fillOpacity: 0.85 };
      },
      onEachFeature: (f, l) => l.on('click', () => selectRef.current(f.properties.id)),
    });
    layer.addLayer(geo);
    // 선택한 시도의 굵은 테두리가 이웃에 가리지 않게 맨 위로 올립니다.
    geo.eachLayer((l) => {
      if ((l as L.GeoJSON).feature && ((l as L.GeoJSON).feature as { properties: { id: string } }).properties.id === selectedId) (l as L.Path).bringToFront();
    });
    const dokdo = L.circleMarker(DOKDO, { radius: 4, color: '#334155', weight: 1, fillColor: areas.fill.gyeongbuk ?? '#e5e7eb', fillOpacity: 1 });
    dokdo.on('click', () => selectRef.current('gyeongbuk'));
    layer.addLayer(dokdo);
    layer.addLayer(
      L.marker(DOKDO, {
        icon: L.divIcon({ className: 'dokdo-label', html: '독도', iconSize: [0, 0] }),
        interactive: false,
        keyboard: false,
      }),
    );
  }, [areas, selectedId]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    // 다시 그려도 키보드 위치를 잃지 않도록, 포커스가 있던 이름표를 기억합니다.
    const focusedId = (document.activeElement as HTMLElement | null)?.dataset?.pointId;
    let refocus: HTMLButtonElement | null = null;
    layer.clearLayers();
    // 큰 원을 먼저 그려야 작은 원이 가려지지 않습니다.
    const sorted = [...points].sort((a, b) => b.radius - a.radius);
    sorted.forEach((p) => {
      if (p.radius <= 0) return;
      const circle = L.circleMarker([p.lat, p.lng], {
        radius: p.radius,
        color: p.id === selectedId ? '#f59e0b' : '#1e293b',
        weight: p.id === selectedId ? 4 : 1.5,
        fillColor: p.color,
        fillOpacity: 0.75,
      });
      circle.on('click', () => selectRef.current(p.id));
      layer.addLayer(circle);
    });
    // 이름표를 따로 그리고, 이름표를 눌러도 고를 수 있게 합니다.
    // (서울처럼 다른 원 안에 겹친 곳도 고를 수 있도록. Leaflet 고정 툴팁은 다시 그릴 때 남는 문제가 있어 쓰지 않습니다.)
    sorted.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `value-tip ${p.id === selectedId ? 'value-tip--on' : ''}`;
      btn.textContent = p.label;
      btn.setAttribute('aria-pressed', String(p.id === selectedId));
      btn.dataset.pointId = p.id;
      if (p.id === focusedId) refocus = btn;
      if (p.labelOffset) {
        const [dx, dy] = p.labelOffset;
        btn.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectRef.current(p.id);
      });
      layer.addLayer(
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: 'value-label', html: btn, iconSize: [0, 0] }),
          keyboard: false,
        }),
      );
    });
    (refocus as HTMLButtonElement | null)?.focus({ preventScroll: true });
  }, [points, selectedId]);

  return <div ref={elRef} className="map" role="application" aria-label={ariaLabel} />;
}
