import type { ClassRoom, Pin } from './types';

/** 헷갈리는 글자(0, O, 1, I, L)를 뺀 학급 코드용 문자 */
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeClassCode(length = 6): string {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => CODE_CHARS[n % CODE_CHARS.length]).join('');
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function makeId(): string {
  return crypto.randomUUID();
}

/** 학생 화면에 보여 줄 핀인지 판단 */
export function visibleToStudent(pin: Pin, cls: ClassRoom, uid: string): boolean {
  if (pin.authorUid === uid) return true;
  if (!cls.showOthers) return false;
  return pin.approved && !pin.hidden;
}

export const LIMITS = {
  placeName: 30,
  text: 150,
  nickname: 10,
  className: 30,
};
