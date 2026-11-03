import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vworldKey } from '../config';
import { FEELINGS, FIXES, PROBLEMS, findChoice } from '../activities';
import type { Pin } from '../data/types';

export interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  center: LatLng;
  radius?: number;
  schoolName?: string;
  pins?: Pin[];
  draft?: LatLng | null;
  selectedId?: string | null;
  /** 교사 화면: 숨김·미승인 핀을 흐리게 표시 */
  showStatus?: boolean;
  onMapClick?: (pos: LatLng) => void;
  onPinClick?: (pin: Pin) => void;
  onReady?: (map: L.Map) => void;
  ariaLabel?: string;
}

function baseLayers(): Record<string, L.Layer> {
  if (vworldKey) {
    const url = (type: string, ext: string) =>
      `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/${type}/{z}/{y}/{x}.${ext}`;
    const attribution = '© <a href="https://www.vworld.kr" target="_blank" rel="noreferrer">브이월드(국토교통부)</a>';
    const satellite = L.layerGroup([
      L.tileLayer(url('Satellite', 'jpeg'), { maxZoom: 19, attribution }),
      L.tileLayer(url('Hybrid', 'png'), { maxZoom: 19 }),
    ]);
    return {
      일반지도: L.tileLayer(url('Base', 'png'), { maxZoom: 19, attribution }),
      영상지도: satellite,
    };
  }
  return {
    일반지도: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }),
  };
}

export function pinEmoji(pin: Pin): string {
  if (pin.activity === 'better') return findChoice(FIXES, pin.fix)?.emoji ?? '✨';
  return findChoice(FEELINGS, pin.feeling)?.emoji ?? '📍';
}

function pinIcon(pin: Pin, selected: boolean, showStatus: boolean): L.DivIcon {
  const classes = ['pin'];
  if (selected) classes.push('pin--selected');
  if (showStatus && (pin.hidden || !pin.approved)) classes.push('pin--muted');
  const badge = pin.activity === 'better' ? findChoice(PROBLEMS, pin.problem)?.emoji : '';
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="${classes.join(' ')}"><span class="pin__emoji">${pinEmoji(pin)}</span>${
      badge ? `<span class="pin__badge">${badge}</span>` : ''
    }</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
}

const draftIcon = L.divIcon({
  className: 'pin-wrap',
  html: '<div class="pin pin--draft"><span class="pin__emoji">📍</span></div>',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

const schoolIcon = L.divIcon({
  className: 'pin-wrap',
  html: '<div class="school-pin">🏫</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function MapView({
  center,
  radius,
  schoolName,
  pins = [],
  draft,
  selectedId,
  showStatus = false,
  onMapClick,
  onPinClick,
  onReady,
  ariaLabel = '우리 동네 지도',
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pinLayerRef = useRef<L.LayerGroup | null>(null);
  const draftRef = useRef<L.Marker | null>(null);
  const schoolLayerRef = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onMapClick);
  const pinClickRef = useRef(onPinClick);
  clickRef.current = onMapClick;
  pinClickRef.current = onPinClick;

  // 지도 만들기 (한 번만)
  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView(
      [center.lat, center.lng],
      16,
    );
    const layers = baseLayers();
    const names = Object.keys(layers);
    layers[names[0]].addTo(map);
    if (names.length > 1) L.control.layers(layers, undefined, { position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => clickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    pinLayerRef.current = L.layerGroup().addTo(map);
    schoolLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    onReady?.(map);
    // 처음 그릴 때 크기 계산이 어긋나는 것을 막습니다.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 학교 위치와 탐색 범위
  useEffect(() => {
    const map = mapRef.current;
    const layer = schoolLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (schoolName !== undefined) {
      // 학교 표시는 누를 수 없게 해서, 학생이 학교 자리에도 장소를 남길 수 있게 합니다.
      const marker = L.marker([center.lat, center.lng], { icon: schoolIcon, keyboard: false, interactive: false, zIndexOffset: -1000 });
      const tip = document.createElement('span');
      tip.textContent = schoolName || '학교';
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -16], permanent: true, className: 'school-tip' });
      layer.addLayer(marker);
    }
    if (radius) {
      const circle = L.circle([center.lat, center.lng], {
        radius,
        color: '#2563eb',
        weight: 2,
        dashArray: '6 6',
        fillOpacity: 0.04,
        interactive: false,
      });
      layer.addLayer(circle);
      map.fitBounds(circle.getBounds(), { padding: [20, 20] });
    } else {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center.lat, center.lng, radius, schoolName]);

  // 핀 그리기
  useEffect(() => {
    const layer = pinLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    pins.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon(pin, pin.id === selectedId, showStatus),
        title: pin.placeName || '장소',
        alt: pin.placeName || '장소',
        riseOnHover: true,
        zIndexOffset: pin.id === selectedId ? 1000 : 0,
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        pinClickRef.current?.(pin);
      });
      // 키보드 사용자: 핀에 초점을 두고 Enter로 열기
      marker.on('keypress', (e: L.LeafletKeyboardEvent) => {
        if (e.originalEvent.key === 'Enter') pinClickRef.current?.(pin);
      });
      if (pin.placeName) {
        const tip = document.createElement('span');
        tip.textContent = pin.placeName;
        marker.bindTooltip(tip, { direction: 'top', offset: [0, -40] });
      }
      layer.addLayer(marker);
    });
  }, [pins, selectedId, showStatus]);

  // 새로 놓을 위치(임시 핀)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (draft) {
      if (!draftRef.current) {
        draftRef.current = L.marker([draft.lat, draft.lng], { icon: draftIcon, keyboard: false }).addTo(map);
      } else {
        draftRef.current.setLatLng([draft.lat, draft.lng]);
      }
    } else if (draftRef.current) {
      draftRef.current.remove();
      draftRef.current = null;
    }
  }, [draft]);

  return <div ref={elRef} className="map" role="application" aria-label={ariaLabel} />;
}
