import { useEffect, useState } from 'react';
import { getStore } from './data/store';
import type { ClassRoom, Pin, Store, WatchPinsOptions } from './data/types';

export function useStore(): { store: Store | null; uid: string | null; error: string | null } {
  const [store, setStore] = useState<Store | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getStore()
      .then(async (s) => {
        const id = await s.getUid();
        if (!alive) return;
        setStore(s);
        setUid(id);
      })
      .catch((e: unknown) => {
        console.error(e);
        if (alive) setError('서버에 연결하지 못했어요. 인터넷 연결과 Firebase 설정을 확인해 주세요.');
      });
    return () => {
      alive = false;
    };
  }, []);
  return { store, uid, error };
}

/** undefined = 불러오는 중, null = 없음 */
export function useClassRoom(store: Store | null, code: string): ClassRoom | null | undefined {
  const [cls, setCls] = useState<ClassRoom | null | undefined>(undefined);
  useEffect(() => {
    if (!store) return;
    return store.watchClass(code, setCls);
  }, [store, code]);
  return cls;
}

export function usePins(store: Store | null, code: string, opts: WatchPinsOptions | null): Pin[] {
  const [pins, setPins] = useState<Pin[]>([]);
  const key = JSON.stringify(opts);
  useEffect(() => {
    if (!store || !opts) return;
    return store.watchPins(code, opts, (list) =>
      setPins([...list].sort((a, b) => a.createdAt - b.createdAt)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, code, key]);
  return pins;
}

/** 주소창의 # 뒤 경로를 읽습니다. 예) #/teacher/ABC123 → ['teacher', 'ABC123'] */
export function useHashRoute(): string[] {
  const parse = () =>
    window.location.hash
      .replace(/^#\/?/, '')
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent);
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path: string) {
  window.location.hash = path.startsWith('/') ? path : `/${path}`;
}

/** 이 브라우저에서 만든 학급 목록 (교사가 다시 찾아갈 수 있도록) */
const MY_CLASSES = 'scm:myClasses';

export function rememberClass(code: string, name: string) {
  const list = myClasses().filter((c) => c.code !== code);
  list.unshift({ code, name });
  localStorage.setItem(MY_CLASSES, JSON.stringify(list.slice(0, 20)));
}

export function myClasses(): { code: string; name: string }[] {
  try {
    return JSON.parse(localStorage.getItem(MY_CLASSES) ?? '[]');
  } catch {
    return [];
  }
}

export function joinUrl(code: string): string {
  const base = window.location.href.split('#')[0];
  return `${base}#/join/${code}`;
}
