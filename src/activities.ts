/**
 * 활동 정의
 * 2022 개정 사회과 3학년 1학기 (1) 우리가 사는 곳
 * 성취기준 문구는 교육부 고시 원문과 대조해 확인하세요.
 */

export type ActivityId = 'feel' | 'better';

export interface Choice {
  id: string;
  emoji: string;
  label: string;
}

export interface ActivityDef {
  id: ActivityId;
  title: string;
  standard: string;
  standardText: string;
  /** 학생에게 보여 줄 안내 (읽어주기 대상) */
  guide: string;
  /** 생각을 돕는 질문 카드 (정답 대신 질문으로 생각을 이끌어 줍니다) */
  questions: string[];
}

export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  feel: {
    id: 'feel',
    title: '나의 장소감 지도',
    standard: '[4사01-01]',
    standardText:
      '주변 여러 장소에서의 경험과 느낌을 다양한 방식으로 표현하고, 장소감을 나누며 서로 존중하는 태도를 지닌다.',
    guide: '우리 동네에서 기억에 남는 장소를 지도에서 찾아 눌러 보세요. 그곳에서 어떤 느낌이 들었는지 표시해요.',
    questions: [
      '그 장소에서 무엇을 했나요?',
      '그때 어떤 기분이 들었나요? 왜 그런 기분이 들었을까요?',
      '친구는 같은 장소에서 다른 느낌을 받았나요? 왜 다를까요?',
    ],
  },
  better: {
    id: 'better',
    title: '더 살기 좋은 우리 동네',
    standard: '[4사01-02]',
    standardText: '주변의 여러 장소를 살펴보고, 우리가 사는 곳을 더 살기 좋은 곳으로 만드는 방안을 탐색한다.',
    guide: '우리 동네에서 불편하거나 위험한 곳을 찾아 눌러 보세요. 무엇이 있으면 더 좋아질지 골라요.',
    questions: [
      '그곳은 누구에게 불편할까요? (어린이, 어르신, 휠체어 이용자…)',
      '왜 그런 문제가 생겼을까요?',
      '내가 고른 방법이 생기면 무엇이 달라질까요? 다른 방법은 없을까요?',
    ],
  },
};

export const ACTIVITY_ORDER: ActivityId[] = ['feel', 'better'];

/** 장소감 (활동 1) */
export const FEELINGS: Choice[] = [
  { id: 'happy', emoji: '😊', label: '좋아요' },
  { id: 'fun', emoji: '😆', label: '신나요' },
  { id: 'calm', emoji: '😌', label: '편안해요' },
  { id: 'proud', emoji: '🥰', label: '소중해요' },
  { id: 'scared', emoji: '😨', label: '무서워요' },
  { id: 'annoyed', emoji: '😣', label: '불편해요' },
  { id: 'sad', emoji: '😢', label: '슬퍼요' },
  { id: 'curious', emoji: '🤔', label: '궁금해요' },
];

/** 문제 종류 (활동 2) */
export const PROBLEMS: Choice[] = [
  { id: 'danger', emoji: '⚠️', label: '위험해요' },
  { id: 'dirty', emoji: '🗑️', label: '더러워요' },
  { id: 'noisy', emoji: '🔊', label: '시끄러워요' },
  { id: 'dark', emoji: '🌑', label: '어두워요' },
  { id: 'hard', emoji: '♿', label: '다니기 힘들어요' },
  { id: 'lack', emoji: '❓', label: '필요한 것이 없어요' },
];

/** 개선 방법 (활동 2) */
export const FIXES: Choice[] = [
  { id: 'signal', emoji: '🚦', label: '신호등' },
  { id: 'crosswalk', emoji: '🚸', label: '횡단보도' },
  { id: 'light', emoji: '💡', label: '가로등' },
  { id: 'cctv', emoji: '📹', label: 'CCTV' },
  { id: 'bin', emoji: '♻️', label: '분리수거함' },
  { id: 'bench', emoji: '🪑', label: '쉼터·벤치' },
  { id: 'tree', emoji: '🌳', label: '나무·공원' },
  { id: 'playground', emoji: '🛝', label: '놀이터' },
  { id: 'ramp', emoji: '🛗', label: '경사로·엘리베이터' },
  { id: 'sidewalk', emoji: '🚶', label: '인도' },
  { id: 'library', emoji: '📚', label: '도서관' },
  { id: 'other', emoji: '✨', label: '기타' },
];

export function findChoice(list: Choice[], id?: string): Choice | undefined {
  return list.find((c) => c.id === id);
}
