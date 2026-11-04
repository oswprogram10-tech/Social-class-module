/**
 * [6사10-01] 세계의 지형 경관과 다양한 삶의 모습
 *
 * 설명은 초등 수준의 널리 알려진 사실만 씁니다. 사진은 위키미디어 공용(Wikimedia Commons)의
 * 자유 라이선스(퍼블릭 도메인, CC0, CC BY, CC BY-SA) 사진을 학생 브라우저에서 바로 불러오며,
 * 사진마다 작가와 라이선스를 표시합니다. 학교망에서 사진이 막혀도 활동은 그대로 할 수 있습니다.
 */

import type { Photo } from './photos';

export type { Photo } from './photos';
export { licenseUrl, photoUrl } from './photos';

export type LandformType = 'mountain' | 'river' | 'dry' | 'glacier' | 'coast' | 'volcano';

export const LANDFORM_TYPES: { id: LandformType; name: string; emoji: string; color: string }[] = [
  { id: 'mountain', name: '산지·산맥', emoji: '⛰️', color: '#78716c' },
  { id: 'river', name: '하천', emoji: '🏞️', color: '#2563eb' },
  { id: 'dry', name: '건조 지형', emoji: '🏜️', color: '#d97706' },
  { id: 'glacier', name: '빙하 지형', emoji: '🧊', color: '#0891b2' },
  { id: 'coast', name: '해안 지형', emoji: '🏖️', color: '#0d9488' },
  { id: 'volcano', name: '화산 지형', emoji: '🌋', color: '#dc2626' },
];


export interface Landform {
  id: string;
  name: string;
  where: string;
  type: LandformType;
  lat: number;
  lng: number;
  about: string;
  /** 사람들의 생활(의식주, 산업, 관광 등) */
  life: string[];
  photo?: Photo;
}

export const LANDFORMS: Landform[] = [
  {
    id: 'himalaya',
    name: '히말라야산맥',
    where: '아시아 (네팔·중국·인도 등)',
    type: 'mountain',
    lat: 27.99,
    lng: 86.93,
    about: '세계에서 가장 높은 산인 에베레스트산(약 8,849m)이 있는 높고 험한 산맥이에요. 꼭대기는 1년 내내 눈과 얼음으로 덮여 있어요.',
    life: ['비탈을 계단처럼 깎은 밭(계단식 밭)에서 농사를 지어요.', '높은 산에 오르려는 등산객이 찾아와, 길 안내와 짐 나르기를 하는 사람들이 있어요.'],
    photo: {
      file: 'Mount Everest as seen from Drukair2 PLW edit.jpg',
      author: 'shrimpo1967 (편집: Papa Lima Whiskey 2)',
      license: 'CC BY-SA 2.0',
      page: 'https://commons.wikimedia.org/wiki/File:Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg',
    },
  },
  {
    id: 'andes',
    name: '안데스산맥',
    where: '남아메리카 (페루·칠레 등)',
    type: 'mountain',
    lat: -13.16,
    lng: -72.55,
    about: '남아메리카 서쪽을 따라 길게 이어진, 땅 위에서 가장 긴 산맥이에요.',
    life: ['옛 잉카 사람들은 산비탈에 계단식 밭을 만들고 높은 곳에 도시(마추픽추)를 세웠어요.', '서늘한 고산에서 감자를 기르고, 라마와 알파카를 길러요.'],
    photo: {
      file: '80 - Machu Picchu - Juin 2009 - edit.jpg',
      author: 'Martin St-Amant',
      license: 'CC BY-SA 3.0',
      page: 'https://commons.wikimedia.org/wiki/File:80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg',
    },
  },
  {
    id: 'alps',
    name: '알프스산맥',
    where: '유럽 (스위스·오스트리아·프랑스 등)',
    type: 'glacier',
    lat: 45.98,
    lng: 7.66,
    about: '아주 오랜 옛날 빙하가 산을 깎아 마터호른 같은 뾰족한 봉우리와 U자 모양의 넓은 골짜기를 만들었어요. 지금도 높은 곳에 빙하가 남아 있어요.',
    life: ['여름에는 가축을 높은 산의 풀밭으로 몰고 올라갔다가 가을에 내려와요.', '겨울에는 스키, 여름에는 등산을 즐기려는 관광객이 많이 찾아와요.'],
    photo: {
      file: 'Matterhorn from Domhütte - 2.jpg',
      author: 'chil (Camptocamp.org), 편집: Zacharie Grossen',
      license: 'CC BY-SA 3.0',
      page: 'https://commons.wikimedia.org/wiki/File:Matterhorn_from_Domh%C3%BCtte_-_2.jpg',
    },
  },
  {
    id: 'sahara',
    name: '사하라사막',
    where: '아프리카 북부',
    type: 'dry',
    lat: 23.5,
    lng: 12.0,
    about: '세계에서 가장 넓은 더운 사막이에요. 비가 거의 오지 않고, 바람이 모래를 쌓아 모래 언덕(사구)을 만들어요.',
    life: ['물이 솟는 오아시스 둘레에 마을을 만들고 대추야자를 길러요.', '낙타를 타고 물과 풀을 찾아 옮겨 다니며 가축을 기르는 사람들도 있어요.'],
    photo: {
      file: 'Morocco Africa Flickr Rosino December 2005 84514010 edited by Buchling.jpg',
      author: 'Rosa Cabecinhas, Alcino Cunha (편집: Buchling)',
      license: 'CC BY-SA 2.0',
      page: 'https://commons.wikimedia.org/wiki/File:Morocco_Africa_Flickr_Rosino_December_2005_84514010_edited_by_Buchling.jpg',
    },
  },
  {
    id: 'steppe',
    name: '몽골 초원',
    where: '아시아 (몽골)',
    type: 'dry',
    lat: 47.5,
    lng: 104.0,
    about: '비가 적어 나무는 잘 자라지 못하지만 풀이 넓게 자라는 초원이에요.',
    life: ['양·염소·말을 기르며 풀을 찾아 옮겨 다니는 유목 생활을 해 왔어요.', '뜯어서 옮기기 쉬운 둥근 천막집 “게르”에서 살아요.'],
    photo: {
      file: 'Jurty na stepie pomiędzy Ułan Bator a Karakorum 01.JPG',
      author: 'Marcin Konsek / Wikimedia Commons',
      license: 'CC BY-SA 4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Jurty_na_stepie_pomi%C4%99dzy_U%C5%82an_Bator_a_Karakorum_01.JPG',
    },
  },
  {
    id: 'amazon',
    name: '아마존강',
    where: '남아메리카 (브라질 등)',
    type: 'river',
    lat: -3.1,
    lng: -60.0,
    about: '세계에서 가장 넓은 열대 우림 사이를 흐르는, 물의 양이 가장 많은 강이에요.',
    life: ['길 대신 강이 중요한 교통로라서 배를 타고 다녀요.', '물이 불어나도 잠기지 않도록 기둥 위에 집을 짓기도 해요.'],
    photo: {
      file: 'Aerial view of the Amazon Rainforest.jpg',
      author: 'lubasi',
      license: 'CC BY-SA 2.0',
      page: 'https://commons.wikimedia.org/wiki/File:Aerial_view_of_the_Amazon_Rainforest.jpg',
    },
  },
  {
    id: 'nile',
    name: '나일강',
    where: '아프리카 (이집트 등)',
    type: 'river',
    lat: 25.7,
    lng: 32.6,
    about: '세계에서 가장 긴 강 가운데 하나로, 사막 한가운데를 지나 지중해로 흘러가요.',
    life: ['강물을 끌어 강 양옆의 좁은 땅에서만 초록빛 밭을 일궈요.', '옛날 이집트 문명이 이 강가에서 피어났어요.'],
    photo: {
      file: 'Crop limit, Nile Valley-2.jpg',
      author: 'Fanny Schertzer',
      license: 'CC BY-SA 4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Crop_limit,_Nile_Valley-2.jpg',
    },
  },
  {
    id: 'grandcanyon',
    name: '그랜드캐니언',
    where: '북아메리카 (미국)',
    type: 'river',
    lat: 36.1,
    lng: -112.1,
    about: '콜로라도강이 아주 오랜 시간 동안 땅을 깎아 만든 깊고 긴 골짜기(협곡)예요. 벽에 여러 겹의 암석 층이 보여요.',
    life: ['국립공원으로 지정되어 해마다 많은 관광객이 찾아와요.', '옛날부터 이 협곡과 그 둘레에서 살아온 원주민 부족이 있어요.'],
    photo: {
      file: 'Grand Canyon Hopi Point Evening Light 2013.jpg',
      author: 'Tuxyso / Wikimedia Commons',
      license: 'CC BY-SA 3.0',
      page: 'https://commons.wikimedia.org/wiki/File:Grand_Canyon_Hopi_Point_Evening_Light_2013.jpg',
    },
  },
  {
    id: 'fjord',
    name: '피오르',
    where: '유럽 (노르웨이)',
    type: 'glacier',
    lat: 62.1,
    lng: 7.2,
    about: '빙하가 깎은 깊은 골짜기에 바닷물이 들어와 생긴, 좁고 길게 육지 안쪽으로 들어온 바다예요.',
    life: ['물이 깊고 잔잔해서 배가 드나들기 좋아, 피오르 안쪽에 항구 마을이 있어요.', '아름다운 경치를 보러 큰 유람선이 찾아와요.'],
    photo: {
      file: 'Geirangerfjord LC0188.jpg',
      author: 'Jörg Hempel',
      license: 'CC BY-SA 2.0 de',
      page: 'https://commons.wikimedia.org/wiki/File:Geirangerfjord_LC0188.jpg',
    },
  },
  {
    id: 'iceland',
    name: '아이슬란드 화산과 간헐천',
    where: '유럽 (아이슬란드)',
    type: 'volcano',
    lat: 64.31,
    lng: -20.3,
    about: '화산이 많은 섬이에요. 땅속의 뜨거운 열 때문에 뜨거운 물과 김이 솟구치는 간헐천과 온천이 있어요.',
    life: ['땅속의 열(지열)로 대부분의 집을 데우고 전기도 만들어요.', '온천과 화산 경치를 보러 관광객이 찾아와요.'],
    photo: {
      file: 'Strokkur geyser eruption, close-up view.jpg',
      author: 'Andreas Tille',
      license: 'CC BY-SA 3.0',
      page: 'https://commons.wikimedia.org/wiki/File:Strokkur_geyser_eruption,_close-up_view.jpg',
    },
  },
  {
    id: 'reef',
    name: '그레이트배리어리프',
    where: '오세아니아 (오스트레일리아)',
    type: 'coast',
    lat: -18.3,
    lng: 147.7,
    about: '바닷속 작은 동물인 산호가 오랜 시간 쌓여 만든, 세계에서 가장 큰 산호초 지대예요.',
    life: ['맑은 바다에서 스노클링과 다이빙을 하려는 관광객이 찾아와요.', '바닷물 온도가 오르면 산호가 하얗게 죽어 가서(백화 현상), 지키려는 노력을 하고 있어요.'],
    photo: {
      file: 'Great-Barrier-Reef-2018-Luka-Peternel.jpg',
      author: 'Luka Peternel',
      license: 'CC BY-SA 4.0',
      page: 'https://commons.wikimedia.org/wiki/File:Great-Barrier-Reef-2018-Luka-Peternel.jpg',
    },
  },
];

export function findLandform(id?: string) {
  return LANDFORMS.find((l) => l.id === id);
}

export function landformName(id: string): string {
  return findLandform(id)?.name ?? id;
}
