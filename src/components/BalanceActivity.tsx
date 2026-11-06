import { useEffect, useState } from 'react';
import type { ActivityId } from '../activities';
import { MOOD_FACE, MOOD_TEXT, parsePlan, planText, sadCount, type BalanceSet } from '../content/balance';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  activity: ActivityId;
  set: BalanceSet;
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

type Stage = 1 | 2 | 3;
const STAGES = ['내 계획', '사람들의 반응', '되돌아보기'];

function Planner({ set, plan, onChange }: { set: BalanceSet; plan: number[]; onChange: (p: number[]) => void }) {
  const used = plan.reduce((a, b) => a + b, 0);
  const left = set.total - used;
  const change = (i: number, d: number) => onChange(plan.map((v, j) => (j === i ? v + d : v)));
  return (
    <>
      <p className="budget-meter" role="status">
        <span className="budget-meter__bar" style={{ width: `${(used / set.total) * 100}%` }} />
        <span className="budget-meter__text">
          나눈 칸 {used} / {set.total} · 남은 칸 {left}
        </span>
      </p>
      <div className="balance-uses">
        {set.uses.map((u, i) => (
          <div key={u.id} className="qty balance-use" role="group" aria-label={u.label}>
            <span className="qty__label">
              <span aria-hidden>{u.emoji}</span> {u.label}
            </span>
            <button type="button" className="btn btn--small" onClick={() => change(i, -1)} disabled={plan[i] <= 0} aria-label={`${u.label} 한 칸 줄이기`}>
              −
            </button>
            <strong className="qty__value">{plan[i]}칸</strong>
            <button type="button" className="btn btn--small" onClick={() => change(i, 1)} disabled={left <= 0} aria-label={`${u.label} 한 칸 늘리기`}>
              +
            </button>
            <span className="balance-cells" aria-hidden>
              {u.emoji.repeat(plan[i])}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Reactions({ set, plan }: { set: BalanceSet; plan: number[] }) {
  return (
    <>
      <ul className="balance-meters">
        {set.meters.map((m) => {
          const v = Math.round(m.value(plan) * 10) / 10;
          return (
            <li key={m.label}>
              <span className="balance-meters__label">
                <span aria-hidden>{m.emoji}</span> {m.label}
              </span>
              <span className="bars__track" aria-hidden>
                <span className="bars__fill" style={{ width: `${Math.min(100, (v / m.max) * 100)}%` }} />
              </span>
              <span className="sr-only">
                {m.label} {v} / {m.max}
              </span>
            </li>
          );
        })}
      </ul>
      <ul className="balance-people">
        {set.people.map((p) => {
          const r = p.react(plan);
          return (
            <li key={p.id} className={`balance-person balance-person--${r.mood}`}>
              <span className="balance-person__face" aria-hidden>
                {MOOD_FACE[r.mood]}
              </span>
              <span>
                <strong>
                  {p.emoji} {p.label}
                </strong>{' '}
                <span className="sr-only">{MOOD_TEXT[r.mood]}.</span>
                <br />“{r.say}”
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** [4사10-01·02] 개발과 보전 배분 시뮬레이션: 땅을 나누고, 사람마다 다른 반응을 보며 타협안을 찾아요. */
export default function BalanceActivity({ activity, set, cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const empty = set.uses.map(() => 0);
  const [stage, setStage] = useState<Stage>(1);
  const [doneStep, setDoneStep] = useState(0);
  const [first, setFirst] = useState<number[]>(empty);
  const [final, setFinal] = useState<number[]>(empty);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    const f = parsePlan(set, record.giveUp);
    if (f) setFirst(f);
    setFinal(parsePlan(set, record.picks) ?? f ?? empty);
    setReason(record.text ?? '');
    const s = record.step ?? 1;
    setDoneStep(s);
    setStage(Math.min(3, s + 1) as Stage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity,
        lat: cls.lat,
        lng: cls.lng,
        placeName: set.title,
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
  }

  async function saveStep(step: number, patch: Partial<Pin>, next: Stage) {
    setSaving(true);
    setMsg('');
    try {
      const s = Math.max(step, doneStep);
      await save({ ...patch, step: s });
      setDoneStep(s);
      setStage(next);
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const full = (p: number[]) => p.reduce((a, b) => a + b, 0) === set.total;
  const sad = sadCount(set, final);

  return (
    <>
      <div className="work-area budget">
        <ol className="stepper" aria-label="활동 순서">
          {STAGES.map((label, i) => {
            const n = (i + 1) as Stage;
            return (
              <li key={label} className={`stepper__item ${n === stage ? 'stepper__item--on' : ''} ${n <= doneStep ? 'stepper__item--done' : ''}`}>
                <button type="button" onClick={() => setStage(n)} disabled={n > doneStep + 1} aria-current={n === stage ? 'step' : undefined}>
                  <span className="stepper__n">{n}</span>
                  <span className="stepper__label">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {stage === 1 && (
          <section>
            <h3 className="sort-title">1. 내 생각대로 나누기</h3>
            <div className="sort-story">
              <p className="sort-story__label">가상 이야기</p>
              {set.intro.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <Speak text={set.intro.join(' ')} label="이야기 읽어주기" />
            </div>
            <Planner set={set} plan={first} onChange={setFirst} />
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving || !full(first)}
              onClick={() => {
                setFinal(first);
                void saveStep(1, { giveUp: first.join(','), picks: first.join(',') }, 2);
              }}
            >
              {full(first) ? '이 계획으로 회의에 내기 →' : `${set.total}칸을 모두 나누어 주세요`}
            </button>
          </section>
        )}

        {stage === 2 && (
          <section>
            <h3 className="sort-title">2. 사람들의 반응을 보고 고쳐 보기</h3>
            <p className="guide__text">
              칸을 옮겨 보며 사람들의 반응이 어떻게 바뀌는지 살펴보세요. 걱정하는 사람(😟)이 없는 계획을 찾을 수 있을까요?{' '}
              <Speak text="칸을 옮겨 보며 사람들의 반응이 어떻게 바뀌는지 살펴보세요. 걱정하는 사람이 없는 계획을 찾을 수 있을까요?" />
            </p>
            <Planner set={set} plan={final} onChange={setFinal} />
            {full(final) && <Reactions set={set} plan={final} />}
            <p className={`feedback ${sad === 0 && full(final) ? 'feedback--ok' : 'feedback--hint'}`} role="status">
              {!full(final)
                ? `${set.total}칸을 모두 나누어 주세요.`
                : sad === 0
                  ? '🎉 걱정하는 사람이 없는 계획을 찾았어요! 모두가 조금씩 양보했지요.'
                  : `걱정하는 사람이 ${sad}명 있어요. 누구를 위해 어떤 칸을 옮겨 볼까요?`}
            </p>
            <button type="button" className="btn btn--primary" disabled={saving || !full(final)} onClick={() => void saveStep(2, { picks: final.join(',') }, 3)}>
              이 계획으로 정하기 →
            </button>
          </section>
        )}

        {stage === 3 && (
          <section>
            <h3 className="sort-title">3. 되돌아보기</h3>
            <table className="progress-table budget-compare">
              <caption className="sr-only">처음 계획과 고친 계획</caption>
              <tbody>
                <tr>
                  <th scope="row">처음 계획</th>
                  <td>
                    {planText(set, first)} (걱정 {sadCount(set, first)}명)
                  </td>
                </tr>
                <tr>
                  <th scope="row">고친 계획</th>
                  <td>
                    {planText(set, final)} (걱정 {sad}명)
                  </td>
                </tr>
              </tbody>
            </table>
            <Reactions set={set} plan={final} />
          </section>
        )}
      </div>

      <aside className="panel" aria-live="polite">
        {stage === 3 ? (
          <>
            <p className="guide__text">
              {set.open} <Speak text={set.open} />
            </p>
            <label className="field">
              <span className="sr-only">{set.open}</span>
              <textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
            </label>
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={saving}
              onClick={async () => {
                if (!reason.trim()) return setMsg('생각을 적어 주세요.');
                await saveStep(3, { text: reason.trim() }, 3);
                onToast('저장했어요!');
              }}
            >
              {saving ? '저장 중…' : '생각 저장하기'}
            </button>
          </>
        ) : (
          <p className="guide__text">정답이 하나로 정해진 활동이 아니에요. 사람마다 바라는 것이 다를 때 어떻게 타협할지 생각해 봐요.</p>
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
        <p className="source">이 활동의 마을과 계산 방식은 이해를 돕기 위한 가상이에요.</p>
      </aside>
    </>
  );
}
