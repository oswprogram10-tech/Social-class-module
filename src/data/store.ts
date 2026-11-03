import { isClassMode } from '../config';
import { localStore } from './localStore';
import type { Store } from './types';

let storePromise: Promise<Store> | null = null;

/**
 * 설정에 따라 저장소를 고릅니다.
 * Firebase 코드는 학급 모드일 때만 내려받아 체험 모드를 가볍게 유지합니다.
 */
export function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = isClassMode
      ? import('./firebaseStore').then((m) => m.firebaseStore)
      : Promise.resolve(localStore);
  }
  return storePromise;
}
