/** 선거 4원칙 지키기 [6사08-01] */

export type PrincipleId = 'U' | 'E' | 'D' | 'S';

export const PRINCIPLES: { id: PrincipleId; emoji: string; label: string; meaning: string }[] = [
  { id: 'U', emoji: '🙋', label: '보통 선거', meaning: '일정한 나이가 되면 누구나 투표할 수 있어요.' },
  { id: 'E', emoji: '⚖️', label: '평등 선거', meaning: '누구나 똑같이 한 표씩 투표해요.' },
  { id: 'D', emoji: '✋', label: '직접 선거', meaning: '다른 사람이 대신하지 않고 자기가 직접 투표해요.' },
  { id: 'S', emoji: '🤫', label: '비밀 선거', meaning: '누구를 뽑았는지 다른 사람이 알 수 없게 투표해요.' },
];

export interface Scenario {
  id: string;
  story: string;
  /** 원칙이 깨져서 생긴 일 */
  result: string;
  answer: PrincipleId;
  /** 틀렸을 때 생각을 돕는 질문 */
  hint: string;
}

/** 지어낸 “행복섬” 반장 선거 이야기 */
export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    story: '행복섬에서는 집에 돈이 많은 사람만 투표할 수 있도록 정했어요.',
    result: '그래서 부자들이 원하는 사람만 뽑혔고, 다른 주민들의 의견은 반영되지 않았어요.',
    answer: 'U',
    hint: '투표할 수 있는 사람이 누구로 정해져 있나요? 모든 사람이 투표할 수 있나요?',
  },
  {
    id: 's2',
    story: '지난 시험에서 100점을 받은 학생은 한 사람이 세 표씩 투표할 수 있게 했어요.',
    result: '그래서 몇몇 학생의 생각이 반 전체의 결과를 정해 버렸어요.',
    answer: 'E',
    hint: '한 사람이 가진 표의 수가 모두 같나요?',
  },
  {
    id: 's3',
    story: '투표하기 귀찮은 학생은 친구에게 자기 대신 투표해 달라고 부탁해도 된다고 했어요.',
    result: '그래서 한 학생이 친구 다섯 명의 표를 마음대로 써 버렸어요.',
    answer: 'D',
    hint: '투표용지에 표시한 사람은 누구인가요? 그 사람 자신인가요?',
  },
  {
    id: 's4',
    story: '모두가 보는 앞에서 손을 들어 누구를 뽑을지 정하기로 했어요.',
    result: '그래서 힘센 친구의 눈치를 보느라 원하는 사람을 뽑지 못한 학생들이 있었어요.',
    answer: 'S',
    hint: '누가 누구를 뽑았는지 다른 사람이 알 수 있나요?',
  },
  {
    id: 's5',
    story: '선거관리위원 학생은 투표함을 열기 전에 친구들에게 “누구 뽑았어?”라고 물어보고 기록했어요.',
    result: '그래서 투표한 내용이 알려질까 봐 걱정하는 친구들이 생겼어요.',
    answer: 'S',
    hint: '투표한 내용이 다른 사람에게 알려지면 어떤 문제가 생길까요?',
  },
  {
    id: 's6',
    story: '3학년 이상만 투표하던 학교에서 갑자기 6학년만 투표할 수 있게 바꿨어요.',
    result: '그래서 전교 어린이회장 선거에 3~5학년의 의견이 전혀 들어가지 않았어요.',
    answer: 'U',
    hint: '투표할 자격이 있는 사람이 일부로 줄어들었나요?',
  },
];

export function findPrinciple(id?: string) {
  return PRINCIPLES.find((p) => p.id === id);
}
