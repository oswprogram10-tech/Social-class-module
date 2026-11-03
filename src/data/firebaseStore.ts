/**
 * 학급 모드 저장소: Firebase Firestore를 사용합니다.
 * 학생·교사 모두 익명 로그인을 하며, 이름·이메일 같은 개인정보는 받지 않습니다.
 *
 * 데이터 구조
 *   classes/{학급코드}              학급 정보
 *   classes/{학급코드}/pins/{핀ID}  학생이 남긴 핀
 */
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { firebaseConfig, useEmulator } from '../config';
import { makeClassCode } from './common';
import type { ClassRoom, Pin, Store } from './types';

const app = initializeApp(useEmulator ? { apiKey: 'demo-key', projectId: 'demo-scm' } : firebaseConfig);
const auth = getAuth(app);
// 값이 없는 칸(undefined)은 저장하지 않고 건너뜁니다.
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
}

let userPromise: Promise<User> | null = null;

function ensureUser(): Promise<User> {
  if (!userPromise) {
    userPromise = new Promise<User>((resolve, reject) => {
      const off = onAuthStateChanged(auth, (user) => {
        if (user) {
          off();
          resolve(user);
        }
      });
      signInAnonymously(auth).catch((err) => {
        off();
        userPromise = null;
        reject(err);
      });
    });
  }
  return userPromise;
}

const classRef = (code: string) => doc(db, 'classes', code);
const pinsRef = (code: string) => collection(db, 'classes', code, 'pins');

function toPin(id: string, data: Record<string, unknown>): Pin {
  return { ...(data as Omit<Pin, 'id'>), id };
}

export const firebaseStore: Store = {
  mode: 'firebase',

  async getUid() {
    return (await ensureUser()).uid;
  },

  async createClass(data) {
    const user = await ensureUser();
    for (let i = 0; i < 5; i++) {
      const code = makeClassCode();
      const existing = await getDoc(classRef(code));
      if (existing.exists()) continue;
      const cls: ClassRoom = { ...data, code, createdAt: Date.now(), teacherUid: user.uid };
      await setDoc(classRef(code), cls);
      return cls;
    }
    throw new Error('학급 코드를 만들지 못했어요. 다시 시도해 주세요.');
  },

  async getClass(code) {
    await ensureUser();
    const snap = await getDoc(classRef(code));
    return snap.exists() ? (snap.data() as ClassRoom) : null;
  },

  watchClass(code, cb) {
    let off: (() => void) | null = null;
    let cancelled = false;
    ensureUser().then(() => {
      if (cancelled) return;
      off = onSnapshot(
        classRef(code),
        (snap) => cb(snap.exists() ? (snap.data() as ClassRoom) : null),
        () => cb(null),
      );
    });
    return () => {
      cancelled = true;
      off?.();
    };
  },

  async updateClass(code, patch) {
    await ensureUser();
    await updateDoc(classRef(code), patch);
  },

  watchPins(code, opts, cb) {
    const offs: (() => void)[] = [];
    let cancelled = false;

    ensureUser().then((user) => {
      if (cancelled) return;
      if (opts.role === 'teacher') {
        offs.push(
          onSnapshot(
            pinsRef(code),
            (snap) => cb(snap.docs.map((d) => toPin(d.id, d.data()))),
            (err) => console.warn('핀을 불러오지 못했어요', err),
          ),
        );
        return;
      }
      // 학생: 보안 규칙에 맞춰 "내 핀"과 "공개된 친구 핀"을 따로 구독해서 합칩니다.
      const groups: Record<string, Pin[]> = { mine: [], others: [] };
      const emit = () => {
        const map = new Map<string, Pin>();
        [...groups.others, ...groups.mine].forEach((p) => map.set(p.id, p));
        cb([...map.values()]);
      };
      const listen = (key: string, constraints: QueryConstraint[]) =>
        offs.push(
          onSnapshot(
            query(pinsRef(code), ...constraints),
            (snap) => {
              groups[key] = snap.docs.map((d) => toPin(d.id, d.data()));
              emit();
            },
            (err) => console.warn('핀을 불러오지 못했어요', err),
          ),
        );
      listen('mine', [where('authorUid', '==', user.uid)]);
      if (opts.showOthers) {
        listen('others', [where('approved', '==', true), where('hidden', '==', false)]);
      }
    });

    return () => {
      cancelled = true;
      offs.forEach((off) => off());
    };
  },

  async addPin(code, pin) {
    await ensureUser();
    const cls = await this.getClass(code);
    const ref = doc(pinsRef(code));
    const full: Omit<Pin, 'id'> = {
      ...pin,
      approved: !cls?.requireApproval,
      hidden: false,
      likes: 0,
      createdAt: Date.now(),
    };
    await setDoc(ref, full);
  },

  async updatePin(code, id, patch) {
    await ensureUser();
    await updateDoc(doc(pinsRef(code), id), patch);
  },

  async likePin(code, id) {
    await ensureUser();
    await updateDoc(doc(pinsRef(code), id), { likes: increment(1) });
  },

  async deletePin(code, id) {
    await ensureUser();
    await deleteDoc(doc(pinsRef(code), id));
  },

  async clearPins(code) {
    await ensureUser();
    const snap = await getDocs(pinsRef(code));
    // 한 번에 최대 500개까지 지울 수 있어 나눠서 지웁니다.
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  },
};
