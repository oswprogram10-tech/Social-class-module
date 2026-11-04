import { useEffect, useState } from 'react';
import {
  BUILTIN_FACT_ITEMS,
  FACT_CHECKLIST,
  FACT_ISSUE,
  TRUST_LEVELS,
  gradeLabels,
  type FactItem,
} from '../content/factcheck';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

export function factItemsFor(cls: ClassRoom): FactItem[] {
  return [...BUILTIN_FACT_ITEMS, ...(cls.factItems ?? [])];
}

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

const NEXT: Record<string, string> = { '-': 'F', F: 'O', O: '-' };

/** [6사08-03] 팩트체크 스튜디오: 문장을 눌러 사실/의견을 표시하고, 출처를 따져 봅니다. */
export default function FactcheckActivity({ cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const items = factItemsFor(cls);
  const [itemId, setItemId] = useState(items[0]?.id);
  const item = items.find((i) => i.id === itemId) ?? items[0];
  const record = myRecords.find((r) => r.itemId === item?.id);

  const [labels, setLabels] = useState('');
  const [checks, setChecks] = useState('');
  const [trust, setTrust] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<ReturnType<typeof gradeLabels> | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // 자료를 바꾸면 저장해 둔 내용을 불러옵니다.
  useEffect(() => {
    if (!item) return;
    setLabels(record?.labels ?? '-'.repeat(item.sentences.length));
    setChecks(record?.checks ?? '-'.repeat(FACT_CHECKLIST.length));
    setTrust(record?.trust);
    setReason(record?.text ?? '');
    setResult(record?.labels ? gradeLabels(item, record.labels) : null);
    setStep(1);
    setMsg('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, record?.id]);

  if (!item) return <p className="page-msg">자료가 없어요.</p>;

  const done = (id: string) => !!myRecords.find((r) => r.itemId === id)?.trust;

  async function save(patch: Partial<Pin>) {
    if (record) {
      await store.updatePin(cls.code, record.id, patch);
    } else {
      await store.addPin(cls.code, {
        activity: 'factcheck',
        itemId: item.id,
        lat: cls.lat,
        lng: cls.lng,
        placeName: item.title.slice(0, LIMITS.placeName),
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
    }
  }

  function toggle(i: number) {
    const arr = labels.split('');
    arr[i] = NEXT[arr[i] ?? '-'];
    setLabels(arr.join(''));
    setResult(null);
  }

  async function check() {
    if (labels.includes('-')) return setMsg('모든 문장에 사실이나 의견을 표시해 주세요.');
    setMsg('');
    const r = gradeLabels(item, labels);
    setResult(r);
    setSaving(true);
    try {
      await save({ labels, attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (checks.includes('-')) return setMsg('체크리스트의 모든 질문에 답해 주세요.');
    if (!trust) return setMsg('이 자료를 얼마나 믿을 수 있는지 골라 주세요.');
    if (!reason.trim()) return setMsg('그렇게 판단한 까닭을 적어 주세요.');
    setMsg('');
    setSaving(true);
    try {
      await save({ checks, trust, text: reason.trim() });
      onToast('팩트체크를 마쳤어요! 다른 자료도 살펴볼까요?');
      const next = items.find((i) => i.id !== item.id && !done(i.id));
      if (next) setItemId(next.id);
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  const wrong = new Set(result?.wrong ?? []);

  return (
    <>
      <div className="work-area">
        <p className="issue">
          🗞️ 같은 일, 다른 자료: <strong>{FACT_ISSUE}</strong>
        </p>
        <div className="item-tabs" role="group" aria-label="자료 고르기">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-pressed={it.id === item.id}
              className={`item-tab ${it.id === item.id ? 'item-tab--on' : ''}`}
              onClick={() => setItemId(it.id)}
            >
              {done(it.id) ? '✅' : `자료 ${i + 1}`} · {it.source}
            </button>
          ))}
        </div>
        <article className="media-card">
          <div className="media-card__meta">
            <span className="tag">{item.source}</span>
            <span className="media-card__author">{item.author}</span>
          </div>
          <h2 className="media-card__title">{item.title}</h2>
          <p className="hint">문장을 누를 때마다 사실 → 의견 → 지우기 순서로 바뀌어요.</p>
          <div className="sentences">
            {item.sentences.map((s, i) => {
              const l = labels[i] ?? '-';
              return (
                <button
                  key={i}
                  type="button"
                  className={`sentence sentence--${l === 'F' ? 'fact' : l === 'O' ? 'opinion' : 'none'} ${wrong.has(i) ? 'sentence--wrong' : ''}`}
                  onClick={() => toggle(i)}
                  disabled={step === 2}
                  aria-label={`${s.text} 현재 표시: ${l === 'F' ? '사실' : l === 'O' ? '의견' : '없음'}`}
                >
                  <span className="sentence__label">{l === 'F' ? '사실' : l === 'O' ? '의견' : '?'}</span>
                  {s.text}
                </button>
              );
            })}
          </div>
          <Speak text={`${item.title}. ${item.sentences.map((s) => s.text).join(' ')}`} label="자료 읽어주기" />
        </article>
      </div>

      <aside className="panel" aria-live="polite">
        <ol className="stepper stepper--two">
          <li className={`stepper__item ${step === 1 ? 'stepper__item--on' : 'stepper__item--done'}`}>
            <button type="button" onClick={() => setStep(1)}>
              <span className="stepper__n">1</span>
              <span className="stepper__label">사실과 의견</span>
            </button>
          </li>
          <li className={`stepper__item ${step === 2 ? 'stepper__item--on' : ''}`}>
            <button type="button" onClick={() => result && setStep(2)} disabled={!result}>
              <span className="stepper__n">2</span>
              <span className="stepper__label">믿을 만할까?</span>
            </button>
          </li>
        </ol>

        {step === 1 ? (
          <>
            <p className="guide__text">
              문장마다 <span className="chip chip--fact">사실</span>인지 <span className="chip chip--opinion">의견</span>인지
              표시해요. <Speak text="문장마다 사실인지 의견인지 표시해요. 사실은 확인할 수 있는 내용이고, 의견은 생각이나 느낌이에요." />
            </p>
            <ul className="questions">
              <li>사실: 숫자, 날짜처럼 확인할 수 있는 내용</li>
              <li>의견: “최고”, “슬프다”처럼 생각이나 느낌</li>
            </ul>
            {result && (
              <div className={`feedback ${result.wrong.length === 0 ? 'feedback--ok' : 'feedback--hint'}`} role="status">
                <span>{result.wrong.length === 0 ? '🎉' : '💡'}</span>
                <p>
                  {result.total}문장 중 {result.correct}문장을 맞혔어요.
                  {result.wrong.length > 0 &&
                    ' 빨간 테두리 문장을 다시 읽어 보세요. 확인할 수 있는 내용인가요, 글쓴이의 생각인가요?'}
                </p>
              </div>
            )}
            <div className="row">
              <button type="button" className="btn btn--primary" onClick={check} disabled={saving}>
                확인하기
              </button>
              {result && (
                <button type="button" className="btn" onClick={() => setStep(2)}>
                  다음 →
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="guide__text">
              이 자료를 믿을 수 있을지 따져 봐요. <Speak text="이 자료를 믿을 수 있을지 따져 봐요." />
            </p>
            <ul className="checklist">
              {FACT_CHECKLIST.map((q, i) => (
                <li key={q}>
                  <span>{q}</span>
                  <span className="yn">
                    {(['Y', 'N'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={checks[i] === v}
                        className={`yn__btn ${checks[i] === v ? 'yn__btn--on' : ''}`}
                        onClick={() => setChecks((c) => c.slice(0, i) + v + c.slice(i + 1))}
                      >
                        {v === 'Y' ? '예' : '아니요'}
                      </button>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <fieldset className="choices">
              <legend>이 자료는…</legend>
              <div className="choices__grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TRUST_LEVELS.map((t) => (
                  <label key={t.id} className={`choice ${trust === t.id ? 'choice--on' : ''}`}>
                    <input type="radio" name="trust" className="sr-only" checked={trust === t.id} onChange={() => setTrust(t.id)} />
                    <span className="choice__emoji" aria-hidden>
                      {t.emoji}
                    </span>
                    <span className="choice__label">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field">
              <span>왜 그렇게 생각했나요?</span>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
            </label>
            <div className="row">
              <button type="button" className="btn" onClick={() => setStep(1)}>
                ← 이전
              </button>
              <button type="button" className="btn btn--primary" onClick={finish} disabled={saving}>
                {saving ? '저장 중…' : '저장하기'}
              </button>
            </div>
          </>
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
