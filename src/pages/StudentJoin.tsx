import { useState, type FormEvent } from 'react';
import Speak from '../components/Speak';
import { LIMITS, normalizeCode } from '../data/common';
import { go, useStore } from '../hooks';
import { ModeBanner } from './Home';

export interface StudentSession {
  code: string;
  studentNo: number;
  nickname: string;
}

const KEY = 'scm:student';

export function loadStudent(code: string): StudentSession | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as StudentSession | null;
    return s && s.code === code ? s : null;
  } catch {
    return null;
  }
}

function saveStudent(s: StudentSession) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

const PROMISE_TEXT = '우리 집이나 친구 집 위치는 지도에 표시하지 않아요. 친구의 느낌을 존중해요.';

export default function StudentJoin({ initialCode }: { initialCode: string }) {
  const { store, error } = useStore();
  const [code, setCode] = useState(initialCode);
  const [no, setNo] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function join(e: FormEvent) {
    e.preventDefault();
    if (!store) return;
    const c = normalizeCode(code);
    const n = Number(no);
    if (c.length < 4) return setMsg('선생님이 알려 준 학급 코드를 적어 주세요.');
    if (!Number.isInteger(n) || n < 1 || n > 99) return setMsg('번호를 숫자로 적어 주세요.');
    if (!agreed) return setMsg('약속을 읽고 “약속해요”를 눌러 주세요.');
    setBusy(true);
    const cls = await store.getClass(c).catch(() => null);
    setBusy(false);
    if (!cls) return setMsg('학급을 찾을 수 없어요. 코드를 다시 확인해 주세요.');
    saveStudent({ code: c, studentNo: n, nickname: nickname.trim() });
    go(`/class/${c}`);
  }

  return (
    <div className="page page--center">
      <ModeBanner />
      <form className="card join" onSubmit={join}>
        <h1>
          <span aria-hidden>🧒</span> 학급에 들어가기
        </h1>
        {error && <p className="error">{error}</p>}
        <label className="field">
          <span>
            학급 코드 <Speak text="선생님이 알려 준 학급 코드를 적어 주세요" />
          </span>
          <input
            className="input-code"
            value={code}
            onChange={(e) => setCode(normalizeCode(e.target.value))}
            placeholder="ABC234"
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus={!initialCode}
          />
        </label>
        <div className="row">
          <label className="field">
            <span>번호</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={no}
              onChange={(e) => setNo(e.target.value)}
              placeholder="12"
              autoFocus={!!initialCode}
            />
          </label>
          <label className="field field--grow">
            <span>별명 (안 적어도 돼요)</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 별빛"
              maxLength={LIMITS.nickname}
            />
          </label>
        </div>
        <p className="hint">진짜 이름은 적지 않아요.</p>

        <div className={`promise ${agreed ? 'promise--on' : ''}`}>
          <p>
            <strong>🤝 우리의 약속</strong> <Speak text={PROMISE_TEXT} />
            <br />
            {PROMISE_TEXT}
          </p>
          <button type="button" className="btn" aria-pressed={agreed} onClick={() => {
              setAgreed((v) => !v);
              setMsg('');
            }}>
            {agreed ? '✅ 약속했어요' : '약속해요'}
          </button>
        </div>

        {msg && (
          <p className="error" role="alert">
            {msg}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={!store || busy}>
          {busy ? '확인 중…' : '들어가기'}
        </button>
        <a href="#/" className="link-back">
          처음으로
        </a>
      </form>
    </div>
  );
}
