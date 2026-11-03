/**
 * 학급 모드 저장소: Firebase Firestore를 사용합니다.
 * 학생·교사 모두 익명 로그인을 하며, 이름·이메일 같은 개인정보는 받지 않습니다.
 *
 * 데이터 구조
 *   classes/{학급코드}              학급 정보
 *   classes/{학급코드}/pins/{핀ID}  학생이 남긴 핀
 */
import { initializeApp, type FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  linkWithCredential,
  linkWithPopup,
  signInAnonymously,
  signInWithCredential,
  signOut,
  type User,
} from 'firebase/auth';
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
import { SHARED_ACTIVITIES, makeClassCode } from './common';
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

/**
 * 로그인된 사용자를 돌려줍니다. 이전에 로그인한 적이 있으면(익명이든 Google이든) 그 사용자를 그대로 쓰고,
 * 처음이면 익명으로 로그인합니다.
 */
function ensureUser(): Promise<User> {
  if (!userPromise) {
    userPromise = (async () => {
      await auth.authStateReady();
      if (auth.currentUser) return auth.currentUser;
      return (await signInAnonymously(auth)).user;
    })().catch((err) => {
      userPromise = null;
      throw err;
    });
  }
  return userPromise;
}

function googleEmail(user: User): string | null {
  return user.providerData.find((p) => p.providerId === 'google.com')?.email ?? null;
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
        listen('others', [
          where('approved', '==', true),
          where('hidden', '==', false),
          where('activity', 'in', SHARED_ACTIVITIES),
        ]);
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
    return ref.id;
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

  async listMyClasses() {
    const user = await ensureUser();
    const snap = await getDocs(query(collection(db, 'classes'), where('teacherUid', '==', user.uid)));
    return snap.docs
      .map((d) => d.data() as ClassRoom)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((c) => ({ code: c.code, name: c.name }));
  },

  async getAccount() {
    const user = await ensureUser();
    return { uid: user.uid, email: googleEmail(user) };
  },

  async connectGoogle() {
    const user = await ensureUser();
    if (googleEmail(user)) return { uid: user.uid, email: googleEmail(user), switched: false };
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // 개발용(에뮬레이터 자동 테스트): 팝업 대신 가짜 Google 토큰으로 연결합니다.
    const testToken = useEmulator ? (window as { __scmTestGoogleToken?: string }).__scmTestGoogleToken : undefined;
    try {
      // 지금 기기의 ID를 그대로 둔 채 Google 계정을 연결합니다 → 이 기기에서 만든 학급이 그대로 유지됩니다.
      const res = testToken
        ? await linkWithCredential(user, GoogleAuthProvider.credential(testToken))
        : await linkWithPopup(user, provider);
      return { uid: res.user.uid, email: googleEmail(res.user), switched: false };
    } catch (err) {
      const e = err as FirebaseError;
      if (e.code !== 'auth/credential-already-in-use') throw err;
      // 이미 다른 기기에서 연결한 Google 계정 → 그 계정으로 로그인합니다.
      const cred =
        GoogleAuthProvider.credentialFromError(e) ?? (testToken ? GoogleAuthProvider.credential(testToken) : null);
      if (!cred) throw err;
      const res = await signInWithCredential(auth, cred);
      userPromise = Promise.resolve(res.user);
      return { uid: res.user.uid, email: googleEmail(res.user), switched: true };
    }
  },

  async signOut() {
    await signOut(auth);
    userPromise = null;
  },
};
