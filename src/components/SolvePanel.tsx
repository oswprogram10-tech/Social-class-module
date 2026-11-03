import { useEffect, useState } from 'react';
import { PROBLEMS, SOLUTIONS, SOLVE_STEPS, findChoice } from '../activities';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, PinPatch, Store } from '../data/types';
import type { LatLng } from '../geo';
import type { StudentSession } from '../pages/StudentJoin';
import PinCard from './PinCard';
import { ChoiceGrid } from './PinForm';
import Speak from './Speak';

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  /** 내 문제 해결 핀 */
  myPins: Pin[];
  draft: LatLng | null;
  setDraft: (pos: LatLng | null) => void;
  onPickingChange: (picking: boolean) => void;
  /** 지도에서 내 핀을 누르면 그 핀을 엽니다 (seq가 바뀔 때마다) */
  openRequest: { id: string; seq: number } | null;
  questions: string[];
  onToast: (msg: string) => void;
}

type Form = Pick<
  Pin,
  | 'placeName'
  | 'problem'
  | 'problemText'
  | 'cause'
  | 'optAType'
  | 'optADetail'
  | 'optAGood'
  | 'optABad'
  | 'optBType'
  | 'optBDetail'
  | 'optBGood'
  | 'optBBad'
  | 'chosen'
  | 'text'
>;

const EMPTY: Form = { placeName: '', text: '' };

function formOf(pin?: Pin): Form {
  if (!pin) return { ...EMPTY };
  const { placeName, problem, problemText, cause, chosen, text } = pin;
  const { optAType, optADetail, optAGood, optABad, optBType, optBDetail, optBGood, optBBad } = pin;
  return {
    placeName,
    problem,
    problemText,
    cause,
    optAType,
    optADetail,
    optAGood,
    optABad,
    optBType,
    optBDetail,
    optBGood,
    optBBad,
    chosen,
    text,
  };
}

const STEP_HELP = [
  '지도에서 문제가 있는 곳을 누르고, 어떤 문제인지 적어요.',
  '왜 이런 문제가 생겼는지 까닭을 생각해 적어요.',
  '문제를 해결할 방법 두 가지를 정하고, 각각 좋은 점과 아쉬운 점을 적어요.',
  '두 방법 중 더 좋은 방법을 고르고, 그 까닭을 적어요.',
];

/** [4사09-01] 지역문제 해결 4단계: 단계마다 저장되어 선생님이 진행 상황을 실시간으로 봅니다. */
export default function SolvePanel({
  cls,
  store,
  uid,
  student,
  myPins,
  draft,
  setDraft,
  onPickingChange,
  openRequest,
  questions,
  onToast,
}: Props) {
  /** null: 목록, 'new': 새로 만들기, 그 외: 고치는 핀 ID */
  const [editing, setEditing] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  /** 지금 고치는 기록이 도달한 가장 높은 단계 */
  const [maxStep, setMaxStep] = useState(0);

  const pin = editing && editing !== 'new' ? myPins.find((p) => p.id === editing) : undefined;
  const pos = draft ?? (pin ? { lat: pin.lat, lng: pin.lng } : null);
  const viewing = viewId ? myPins.find((p) => p.id === viewId) : undefined;

  useEffect(() => {
    onPickingChange(editing !== null && step === 1);
  }, [editing, step, onPickingChange]);

  useEffect(() => {
    if (!openRequest) return;
    const p = myPins.find((x) => x.id === openRequest.id);
    if (!p) return;
    if ((p.step ?? 1) >= 4) {
      setEditing(null);
      setViewId(p.id);
    } else {
      start(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest?.seq]);

  function start(p?: Pin, atStep?: number) {
    setViewId(null);
    setEditing(p ? p.id : 'new');
    setForm(formOf(p));
    setStep(atStep ?? (p ? Math.min((p.step ?? 1) + 1, 4) : 1));
    setMaxStep(p?.step ?? 0);
    setMsg('');
    setDraft(null);
  }

  function close() {
    setEditing(null);
    setDraft(null);
    setMsg('');
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const filled = (v?: string) => !!v && v.trim().length > 0;

  function validate(): string {
    switch (step) {
      case 1:
        if (!pos) return '지도에서 문제가 있는 곳을 눌러 주세요.';
        if (!filled(form.placeName)) return '장소 이름을 적어 주세요.';
        if (!form.problem) return '어떤 문제인지 하나 골라 주세요.';
        if (!filled(form.problemText)) return '문제를 한 문장으로 적어 주세요.';
        return '';
      case 2:
        return filled(form.cause) ? '' : '문제가 생긴 까닭을 적어 주세요.';
      case 3:
        if (!form.optAType || !filled(form.optADetail)) return '방법 A의 종류를 고르고 어떻게 할지 적어 주세요.';
        if (!form.optBType || !filled(form.optBDetail)) return '방법 B의 종류를 고르고 어떻게 할지 적어 주세요.';
        if (!filled(form.optAGood) || !filled(form.optBGood)) return '두 방법의 좋은 점을 적어 주세요.';
        return '';
      default:
        if (!form.chosen) return '더 좋은 방법을 골라 주세요.';
        if (!filled(form.text)) return '그 방법을 고른 까닭을 적어 주세요.';
        return '';
    }
  }

  function stepPatch(): PinPatch {
    const t = (v?: string) => v?.trim() ?? '';
    switch (step) {
      case 1:
        return { lat: pos!.lat, lng: pos!.lng, placeName: t(form.placeName), problem: form.problem, problemText: t(form.problemText) };
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
        return { chosen: form.chosen, text: t(form.text) };
    }
  }

  async function next() {
    const err = validate();
    setMsg(err);
    if (err) return;
    setSaving(true);
    try {
      const patch = stepPatch();
      const reached = Math.max(maxStep, step);
      if (editing === 'new') {
        const id = await store.addPin(cls.code, {
          activity: 'solve',
          step: 1,
          lat: patch.lat!,
          lng: patch.lng!,
          placeName: patch.placeName!,
          problem: patch.problem,
          problemText: patch.problemText,
          text: '',
          studentNo: student.studentNo,
          nickname: student.nickname,
          authorUid: uid,
        });
        setEditing(id);
      } else if (editing) {
        // 승인제 학급에서 완성한 내용을 고치면 다시 선생님이 확인합니다.
        const reapprove = cls.requireApproval && reached >= 4 ? { approved: false } : {};
        await store.updatePin(cls.code, editing, { ...patch, step: reached, ...reapprove });
      }
      setMaxStep(reached);
      setDraft(null);
      if (step < 4) {
        setStep(step + 1);
      } else {
        onToast(
          cls.requireApproval ? '완성했어요! 선생님이 확인하면 친구들에게 보여요.' : '해결 방안을 완성했어요! 🎉',
        );
        const doneId = editing === 'new' ? null : editing;
        close();
        if (doneId) setViewId(doneId);
      }
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Pin) {
    if (!confirm('이 문제 해결 기록을 지울까요?')) return;
    await store.deletePin(cls.code, p.id).catch(console.error);
    setViewId(null);
    close();
  }

  // ---------- 목록 / 보기 ----------
  if (editing === null) {
    if (viewing) {
      return (
        <>
          <PinCard pin={viewing} author="내가 해결한 문제">
            <button type="button" className="btn" onClick={() => start(viewing, 1)}>
              ✏️ 고치기
            </button>
            <button type="button" className="btn btn--danger" onClick={() => remove(viewing)}>
              🗑️ 지우기
            </button>
          </PinCard>
          <button type="button" className="btn btn--block" onClick={() => setViewId(null)}>
            목록으로
          </button>
        </>
      );
    }
    return (
      <div className="guide">
        <p className="guide__text">
          우리 동네의 문제를 찾아 4단계로 해결 방법을 찾아요.{' '}
          <Speak text="우리 동네의 문제를 찾아 4단계로 해결 방법을 찾아요. 문제 찾기, 원인 생각하기, 방법 비교하기, 결론 내리기 순서로 해요." />
        </p>
        <ol className="steps-preview">
          {SOLVE_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <button type="button" className="btn btn--primary btn--block" onClick={() => start()}>
          ➕ 새 문제 찾기
        </button>
        {myPins.length > 0 && (
          <ul className="pin-list">
            {myPins.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="pin-list__item"
                  onClick={() => ((p.step ?? 1) >= 4 ? setViewId(p.id) : start(p))}
                >
                  <PinCard pin={p} compact />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">친구들이 완성한 문제 해결은 지도에서 눌러 볼 수 있어요.</p>
      </div>
    );
  }

  // ---------- 단계별 입력 ----------
  const optionBlock = (k: 'A' | 'B') => {
    const T = `opt${k}Type` as const;
    const D = `opt${k}Detail` as const;
    const G = `opt${k}Good` as const;
    const B = `opt${k}Bad` as const;
    return (
      <fieldset className="option-edit">
        <legend>방법 {k}</legend>
        <ChoiceGrid legend="어떤 방법인가요?" name={`opt${k}`} choices={SOLUTIONS} value={form[T]} onChange={(v) => set(T, v)} columns={3} />
        <label className="field">
          <span>어떻게 할까요?</span>
          <input value={form[D] ?? ''} onChange={(e) => set(D, e.target.value)} maxLength={LIMITS.detail} placeholder="예: 학교 앞에 과속방지턱 만들기" />
        </label>
        <label className="field">
          <span>👍 좋은 점</span>
          <input value={form[G] ?? ''} onChange={(e) => set(G, e.target.value)} maxLength={LIMITS.proCon} />
        </label>
        <label className="field">
          <span>🤔 아쉬운 점 (돈, 시간, 불편한 사람…)</span>
          <input value={form[B] ?? ''} onChange={(e) => set(B, e.target.value)} maxLength={LIMITS.proCon} />
        </label>
      </fieldset>
    );
  };

  const optSummary = (k: 'A' | 'B') => {
    const c = findChoice(SOLUTIONS, k === 'A' ? form.optAType : form.optBType);
    return (
      <label key={k} className={`choice-card ${form.chosen === k ? 'choice-card--on' : ''}`}>
        <input type="radio" name="chosen" className="sr-only" checked={form.chosen === k} onChange={() => set('chosen', k)} />
        <strong>
          방법 {k}. {c?.emoji} {k === 'A' ? form.optADetail : form.optBDetail}
        </strong>
        <span>👍 {k === 'A' ? form.optAGood : form.optBGood}</span>
        {(k === 'A' ? form.optABad : form.optBBad) && <span>🤔 {k === 'A' ? form.optABad : form.optBBad}</span>}
      </label>
    );
  };

  return (
    <div className="solve">
      <ol className="stepper" aria-label="문제 해결 단계">
        {SOLVE_STEPS.map((s, i) => {
          const n = i + 1;
          const reachable = n <= Math.max(maxStep + 1, step);
          return (
            <li key={s} className={`stepper__item ${n === step ? 'stepper__item--on' : ''} ${n < step ? 'stepper__item--done' : ''}`}>
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
          <p className={`hint ${pos ? 'hint--ok' : ''}`}>{pos ? '✅ 지도에 표시했어요. 다시 누르면 위치가 바뀌어요.' : '📍 지도를 눌러 문제가 있는 곳을 표시해 주세요.'}</p>
          <label className="field">
            <span>장소 이름</span>
            <input value={form.placeName} onChange={(e) => set('placeName', e.target.value)} maxLength={LIMITS.placeName} placeholder="예: 학교 앞 횡단보도" />
          </label>
          <ChoiceGrid legend="어떤 문제인가요?" name="problem" choices={PROBLEMS} value={form.problem} onChange={(v) => set('problem', v)} columns={3} />
          <label className="field">
            <span>
              무엇이 문제인가요? 누가 불편한가요? <Speak text="무엇이 문제인가요? 누가 불편한가요?" />
            </span>
            <textarea rows={2} value={form.problemText ?? ''} onChange={(e) => set('problemText', e.target.value)} maxLength={LIMITS.text} />
          </label>
        </>
      )}

      {step === 2 && (
        <>
          <div className="recap">
            <strong>문제</strong> {form.placeName}: {form.problemText}
          </div>
          <label className="field">
            <span>
              왜 이런 문제가 생겼을까요? <Speak text="왜 이런 문제가 생겼을까요?" />
            </span>
            <textarea rows={3} value={form.cause ?? ''} onChange={(e) => set('cause', e.target.value)} maxLength={LIMITS.text} placeholder="예: 차들이 빨리 달리는데 신호등이 없어서" />
          </label>
          <ul className="questions">
            {questions.map((q) => (
              <li key={q}>
                {q} <Speak text={q} />
              </li>
            ))}
          </ul>
        </>
      )}

      {step === 3 && (
        <>
          {optionBlock('A')}
          {optionBlock('B')}
        </>
      )}

      {step === 4 && (
        <>
          <fieldset className="choices">
            <legend>더 좋은 방법은? <Speak text="두 방법 중 더 좋은 방법을 골라요." /></legend>
            <div className="choice-cards">{(['A', 'B'] as const).map(optSummary)}</div>
          </fieldset>
          <label className="field">
            <span>
              왜 이 방법을 골랐나요? <Speak text="왜 이 방법을 골랐나요?" />
            </span>
            <textarea rows={3} value={form.text} onChange={(e) => set('text', e.target.value)} maxLength={LIMITS.text} />
          </label>
        </>
      )}

      {msg && (
        <p className="error" role="alert">
          {msg}
        </p>
      )}
      <div className="row">
        <button type="button" className="btn" onClick={() => (step > 1 ? setStep(step - 1) : close())} disabled={saving}>
          {step > 1 ? '← 이전' : '취소'}
        </button>
        <button type="button" className="btn btn--primary" onClick={next} disabled={saving}>
          {saving ? '저장 중…' : step < 4 ? '저장하고 다음 →' : '완성하기 ✔'}
        </button>
      </div>
      <p className="hint">단계마다 저장돼요. 나중에 이어서 할 수 있어요.</p>
    </div>
  );
}
