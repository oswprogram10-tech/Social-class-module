/**
 * 지도에서 골라 답하는 탐구 질문 (자동 확인, 틀리면 답 대신 힌트)
 * 정답은 korea-data.ts 의 공식 통계와 맞춰 두었습니다.
 */
import type { ActivityId } from '../activities';
import { WORLDPOP_ANSWERS } from './world-pop';

export interface QuizQuestion {
  id: string;
  text: string;
  /** 정답 ID들 (도시·시도·나라 ID). 'choice' 문제는 보기 ID */
  answers: string[];
  hint: string;
  /** 보기에서 고르는 문제 */
  choices?: { id: string; label: string }[];
  /** 맞힌 뒤 보여 줄 설명 */
  explain?: string;
}

export interface QuizSet {
  questions: QuizQuestion[];
  /** 마지막 생각 쓰기 질문 */
  open: string;
}

export const QUIZZES: Partial<Record<ActivityId, QuizSet>> = {
  climate: {
    questions: [
      {
        id: 'c1',
        text: '1월 평균기온이 가장 높은 도시는 어디인가요?',
        answers: ['jeju'],
        hint: '달을 1월로 두고 기온을 비교해 보세요. 남쪽과 북쪽 중 어디가 더 따뜻할까요?',
        explain: '제주는 1월에도 평균 6.1℃예요. 남쪽 바다에 둘러싸여 겨울이 따뜻해요.',
      },
      {
        id: 'c2',
        text: '1월 평균기온이 가장 낮은 도시는 어디인가요?',
        answers: ['seoul'],
        hint: '1월 기온이 0℃보다 낮은 도시들을 먼저 찾아보세요. 그중 가장 낮은 곳은?',
        explain: '서울의 1월 평균기온은 -1.9℃로, 9개 도시 중 가장 추워요.',
      },
      {
        id: 'c3',
        text: '7월 강수량이 가장 많은 도시는 어디인가요?',
        answers: ['seoul'],
        hint: '달을 7월로 두고 “강수량”으로 바꿔 보세요. 원이 가장 큰 도시는?',
        explain: '서울의 7월 강수량은 414.4㎜예요. 장마와 집중호우가 여름에 몰려요.',
      },
      {
        id: 'c4',
        text: '1년 동안 내린 비(연 강수량)가 가장 적은 도시는 어디인가요?',
        answers: ['daegu'],
        hint: '도시를 눌러 기후 그래프의 “1년 강수량”을 비교해 보세요.',
        explain: '대구의 연 강수량은 1,080.8㎜로 가장 적어요. 산으로 둘러싸인 분지예요.',
      },
      {
        id: 'c5',
        text: '서울과 강릉은 위도가 비슷해요. 1월에 더 따뜻한 곳은 어디인가요?',
        answers: ['gangneung'],
        hint: '두 도시를 차례로 눌러 1월 기온을 비교해 보세요.',
        explain: '강릉은 1월 0.9℃, 서울은 -1.9℃예요. 태백산맥이 차가운 북서풍을 막아 주고 동해가 가까워요.',
      },
    ],
    open: '여름에 비가 많이 오는 까닭은 무엇일까요? 기후변화로 생길 수 있는 자연재해도 적어 보세요.',
  },
  population: {
    questions: [
      {
        id: 'p1',
        text: '1980년에 인구가 가장 많았던 시도는 어디인가요?',
        answers: ['seoul'],
        hint: '연도를 1980년으로 두고 가장 큰 원을 찾아보세요.',
        explain: '1980년 서울 인구는 약 836만 명으로 가장 많았어요.',
      },
      {
        id: 'p2',
        text: '2025년에 인구가 가장 많은 시도는 어디인가요?',
        answers: ['gyeonggi'],
        hint: '연도를 2025년으로 옮겨 보세요. 가장 큰 원이 바뀌었나요?',
        explain: '2025년 경기 인구는 약 1,397만 명으로, 서울보다 훨씬 많아요.',
      },
      {
        id: 'p3',
        text: '1980년부터 2025년 사이에 인구가 가장 많이 늘어난 시도는 어디인가요?',
        answers: ['gyeonggi'],
        hint: '연도를 바꾸며 어느 원이 가장 크게 자라는지 살펴보세요.',
        explain: '경기는 약 370만 명에서 약 1,397만 명으로 1,000만 명 넘게 늘었어요.',
      },
      {
        id: 'p4',
        text: '1980년보다 2025년에 인구가 줄어든 시도를 하나 찾아보세요.',
        answers: ['jeonnam', 'jeonbuk', 'gyeongbuk', 'gangwon', 'busan'],
        hint: '시도를 눌러 1980년과 2025년 인구를 비교해 보세요. 수도권에서 먼 곳을 살펴볼까요?',
        explain: '전남, 전북, 경북, 강원, 부산은 인구가 줄었어요. 일자리를 찾아 수도권과 대도시로 이동했어요.',
      },
      {
        id: 'p5',
        text: '2025년에 인구가 가장 적은 시도는 어디인가요?',
        answers: ['sejong'],
        hint: '연도를 2025년으로 두고 가장 작은 원을 찾아보세요.',
        explain: '세종은 약 39만 명이에요. 2012년에 새로 만들어진 행정 중심 도시라 인구가 빠르게 늘고 있어요.',
      },
    ],
    open: '수도권에 인구가 몰리면 어떤 문제가 생길까요? 해결 방법도 적어 보세요.',
  },
  globe: {
    questions: [
      {
        id: 'g1',
        text: '지구본이나 세계지도에서 대한민국을 찾아 누르세요.',
        answers: ['410'],
        hint: '아시아 대륙의 동쪽 끝, 북위 37° 근처를 찾아보세요.',
      },
      {
        id: 'g2',
        text: '우리나라 동쪽 바다 건너에 있는 섬나라를 찾아 누르세요.',
        answers: ['392'],
        hint: '대한민국에서 동쪽(오른쪽)으로 바다를 건너 보세요.',
      },
      {
        id: 'g3',
        text: '북위 약 40°, 서경 약 100° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['840'],
        hint: '서경은 본초 자오선(경도 0°)의 서쪽이에요. 북아메리카 대륙을 살펴보세요.',
      },
      {
        id: 'g4',
        text: '남위 약 25°, 동경 약 135° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['036'],
        hint: '남위는 적도의 남쪽이에요. 우리나라와 비슷한 경도에서 적도 아래로 내려가 보세요.',
      },
      {
        id: 'g5',
        text: '남위 약 10°, 서경 약 55° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['076'],
        hint: '적도 바로 아래, 남아메리카 대륙을 살펴보세요.',
      },
      {
        id: 'g6',
        text: '메르카토르 세계지도에서는 그린란드가 아프리카 대륙만큼 커 보여요. 실제로는 어떨까요?',
        answers: ['africa'],
        choices: [
          { id: 'green', label: '그린란드가 더 넓어요' },
          { id: 'same', label: '둘이 비슷해요' },
          { id: 'africa', label: '아프리카가 훨씬 넓어요' },
        ],
        hint: '지구본을 돌려 그린란드와 아프리카를 같은 크기로 비교해 보세요. 세계지도는 북쪽·남쪽 끝으로 갈수록 크게 그려져요.',
        explain: '실제 넓이는 아프리카 대륙 약 3,037만 ㎢, 그린란드 약 217만 ㎢로 아프리카가 약 14배 넓어요.',
      },
    ],
    open: '지구본과 세계지도는 각각 어떤 좋은 점과 불편한 점이 있을까요?',
  },
  worldpop: {
    questions: [
      {
        id: 'w1',
        text: '세계에서 인구가 가장 많은 나라를 찾아 누르세요.',
        answers: [WORLDPOP_ANSWERS.most],
        hint: '“인구” 보기에서 가장 진한 색의 나라를 찾아보세요. 아시아 대륙을 살펴볼까요?',
        explain: '2023년 국제연합 추계로 인도가 약 14억 4천만 명으로 가장 많아요. 중국도 약 14억 2천만 명이에요.',
      },
      {
        id: 'w2',
        text: '세계 인구의 절반 넘게 사는 대륙은 어디인가요?',
        answers: ['AS'],
        choices: [
          { id: 'AS', label: '아시아' },
          { id: 'AF', label: '아프리카' },
          { id: 'EU', label: '유럽' },
          { id: 'NA', label: '북아메리카' },
        ],
        hint: '오른쪽 대륙별 막대그래프를 비교해 보세요.',
        explain: '아시아에 세계 인구의 약 59%가 살아요.',
      },
      {
        id: 'w3',
        text: '아프리카에서 인구가 가장 많은 나라를 찾아 누르세요.',
        answers: [WORLDPOP_ANSWERS.africaMost],
        hint: '아프리카 대륙에서 색이 가장 진한 나라를 찾아보세요. 서쪽 해안을 살펴볼까요?',
        explain: '나이지리아는 약 2억 3천만 명으로 아프리카에서 인구가 가장 많아요.',
      },
      {
        id: 'w4',
        text: '사람이 아주 드물게 사는(인구 밀도가 낮은) 나라를 하나 찾아 누르세요.',
        answers: WORLDPOP_ANSWERS.lowDensity,
        hint: '“인구 밀도” 보기로 바꿔 가장 연한 색의 넓은 나라를 찾아보세요. 사막이나 아주 추운 곳은 어떨까요?',
        explain: '사막, 추운 지역, 높은 산이 넓은 나라는 사람이 드물게 살아요.',
      },
      {
        id: 'w5',
        text: '우리나라(약 5,175만 명)보다 인구가 많은 아프리카 나라를 하나 찾아 누르세요.',
        answers: WORLDPOP_ANSWERS.africaMoreThanKorea,
        hint: '아프리카 나라를 눌러 인구를 우리나라와 비교해 보세요.',
        explain: '아프리카에는 우리나라보다 인구가 많은 나라가 7개나 있어요. 아프리카는 인구가 빠르게 늘고 있어요.',
      },
    ],
    open: '사람이 많이 모여 사는 곳과 드물게 사는 곳은 자연환경이 어떻게 다를까요?',
  },
};

/** 문제에 대한 학생 답이 맞았는지 */
export function isCorrect(q: QuizQuestion, answer?: string): boolean {
  return !!answer && q.answers.includes(answer);
}

/** 저장 형식: 문제 순서대로 쉼표로 구분한 답 */
export function parseAnswers(picks?: string): string[] {
  return (picks ?? '').split(',');
}

export function quizScore(set: QuizSet, picks?: string): number {
  const a = parseAnswers(picks);
  return set.questions.filter((q, i) => isCorrect(q, a[i])).length;
}
