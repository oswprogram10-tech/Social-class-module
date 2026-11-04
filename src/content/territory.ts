/**
 * 5학년 1학기 (1) 우리나라 국토 여행 [6사01-01·02]
 * 우리나라의 산지·하천·해안 지형과 독도.
 *
 * 높이·길이 같은 숫자는 널리 쓰이는 공식 값만 씁니다.
 * - 한라산 1,947m, 지리산(천왕봉) 1,915m, 설악산(대청봉) 1,708m: 국토지리정보원 표기
 * - 낙동강은 남한에서 가장 긴 강(약 510km)
 * - 독도: 외교부·해양수산부 독도 누리집 (울릉도에서 약 87.4km, 동도·서도와 89개 부속 섬)
 */

export type TerritoryType = 'mountain' | 'river' | 'coast' | 'dokdo';

export const TERRITORY_TYPES: { id: TerritoryType; name: string; emoji: string; color: string }[] = [
  { id: 'mountain', name: '산지', emoji: '⛰️', color: '#78716c' },
  { id: 'river', name: '하천', emoji: '🏞️', color: '#2563eb' },
  { id: 'coast', name: '해안', emoji: '🏖️', color: '#0d9488' },
  { id: 'dokdo', name: '독도', emoji: '🇰🇷', color: '#dc2626' },
];

export interface TerritoryPlace {
  id: string;
  name: string;
  type: TerritoryType;
  lat: number;
  lng: number;
  about: string;
  /** 지도 이름표 위치 조정(px) */
  labelOffset?: [number, number];
}

export const TERRITORY_PLACES: TerritoryPlace[] = [
  {
    id: 'seorak',
    name: '설악산',
    type: 'mountain',
    lat: 38.12,
    lng: 128.47,
    about: '태백산맥에 있는 높은 산(대청봉 1,708m)이에요. 우리나라는 동쪽에 높은 산지가 많아요.',
  },
  {
    id: 'jiri',
    name: '지리산',
    type: 'mountain',
    lat: 35.34,
    lng: 127.73,
    about: '소백산맥에 있는 큰 산(천왕봉 1,915m)으로, 전라도와 경상도에 걸쳐 있어요. 우리나라 첫 국립공원이에요.',
  },
  {
    id: 'halla',
    name: '한라산',
    type: 'mountain',
    lat: 33.36,
    lng: 126.53,
    about: '제주도 한가운데에 있는 화산으로, 남한에서 가장 높은 산(1,947m)이에요. 꼭대기에 백록담이 있어요.',
    labelOffset: [0, -14],
  },
  {
    id: 'han',
    name: '한강',
    type: 'river',
    lat: 37.53,
    lng: 126.98,
    about: '태백산맥에서 시작해 서울을 지나 서해로 흘러가는 강이에요. 옛날부터 강 둘레에 사람들이 모여 살았어요.',
    labelOffset: [-6, -12],
  },
  {
    id: 'nakdong',
    name: '낙동강',
    type: 'river',
    lat: 35.7,
    lng: 128.45,
    about: '남한에서 가장 긴 강(약 510km)이에요. 경상도를 지나 남해로 흘러가요.',
  },
  {
    id: 'geum',
    name: '금강',
    type: 'river',
    lat: 36.45,
    lng: 127.1,
    about: '충청도와 전라도 사이를 지나 서해로 흘러가는 강이에요.',
    labelOffset: [-22, 6],
  },
  {
    id: 'westcoast',
    name: '서해안 갯벌',
    type: 'coast',
    lat: 36.75,
    lng: 126.2,
    about: '서해안은 밀물과 썰물의 차이가 커서, 바닷물이 빠지면 넓은 갯벌이 드러나요. 해안선이 꼬불꼬불해요.',
    labelOffset: [-30, 0],
  },
  {
    id: 'southcoast',
    name: '남해안 다도해',
    type: 'coast',
    lat: 34.6,
    lng: 127.4,
    about: '남해안에는 크고 작은 섬이 아주 많아요. 해안선이 꼬불꼬불해서 양식업이 발달했어요.',
    labelOffset: [0, 12],
  },
  {
    id: 'eastcoast',
    name: '동해안 모래 해안',
    type: 'coast',
    lat: 37.8,
    lng: 128.92,
    about: '동해안은 해안선이 비교적 단조롭고, 모래사장이 넓은 해수욕장이 많아요. 바다가 깊어요.',
    labelOffset: [30, 0],
  },
  {
    id: 'dokdo',
    name: '독도',
    type: 'dokdo',
    lat: 37.2417,
    lng: 131.8647,
    about:
      '우리나라 가장 동쪽 끝에 있는 섬으로, 경상북도 울릉군에 속해요. 동도와 서도, 그리고 89개의 작은 섬으로 이루어져 있고, 울릉도에서 약 87.4km 떨어져 있어 맑은 날에는 울릉도에서 보여요. 『세종실록지리지』(1454) 같은 옛 기록에도 우리 땅으로 나와요.',
    labelOffset: [0, -14],
  },
];

export function findTerritory(id?: string) {
  return TERRITORY_PLACES.find((p) => p.id === id);
}

export function territoryName(id: string): string {
  return findTerritory(id)?.name ?? id;
}
