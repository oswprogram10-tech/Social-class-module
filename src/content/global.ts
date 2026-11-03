/**
 * [6사12-02] 지구촌 문제와 지속가능한 미래
 *
 * 숫자 대신 초등 수준의 사실 설명만 씁니다. 지속가능발전목표(SDGs)는
 * 2015년 국제연합(UN)에서 여러 나라가 2030년까지 함께 이루기로 약속한 17가지 목표입니다.
 */
import type { Choice } from '../activities';

export interface GlobalProblem extends Choice {
  about: string;
  /** 관련 지속가능발전목표 번호와 이름 */
  sdgs: { n: number; name: string }[];
  /** 원인을 생각할 때 도움이 되는 질문 */
  causeHint: string;
}

export const GLOBAL_PROBLEMS: GlobalProblem[] = [
  {
    id: 'climate',
    emoji: '🌡️',
    label: '기후 위기',
    about: '석탄·석유를 태울 때 나오는 온실가스가 늘어 지구의 평균 기온이 오르고 있어요. 폭염, 가뭄, 홍수 같은 피해가 잦아져요.',
    sdgs: [{ n: 13, name: '기후변화 대응' }],
    causeHint: '우리가 전기를 쓰고, 차를 타고, 물건을 만들 때 무엇을 태울까요?',
  },
  {
    id: 'forest',
    emoji: '🌳',
    label: '열대림 파괴',
    about: '농장과 목장을 만들거나 나무를 베어 팔려고 열대림이 줄고 있어요. 그곳에 사는 많은 동식물이 살 곳을 잃어요.',
    sdgs: [{ n: 15, name: '육상 생태계 보호' }, { n: 13, name: '기후변화 대응' }],
    causeHint: '숲이 있던 자리에 무엇이 생겼을까요? 그것은 누가 사서 쓸까요?',
  },
  {
    id: 'ocean',
    emoji: '🐢',
    label: '바다 쓰레기',
    about: '버려진 플라스틱 쓰레기가 강을 따라 바다로 흘러가요. 바다 생물이 걸려 다치거나 먹이로 잘못 먹기도 해요.',
    sdgs: [{ n: 14, name: '해양 생태계 보호' }, { n: 12, name: '책임 있는 소비와 생산' }],
    causeHint: '한 번 쓰고 버리는 물건에는 무엇이 있을까요? 그 쓰레기는 어디로 갈까요?',
  },
  {
    id: 'hunger',
    emoji: '🍚',
    label: '빈곤과 기아',
    about: '지구촌 어딘가에는 먹을 것이 부족하고, 학교에 가지 못하고 일을 해야 하는 어린이들이 있어요.',
    sdgs: [{ n: 1, name: '빈곤 퇴치' }, { n: 2, name: '기아 종식' }, { n: 4, name: '양질의 교육' }],
    causeHint: '가뭄이나 전쟁이 일어나면 농사와 일자리는 어떻게 될까요?',
  },
  {
    id: 'refugee',
    emoji: '🏕️',
    label: '전쟁과 난민',
    about: '전쟁이나 박해를 피해 살던 나라를 떠나야 하는 사람들이 있어요. 이런 사람들을 난민이라고 해요.',
    sdgs: [{ n: 16, name: '평화와 정의' }],
    causeHint: '사람들이 집과 고향을 떠날 수밖에 없는 까닭은 무엇일까요?',
  },
  {
    id: 'water',
    emoji: '💧',
    label: '물 부족',
    about: '깨끗한 물을 쉽게 구하지 못해 먼 곳까지 물을 길으러 가거나, 더러운 물을 마셔 병에 걸리는 지역이 있어요.',
    sdgs: [{ n: 6, name: '깨끗한 물과 위생' }],
    causeHint: '비가 적게 오는 곳, 상수도 시설이 없는 곳은 어떨까요?',
  },
];

/** 해결에 나서는 주체: 누가 할 수 있을까? */
export const ACTORS: Choice[] = [
  { id: 'un', emoji: '🇺🇳', label: '국제기구·여러 나라 협력' },
  { id: 'gov', emoji: '🏛️', label: '정부(나라)' },
  { id: 'ngo', emoji: '🤝', label: '비정부 기구(NGO)' },
  { id: 'company', emoji: '🏭', label: '기업' },
  { id: 'me', emoji: '🙋', label: '나와 우리 반' },
];

export const GLOBAL_STEPS = ['문제 고르기', '원인 생각하기', '방법 비교하기', '실천 약속하기'] as const;

export function findProblem(id?: string) {
  return GLOBAL_PROBLEMS.find((p) => p.id === id);
}

export function findActor(id?: string) {
  return ACTORS.find((a) => a.id === id);
}

export const SDG_ABOUT =
  '지속가능발전목표(SDGs)는 2015년 국제연합(UN)에서 세계 여러 나라가 2030년까지 함께 이루기로 약속한 17가지 목표예요.';
