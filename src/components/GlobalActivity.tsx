import { useEffect, useState } from 'react';
import { ACTORS, GLOBAL_PROBLEMS, GLOBAL_STEPS, SDG_ABOUT, findActor, findProblem } from '../content/global';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import { ChoiceGrid } from './PinForm';
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

type Form = Pick<
  Pin,
  'category' | 'problemText' | 'cause' | 'optAType' | 'optADetail' | 'optAGood' | 'optABad' | 'optBType' | 'optBDetail' | 'optBGood' | 'optBBad' | 'chosen' | 'text' | 'slogan'
>;

const KEYS: (keyof Form)[] = [
  'category', 'problemText', 'cause', 'optAType', 'optADetail', 'optAGood', 'optABad', 'optBType', 'optBDetail', 'optBGood', 'optBBad', 'chosen', 'text', 'slogan',
];

const STEP_HELP = [
  '지구촌 문제 하나를 고르고, 누가 어떤 어려움을 겪는지 적어요.',
  '왜 이런 문제가 생겼는지 까닭을 생각해 적어요.',
  '누가, 어떻게 해결할 수 있을지 두 가지 방법을 정하고 좋은 점과 아쉬운 점을 비교해요.',
  '더 좋은 방법을 고르고, 내가 지금 실천할 수 있는 약속을 정해요.',
];

/** 지속가능발전목표 동그라미 */
function SdgChips({ sdgs }: { sdgs: { n: number; name: string }[] }) {
  return (
    <span className="sdg-chips">
      {sdgs.map((s) => (
        <span key={s.n} className="sdg-chip" title={`지속가능발전목표 ${s.n}번`}>
          SDG {s.n} {s.name}
        </span>
      ))}
    </span>
  );
}

/** [6사12-02] 지구촌 문제 해결 4단계: 문제 → 원인 → 주체별 방법 비교 → 결론과 실천 약속 */
export default function GlobalActivity({ cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const [form, setForm] = useState<Form>({ text: '' });
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(0);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    const f: Form = { text: '' };
    KEYS.forEach((k) => ((f as Record<string, unknown>)[k] = record[k]));
    f.text = record.text ?? '';
    setForm(f);
    const s = record.step ?? 1;
    setMaxStep(s);
    setStep(Math.min(4, s + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const filled = (v?: string) => !!v && v.trim().length > 0;
  const t = (v?: string) => v?.trim() ?? '';
  const problem = findProblem(form.category);
  const done = maxStep >= 4;

  function validate(): string {
    switch (step) {
      case 1:
        if (!form.category) return '지구촌 문제를 하나 골라 주세요.';
        return filled(form.problemText) ? '' : '누가 어떤 어려움을 겪는지 적어 주세요.';
      case 2:
        return filled(form.cause) ? '' : '문제가 생긴 까닭을 적어 주세요.';
      case 3:
        if (!form.optAType || !filled(form.optADetail)) return '방법 A는 누가 할지 고르고, 어떻게 할지 적어 주세요.';
        if (!form.optBType || !filled(form.optBDetail)) return '방법 B는 누가 할지 고르고, 어떻게 할지 적어 주세요.';
        if (!filled(form.optAGood) || !filled(form.optBGood)) return '두 방법의 좋은 점을 적어 주세요.';
        return '';
      default:
        if (!form.chosen) return '더 좋은 방법을 골라 주세요.';
        if (!filled(form.text)) return '그 방법을 고른 까닭을 적어 주세요.';
        if (!filled(form.slogan)) return '나의 실천 약속을 적어 주세요.';
        return '';
    }
  }

  function patchFor(): Partial<Pin> {
    switch (step) {
      case 1:
        return { category: form.category, problemText: t(form.problemText), placeName: findProblem(form.category)?.label ?? '지구촌 문제' };
      case 2:
        return { cause: t(form.cause) };
      case 3:
        return {
          optAType: form.optAType,
          optADetail: t(form.optADetail),
          optAGood: t(form.optAGood),
          optABad: t(form.optABad),
          optBType: form.optBType,
          optBDetail: t(form.optBDetail),
          optBGood: t(form.optBGood),
          optBBad: t(form.optBBad),
        };
      default:
        return { chosen: form.chosen, text: t(form.text), slogan: t(form.slogan) };
    }
  }

  async function next() {
    const err = validate();
    setMsg(err);
    if (err) return;
    setSaving(true);
    try {
      const reached = Math.max(maxStep, step);
      const patch = { ...patchFor(), step: reached };
      if (record) await store.updatePin(cls.code, record.id, patch);
      else
        await store.addPin(cls.code, {
          activity: 'global',
          lat: cls.lat,
          lng: cls.lng,
          placeName: '지구촌 문제',
          text: '',
          studentNo: student.studentNo,
          nickname: student.nickname,
          authorUid: uid,
          ...patch,
        });
      setMaxStep(reached);
      if (step < 4) setStep(step + 1);
      else onToast('실천 약속을 완성했어요! 🌏');
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const optionBlock = (k: 'A' | 'B') => {
    const T = `opt${k}Type` as const;
    const D = `opt${k}Detail` as const;
    const G = `opt${k}Good` as const;
    const B = `opt${k}Bad` as const;
    return (
      <fieldset className="option-edit">
        <legend>방법 {k}</legend>
        <ChoiceGrid legend="누가 해결할까요?" name={`gopt${k}`} choices={ACTORS} value={form[T]} onChange={(v) => set(T, v)} columns={3} />
        <label className="field">
          <span>어떻게 할까요?</span>
          <input
            value={form[D] ?? ''}
            onChange={(e) => set(D, e.target.value)}
            maxLength={LIMITS.detail}
            placeholder={k === 'A' ? '예: 여러 나라가 온실가스를 줄이기로 약속하기' : '예: 우리 반이 안 쓰는 전등 끄기'}
          />
        </label>
        <label className="field">
          <span>👍 좋은 점</span>
          <input value={form[G] ?? ''} onChange={(e) => set(G, e.target.value)} maxLength={LIMITS.proCon} />
        </label>
        <label className="field">
          <span>🤔 아쉬운 점 (돈, 시간, 지키기 어려운 점…)</span>
          <input value={form[B] ?? ''} onChange={(e) => set(B, e.target.value)} maxLength={LIMITS.proCon} />
        </label>
      </fieldset>
    );
  };

  const optSummary = (k: 'A' | 'B') => {
    const a = findActor(k === 'A' ? form.optAType : form.optBType);
    return (
      <label key={k} className={`choice-card ${form.chosen === k ? 'choice-card--on' : ''}`}>
        <input type="radio" name="gchosen" className="sr-only" checked={form.chosen === k} onChange={() => set('chosen', k)} />
        <strong>
          방법 {k}. {a?.emoji} {a?.label}: {k === 'A' ? form.optADetail : form.optBDetail}
        </strong>
        <span>👍 {k === 'A' ? form.optAGood : form.optBGood}</span>
        {(k === 'A' ? form.optABad : form.optBBad) && <span>🤔 {k === 'A' ? form.optABad : form.optBBad}</span>}
      </label>
    );
  };

  return (
    <>
      <div className="work-area global">
        <ol className="stepper" aria-label="지구촌 문제 해결 단계">
          {GLOBAL_STEPS.map((s, i) => {
            const n = i + 1;
            const reachable = n <= Math.max(maxStep + 1, step);
            return (
              <li key={s} className={`stepper__item ${n === step ? 'stepper__item--on' : ''} ${n <= maxStep ? 'stepper__item--done' : ''}`}>
                <button type="button" disabled={!reachable || saving} onClick={() => setStep(n)} aria-current={n === step ? 'step' : undefined}>
                  <span className="stepper__n">{n}</span>
                  <span className="stepper__label">{s}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="guide__text">
          {STEP_HELP[step - 1]} <Speak text={STEP_HELP[step - 1]} />
        </p>

        {step === 1 && (
          <>
            <div className="global-problems" role="radiogroup" aria-label="지구촌 문제">
              {GLOBAL_PROBLEMS.map((p) => (
                <label key={p.id} className={`global-problem ${form.category === p.id ? 'global-problem--on' : ''}`}>
                  <input type="radio" name="gproblem" className="sr-only" checked={form.category === p.id} onChange={() => set('category', p.id)} />
                  <span className="global-problem__title">
                    <span aria-hidden>{p.emoji}</span> {p.label}
                  </span>
                  <span className="global-problem__about">{p.about}</span>
                  <SdgChips sdgs={p.sdgs} />
                </label>
              ))}
            </div>
            {problem && (
              <p className="hint">
                <Speak text={`${problem.label}. ${problem.about}`} /> 고른 문제: {problem.emoji} {problem.label}
              </p>
            )}
            <label className="field">
              <span>
                누가, 어떤 어려움을 겪고 있을까요? <Speak text="누가, 어떤 어려움을 겪고 있을까요?" />
              </span>
              <textarea rows={2} value={form.problemText ?? ''} onChange={(e) => set('problemText', e.target.value)} maxLength={LIMITS.text} placeholder="예: 바다거북이 비닐을 먹이로 알고 먹어서 아파요." />
            </label>
            <p className="hint sdg-about">🎯 {SDG_ABOUT}</p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="recap">
              <strong>
                {problem?.emoji} {problem?.label}
              </strong>{' '}
              {form.problemText}
            </div>
            {problem && <p className="hint">💡 {problem.causeHint}</p>}
            <label className="field">
              <span>
                왜 이런 문제가 생겼을까요? <Speak text="왜 이런 문제가 생겼을까요?" />
              </span>
              <textarea rows={3} value={form.cause ?? ''} onChange={(e) => set('cause', e.target.value)} maxLength={LIMITS.text} />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <p className="hint">한 가지는 국제기구·정부·NGO·기업처럼 큰 힘을 가진 곳의 방법, 다른 하나는 나와 우리 반이 할 수 있는 방법으로 정해 보면 비교하기 좋아요.</p>
            <div className="global-options">
              {optionBlock('A')}
              {optionBlock('B')}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <fieldset className="choices">
              <legend>
                더 좋은 방법은? <Speak text="두 방법 중 더 좋은 방법을 골라요." />
              </legend>
              <div className="choice-cards">{(['A', 'B'] as const).map(optSummary)}</div>
            </fieldset>
            <label className="field">
              <span>
                왜 이 방법을 골랐나요? <Speak text="왜 이 방법을 골랐나요?" />
              </span>
              <textarea rows={3} value={form.text} onChange={(e) => set('text', e.target.value)} maxLength={LIMITS.text} />
            </label>
            <label className="field">
              <span>
                🌱 나의 실천 약속 (한 줄) <Speak text="내가 지금부터 실천할 약속을 한 줄로 적어요." />
              </span>
              <input value={form.slogan ?? ''} onChange={(e) => set('slogan', e.target.value)} maxLength={LIMITS.slogan} placeholder="예: 급식 남기지 않기, 개인 컵 쓰기" />
            </label>
          </>
        )}

        {msg && (
          <p className="error" role="alert">
            {msg}
          </p>
        )}
        <div className="row">
          <button type="button" className="btn" onClick={() => setStep(step - 1)} disabled={saving || step === 1}>
            ← 이전
          </button>
          <button type="button" className="btn btn--primary" onClick={next} disabled={saving}>
            {saving ? '저장 중…' : step < 4 ? '저장하고 다음 →' : done ? '고친 내용 저장 ✔' : '완성하기 ✔'}
          </button>
        </div>
        <p className="hint">단계마다 저장돼요. 나중에 이어서 할 수 있어요.</p>
      </div>

      <aside className="panel" aria-live="polite">
        {done ? (
          <div className="result-card promise-card">
            <h2>🌏 나의 지구촌 실천 약속</h2>
            <p>
              {problem?.emoji} {problem?.label}
            </p>
            <p className="promise-card__slogan">“{form.slogan}”</p>
            {problem && <SdgChips sdgs={problem.sdgs} />}
            <p className="hint">고친 내용은 왼쪽에서 다시 저장할 수 있어요.</p>
          </div>
        ) : (
          <p className="guide__text">
            지구촌 문제를 4단계로 해결해 보고, 마지막에 나의 실천 약속을 만들어요.{' '}
            <Speak text="지구촌 문제를 4단계로 해결해 보고, 마지막에 나의 실천 약속을 만들어요." />
          </p>
        )}
        <details className="helper" open={step === 2}>
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
