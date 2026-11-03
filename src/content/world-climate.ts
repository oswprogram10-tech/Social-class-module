/**
 * [6사10-02] 세계의 다양한 기후: 기후대별 대표 도시의 월평균 기온과 강수량 (1991~2020 평년값)
 *
 * 숫자는 각 나라 기상청 또는 세계기상기구(WMO) 평년값을 그대로 옮겼습니다.
 * - 싱가포르: 싱가포르 기상청(MSS/NEA) 1991–2020 평년값
 * - 카이로: 세계기상기구 1991–2020 평년값(카이로 국제공항, 미국 해양대기청 NOAA 제공)
 * - 런던: 영국 기상청(Met Office) 1991–2020 평년값(히스로)
 * - 모스크바: 러시아 수문기상청 중앙지방청 1991–2020 평년값(VDNKh 관측소)
 * - 우트키아비크(옛 이름 배로): 미국 해양대기청 NOAA 1991–2020 평년값(USW00027516), ℉·인치를 ℃·㎜로 바꿈
 * - 키토: 세계기상기구 1991–2020 평년값(마리스칼 수크레 공항, 해발 약 2,800m)
 * - 서울: 기상청 1991–2020 기후평년값 (우리나라 기후 탐구와 같은 자료)
 *
 * 기후대 나누기는 초등 교과서에서 쓰는 열대·건조·온대·냉대·한대·고산 기후를 따릅니다.
 */
import { CITIES } from './korea-data';

export type ZoneId = 'tropical' | 'dry' | 'temperate' | 'cold' | 'polar' | 'highland';

export interface Zone {
  id: ZoneId;
  name: string;
  color: string;
  /** 기온·강수량의 특징 (자료에서 확인할 수 있는 것만) */
  feature: string;
}

export const ZONES: Zone[] = [
  { id: 'tropical', name: '열대 기후', color: '#dc2626', feature: '1년 내내 덥고(가장 추운 달도 18℃ 이상) 비가 많이 와요.' },
  { id: 'dry', name: '건조 기후', color: '#d97706', feature: '비가 아주 적게 와요. 내리는 비보다 증발하는 물이 더 많아요.' },
  { id: 'temperate', name: '온대 기후', color: '#16a34a', feature: '사계절이 나타나고, 겨울도 아주 춥지는 않아요.' },
  { id: 'cold', name: '냉대 기후', color: '#2563eb', feature: '겨울이 길고 몹시 추우며, 여름은 짧지만 따뜻해요.' },
  { id: 'polar', name: '한대 기후', color: '#7c3aed', feature: '1년 내내 추워서 가장 따뜻한 달도 10℃가 안 돼요.' },
  { id: 'highland', name: '고산 기후', color: '#78716c', feature: '높은 곳이라 같은 위도의 낮은 곳보다 서늘해요. 적도 근처라면 1년 내내 봄 같아요.' },
];

export interface LifeNote {
  icon: string;
  title: string;
  text: string;
}

export interface WorldCity {
  id: string;
  name: string;
  country: string;
  zone: ZoneId;
  lat: number;
  lng: number;
  /** 해발 고도(m), 대략 */
  elevation: number;
  temp: number[];
  rain: number[];
  source: string;
  /** 기후와 사람들의 생활(의·식·주) */
  life: LifeNote[];
}

const seoul = CITIES.find((c) => c.id === 'seoul')!;

export const WORLD_CITIES: WorldCity[] = [
  {
    id: 'singapore',
    name: '싱가포르',
    country: '싱가포르',
    zone: 'tropical',
    lat: 1.35,
    lng: 103.82,
    elevation: 15,
    temp: [26.8, 27.3, 27.8, 28.2, 28.6, 28.5, 28.2, 28.1, 28.0, 27.9, 27.2, 26.8],
    rain: [221.6, 105.1, 151.7, 164.3, 164.3, 135.3, 146.6, 146.9, 124.9, 168.3, 252.3, 331.9],
    source: '싱가포르 기상청 1991–2020 평년값',
    life: [
      { icon: '👕', title: '옷', text: '덥고 습해서 바람이 잘 통하는 얇은 옷을 입어요.' },
      { icon: '🏠', title: '집', text: '동남아시아의 전통 가옥은 땅에서 띄워 지어(고상 가옥) 습기와 열기, 벌레를 피했어요.' },
      { icon: '🍚', title: '먹거리', text: '덥고 비가 많아 벼가 잘 자라요. 동남아시아에는 1년에 벼를 두세 번 거두는 곳도 있어요.' },
    ],
  },
  {
    id: 'cairo',
    name: '카이로',
    country: '이집트',
    zone: 'dry',
    lat: 30.04,
    lng: 31.24,
    elevation: 74,
    temp: [14.4, 15.6, 18.3, 21.8, 25.6, 28.2, 29.1, 29.2, 27.6, 24.6, 20.0, 15.9],
    rain: [4.8, 3.8, 6.3, 1.3, 0.2, 0, 0, 0, 0, 0.7, 4.3, 3.4],
    source: '세계기상기구(WMO) 1991–2020 평년값, 카이로 국제공항',
    life: [
      { icon: '👕', title: '옷', text: '강한 햇볕과 모래바람을 막으려고 온몸을 가리는 헐렁한 옷을 입어요.' },
      { icon: '🏠', title: '집', text: '나무가 귀해 흙벽돌로 짓고, 벽은 두껍게·창은 작게 만들어 낮의 열기를 막았어요. 비가 거의 안 와서 지붕이 평평해요.' },
      { icon: '🌴', title: '먹거리', text: '비 대신 나일강 물을 끌어 농사를 지어요. 사막의 오아시스에서는 대추야자를 길러요.' },
    ],
  },
  {
    id: 'london',
    name: '런던',
    country: '영국',
    zone: 'temperate',
    lat: 51.51,
    lng: -0.13,
    elevation: 25,
    temp: [5.6, 5.8, 7.9, 10.5, 13.7, 16.8, 19.0, 18.7, 15.9, 12.3, 8.4, 5.9],
    rain: [58.8, 45.0, 38.8, 42.3, 45.9, 47.3, 45.8, 52.8, 49.6, 65.1, 66.6, 57.1],
    source: '영국 기상청(Met Office) 1991–2020 평년값, 히스로',
    life: [
      { icon: '☂️', title: '옷', text: '1년 내내 비가 고르게 자주 와서 우산이나 비옷을 자주 챙겨요. 계절에 따라 옷을 바꿔 입어요.' },
      { icon: '🐄', title: '먹거리', text: '겨울이 많이 춥지 않고 비가 고르게 와서 풀이 잘 자라요. 소나 양을 기르는 목축과 낙농이 발달했어요.' },
      { icon: '🏠', title: '집', text: '여름이 덥지 않아 오래된 집에는 에어컨이 없는 경우가 많고, 겨울을 대비해 난방을 해요.' },
    ],
  },
  {
    id: 'moscow',
    name: '모스크바',
    country: '러시아',
    zone: 'cold',
    lat: 55.76,
    lng: 37.62,
    elevation: 147,
    temp: [-6.2, -5.9, -0.7, 6.9, 13.6, 17.3, 19.7, 17.6, 11.9, 5.8, -0.5, -4.4],
    rain: [53, 44, 39, 37, 61, 77, 84, 78, 66, 70, 52, 51],
    source: '러시아 수문기상청 1991–2020 평년값, VDNKh 관측소',
    life: [
      { icon: '🧥', title: '옷', text: '긴 겨울을 견디려고 털모자와 두꺼운 외투를 입어요.' },
      { icon: '🌲', title: '집', text: '냉대 기후에는 침엽수림(타이가)이 넓게 펼쳐져 있어요. 전통 가옥은 이 나무로 지은 통나무집이고, 창을 이중으로 만들어 추위를 막아요.' },
      { icon: '🥔', title: '먹거리', text: '여름이 짧아 감자, 호밀처럼 서늘한 곳에서 잘 자라는 작물을 길러요.' },
    ],
  },
  {
    id: 'utqiagvik',
    name: '우트키아비크',
    country: '미국 알래스카',
    zone: 'polar',
    lat: 71.29,
    lng: -156.79,
    elevation: 10,
    temp: [-24.8, -24.9, -24.4, -16.3, -5.9, 1.3, 4.6, 3.9, 0.8, -6.0, -14.9, -21.8],
    rain: [6.4, 6.6, 7.6, 6.6, 10.9, 10.7, 24.4, 28.2, 19.0, 16.0, 9.1, 11.7],
    source: '미국 해양대기청(NOAA) 1991–2020 평년값(℉·인치를 ℃·㎜로 바꿈)',
    life: [
      { icon: '🧤', title: '옷', text: '몹시 추워서 동물 털가죽이나 두꺼운 방한복으로 온몸을 감싸요.' },
      { icon: '🏠', title: '집', text: '땅속이 1년 내내 얼어 있어요(영구 동토층). 집의 열로 언 땅이 녹아 내려앉지 않도록 기둥 위에 띄워 지어요.' },
      { icon: '🐋', title: '먹거리', text: '너무 추워 나무와 곡식이 자라기 어려워요. 원주민(이누피아트)은 고래·물범 사냥과 고기잡이로 먹거리를 얻어 왔어요.' },
    ],
  },
  {
    id: 'quito',
    name: '키토',
    country: '에콰도르',
    zone: 'highland',
    lat: -0.18,
    lng: -78.47,
    elevation: 2800,
    temp: [13.9, 13.9, 14.1, 14.1, 14.2, 14.2, 14.3, 14.5, 14.5, 14.2, 13.8, 13.9],
    rain: [81.3, 109.1, 142.4, 168.2, 120.5, 41.3, 22.0, 31.5, 69.4, 112.1, 108.5, 93.6],
    source: '세계기상기구(WMO) 1991–2020 평년값, 마리스칼 수크레 공항',
    life: [
      { icon: '🧣', title: '옷', text: '적도 근처지만 높은 곳이라 서늘해요. 낮과 밤의 기온 차가 커서 판초처럼 걸치고 벗기 쉬운 옷을 입어요.' },
      { icon: '🥔', title: '먹거리', text: '안데스 산지에서는 서늘한 곳에서 잘 자라는 감자와 옥수수를 길러요. 라마와 알파카도 길러요.' },
      { icon: '🏙️', title: '도시', text: '덥고 습한 낮은 땅보다 지내기 좋아서, 안데스 산지에는 키토처럼 높은 곳에 큰 도시가 생겼어요.' },
    ],
  },
  {
    id: 'seoul',
    name: '서울',
    country: '대한민국',
    zone: 'temperate',
    lat: seoul.lat,
    lng: seoul.lng,
    elevation: 86,
    temp: seoul.temp,
    rain: seoul.rain,
    source: '기상청 1991–2020 기후평년값',
    life: [
      { icon: '🌧️', title: '여름', text: '여름에 비가 몰려 와요(장마·집중호우). 덥고 습해서 대청마루처럼 바람이 통하는 공간을 만들었어요.' },
      { icon: '🔥', title: '겨울', text: '겨울에는 춥고 건조해서 온돌로 방바닥을 데웠어요.' },
      { icon: '🍚', title: '먹거리', text: '여름에 덥고 비가 많아 벼농사를 지어요. 겨울을 앞두고 김장을 해요.' },
    ],
  },
];

export const WORLD_CLIMATE_SOURCE =
  '각 나라 기상청·세계기상기구(WMO)·미국 해양대기청(NOAA)의 1991~2020 평년값 (도시를 누르면 출처가 나와요)';

export const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
export const yearRain = (c: WorldCity) => sum(c.rain);
export const avgTemp = (c: WorldCity) => sum(c.temp) / 12;
export const warmest = (c: WorldCity) => Math.max(...c.temp);
export const coldest = (c: WorldCity) => Math.min(...c.temp);

/** 탐구 질문의 정답: 손으로 쓰지 않고 위 자료에서 계산합니다 */
export const WORLDCLIMATE_ANSWERS = {
  /** 가장 추운 달도 18℃ 이상이고 1년 강수량 1,500㎜ 이상 */
  hotWet: WORLD_CITIES.filter((c) => coldest(c) >= 18 && yearRain(c) >= 1500).map((c) => c.id),
  /** 1년 강수량이 가장 적은 도시 */
  driest: [...WORLD_CITIES].sort((a, b) => yearRain(a) - yearRain(b))[0].id,
  /** 가장 따뜻한 달도 10℃ 미만 */
  coldSummer: WORLD_CITIES.filter((c) => warmest(c) < 10).map((c) => c.id),
  /** 적도에서 위도 10도 안쪽인데 가장 더운 달이 18℃ 미만 */
  coolEquator: WORLD_CITIES.filter((c) => Math.abs(c.lat) < 10 && warmest(c) < 18).map((c) => c.id),
  /** 서울과 런던 중 연교차(가장 더운 달 - 가장 추운 달)가 큰 도시 */
  seoulVsLondon: (['seoul', 'london'] as const)
    .map((id) => WORLD_CITIES.find((c) => c.id === id)!)
    .sort((a, b) => warmest(b) - coldest(b) - (warmest(a) - coldest(a)))[0].id,
};

export function worldCityName(id: string): string {
  return WORLD_CITIES.find((c) => c.id === id)?.name ?? id;
}
