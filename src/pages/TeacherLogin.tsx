import { useEffect, useState } from 'react';
import type { Account } from '../data/types';
import { useStore } from '../hooks';

/** 다른 기기에서 Google 계정으로 로그인해 내 학급을 관리합니다 (학급 모드에서만). */
export default function TeacherLogin() {
  const { store, error } = useStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [classes, setClasses] = useState<{ code: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!store?.getAccount) return;
    store.getAccount().then(setAccount).catch(console.error);
  }, [store]);

  useEffect(() => {
    if (!store || !account?.email) return;
    store.listMyClasses().then(setClasses).catch((e) => {
      console.error(e);
      setMsg('학급 목록을 불러오지 못했어요.');
    });
  }, [store, account?.email]);

  async function login() {
    if (!store?.connectGoogle) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await store.connectGoogle();
      if (res.switched) {
        // 다른 사용자로 바뀌었으므로 저장소 상태를 새로 읽습니다.
        window.location.reload();
        return;
      }
      setAccount(res);
    } catch (e) {
      console.error(e);
      setMsg('로그인하지 못했어요. 팝업 차단을 풀고 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!store?.signOut || !confirm('이 기기에서 로그아웃할까요?')) return;
    await store.signOut();
    window.location.hash = '/';
    window.location.reload();
  }

  return (
    <div className="page page--center">
      <main className="card join">
        <h1>🔑 다른 기기에서 내 학급 관리하기</h1>
        {error && <p className="error">{error}</p>}
        {store && !store.connectGoogle && (
          <p className="hint">체험 모드에서는 쓸 수 없어요. README의 “학급 모드 켜기”를 먼저 해 주세요.</p>
        )}
        {store?.connectGoogle && !account?.email && (
          <>
            <p>
              학급을 만든 크롬북의 교사 화면에서 먼저 <strong>“Google 계정 연결”</strong>을 해 주세요. 그다음 이 기기에서 같은
              Google 계정으로 로그인하면 학급을 관리할 수 있어요.
            </p>
            <button type="button" className="btn btn--primary btn--block" onClick={login} disabled={busy}>
              {busy ? '로그인 중…' : 'Google 계정으로 로그인'}
            </button>
          </>
        )}
        {account?.email && (
          <>
            <p>
              ✅ <strong>{account.email}</strong> 계정으로 로그인했어요.
            </p>
            <h2>내 학급</h2>
            {classes === null ? (
              <p className="hint">불러오는 중…</p>
            ) : classes.length === 0 ? (
              <p className="hint">이 계정에 연결된 학급이 없어요.</p>
            ) : (
              <ul className="class-links">
                {classes.map((c) => (
                  <li key={c.code}>
                    <a className="btn btn--block" href={`#/teacher/${c.code}`}>
                      {c.name} <span className="code-chip">{c.code}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn btn--small" onClick={logout}>
              이 기기에서 로그아웃
            </button>
          </>
        )}
        {msg && <p className="error">{msg}</p>}
        <a href="#/" className="link-back">
          처음으로
        </a>
      </main>
    </div>
  );
}
