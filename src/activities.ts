/**
 * 활동 정의
 * 2022 개정 사회과 3~4학년군
 * 성취기준 문구는 교육부 고시 원문과 대조해 확인하세요.
 */

export type ActivityId = 'feel' | 'better' | 'mission' | 'solve';

/** 활동 종류: 핀 남기기 / 미션(자동 확인) / 단계별 문제 해결 */
export type ActivityKind = 'pin' | 'mission' | 'solve';

export interface Choice {
  id: string;
  emoji: string;
  label: string;
}

export interface ActivityDef {
  id: ActivityId;
  kind: ActivityKind;
  title: string;
  standard: string;
  standardText: string;
  /** 학생에게 보여 줄 안내 (읽어주기 대상) */
  guide: string;
  /** 생각을 돕는 질문 카드 (정답 대신 질문으로 생각을 이끌어 줍니다). 교사가 학급별로 고칠 수 있습니다. */
  questions: string[];
}

export interface UnitDef {
  grade: string;
  title: string;
  activities: ActivityId[];
}

export const UNITS: UnitDef[] = [
  { grade: '3-1', title: '(1) 우리가 사는 곳', activities: ['feel', 'better'] },
  { grade: '4-1', title: '(5) 지도로 만나는 우리 지역', activities: ['mission'] },
  { grade: '4-2', title: '(9) 지역문제를 해결하고 지역을 알리는 노력', activities: ['solve'] },
];

export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  feel: {
    id: 'feel',
    kind: 'pin',
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
    kind: 'pin',
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
  mission: {
    id: 'mission',
    kind: 'mission',
    title: '방위와 거리 미션',
    standard: '[4사05-01·02]',
    standardText:
      '우리 지역을 표현한 다양한 종류의 지도를 찾아보고, 지도의 요소를 이해한다. / 지도에서 우리 지역의 위치를 파악하고, 우리 지역의 지리 정보를 탐색한다.',
    guide: '방위표와 축척 막대를 이용해 미션에 맞는 장소를 지도에서 찾아 표시해요.',
    questions: [
      '방위표에서 북쪽은 지도의 어느 쪽인가요?',
      '축척 막대 한 칸은 실제로 몇 m일까요? 손가락으로 재어 볼까요?',
      '내가 찾은 장소를 친구에게 “학교에서 ○쪽으로 약 ○m”라고 설명해 볼까요?',
    ],
  },
  solve: {
    id: 'solve',
    kind: 'solve',
    title: '우리 동네 문제 해결하기',
    standard: '[4사09-01]',
    standardText:
      '생활 주변에서 찾을 수 있는 여러 가지 문제를 파악하고, 그 문제를 합리적으로 해결하는 능력을 기른다.',
    guide: '우리 동네의 문제를 하나 찾아, 원인을 생각하고 두 가지 해결 방법을 비교한 뒤 더 좋은 방법을 골라요.',
    questions: [
      '이 문제 때문에 누가 불편을 겪나요?',
      '문제가 생긴 까닭은 무엇일까요? 한 가지만 있을까요?',
      '두 방법 중 더 많은 사람에게 도움이 되고, 실천하기 쉬운 것은 무엇일까요?',
    ],
  },
};

export const ACTIVITY_ORDER: ActivityId[] = ['feel', 'better', 'mission', 'solve'];

export function isActivityId(v: unknown): v is ActivityId {
  return typeof v === 'string' && (ACTIVITY_ORDER as string[]).includes(v);
}

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

/** 문제 해결 방법 (활동 4) */
export const SOLUTIONS: Choice[] = [
  { id: 'facility', emoji: '🏗️', label: '시설 만들기·고치기' },
  { id: 'campaign', emoji: '📢', label: '캠페인·알리기' },
  { id: 'rule', emoji: '📜', label: '규칙·약속 만들기' },
  { id: 'petition', emoji: '🗳️', label: '의견 모아 건의하기' },
  { id: 'volunteer', emoji: '🧹', label: '봉사·함께 실천' },
  { id: 'patrol', emoji: '👮', label: '살피기·순찰' },
];

/** 문제 해결 4단계 */
export const SOLVE_STEPS = ['문제 찾기', '원인 생각하기', '방법 비교하기', '결론 내리기'] as const;

export type Direction = 'N' | 'E' | 'S' | 'W';

export interface MissionDef {
  id: string;
  emoji: string;
  title: string;
  guide: string;
  check: { type: 'dir'; dir: Direction } | { type: 'dist'; target: number; min: number; max: number };
}

/** 방위와 거리 미션 (활동 3). 학교 위치를 기준으로 자동으로 확인합니다. */
export const MISSIONS: MissionDef[] = [
  { id: 'dir-n', emoji: '⬆️', title: '북쪽 탐험', guide: '학교의 북쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'N' } },
  { id: 'dir-e', emoji: '➡️', title: '동쪽 탐험', guide: '학교의 동쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'E' } },
  { id: 'dir-s', emoji: '⬇️', title: '남쪽 탐험', guide: '학교의 남쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'S' } },
  { id: 'dir-w', emoji: '⬅️', title: '서쪽 탐험', guide: '학교의 서쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'W' } },
  {
    id: 'dist-300',
    emoji: '📏',
    title: '300m 찾기',
    guide: '축척 막대를 이용해 학교에서 약 300m 떨어진 장소를 찾아 표시하세요.',
    check: { type: 'dist', target: 300, min: 200, max: 400 },
  },
  {
    id: 'dist-600',
    emoji: '📐',
    title: '600m 찾기',
    guide: '축척 막대를 이용해 학교에서 약 600m 떨어진 장소를 찾아 표시하세요.',
    check: { type: 'dist', target: 600, min: 450, max: 750 },
  },
];

export function findMission(id?: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function findChoice(list: Choice[], id?: string): Choice | undefined {
  return list.find((c) => c.id === id);
}
