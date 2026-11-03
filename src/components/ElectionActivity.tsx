import { useEffect, useState } from 'react';
import { PRINCIPLES, SCENARIOS, findPrinciple, type PrincipleId } from '../content/election';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

/** 저장된 답에서 맞힌 이야기 수 */
export function electionScore(labels?: string): number {
  return SCENARIOS.filter((s, i) => labels?.[i] === s.answer).length;
}

/** [6사08-01] 선거 4원칙 지키기: 원칙이 깨진 이야기를 읽고 어떤 원칙인지 찾습니다. */
export default function ElectionActivity({ cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const [answers, setAnswers] = useState('-'.repeat(SCENARIOS.length));
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [important, setImportant] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    setAnswers(record.labels ?? '-'.repeat(SCENARIOS.length));
    setImportant(record.picks);
    setReason(record.text ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const scenario = SCENARIOS[idx];
  const solved = (i: number) => answers[i] === SCENARIOS[i].answer;
  const score = SCENARIOS.filter((_, i) => solved(i)).length;
  const allDone = score === SCENARIOS.length;

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity: 'election',
        lat: cls.lat,
        lng: cls.lng,
        placeName: '선거 4원칙',
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
  }

  async function answer(p: PrincipleId) {
    const next = answers.slice(0, idx) + p + answers.slice(idx + 1);
    setAnswers(next);
    const ok = p === scenario.answer;
    const principle = findPrinciple(p)!;
    setFeedback(
      ok
        ? { ok, text: `정답! ${principle.label}: ${principle.meaning}` }
        : { ok, text: `다시 생각해 볼까요? ${scenario.hint}` },
    );
    try {
      await save({ labels: next, attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    }
  }

  function go(i: number) {
    setIdx(i);
    setFeedback(null);
  }

  async function finish() {
    if (!important) return setMsg('가장 중요하다고 생각하는 원칙을 골라 주세요.');
    if (!reason.trim()) return setMsg('그렇게 생각한 까닭을 적어 주세요.');
    setMsg('');
    setSaving(true);
    try {
      await save({ picks: important, text: reason.trim() });
      onToast('저장했어요!');
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="work-area">
        <ol className="scenario-dots" aria-label="이야기 목록">
          {SCENARIOS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`dot ${i === idx ? 'dot--on' : ''} ${solved(i) ? 'dot--ok' : ''}`}
                onClick={() => go(i)}
                aria-label={`이야기 ${i + 1}${solved(i) ? ' 해결' : ''}`}
              >
                {solved(i) ? '✅' : i + 1}
              </button>
            </li>
          ))}
        </ol>
        <article className="scenario">
          <p className="scenario__label">🏝️ 행복섬 선거 이야기 {idx + 1}</p>
          <p className="scenario__story">
            {scenario.story} <Speak text={`${scenario.story} ${scenario.result}`} />
          </p>
          <p className="scenario__result">😟 {scenario.result}</p>
          <h3>어떤 원칙이 지켜지지 않았을까요?</h3>
          <div className="principles">
            {PRINCIPLES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`principle ${answers[idx] === p.id ? (p.id === scenario.answer ? 'principle--ok' : 'principle--no') : ''}`}
                onClick={() => answer(p.id)}
              >
                <span className="principle__emoji" aria-hidden>
                  {p.emoji}
                </span>
                <strong>{p.label}</strong>
                <span className="principle__meaning">{p.meaning}</span>
              </button>
            ))}
          </div>
          {feedback && (
            <div className={`feedback ${feedback.ok ? 'feedback--ok' : 'feedback--hint'}`} role="status">
              <span>{feedback.ok ? '🎉' : '💡'}</span>
              <p>
                {feedback.text} <Speak text={feedback.text} />
              </p>
            </div>
          )}
          <div className="row">
            <button type="button" className="btn" onClick={() => go(idx - 1)} disabled={idx === 0}>
              ← 이전 이야기
            </button>
            <button type="button" className="btn btn--primary" onClick={() => go(idx + 1)} disabled={idx === SCENARIOS.length - 1}>
              다음 이야기 →
            </button>
          </div>
        </article>
      </div>

      <aside className="panel" aria-live="polite">
        <div className="progress" aria-label={`이야기 ${SCENARIOS.length}개 중 ${score}개 해결`}>
          <span className="progress__bar" style={{ width: `${(score / SCENARIOS.length) * 100}%` }} />
          <span className="progress__text">
            {score} / {SCENARIOS.length} 해결
          </span>
        </div>
        {allDone ? (
          <>
            <p className="guide__text">
              🎉 모든 이야기를 해결했어요! 네 원칙 중 가장 중요하다고 생각하는 것은 무엇인가요?{' '}
              <Speak text="모든 이야기를 해결했어요! 네 원칙 중 가장 중요하다고 생각하는 것은 무엇인가요?" />
            </p>
            <div className="choices__grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} role="radiogroup">
              {PRINCIPLES.map((p) => (
                <label key={p.id} className={`choice ${important === p.id ? 'choice--on' : ''}`}>
                  <input type="radio" name="important" className="sr-only" checked={important === p.id} onChange={() => setImportant(p.id)} />
                  <span className="choice__emoji" aria-hidden>
                    {p.emoji}
                  </span>
                  <span className="choice__label">{p.label}</span>
                </label>
              ))}
            </div>
            <label className="field">
              <span>왜 그렇게 생각했나요?</span>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
            </label>
            <button type="button" className="btn btn--primary btn--block" onClick={finish} disabled={saving}>
              {saving ? '저장 중…' : '저장하기'}
            </button>
          </>
        ) : (
          <p className="guide__text">
            이야기를 읽고 지켜지지 않은 원칙을 골라요. 모두 해결하면 마지막 질문이 나와요.{' '}
            <Speak text="이야기를 읽고 지켜지지 않은 원칙을 골라요. 모두 해결하면 마지막 질문이 나와요." />
          </p>
        )}
        {msg && (
          <p className="error" role="alert">
            {msg}
          </p>
        )}
        <details className="helper">
          <summary>💭 생각 도우미</summary>
          <ul className="questions">
            {questions.map((q) => (
              <li key={q}>
                {q} <Speak text={q} />
              </li>
            ))}
          </ul>
        </details>
      </aside>
    </>
  );
}
