/**
 * 팩트체크 스튜디오 [6사08-03] 기본 자료
 * 모두 지어낸 이야기입니다(실제 지역·언론·업체가 아님).
 * 사실(F): 확인할 수 있는 내용 / 의견(O): 생각이나 느낌, 판단
 */

export type FactLabel = 'F' | 'O';

export interface FactItem {
  id: string;
  title: string;
  /** 자료 종류 */
  source: string;
  /** 쓴 사람·채널 */
  author: string;
  sentences: { text: string; answer: FactLabel }[];
  /** 교사가 만든 자료인지 */
  custom?: boolean;
}

export const SOURCE_TYPES = ['신문 기사', '개인 방송', 'SNS 글', '광고', '기타'];

export const FACT_ISSUE = '놀이터 자리에 주차장을 짓는 계획';

export const BUILTIN_FACT_ITEMS: FactItem[] = [
  {
    id: 'news',
    title: '행복구, 놀이터 자리에 공영 주차장 짓는다',
    source: '신문 기사',
    author: '행복일보 김바른 기자 (지어낸 자료)',
    sentences: [
      { text: '행복구는 학교 앞 놀이터 자리에 공영 주차장을 짓는 계획을 3월 2일 발표했다.', answer: 'F' },
      { text: '주차장에는 차 40대를 세울 수 있다.', answer: 'F' },
      { text: '행복구 조사에 따르면 이 지역의 주차 공간은 차량 수보다 300면 부족하다.', answer: 'F' },
      { text: '공사는 내년 5월에 시작할 예정이다.', answer: 'F' },
      { text: '놀이터가 사라지는 것은 아이들에게 너무 슬픈 일이다.', answer: 'O' },
    ],
  },
  {
    id: 'stream',
    title: '[긴급] 우리 동네 놀이터가 사라진다고요?!',
    source: '개인 방송',
    author: '동네왕TV (지어낸 자료)',
    sentences: [
      { text: '여러분, 이 주차장 계획은 정말 최악이에요!', answer: 'O' },
      { text: '놀이터는 이 동네에서 가장 중요한 곳이에요.', answer: 'O' },
      { text: '놀이터 넓이는 약 800제곱미터예요.', answer: 'F' },
      { text: '제 생각엔 구청이 아이들을 전혀 신경 쓰지 않는 것 같아요.', answer: 'O' },
      { text: '이 계획에 반대하는 사람이 엄청 많을 거예요.', answer: 'O' },
    ],
  },
  {
    id: 'sns',
    title: '주차 걱정 끝! 우리 동네에도 주차장이 생겨요',
    source: '광고',
    author: '빠른주차 공식 계정 (지어낸 자료)',
    sentences: [
      { text: '주차장이 생기면 동네가 훨씬 편리해질 거예요!', answer: 'O' },
      { text: '빠른주차는 전국에서 주차장 120곳을 운영하고 있습니다.', answer: 'F' },
      { text: '주차장 이용료는 1시간에 1,000원입니다.', answer: 'F' },
      { text: '우리가 만든 주차장이 가장 안전합니다.', answer: 'O' },
      { text: '놀이터보다 주차장이 동네에 더 필요합니다.', answer: 'O' },
    ],
  },
];

/** 출처 믿을 만한지 따져 보는 질문 (정답 없이 스스로 판단) */
export const FACT_CHECKLIST = [
  '누가 썼는지 알 수 있나요?',
  '숫자나 조사 같은 근거가 있나요?',
  '광고나 홍보가 섞여 있나요?',
  '한쪽 의견만 말하나요?',
  '“최악”, “엄청” 같은 감정을 부추기는 말이 있나요?',
];

export const TRUST_LEVELS = [
  { id: 'high', emoji: '👍', label: '믿을 만해요' },
  { id: 'mid', emoji: '🤔', label: '더 확인해 볼래요' },
  { id: 'low', emoji: '⚠️', label: '믿기 어려워요' },
];

/** 교사가 쓴 글을 문장으로 나눕니다 */
export function splitSentences(text: string): string[] {
  return (text.replace(/\s+/g, ' ').match(/[^.!?。]+[.!?。]?/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/** 학생 표시와 정답 비교: 맞은 개수와 틀린 문장 번호 */
export function gradeLabels(item: FactItem, labels: string): { correct: number; total: number; wrong: number[] } {
  const wrong: number[] = [];
  item.sentences.forEach((s, i) => {
    if (labels[i] !== s.answer) wrong.push(i);
  });
  return { correct: item.sentences.length - wrong.length, total: item.sentences.length, wrong };
}
