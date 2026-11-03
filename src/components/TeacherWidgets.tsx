import { useEffect, useState } from 'react';
import {
  ACTIVITIES,
  FEELINGS,
  FIXES,
  MISSIONS,
  PLACE_TYPES,
  PROMO_CATS,
  SOLUTIONS,
  SOLVE_STEPS,
  type ActivityId,
  type Choice,
} from '../activities';
import { LIMITS, questionsFor } from '../data/common';
import type { Account, ClassRoom, Pin, Store } from '../data/types';
import { isMissionCorrect } from '../geo';

function Bars({ items }: { items: { c: Choice; n: number }[] }) {
  const shown = items.filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  if (shown.length === 0) return null;
  const max = Math.max(1, ...shown.map((x) => x.n));
  return (
    <ul className="bars">
      {shown.map(({ c, n }) => (
        <li key={c.id}>
          <span className="bars__label">
            {c.emoji} {c.label}
          </span>
          <span className="bars__track">
            <span className="bars__fill" style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="bars__n">{n}</span>
        </li>
      ))}
    </ul>
  );
}

/** 활동별 한눈에 보기 */
export function Summary({ pins, activity, cls }: { pins: Pin[]; activity: ActivityId; cls: ClassRoom }) {
  const students = new Set(pins.map((p) => p.authorUid)).size;
  const kind = ACTIVITIES[activity].kind;

  if (kind === 'mission') {
    const school = { lat: cls.lat, lng: cls.lng };
    const items = MISSIONS.map((m) => ({
      c: { id: m.id, emoji: m.emoji, label: m.title },
      n: pins.filter((p) => p.missionId === m.id && isMissionCorrect(m.id, school, p)).length,
    }));
    return (
      <section className="summary" aria-label="한눈에 보기">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명 · 미션별 성공 학생 수
        </p>
        <Bars items={items} />
      </section>
    );
  }

  if (kind === 'solve') {
    const done = pins.filter((p) => (p.step ?? 1) >= 4);
    const byStep = [1, 2, 3].map((s) => pins.filter((p) => (p.step ?? 1) === s).length);
    const chosen = SOLUTIONS.map((c) => ({
      c,
      n: done.filter((p) => (p.chosen === 'A' ? p.optAType : p.optBType) === c.id).length,
    }));
    return (
      <section className="summary" aria-label="한눈에 보기">
        <p className="summary__total">
          완성 <strong>{done.length}</strong>개 · 참여 학생 <strong>{students}</strong>명
        </p>
        <p className="hint">
          진행 중: {SOLVE_STEPS.slice(0, 3)
            .map((s, i) => `${s} ${byStep[i]}`)
            .join(' · ')}
        </p>
        {done.length > 0 && <p className="hint">학생들이 고른 해결 방법</p>}
        <Bars items={chosen} />
      </section>
    );
  }

  if (kind === 'timeline') {
    return (
      <section className="summary" aria-label="한눈에 보기">
        <p className="summary__total">
          연표를 만든 학생 <strong>{students}</strong>명 · 적은 일 <strong>{pins.length}</strong>개
        </p>
        <p className="hint">연표는 학생 본인과 선생님만 볼 수 있어요.</p>
      </section>
    );
  }

  const groupBy: Partial<Record<ActivityId, { list: Choice[]; key: keyof Pin }>> = {
    feel: { list: FEELINGS, key: 'feeling' },
    better: { list: FIXES, key: 'fix' },
    legend: { list: PLACE_TYPES, key: 'placeType' },
    promote: { list: PROMO_CATS, key: 'category' },
  };
  const g = groupBy[activity];
  const items = g ? g.list.map((c) => ({ c, n: pins.filter((p) => p[g.key] === c.id).length })) : [];
  return (
    <section className="summary" aria-label="한눈에 보기">
      <p className="summary__total">
        장소 <strong>{pins.length}</strong>개 · 참여 학생 <strong>{students}</strong>명
      </p>
      <Bars items={items} />
    </section>
  );
}

/** [4사05] 학생 × 미션 진행표 */
export function MissionProgress({ pins, cls, onSelect }: { pins: Pin[]; cls: ClassRoom; onSelect: (pin: Pin) => void }) {
  const school = { lat: cls.lat, lng: cls.lng };
  const students = new Map<string, { label: string; no: number; pins: Map<string, Pin> }>();
  for (const p of pins) {
    const key = `${p.authorUid}:${p.studentNo}`;
    const s = students.get(key) ?? {
      label: `${p.studentNo}${p.nickname ? ` ${p.nickname}` : ''}`,
      no: p.studentNo,
      pins: new Map<string, Pin>(),
    };
    if (p.missionId) s.pins.set(p.missionId, p);
    students.set(key, s);
  }
  const rows = [...students.values()].sort((a, b) => a.no - b.no);
  if (rows.length === 0) return <p className="hint">아직 미션에 도전한 학생이 없어요.</p>;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 미션 진행표</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            {MISSIONS.map((m) => (
              <th key={m.id} scope="col" title={m.title}>
                {m.emoji}
              </th>
            ))}
            <th scope="col">성공</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            let ok = 0;
            return (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {MISSIONS.map((m) => {
                  const p = r.pins.get(m.id);
                  if (!p) return <td key={m.id} aria-label="도전 안 함">·</td>;
                  const good = isMissionCorrect(m.id, school, p);
                  if (good) ok++;
                  return (
                    <td key={m.id}>
                      <button
                        type="button"
                        className={`cell ${good ? 'cell--ok' : 'cell--retry'}`}
                        onClick={() => onSelect(p)}
                        aria-label={`${m.title} ${good ? '성공' : '다시 도전'} ${p.attempts ?? 1}번 시도`}
                        title={`${p.placeName} · ${p.attempts ?? 1}번 시도`}
                      >
                        {good ? '✅' : '🔁'}
                        {(p.attempts ?? 1) > 1 && <small>{p.attempts}</small>}
                      </button>
                    </td>
                  );
                })}
                <td className="progress-table__sum">{ok}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 생각 도우미 질문 고치기 */
export function QuestionEditor({
  cls,
  activity,
  onSave,
}: {
  cls: ClassRoom;
  activity: ActivityId;
  onSave: (questions: string[] | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const custom = !!cls.questions?.[activity]?.length;

  function start() {
    setText(questionsFor(cls, activity).join('\n'));
    setOpen(true);
  }

  function save() {
    const lines = text
      .split('\n')
      .map((l) => l.trim().slice(0, LIMITS.question))
      .filter(Boolean)
      .slice(0, LIMITS.questionCount);
    onSave(lines.length ? lines : null);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--small" onClick={start}>
        ✏️ 생각 도우미 질문 고치기{custom ? ' (고친 질문 사용 중)' : ''}
      </button>
    );
  }
  return (
    <div className="question-editor">
      <label className="field">
        <span>질문 (한 줄에 하나, 최대 {LIMITS.questionCount}개)</span>
        <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="row">
        <button
          type="button"
          className="btn btn--small"
          onClick={() => {
            onSave(null);
            setOpen(false);
          }}
        >
          기본 질문으로
        </button>
        <button type="button" className="btn btn--small" onClick={() => setOpen(false)}>
          취소
        </button>
        <button type="button" className="btn btn--small btn--primary" onClick={save}>
          저장
        </button>
      </div>
    </div>
  );
}

/** 교사 Google 계정 연결 (학급 모드에서만) */
export function TeacherAccount({ store }: { store: Store }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    store.getAccount?.().then(setAccount).catch(console.error);
  }, [store]);

  if (!store.connectGoogle || !account) return null;

  async function connect() {
    setBusy(true);
    setMsg('');
    try {
      const res = await store.connectGoogle!();
      if (res.switched) {
        alert(`${res.email} 계정으로 로그인했어요. 화면을 새로 고칩니다.`);
        window.location.reload();
        return;
      }
      setAccount(res);
    } catch (e) {
      console.error(e);
      setMsg('연결하지 못했어요. 팝업 차단을 풀고 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card account">
      <h2>🔑 다른 기기에서도 관리하기</h2>
      {account.email ? (
        <p className="hint">
          ✅ <strong>{account.email}</strong> 계정에 연결되어 있어요. 다른 크롬북에서는 첫 화면의 “다른 기기에서 내 학급
          관리하기”로 들어오세요.
        </p>
      ) : (
        <>
          <p className="hint">
            지금은 이 브라우저에서만 학급을 관리할 수 있어요. Google 계정을 연결하면 다른 기기에서도 같은 계정으로 로그인해
            관리할 수 있어요. 학생 정보는 Google에 연결되지 않아요.
          </p>
          <button type="button" className="btn btn--small" onClick={connect} disabled={busy}>
            {busy ? '연결 중…' : 'Google 계정 연결'}
          </button>
        </>
      )}
      {msg && <p className="error">{msg}</p>}
    </section>
  );
}
