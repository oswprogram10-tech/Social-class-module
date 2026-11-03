/** 기회비용 장터 [4사07-01] */

export const MARKET_BUDGET = 5000;

export interface MarketItem {
  id: string;
  emoji: string;
  label: string;
  price: number;
}

export const MARKET_ITEMS: MarketItem[] = [
  { id: 'snack', emoji: '🍪', label: '과자', price: 1500 },
  { id: 'icecream', emoji: '🍦', label: '아이스크림', price: 1000 },
  { id: 'pen', emoji: '🖊️', label: '예쁜 볼펜', price: 2000 },
  { id: 'sticker', emoji: '🌟', label: '스티커', price: 1000 },
  { id: 'book', emoji: '📘', label: '만화책', price: 4000 },
  { id: 'toy', emoji: '🧸', label: '작은 인형', price: 3000 },
  { id: 'ball', emoji: '⚽', label: '탱탱볼', price: 2500 },
  { id: 'save', emoji: '🐷', label: '저금하기', price: 2000 },
];

export function findMarketItem(id?: string): MarketItem | undefined {
  return MARKET_ITEMS.find((m) => m.id === id);
}

export function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}
