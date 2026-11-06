import { useEffect, useState } from 'react';
import type { ActivityId } from '../activities';
import { firstPicks, labelsOf, parsePicks, totalCost, type BudgetSet } from '../content/budget';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  activity: ActivityId;
  set: BudgetSet;
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

type Stage = 1 | 2 | 3 | 4;
const STAGES = ['처음 고르기', '포기한 것', '다른 의견 듣기', '되돌아보기'];

/** 예산 안에서 제안 고르기 */
function Chooser({ set, picks, onChange }: { set: BudgetSet; picks: string[]; onChange: (ids: string[]) => void }) {
  const used = totalCost(set, picks);
  const left = set.budget - used;
  return (
    <>
      <div className="budget-meter" role="status">
        <span className="budget-meter__bar" style={{ width: `${Math.min(100, (used / set.budget) * 100)}%` }} />
        <span className="budget-meter__text">
          쓴 돈 {used}
          {set.unit} · 남은 돈 {left}
          {set.unit} (전체 {set.budget}
          {set.unit}, 가상)
        </span>
      </div>
      <ul className="budget-options">
        {set.options.map((o) => {
          const on = picks.includes(o.id);
          const tooMuch = !on && o.cost > left;
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`budget-option ${on ? 'budget-option--on' : ''}`}
                aria-pressed={on}
                disabled={tooMuch}
                onClick={() => onChange(on ? picks.filter((x) => x !== o.id) : [...picks, o.id])}
              >
                <span className="budget-option__head">
                  <span aria-hidden>{o.emoji}</span> <strong>{o.label}</strong>
                  <span className="budget-option__cost">
                    {o.cost}
                    {set.unit}
                  </span>
                </span>
                <small>도움을 받는 사람: {o.who}</small>
                {tooMuch && <small className="budget-option__warn">남은 돈이 모자라요</small>}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** [4사08-02] 참여 예산 시뮬레이션: 기회비용을 따지고, 소수 의견을 들은 뒤 다시 결정합니다. */
export default function BudgetActivity({ activity, set, cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const [stage, setStage] = useState<Stage>(1);
  const [doneStep, setDoneStep] = useState(0);
  const [first, setFirst] = useState<string[]>([]);
  const [giveUp, setGiveUp] = useState<string | undefined>();
  const [final, setFinal] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    const f = firstPicks(set, record.checks);
    setFirst(f);
    setGiveUp(record.giveUp);
    setFinal(record.picks ? parsePicks(record.picks) : f);
    setReason(record.text ?? '');
    const s = record.step ?? 1;
    setDoneStep(s);
    setStage(Math.min(4, s + 1) as Stage);
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

  const notChosen = set.options.filter((o) => !first.includes(o.id));
  const changed = [...first].sort().join(',') !== [...final].sort().join(',');

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
            <h3 className="sort-title">1. 예산 안에서 골라요</h3>
            <div className="sort-story">
              <p className="sort-story__label">가상 이야기</p>
              {set.intro.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <Speak text={set.intro.join(' ')} label="이야기 읽어주기" />
            </div>
            <Chooser set={set} picks={first} onChange={setFirst} />
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving || first.length === 0}
              onClick={() => {
                const checks = set.options.map((o) => (first.includes(o.id) ? 'Y' : 'N')).join('');
                setFinal(first);
                void saveStep(1, { checks, picks: first.join(',') }, 2);
              }}
            >
              이대로 정하기 →
            </button>
          </section>
        )}

        {stage === 2 && (
          <section>
            <h3 className="sort-title">2. 포기한 것(기회비용)</h3>
            <p className="guide__text">
              하나를 고르면 다른 것은 포기해야 해요. 고르지 못한 것 가운데 가장 아쉬운 것은 무엇인가요?{' '}
              <Speak text="하나를 고르면 다른 것은 포기해야 해요. 고르지 못한 것 가운데 가장 아쉬운 것은 무엇인가요?" />
            </p>
            <p className="hint">내가 고른 것: {labelsOf(set, first)}</p>
            {notChosen.length === 0 ? (
              <p className="hint">모든 제안을 골랐어요. 1단계로 돌아가 다시 살펴보세요.</p>
            ) : (
              <div className="choices" role="radiogroup" aria-label="가장 아쉬운 제안">
                {notChosen.map((o) => (
                  <label key={o.id} className={`choice ${giveUp === o.id ? 'choice--on' : ''}`}>
                    <input type="radio" name="giveUp" className="sr-only" checked={giveUp === o.id} onChange={() => setGiveUp(o.id)} />
                    <span aria-hidden>{o.emoji}</span> {o.label}
                  </label>
                ))}
              </div>
            )}
            <button type="button" className="btn btn--primary" disabled={saving || !giveUp} onClick={() => void saveStep(2, { giveUp }, 3)}>
              다음 →
            </button>
          </section>
        )}

        {stage === 3 && (
          <section>
            <h3 className="sort-title">3. 다른 의견 듣기</h3>
            <article className="sort-story">
              <p className="sort-story__label">
                <span aria-hidden>{set.minority.emoji} </span>
                {set.minority.label}
              </p>
              {set.minority.paragraphs.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <Speak text={set.minority.paragraphs.join(' ')} label="이야기 읽어주기" />
            </article>
            <p className="guide__text">이야기를 듣고 다시 생각해 보세요. 그대로 두어도, 바꾸어도 괜찮아요.</p>
            <Chooser set={set} picks={final} onChange={setFinal} />
            <button type="button" className="btn btn--primary" disabled={saving || final.length === 0} onClick={() => void saveStep(3, { picks: final.join(',') }, 4)}>
              최종 결정 →
            </button>
          </section>
        )}

        {stage === 4 && (
          <section>
            <h3 className="sort-title">4. 되돌아보기</h3>
            <table className="progress-table budget-compare">
              <caption className="sr-only">처음 결정과 최종 결정</caption>
              <tbody>
                <tr>
                  <th scope="row">처음 결정</th>
                  <td>{labelsOf(set, first) || '–'}</td>
                </tr>
                <tr>
                  <th scope="row">가장 아쉬운 것</th>
                  <td>{labelsOf(set, giveUp ? [giveUp] : []) || '–'}</td>
                </tr>
                <tr>
                  <th scope="row">최종 결정</th>
                  <td>
                    {labelsOf(set, final) || '–'} {changed ? '(바꾸었어요)' : '(그대로예요)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </div>

      <aside className="panel" aria-live="polite">
        {stage === 4 ? (
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
                await saveStep(4, { text: reason.trim() }, 4);
                onToast('저장했어요!');
              }}
            >
              {saving ? '저장 중…' : '생각 저장하기'}
            </button>
          </>
        ) : (
          <p className="guide__text">
            정답이 없는 활동이에요. 예산 안에서 고르고, 포기한 것을 따져 보고, 다른 의견을 들은 뒤 다시 결정해요.
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
        <p className="source">이 활동의 학교, 금액, 이야기는 이해를 돕기 위한 가상이에요.</p>
      </aside>
    </>
  );
}
