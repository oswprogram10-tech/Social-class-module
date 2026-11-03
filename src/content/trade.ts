/**
 * [6사11-03] 무역 시뮬레이션: 나라마다 자연환경·자원·기술이 달라서 서로 사고판다는 것을 체험합니다.
 *
 * 나라와 숫자는 모두 이해를 돕기 위한 **가상**입니다(실제 통계가 아님).
 * 학생은 “기술나라”가 되어 12시간 동안 일하고, 무역하기 전과 후를 비교합니다.
 */

export const HOURS = 12;

export type GoodId = 'wheat' | 'fruit' | 'phone';

export const GOODS: Record<GoodId, { emoji: string; label: string; unit: string }> = {
  wheat: { emoji: '🌾', label: '밀', unit: '자루' },
  fruit: { emoji: '🍌', label: '과일', unit: '송이' },
  phone: { emoji: '📱', label: '휴대폰', unit: '대' },
};

/** 기술나라가 1시간에 만들 수 있는 양 (과일은 기후가 맞지 않아 기를 수 없음) */
export const RATE = { phone: 3, wheat: 1, fruit: 0 };

/** 한 달 동안 살아가는 데 필요한 양 */
export const NEED = { wheat: 6, fruit: 4 };

export interface Partner {
  id: 'sun' | 'wind';
  name: string;
  emoji: string;
  good: Exclude<GoodId, 'phone'>;
  /** 휴대폰 1대를 주면 받는 양 */
  per: number;
  about: string;
}

export const PARTNERS: Partner[] = [
  {
    id: 'sun',
    name: '햇살나라',
    emoji: '🌴',
    good: 'fruit',
    per: 2,
    about: '1년 내내 덥고 비가 많이 와서 과일이 잘 자라요. 휴대폰을 만드는 기술은 아직 부족해요.',
  },
  {
    id: 'wind',
    name: '바람나라',
    emoji: '🌾',
    good: 'wheat',
    per: 3,
    about: '넓고 평평한 들판이 있어 밀을 많이 길러요. 휴대폰은 다른 나라에서 사 와요.',
  },
];

export const HOME = {
  name: '기술나라',
  emoji: '🏭',
  about: '땅이 좁고 겨울이 추워 과일을 기를 수 없어요. 대신 휴대폰을 잘 만드는 기술이 있어요.',
};

export interface Outcome {
  wheat: number;
  fruit: number;
  phone: number;
}

/** 무역 없이: 밀에 쓴 시간(나머지는 휴대폰) */
export function alone(wheatHours: number): Outcome {
  return { wheat: wheatHours * RATE.wheat, fruit: 0, phone: (HOURS - wheatHours) * RATE.phone };
}

/** 무역하면: 밀에 쓴 시간, 바람나라·햇살나라와 바꾼 휴대폰 수 */
export function withTrade(wheatHours: number, toWind: number, toSun: number): Outcome {
  const base = alone(wheatHours);
  return {
    wheat: base.wheat + toWind * PARTNERS[1].per,
    fruit: toSun * PARTNERS[0].per,
    phone: base.phone - toWind - toSun,
  };
}

export function needsMet(o: Outcome): boolean {
  return o.wheat >= NEED.wheat && o.fruit >= NEED.fruit;
}

/** 무역 없이 필요한 밀을 채우면서 휴대폰을 가장 많이 남기는 경우 */
export const BEST_ALONE = alone(Math.ceil(NEED.wheat / RATE.wheat));
/** 무역해서 필요한 것을 채우면서 휴대폰을 가장 많이 남기는 경우 */
export const BEST_TRADE = withTrade(0, Math.ceil(NEED.wheat / PARTNERS[1].per), Math.ceil(NEED.fruit / PARTNERS[0].per));

/** 사건: 바람나라에 가뭄 → 밀을 팔 수 없음. 정답 없이 생각을 묻습니다. */
export const EVENT = {
  text: '큰일이에요! 바람나라에 큰 가뭄이 들어 올해는 밀을 팔 수 없대요. 기술나라는 어떻게 하면 좋을까요?',
  choices: [
    { id: 'other', emoji: '🌍', label: '밀을 파는 다른 나라를 찾아 거래해요' },
    { id: 'grow', emoji: '🚜', label: '휴대폰 만드는 시간을 줄여 밀을 직접 길러요' },
    { id: 'store', emoji: '🏚️', label: '앞으로는 밀을 미리 사서 넉넉히 저장해 둬요' },
    { id: 'help', emoji: '🤝', label: '바람나라를 도와 함께 가뭄을 이겨 내요' },
  ],
};

export function findEventChoice(id?: string) {
  return EVENT.choices.find((c) => c.id === id);
}

export interface TradeCheck {
  id: string;
  text: string;
  choices: { id: string; label: string }[];
  answer: string;
  hint: string;
  explain: string;
}

/** 확인 문제 (자동 확인, 틀리면 힌트) */
export const TRADE_CHECKS: TradeCheck[] = [
  {
    id: 't1',
    text: '기술나라가 과일을 다른 나라에서 사 와야 했던 까닭은 무엇일까요?',
    choices: [
      { id: 'a', label: '기후가 맞지 않아 과일을 기를 수 없어서' },
      { id: 'b', label: '과일보다 휴대폰을 더 좋아해서' },
      { id: 'c', label: '과일 값이 휴대폰보다 비싸서' },
    ],
    answer: 'a',
    hint: '기술나라 소개를 다시 읽어 보세요. 겨울이 어떤가요?',
    explain: '나라마다 자연환경(기후, 땅)이 달라서 만들 수 있는 것이 달라요.',
  },
  {
    id: 't2',
    text: '기술나라가 휴대폰을 만들어 파는 것이 좋은 까닭은 무엇일까요?',
    choices: [
      { id: 'a', label: '휴대폰은 아무 나라나 만들 수 있어서' },
      { id: 'b', label: '같은 시간에 밀보다 휴대폰을 더 많이, 잘 만들 수 있어서' },
      { id: 'c', label: '휴대폰은 팔지 않고 모아 두어야 해서' },
    ],
    answer: 'b',
    hint: '1시간에 밀은 1자루, 휴대폰은 몇 대를 만들 수 있었나요?',
    explain: '잘 만드는 것(기술)에 시간을 쓰고 바꾸면, 직접 다 만들 때보다 더 많이 가질 수 있어요.',
  },
  {
    id: 't3',
    text: '바람나라에 가뭄이 든 사건에서 알 수 있는 것은 무엇일까요?',
    choices: [
      { id: 'a', label: '무역을 하면 다른 나라 일과 상관없이 살 수 있다' },
      { id: 'b', label: '무역을 하는 나라들은 서로 영향을 주고받는다' },
      { id: 'c', label: '무역은 한 나라에만 이익이 된다' },
    ],
    answer: 'b',
    hint: '바람나라의 가뭄 때문에 기술나라에는 어떤 일이 생겼나요?',
    explain: '무역으로 나라들은 서로 기대어 살아요(상호 의존). 한 나라의 어려움이 다른 나라에도 영향을 줘요.',
  },
  {
    id: 't4',
    text: '실제 우리나라가 원유(석유)를 대부분 다른 나라에서 사 오는 까닭은 무엇일까요?',
    choices: [
      { id: 'a', label: '석유를 쓰지 않아서' },
      { id: 'b', label: '우리나라 땅에서 원유가 거의 나지 않아서' },
      { id: 'c', label: '우리나라 원유를 모두 다른 나라에 팔아서' },
    ],
    answer: 'b',
    hint: '기술나라가 과일을 사 온 까닭과 비슷해요. 나라마다 무엇이 다를까요?',
    explain: '우리나라는 원유 같은 자원이 거의 나지 않아 수입하고, 반도체·자동차처럼 기술로 만든 물건을 수출해요.',
  },
];

export function tradeScore(labels?: string): number {
  return TRADE_CHECKS.filter((q, i) => labels?.[i] === q.answer).length;
}

/** 기록 형식(picks): “무역 전 밀 시간,무역 후 밀 시간,바람나라에 준 휴대폰,햇살나라에 준 휴대폰” */
export function parseTradePicks(picks?: string): { aloneH: number; tradeH: number; toWind: number; toSun: number } | null {
  const n = (picks ?? '').split(',').map((x) => Number(x));
  if (n.length < 1 || !(picks ?? '').trim() || n.some((x) => !Number.isFinite(x))) return null;
  return { aloneH: n[0] ?? 0, tradeH: n[1] ?? 0, toWind: n[2] ?? 0, toSun: n[3] ?? 0 };
}

export function outcomeText(o: Outcome): string {
  return `🌾${o.wheat} 🍌${o.fruit} 📱${o.phone}`;
}
