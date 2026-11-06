/**
 * 개발과 보전 배분 시뮬레이션: 땅을 여러 쓰임에 나누고, 사람마다 반응이 어떻게 달라지는지 보며 타협안을 찾습니다.
 * 계산 방식은 이해를 돕기 위한 가상 모델이에요(실제 지역 자료가 아닙니다).
 *
 * 설계 근거: 김현주·이관용(2025) 개발과 보전 주제의 비판적 검토(이해관계자, 사회·생태적 정의),
 * 박새롬(2023) 합의 도출형 의사결정 학습, Geographical Association 탐구 틀(가치가 서로 다름을 인정하고 타협 생각하기).
 *
 * 저장 형식
 *  - giveUp: 처음 계획 (쓰임 순서대로 칸 수, 예: '6,1,3')
 *  - picks: 다시 고친 최종 계획
 *  - step: 1 처음 계획, 2 최종 계획, 3 생각 쓰기까지 끝
 */
import type { ActivityId } from '../activities';

export interface BalanceUse {
  id: string;
  emoji: string;
  label: string;
}

export type Mood = 'happy' | 'ok' | 'sad';

export interface BalancePerson {
  id: string;
  emoji: string;
  label: string;
  /** 계획(쓰임별 칸 수)에 대한 반응과 그 까닭 */
  react: (plan: number[]) => { mood: Mood; say: string };
}

export interface BalanceMeter {
  label: string;
  emoji: string;
  value: (plan: number[]) => number;
  max: number;
}

export interface BalanceSet {
  title: string;
  total: number;
  intro: string[];
  uses: BalanceUse[];
  people: BalancePerson[];
  meters: BalanceMeter[];
  open: string;
}

const T = 0; // 관광 단지
const F = 1; // 갯벌 보전
const A = 2; // 양식장·어업

export const BALANCE_SETS: Partial<Record<ActivityId, BalanceSet>> = {
  devbalance: {
    title: '푸른갯마을 땅 나누기',
    total: 10,
    intro: [
      '푸른갯마을(가상) 바닷가에 땅과 갯벌 10칸이 있어요. 관광 단지, 갯벌 보전, 양식장·어업에 몇 칸씩 쓸지 정해요.',
      '마을 사람마다 바라는 것이 달라요. 모두가 받아들일 수 있는 계획을 찾아보세요.',
    ],
    uses: [
      { id: 'tour', emoji: '🏨', label: '관광 단지' },
      { id: 'flat', emoji: '🦢', label: '갯벌 보전' },
      { id: 'farm', emoji: '🦪', label: '양식장·어업' },
    ],
    people: [
      {
        id: 'fisher',
        emoji: '🧑‍🌾',
        label: '갯벌에서 조개를 캐는 어민',
        react: (p) =>
          p[A] >= 4 && p[F] >= 3
            ? { mood: 'happy', say: '조개 캘 갯벌과 양식장이 넉넉해요.' }
            : p[A] >= 2 && p[F] >= 2
              ? { mood: 'ok', say: '조금 줄었지만 일은 계속할 수 있어요.' }
              : { mood: 'sad', say: '갯벌이나 양식장이 너무 적어 일할 곳이 없어요.' },
      },
      {
        id: 'inn',
        emoji: '🏡',
        label: '민박을 하는 주인',
        react: (p) =>
          p[T] >= 5
            ? { mood: 'happy', say: '관광객이 많이 와서 좋아요.' }
            : p[T] >= 3
              ? { mood: 'ok', say: '손님이 조금은 늘겠네요.' }
              : { mood: 'sad', say: '관광객이 거의 오지 않을 것 같아요.' },
      },
      {
        id: 'bird',
        emoji: '🔭',
        label: '철새를 연구하는 사람',
        react: (p) =>
          p[F] >= 6
            ? { mood: 'happy', say: '철새가 쉬어 갈 갯벌이 넉넉해요.' }
            : p[F] >= 4
              ? { mood: 'ok', say: '철새가 쉴 곳이 조금 남았어요.' }
              : { mood: 'sad', say: '갯벌이 너무 줄어 철새가 쉴 곳이 없어요.' },
      },
      {
        id: 'youth',
        emoji: '🧑‍💼',
        label: '일자리를 찾는 청년',
        react: (p) =>
          p[T] + p[A] >= 7
            ? { mood: 'happy', say: '일할 곳이 많아졌어요.' }
            : p[T] + p[A] >= 5
              ? { mood: 'ok', say: '일자리가 조금 생겼어요.' }
              : { mood: 'sad', say: '마을에 일자리가 없어서 떠나야 할 것 같아요.' },
      },
      {
        id: 'elder',
        emoji: '👵',
        label: '오래 살아온 어르신',
        react: (p) =>
          p[T] <= 3
            ? { mood: 'happy', say: '마을이 조용하고 바다도 깨끗해요.' }
            : p[T] <= 5
              ? { mood: 'ok', say: '조금 붐비지만 견딜 만해요.' }
              : { mood: 'sad', say: '차와 사람이 너무 많아 시끄럽고 바다가 더러워질까 걱정이에요.' },
      },
    ],
    meters: [
      { label: '일자리', emoji: '💼', value: (p) => p[T] * 1.5 + p[A], max: 15 },
      { label: '철새 쉼터', emoji: '🦢', value: (p) => p[F], max: 10 },
      { label: '조용하고 깨끗한 바다', emoji: '🌊', value: (p) => Math.max(0, 10 - p[T] * 1.2 - p[A] * 0.3), max: 10 },
    ],
    open: '처음 계획과 고친 계획을 비교해 보세요. 누구를 위해 무엇을 양보했나요? 모두가 만족하는 계획이 어려운 까닭은 무엇일까요?',
  },
};

export const MOOD_FACE: Record<Mood, string> = { happy: '😀', ok: '🙂', sad: '😟' };
export const MOOD_TEXT: Record<Mood, string> = { happy: '만족해요', ok: '받아들일 만해요', sad: '걱정해요' };

export function parsePlan(set: BalanceSet, s?: string): number[] | null {
  const v = (s ?? '').split(',').map(Number);
  if (v.length !== set.uses.length || v.some((n) => !Number.isInteger(n) || n < 0)) return null;
  return v.reduce((a, b) => a + b, 0) === set.total ? v : null;
}

export function sadCount(set: BalanceSet, plan: number[]): number {
  return set.people.filter((p) => p.react(plan).mood === 'sad').length;
}

export function planText(set: BalanceSet, plan: number[] | null): string {
  if (!plan) return '';
  return set.uses.map((u, i) => `${u.emoji}${u.label} ${plan[i]}`).join(' · ');
}
