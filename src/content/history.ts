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
