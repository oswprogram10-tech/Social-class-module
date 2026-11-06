/**
 * 참여 예산 시뮬레이션: 한정된 예산으로 제안을 고르고(기회비용), 소수 의견을 들은 뒤 다시 결정합니다.
 * 정답이 없는 결정 활동입니다. 금액과 이야기는 모두 가상입니다.
 *
 * 설계 근거: 조의호, 「초등사회과에서 공론화를 활용한 민주시민교육 사례 연구: 학생참여예산 제안 프로젝트」(KCI),
 * 이수룡(2021) 학교 의사결정과 소수 공감, 성경희 외(2024) 숙의 토론 수업(입장 바꾸기 → 합의 → 의견 변화 성찰).
 *
 * 저장 형식
 *  - checks: 처음 고른 제안을 제안 순서대로 Y/N (예: 'YNNYNN')
 *  - giveUp: 가장 아쉬운 제안 ID
 *  - picks: 최종으로 고른 제안 ID (쉼표로 구분)
 *  - step: 1 처음 고르기, 2 기회비용, 3 다시 결정, 4 생각 쓰기까지 끝
 */
import type { ActivityId } from '../activities';

export interface BudgetOption {
  id: string;
  emoji: string;
  label: string;
  /** 비용 (단위는 BudgetSet.unit) */
  cost: number;
  /** 누구에게 도움이 되나요 */
  who: string;
}

export interface BudgetSet {
  title: string;
  budget: number;
  unit: string;
  intro: string[];
  options: BudgetOption[];
  /** 다시 생각해 볼 소수 의견 이야기 */
  minority: { label: string; emoji: string; paragraphs: string[] };
  open: string;
}

export const BUDGET_SETS: Partial<Record<ActivityId, BudgetSet>> = {
  schoolbudget: {
    title: '우리 학교 학생 참여 예산',
    budget: 100,
    unit: '만 원',
    intro: [
      '우리 학교가 학생들의 의견으로 쓸 수 있는 예산 100만 원을 마련했어요(가상).',
      '여섯 가지 제안 가운데 예산 안에서 무엇을 할지 정해 보세요. 모두 할 수는 없어요.',
    ],
    options: [
      { id: 'play', emoji: '🛝', label: '새 놀이기구', cost: 50, who: '운동장에서 노는 많은 학생' },
      { id: 'shade', emoji: '⛱️', label: '운동장 그늘막', cost: 40, who: '여름에 운동장에 나가는 모든 학생' },
      { id: 'fan', emoji: '🌀', label: '급식실 선풍기', cost: 40, who: '더운 날 급식실을 쓰는 모든 학생' },
      { id: 'books', emoji: '📚', label: '학급 문고 새 책', cost: 30, who: '책을 좋아하는 학생' },
      { id: 'ramp', emoji: '♿', label: '부서진 경사로 고치기', cost: 30, who: '휠체어나 목발을 쓰는 학생, 무거운 짐을 나르는 사람' },
      { id: 'games', emoji: '🎲', label: '보드게임', cost: 10, who: '비 오는 날 쉬는 시간의 학생' },
    ],
    minority: {
      label: '가상 이야기 · 소수 의견',
      emoji: '♿',
      paragraphs: [
        '4학년 민서는 휠체어를 타요. 운동장으로 내려가는 경사로가 부서져서 체육 시간마다 교실에 혼자 남아 있어요.',
        '학급 투표에서 경사로를 고르자는 친구는 많지 않았어요. 민서처럼 경사로가 꼭 필요한 친구는 학교에 몇 명뿐이기 때문이에요.',
      ],
    },
    open: '처음 결정과 최종 결정을 비교해 보세요. 바꾸었다면(또는 바꾸지 않았다면) 그 까닭은 무엇인가요? 우리 동네의 주민 참여 예산에는 어떤 제안을 내고 싶나요?',
  },
};

export function budgetSetFor(activity: ActivityId): BudgetSet | undefined {
  return BUDGET_SETS[activity];
}

export function parsePicks(picks?: string): string[] {
  return (picks ?? '').split(',').filter(Boolean);
}

export function firstPicks(set: BudgetSet, checks?: string): string[] {
  return set.options.filter((_, i) => checks?.[i] === 'Y').map((o) => o.id);
}

export function totalCost(set: BudgetSet, ids: string[]): number {
  return set.options.filter((o) => ids.includes(o.id)).reduce((s, o) => s + o.cost, 0);
}

export function optionLabel(set: BudgetSet, id?: string): string {
  const o = set.options.find((x) => x.id === id);
  return o ? `${o.emoji} ${o.label}` : '';
}

export function labelsOf(set: BudgetSet, ids: string[]): string {
  return ids.map((id) => optionLabel(set, id)).filter(Boolean).join(', ');
}

/** 처음과 최종이 다른지 */
export function changedMind(set: BudgetSet, checks?: string, picks?: string): boolean {
  const a = firstPicks(set, checks).sort().join(',');
  const b = parsePicks(picks).sort().join(',');
  return !!checks && !!picks && a !== b;
}
