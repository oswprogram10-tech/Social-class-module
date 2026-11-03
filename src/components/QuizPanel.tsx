import { useEffect, useRef, useState } from 'react';
import type { ActivityId } from '../activities';
import { isCorrect, parseAnswers, type QuizSet } from '../content/quizzes';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  activity: ActivityId;
  set: QuizSet;
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  record?: Pin;
  /** 지도·지구본에서 고른 것 */
  selection: string | null;
  /** ID → 이름 */
  nameOf: (id: string) => string;
  /** 무엇을 눌러 고르는지 (예: “도시”, “나라”) */
  targetWord: string;
  questions: string[];
  onToast: (msg: string) => void;
}

/** 지도에서 골라 답하는 탐구 질문 패널: 자동 확인, 틀리면 답 대신 힌트 */
export default function QuizPanel({
  activity,
  set,
  cls,
  store,
  uid,
  student,
  record,
  selection,
  nameOf,
  targetWord,
  questions,
  onToast,
}: Props) {
  const n = set.questions.length;
  const [answers, setAnswers] = useState<string[]>(() => Array(n).fill(''));
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [openText, setOpenText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // 이어 하기: 화면을 처음 열었을 때 저장된 답을 한 번만 불러옵니다.
  // (이번에 처음 답해서 기록이 새로 생긴 경우에는 지금 보고 있는 질문을 그대로 둡니다.)
  const answeredHere = useRef(false);
  useEffect(() => {
    if (!record || answeredHere.current) return;
    const a = parseAnswers(record.picks);
    setAnswers(Array.from({ length: n }, (_, i) => a[i] ?? ''));
    setOpenText(record.text ?? '');
    const firstOpen = set.questions.findIndex((q, i) => !isCorrect(q, a[i]));
    setIdx(firstOpen === -1 ? n - 1 : firstOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const q = set.questions[idx];
  const solved = set.questions.map((qq, i) => isCorrect(qq, answers[i]));
  const score = solved.filter(Boolean).length;
  const pick = q.choices ? choice : selection;

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity,
        lat: cls.lat,
        lng: cls.lng,
        placeName: '탐구 질문',
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
  }

  async function check() {
    if (!pick) {
      setMsg(q.choices ? '보기에서 하나를 골라 주세요.' : `지도에서 ${targetWord}을(를) 눌러 골라 주세요.`);
      return;
    }
    setMsg('');
    answeredHere.current = true;
    const next = [...answers];
    next[idx] = pick;
    setAnswers(next);
    const ok = isCorrect(q, pick);
    setFeedback(ok ? { ok, text: `정답! ${q.explain ?? ''}`.trim() } : { ok, text: q.hint });
    try {
      await save({ picks: next.join(','), attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    }
  }

  function go(i: number) {
    setIdx(i);
    setFeedback(null);
    setChoice(null);
    setMsg('');
  }

  async function saveOpen() {
    if (!openText.trim()) return setMsg('생각을 적어 주세요.');
    setSaving(true);
    try {
      await save({ text: openText.trim() });
      onToast('저장했어요!');
      setMsg('');
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="panel" aria-live="polite">
      <div className="progress" aria-label={`질문 ${n}개 중 ${score}개 해결`}>
        <span className="progress__bar" style={{ width: `${(score / n) * 100}%` }} />
        <span className="progress__text">
          {score} / {n} 해결
        </span>
      </div>
      <ol className="scenario-dots" aria-label="질문 목록">
        {set.questions.map((qq, i) => (
          <li key={qq.id}>
            <button
              type="button"
              className={`dot ${i === idx ? 'dot--on' : ''} ${solved[i] ? 'dot--ok' : ''}`}
              onClick={() => go(i)}
              aria-label={`질문 ${i + 1}${solved[i] ? ' 해결' : ''}`}
            >
              {solved[i] ? '✅' : i + 1}
            </button>
          </li>
        ))}
      </ol>

      <section className="quiz-q">
        <p className="guide__text">
          {q.text} <Speak text={q.text} />
        </p>
        {q.choices ? (
          <div className="choice-cards">
            {q.choices.map((c) => (
              <label key={c.id} className={`choice-card ${choice === c.id ? 'choice-card--on' : ''}`}>
                <input type="radio" name="quiz-choice" className="sr-only" checked={choice === c.id} onChange={() => setChoice(c.id)} />
                <strong>{c.label}</strong>
              </label>
            ))}
          </div>
        ) : (
          <p className={`hint ${selection ? 'hint--ok' : ''}`}>
            {selection ? `고른 ${targetWord}: ${nameOf(selection)}` : `지도에서 ${targetWord}을(를) 눌러 골라요.`}
          </p>
        )}
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
            ←
          </button>
          {feedback?.ok && idx < n - 1 ? (
            <button type="button" className="btn btn--primary" onClick={() => go(idx + 1)}>
              다음 질문 →
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={check}>
              확인하기
            </button>
          )}
          <button type="button" className="btn" onClick={() => go(idx + 1)} disabled={idx === n - 1}>
            →
          </button>
        </div>
      </section>

      {score === n && (
        <section className="quiz-open">
          <p className="guide__text">
            🎉 모두 해결했어요! {set.open} <Speak text={set.open} />
          </p>
          <textarea
            rows={3}
            value={openText}
            onChange={(e) => setOpenText(e.target.value)}
            maxLength={LIMITS.text}
            aria-label="나의 생각"
          />
          <button type="button" className="btn btn--primary btn--block" onClick={saveOpen} disabled={saving}>
            {saving ? '저장 중…' : '생각 저장하기'}
          </button>
        </section>
      )}
      {msg && (
        <p className="error" role="alert">
          {msg}
        </p>
      )}
      <details className="helper">
        <summary>💭 생각 도우미</summary>
        <ul className="questions">
          {questions.map((qq) => (
            <li key={qq}>
              {qq} <Speak text={qq} />
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
