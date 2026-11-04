/** 5학년 2학기 한국사 [6사04~06]: 큰 사건을 시대 순서대로 놓기 */

export interface HistoryEvent {
  id: string;
  label: string;
  /** 정답 공개 후 보여 줄 연도 */
  when: string;
  /** 정렬용 연도 (기원전은 음수) */
  year: number;
  emoji: string;
}

export const HISTORY_EVENTS: HistoryEvent[] = [
  { id: 'A', label: '고조선 건국', when: '기원전 2333년 (『삼국유사』 기록)', year: -2333, emoji: '🏔️' },
  { id: 'B', label: '신라의 삼국 통일', when: '676년', year: 676, emoji: '🤝' },
  { id: 'C', label: '고려 건국', when: '918년', year: 918, emoji: '🏯' },
  { id: 'D', label: '조선 건국', when: '1392년', year: 1392, emoji: '👑' },
  { id: 'E', label: '훈민정음 반포', when: '1446년', year: 1446, emoji: '📜' },
  { id: 'F', label: '임진왜란', when: '1592년', year: 1592, emoji: '⚔️' },
  { id: 'G', label: '3·1 운동', when: '1919년', year: 1919, emoji: '🇰🇷' },
  { id: 'H', label: '8·15 광복', when: '1945년', year: 1945, emoji: '🎉' },
];

/** 정답 순서 (예: "ABCDEFGH") */
export const HISTORY_ANSWER = [...HISTORY_EVENTS].sort((a, b) => a.year - b.year).map((e) => e.id).join('');

export function findEvent(id: string) {
  return HISTORY_EVENTS.find((e) => e.id === id);
}

/** 제자리에 놓인 사건 수 */
export function historyScore(order?: string): number {
  if (!order) return 0;
  return [...HISTORY_ANSWER].filter((id, i) => order[i] === id).length;
}

// ---------- 여러 연표 순서 활동이 함께 쓰는 형식 ----------

export interface OrderSet {
  events: HistoryEvent[];
  /** 정답 순서 */
  answer: string;
  /** 카드를 보여 줄 섞인 순서 (정답과 다르게 고정) */
  shuffled: string[];
  placeName: string;
  title: string;
  /** 순서가 바뀐 두 사건을 물을 때 덧붙일 생각 거리 */
  hintTail: string;
  open: string;
}

/** 6학년 1학기 (7) 평화 통일을 위한 노력, 민주화와 산업화 [6사07-01·02] */
export const MODERN_EVENTS: HistoryEvent[] = [
  { id: 'A', label: '6·25 전쟁 정전 협정', when: '1953년 7월', year: 1953, emoji: '🕊️' },
  { id: 'B', label: '4·19 혁명', when: '1960년', year: 1960, emoji: '✊' },
  { id: 'C', label: '경부 고속 국도 개통', when: '1970년', year: 1970, emoji: '🛣️' },
  { id: 'D', label: '포항 제철소 첫 쇳물 생산', when: '1973년', year: 1973, emoji: '🏭' },
  { id: 'E', label: '5·18 민주화 운동', when: '1980년', year: 1980, emoji: '🕯️' },
  { id: 'F', label: '6월 민주 항쟁', when: '1987년', year: 1987, emoji: '📣' },
  { id: 'G', label: '서울 올림픽 대회', when: '1988년', year: 1988, emoji: '🏅' },
  { id: 'H', label: '첫 남북 정상 회담', when: '2000년 6월', year: 2000, emoji: '🤝' },
];

const answerOf = (events: HistoryEvent[]) => [...events].sort((a, b) => a.year - b.year).map((e) => e.id).join('');

export const ORDER_SETS: Record<'history' | 'modern', OrderSet> = {
  history: {
    events: HISTORY_EVENTS,
    answer: HISTORY_ANSWER,
    shuffled: ['F', 'C', 'H', 'A', 'E', 'G', 'B', 'D'],
    placeName: '한국사 연표',
    title: '한국사 연표 순서',
    hintTail: '각 사건이 어느 나라 때 일인지 떠올려 보세요.',
    open: '가장 기억에 남는 사건과 그 까닭은?',
  },
  modern: {
    events: MODERN_EVENTS,
    answer: answerOf(MODERN_EVENTS),
    shuffled: ['G', 'C', 'E', 'A', 'H', 'D', 'B', 'F'],
    placeName: '민주화와 산업화 연표',
    title: '민주화·산업화 연표 순서',
    hintTail: '전쟁이 끝난 뒤 민주주의를 지키려는 노력과 경제 발전이 어떤 차례로 이어졌는지 떠올려 보세요.',
    open: '민주화와 산업화를 이룬 사람들의 노력 중 가장 기억에 남는 것은? 평화 통일을 위해 내가 할 수 있는 일도 적어 보세요.',
  },
};

export function orderSetFor(activity: string): OrderSet | undefined {
  return (ORDER_SETS as Record<string, OrderSet>)[activity];
}

export function orderScore(set: OrderSet, order?: string): number {
  if (!order) return 0;
  return [...set.answer].filter((id, i) => order[i] === id).length;
}
