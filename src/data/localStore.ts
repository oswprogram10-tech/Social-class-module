/**
 * 체험 모드 저장소: 브라우저(localStorage)에 저장합니다.
 * 같은 브라우저의 다른 탭과는 BroadcastChannel로 실시간 동기화됩니다.
 */
import { makeClassCode, makeId } from './common';
import type { ClassRoom, Pin, Store } from './types';

const PREFIX = 'scm:';
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('scm-sync') : null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
  channel?.postMessage('changed');
}

channel?.addEventListener('message', () => listeners.forEach((fn) => fn()));
window.addEventListener('storage', (e) => {
  if (e.key?.startsWith(PREFIX)) listeners.forEach((fn) => fn());
});

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function getPins(code: string): Pin[] {
  return read<Pin[]>(`pins:${code}`) ?? [];
}

function setPins(code: string, pins: Pin[]) {
  write(`pins:${code}`, pins);
  notify();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  fn();
  return () => {
    listeners.delete(fn);
  };
}

export const localStore: Store = {
  mode: 'local',

  async getUid() {
    let uid = read<string>('uid');
    if (!uid) {
      uid = makeId();
      write('uid', uid);
    }
    return uid;
  },

  async createClass(data) {
    let code = makeClassCode();
    while (read(`class:${code}`)) code = makeClassCode();
    const cls: ClassRoom = { ...data, code, createdAt: Date.now(), teacherUid: await this.getUid() };
    write(`class:${code}`, cls);
    notify();
    return cls;
  },

  async getClass(code) {
    return read<ClassRoom>(`class:${code}`);
  },

  watchClass(code, cb) {
    return subscribe(() => cb(read<ClassRoom>(`class:${code}`)));
  },

  async updateClass(code, patch) {
    const cls = read<ClassRoom>(`class:${code}`);
    if (!cls) return;
    write(`class:${code}`, { ...cls, ...patch });
    notify();
  },

  // 체험 모드는 한 브라우저 안에서만 쓰므로 모든 핀을 넘기고, 화면에서 걸러 보여 줍니다.
  watchPins(code, _opts, cb) {
    return subscribe(() => cb(getPins(code)));
  },

  async addPin(code, pin) {
    const cls = read<ClassRoom>(`class:${code}`);
    const full: Pin = {
      ...pin,
      id: makeId(),
      approved: !cls?.requireApproval,
      hidden: false,
      likes: 0,
      createdAt: Date.now(),
    };
    setPins(code, [...getPins(code), full]);
  },

  async updatePin(code, id, patch) {
    setPins(
      code,
      getPins(code).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  },

  async likePin(code, id) {
    setPins(
      code,
      getPins(code).map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
  },

  async deletePin(code, id) {
    setPins(
      code,
      getPins(code).filter((p) => p.id !== id),
    );
  },

  async clearPins(code) {
    setPins(code, []);
  },
};
