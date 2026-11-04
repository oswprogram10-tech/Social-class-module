import { ACTIVITIES, type ActivityId } from '../activities';
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

/** 친구끼리 볼 수 있는 활동. firestore.rules 의 sharedActivities()와 같아야 합니다. */
export const SHARED_ACTIVITIES: ActivityId[] = ['feel', 'better', 'legend', 'solve', 'promote', 'heritage'];

/** 학생 화면에 보여 줄 핀인지 판단 */
export function visibleToStudent(pin: Pin, cls: ClassRoom, uid: string): boolean {
  if (pin.authorUid === uid) return true;
  if (!cls.showOthers) return false;
  // 미션 답과 개인 연표는 친구에게 보이지 않게, 문제 해결은 완성한 것만 보이게 합니다.
  // 답을 맞히는 활동과 개인 연표는 친구에게 보이지 않게 합니다(보안 규칙도 같은 기준).
  if (!SHARED_ACTIVITIES.includes(pin.activity)) return false;
  if (pin.activity === 'solve' && (pin.step ?? 0) < 4) return false;
  return pin.approved && !pin.hidden;
}

/** 학급에서 쓰는 생각 도우미 질문 (교사가 고친 것이 있으면 그것을 씁니다) */
export function questionsFor(cls: ClassRoom, activity: ActivityId): string[] {
  const custom = cls.questions?.[activity];
  return custom && custom.length > 0 ? custom : ACTIVITIES[activity].questions;
}

export const LIMITS = {
  placeName: 30,
  text: 150,
  nickname: 10,
  className: 30,
  /** 문제 해결: 해결 방법 설명 */
  detail: 60,
  /** 문제 해결: 좋은 점·아쉬운 점 */
  proCon: 80,
  question: 80,
  slogan: 40,
  questionCount: 5,
};
