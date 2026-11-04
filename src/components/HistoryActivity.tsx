import { useEffect, useState } from 'react';
import type { ActivityId } from '../activities';
import { orderScore, type OrderSet } from '../content/history';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  activity: ActivityId;
  set: OrderSet;
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

/** [6사04~06] 한국사 연표 순서: 사건 카드를 옛날부터 차례로 눌러 연표를 완성합니다. */
export default function HistoryActivity({ activity, set, cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const findEvent = (id: string) => set.events.find((e) => e.id === id);
  const SHUFFLED = set.shuffled.map((id) => findEvent(id)!);
  const HISTORY_EVENTS = set.events;
  const HISTORY_ANSWER = set.answer;
  const historyScore = (o?: string) => orderScore(set, o);
  const record = myRecords[0];
  const [order, setOrder] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; wrong: number[]; hint: string } | null>(null);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record?.labels) return;
    setOrder(record.labels.split('').filter((c) => c !== '-'));
    setReason(record.text ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const done = result?.score === HISTORY_EVENTS.length || (record?.labels === HISTORY_ANSWER && order.join('') === HISTORY_ANSWER);
  const full = order.length === HISTORY_EVENTS.length;

  function add(id: string) {
    if (order.includes(id) || done) return;
    setOrder([...order, id]);
    setResult(null);
  }

  function removeAt(i: number) {
    if (done) return;
    setOrder(order.filter((_, j) => j !== i));
    setResult(null);
  }

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity,
        lat: cls.lat,
        lng: cls.lng,
        placeName: set.placeName,
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
  }

  async function check() {
    if (!full) return setMsg(`사건 ${HISTORY_EVENTS.length}개를 모두 연표에 놓아 주세요.`);
    setMsg('');
    const str = order.join('');
    const score = historyScore(str);
    const wrong = [...HISTORY_ANSWER].map((id, i) => (str[i] === id ? -1 : i)).filter((i) => i >= 0);
    let hint = '';
    if (wrong.length > 0) {
      // 순서가 뒤바뀐 첫 짝을 찾아 질문으로 힌트를 줍니다.
      const pos = (id: string) => HISTORY_EVENTS.find((e) => e.id === id)!.year;
      for (let i = 0; i < order.length - 1; i++) {
        if (pos(order[i]) > pos(order[i + 1])) {
          hint = `“${findEvent(order[i])!.label}”과(와) “${findEvent(order[i + 1])!.label}” 중 무엇이 먼저 일어났을까요? ${set.hintTail}`;
          break;
        }
      }
    }
    setResult({ score, wrong, hint });
    try {
      await save({ labels: str, attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    }
  }

  async function saveReason() {
    if (!reason.trim()) return setMsg('생각을 적어 주세요.');
    setSaving(true);
    try {
      await save({ text: reason.trim() });
      onToast('저장했어요!');
      setMsg('');
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  const wrongSet = new Set(result?.wrong ?? []);

  return (
    <>
      <div className="work-area">
        <section className="history-board">
          <h3>📜 연표 (왼쪽이 가장 옛날)</h3>
          <ol className="history-slots">
            {HISTORY_EVENTS.map((_, i) => {
              const ev = order[i] ? findEvent(order[i]) : undefined;
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`slot ${ev ? 'slot--filled' : ''} ${wrongSet.has(i) ? 'slot--wrong' : ''} ${done ? 'slot--done' : ''}`}
                    onClick={() => ev && removeAt(i)}
                    disabled={!ev || done}
                    aria-label={ev ? `${i + 1}번째: ${ev.label}. 누르면 빼요.` : `${i + 1}번째 빈칸`}
                  >
                    <span className="slot__n">{i + 1}</span>
                    {ev ? (
                      <>
                        <span className="slot__emoji" aria-hidden>
                          {ev.emoji}
                        </span>
                        <span className="slot__label">{ev.label}</span>
                        {done && <span className="slot__when">{ev.when}</span>}
                      </>
                    ) : (
                      <span className="slot__empty">?</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
        {!done && (
          <section>
            <h3>사건 카드 (옛날 것부터 차례로 눌러요)</h3>
            <div className="event-cards">
              {SHUFFLED.map((ev) => (
                <button key={ev.id} type="button" className="event-card" onClick={() => add(ev.id)} disabled={order.includes(ev.id)}>
                  <span aria-hidden>{ev.emoji}</span> {ev.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <aside className="panel" aria-live="polite">
        <p className="guide__text">
          사건 카드를 옛날 것부터 차례로 눌러 연표를 채워요. 잘못 놓은 카드는 연표에서 누르면 빠져요.{' '}
          <Speak text="사건 카드를 옛날 것부터 차례로 눌러 연표를 채워요. 잘못 놓은 카드는 연표에서 누르면 빠져요." />
        </p>
        {result && !done && (
          <div className="feedback feedback--hint" role="status">
            <span>💡</span>
            <p>
              {HISTORY_EVENTS.length}개 중 {result.score}개가 제자리에 있어요. 빨간 칸을 다시 살펴보세요. {result.hint}
            </p>
          </div>
        )}
        {done ? (
          <>
            <div className="feedback feedback--ok" role="status">
              <span>🎉</span>
              <p>연표를 완성했어요! 사건마다 연도가 나타났어요.</p>
            </div>
            <label className="field">
              <span>{set.open}</span>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
            </label>
            <button type="button" className="btn btn--primary btn--block" onClick={saveReason} disabled={saving}>
              {saving ? '저장 중…' : '저장하기'}
            </button>
          </>
        ) : (
          <div className="row">
            <button type="button" className="btn" onClick={() => setOrder([])} disabled={order.length === 0}>
              모두 빼기
            </button>
            <button type="button" className="btn btn--primary" onClick={check} disabled={!full}>
              확인하기
            </button>
          </div>
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
