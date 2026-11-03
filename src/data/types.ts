import type { ActivityId } from '../activities';

export interface ClassRoom {
  code: string;
  name: string;
  schoolName: string;
  lat: number;
  lng: number;
  /** 탐색 범위 반경 (미터) */
  radius: number;
  activeActivity: ActivityId;
  /** true면 교사가 승인한 핀만 친구들에게 보입니다 */
  requireApproval: boolean;
  /** true면 학생들이 친구들의 핀을 볼 수 있습니다 */
  showOthers: boolean;
  teacherUid: string;
  createdAt: number;
}

export interface Pin {
  id: string;
  activity: ActivityId;
  lat: number;
  lng: number;
  placeName: string;
  text: string;
  /** 활동 1: 장소감 */
  feeling?: string;
  /** 활동 2: 문제 종류와 개선 방법 */
  problem?: string;
  fix?: string;
  studentNo: number;
  nickname: string;
  authorUid: string;
  approved: boolean;
  hidden: boolean;
  likes: number;
  createdAt: number;
}

export type NewPin = Omit<Pin, 'id' | 'approved' | 'hidden' | 'likes' | 'createdAt'>;

export type ClassPatch = Partial<
  Pick<ClassRoom, 'activeActivity' | 'requireApproval' | 'showOthers' | 'name' | 'radius'>
>;

export type PinPatch = Partial<Pick<Pin, 'placeName' | 'text' | 'feeling' | 'problem' | 'fix' | 'approved' | 'hidden'>>;

export type Unsubscribe = () => void;

export type WatchPinsOptions =
  | { role: 'teacher' }
  | { role: 'student'; uid: string; showOthers: boolean };

/** 체험 모드(브라우저 저장)와 학급 모드(Firebase)가 같은 방식으로 동작하도록 하는 저장소 */
export interface Store {
  mode: 'local' | 'firebase';
  /** 이 기기(브라우저)를 구분하는 익명 ID */
  getUid(): Promise<string>;
  createClass(data: Omit<ClassRoom, 'code' | 'createdAt' | 'teacherUid'>): Promise<ClassRoom>;
  getClass(code: string): Promise<ClassRoom | null>;
  watchClass(code: string, cb: (c: ClassRoom | null) => void): Unsubscribe;
  updateClass(code: string, patch: ClassPatch): Promise<void>;
  /**
   * 핀 목록을 실시간으로 받습니다.
   * 학생은 자기 핀 + (친구 보기가 켜져 있으면) 승인된 핀만 받습니다.
   */
  watchPins(code: string, opts: WatchPinsOptions, cb: (pins: Pin[]) => void): Unsubscribe;
  addPin(code: string, pin: NewPin): Promise<void>;
  updatePin(code: string, id: string, patch: PinPatch): Promise<void>;
  likePin(code: string, id: string): Promise<void>;
  deletePin(code: string, id: string): Promise<void>;
  /** 학급의 모든 핀 삭제 (학기 말 정리용) */
  clearPins(code: string): Promise<void>;
}
