import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const KOREA_BOUNDS: L.LatLngBoundsExpression = [
  [33.0, 124.6],
  [38.7, 130.9],
];

/** 우리나라 전체 지도 위에 도시·시도 원을 그립니다 (기후·인구 탐구용) */
export default function KoreaMap({
  points,
  selectedId,
  onSelect,
  ariaLabel,
}: {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { zoomSnap: 0.25 });
    map.fitBounds(KOREA_BOUNDS, { animate: false });
    const layers = baseLayers();
    layers[Object.keys(layers)[0]].addTo(map);
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
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    // 큰 원을 먼저 그려야 작은 원이 가려지지 않습니다.
    const sorted = [...points].sort((a, b) => b.radius - a.radius);
    sorted.forEach((p) => {
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
  }, [points, selectedId]);

  return <div ref={elRef} className="map" role="application" aria-label={ariaLabel} />;
}
