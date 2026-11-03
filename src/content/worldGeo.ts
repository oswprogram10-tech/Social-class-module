/** 세계 지도 자료(Natural Earth 1:1억 1천만, 퍼블릭 도메인)와 나라 이름 — 지구본·세계 인구 활동이 함께 씀 */
import { geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { COUNTRY_KO } from './countries-ko';

export type Country = Feature<Geometry, { name: string }>;

const topo = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
// 몇몇 지역(코소보 등)은 ISO 코드가 없어 이름으로 ID를 만듭니다.
export const COUNTRIES = (
  (feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>).features as Country[]
).map((c) => ({ ...c, id: c.id === undefined ? `name:${c.properties.name}` : String(c.id) }));
export const GRATICULE = geoGraticule10();
export const EQUATOR = { type: 'LineString' as const, coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]] };
export const PRIME = { type: 'LineString' as const, coordinates: [[0, -89], [0, 0], [0, 89]] };
export const EARTH_R = 6371;

export function countryName(id: string): string {
  return COUNTRY_KO[id] ?? COUNTRIES.find((c) => c.id === id)?.properties.name ?? id.replace(/^name:/, '');
}

