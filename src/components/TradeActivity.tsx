import { useEffect, useState } from 'react';
import {
  BEST_ALONE,
  BEST_TRADE,
  EVENT,
  GOODS,
  HOME,
  HOURS,
  NEED,
  PARTNERS,
  RATE,
  TRADE_CHECKS,
  alone,
  findEventChoice,
  needsMet,
  parseTradePicks,
  tradeScore,
  withTrade,
  type Outcome,
} from '../content/trade';
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

type Stage = 1 | 2 | 3 | 4;

const STAGES = ['혼자 만들기', '무역하기', '큰일이에요!', '정리하기'];

function OutcomeView({ o, title }: { o: Outcome; title: string }) {
  const okW = o.wheat >= NEED.wheat;
  const okF = o.fruit >= NEED.fruit;
  return (
    <div className="trade-outcome" aria-label={title}>
      <p className="trade-outcome__title">{title}</p>
      <ul>
        <li className={okW ? 'ok' : 'no'}>
          {GOODS.wheat.emoji} 밀 <strong>{o.wheat}</strong>
          {GOODS.wheat.unit} <small>(필요 {NEED.wheat}) {okW ? '✅' : '❌'}</small>
        </li>
        <li className={okF ? 'ok' : 'no'}>
          {GOODS.fruit.emoji} 과일 <strong>{o.fruit}</strong>
          {GOODS.fruit.unit} <small>(필요 {NEED.fruit}) {okF ? '✅' : '❌'}</small>
        </li>
        <li>
          {GOODS.phone.emoji} 남은 휴대폰 <strong>{o.phone}</strong>
          {GOODS.phone.unit}
        </li>
      </ul>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <span className="qty__label">{label}</span>
      <button type="button" className="btn btn--small" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} 줄이기`}>
        −
      </button>
      <strong className="qty__value" aria-live="polite">
        {value}
      </strong>
      <button type="button" className="btn btn--small" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} 늘리기`}>
        +
      </button>
    </div>
  );
}

/** 시간 나누기: 밀에 쓸 시간 (나머지는 휴대폰) */
function HoursSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="field trade-hours">
      <span>
        12시간 중 🌾 밀 기르기 <strong>{value}시간</strong> · 📱 휴대폰 만들기 <strong>{HOURS - value}시간</strong>
      </span>
      <input type="range" min={0} max={HOURS} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label="밀 기르는 시간" aria-valuetext={`밀 ${value}시간, 휴대폰 ${HOURS - value}시간`} />
      <div className="hours-bar" aria-hidden>
        {Array.from({ length: HOURS }, (_, i) => (
          <span key={i} className={i < value ? 'hours-bar__w' : 'hours-bar__p'}>
            {i < value ? '🌾' : '📱'}
          </span>
        ))}
      </div>
    </label>
  );
}

/** [6사11-03] 무역 시뮬레이션: 무역 전과 후를 비교하고, 나라 사이의 상호 의존을 경험합니다. */
export default function TradeActivity({ cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const [stage, setStage] = useState<Stage>(1);
  const [doneStep, setDoneStep] = useState(0);
  const [aloneH, setAloneH] = useState(4);
  const [tradeH, setTradeH] = useState(4);
  const [toWind, setToWind] = useState(0);
  const [toSun, setToSun] = useState(0);
  const [event, setEvent] = useState<string | undefined>();
  const [answers, setAnswers] = useState('-'.repeat(TRADE_CHECKS.length));
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    const p = parseTradePicks(record.picks);
    if (p) {
      setAloneH(p.aloneH);
      setTradeH(p.tradeH);
      setToWind(p.toWind);
      setToSun(p.toSun);
    }
    setEvent(record.giveUp);
    setAnswers(record.labels ?? '-'.repeat(TRADE_CHECKS.length));
    setReason(record.text ?? '');
    const s = record.step ?? 1;
    setDoneStep(s);
    setStage(Math.min(4, s + 1) as Stage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const before = alone(aloneH);
  const phonesMade = (HOURS - tradeH) * RATE.phone;
  const after = withTrade(tradeH, toWind, toSun);
  const solved = (i: number) => answers[i] === TRADE_CHECKS[i].answer;
  const score = tradeScore(answers);
  const allSolved = score === TRADE_CHECKS.length;

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity: 'trade',
        lat: cls.lat,
        lng: cls.lng,
        placeName: '무역 시뮬레이션',
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
      await save({ ...patch, step: s, picks: [aloneH, tradeH, toWind, toSun].join(',') });
      setDoneStep(s);
      setStage(next);
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  function changeTradeH(v: number) {
    setTradeH(v);
    // 만든 휴대폰보다 많이 줄 수는 없어요.
    const made = (HOURS - v) * RATE.phone;
    if (toWind + toSun > made) {
      const w = Math.min(toWind, made);
      setToWind(w);
      setToSun(Math.min(toSun, made - w));
    }
  }

  async function check(choice: string) {
    const next = answers.slice(0, idx) + choice + answers.slice(idx + 1);
    setAnswers(next);
    const q = TRADE_CHECKS[idx];
    const ok = choice === q.answer;
    setFeedback(ok ? { ok, text: `정답! ${q.explain}` } : { ok, text: `다시 생각해 볼까요? ${q.hint}` });
    try {
      await save({ labels: next, attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    }
  }

  async function finish() {
    if (!reason.trim()) return setMsg('생각을 적어 주세요.');
    await saveStep(4, { text: reason.trim() }, 4);
    onToast('저장했어요!');
  }

  const eventChoice = findEventChoice(event);
  const growCase = withTrade(NEED.wheat, 0, toSun || Math.ceil(NEED.fruit / PARTNERS[0].per));
  const consequence: Record<string, string> = {
    other: '여러 나라와 거래하면 한 나라에 일이 생겨도 덜 어려워요. 하지만 새로 거래할 나라를 찾는 데 시간이 걸리고 값이 달라질 수 있어요.',
    grow: `밀 ${NEED.wheat}시간을 직접 기르면 휴대폰이 ${growCase.phone}대 남아요. 무역할 때(${BEST_TRADE.phone}대)보다는 적지만 굶지는 않아요.`,
    store: '저장할 곳과 돈이 들지만, 갑자기 생긴 일에 대비할 수 있어요.',
    help: '어려울 때 서로 돕는 나라끼리는 오래 믿고 거래할 수 있어요.',
  };

  return (
    <>
      <div className="work-area trade">
        <ol className="trade-steps" aria-label="활동 순서">
          {STAGES.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                className={`trade-step ${stage === i + 1 ? 'trade-step--on' : ''} ${doneStep > i ? 'trade-step--done' : ''}`}
                onClick={() => setStage((i + 1) as Stage)}
                disabled={i > doneStep}
              >
                {doneStep > i ? '✅' : i + 1} {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="trade-countries">
          <section className="trade-country trade-country--home">
            <h3>
              {HOME.emoji} {HOME.name} <small>(우리 나라)</small>
            </h3>
            <p>{HOME.about}</p>
            <p className="hint">
              1시간에 📱 휴대폰 {RATE.phone}대 또는 🌾 밀 {RATE.wheat}자루 · 🍌 과일은 기를 수 없음
            </p>
          </section>
          {stage >= 2 &&
            PARTNERS.map((p) => (
              <section key={p.id} className={`trade-country ${stage >= 3 && p.id === 'wind' ? 'trade-country--trouble' : ''}`}>
                <h3>
                  {p.emoji} {p.name}
                </h3>
                <p>{p.about}</p>
                <p className="hint">
                  📱 1대 ↔ {GOODS[p.good].emoji} {GOODS[p.good].label} {p.per}
                  {GOODS[p.good].unit}
                </p>
                {stage >= 3 && p.id === 'wind' && <p className="trade-alert">🌵 가뭄!</p>}
              </section>
            ))}
        </div>

        {stage === 1 && (
          <section className="card trade-card">
            <h3>1. 무역 없이 혼자 만들어 살기</h3>
            <p>
              한 달을 살려면 🌾 밀 {NEED.wheat}자루와 🍌 과일 {NEED.fruit}송이가 필요해요. 남은 📱 휴대폰은 많을수록 좋아요. 12시간을 어떻게
              나눌까요? <Speak text={`한 달을 살려면 밀 ${NEED.wheat}자루와 과일 ${NEED.fruit}송이가 필요해요. 12시간을 어떻게 나눌까요?`} />
            </p>
            <HoursSlider value={aloneH} onChange={setAloneH} />
            <OutcomeView o={before} title="무역 없이 한 달" />
            {before.fruit < NEED.fruit && <p className="hint">🍌 과일은 기술나라의 기후에서 기를 수 없어요. 아무리 시간을 써도 0송이예요.</p>}
            <button type="button" className="btn btn--primary" onClick={() => saveStep(1, {}, 2)} disabled={saving}>
              이대로 한 달 살아 보기 →
            </button>
          </section>
        )}

        {stage === 2 && (
          <section className="card trade-card">
            <h3>2. 이웃 나라와 무역하기</h3>
            <p>
              만든 휴대폰을 이웃 나라의 밀·과일과 바꿀 수 있어요. 필요한 것을 채우고 휴대폰을 가장 많이 남겨 보세요.{' '}
              <Speak text="만든 휴대폰을 이웃 나라의 밀과 과일로 바꿀 수 있어요. 필요한 것을 채우고 휴대폰을 가장 많이 남겨 보세요." />
            </p>
            <HoursSlider value={tradeH} onChange={changeTradeH} />
            <p className="hint">만든 휴대폰: 📱 {phonesMade}대</p>
            <div className="trade-deals">
              <Stepper label="🌾 바람나라에 줄 휴대폰" value={toWind} min={0} max={phonesMade - toSun} onChange={setToWind} />
              <Stepper label="🍌 햇살나라에 줄 휴대폰" value={toSun} min={0} max={phonesMade - toWind} onChange={setToSun} />
            </div>
            <div className="trade-compare">
              <OutcomeView o={before} title="무역 전 (1단계)" />
              <OutcomeView o={after} title="무역 후" />
            </div>
            {needsMet(after) && after.phone >= BEST_TRADE.phone && (
              <p className="tag tag--good">🎉 가장 좋은 방법을 찾았어요! 휴대폰만 만들어 바꾸니 무역 전보다 훨씬 많이 남아요.</p>
            )}
            {needsMet(after) && after.phone < BEST_TRADE.phone && (
              <p className="hint">필요한 것을 모두 채웠어요! 휴대폰을 더 많이 남기는 방법도 있을까요? 밀 기르는 시간을 바꿔 보세요.</p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => (needsMet(after) ? saveStep(2, {}, 3) : setMsg('밀과 과일이 아직 모자라요. 이웃 나라와 더 바꿔 보세요.'))}
              disabled={saving}
            >
              이대로 무역하기 →
            </button>
          </section>
        )}

        {stage === 3 && (
          <section className="card trade-card">
            <h3>3. 큰일이에요!</h3>
            <p className="scenario__story">
              {EVENT.text} <Speak text={EVENT.text} />
            </p>
            <div className="choices__grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} role="radiogroup" aria-label="기술나라는 어떻게 할까요?">
              {EVENT.choices.map((c) => (
                <label key={c.id} className={`choice ${event === c.id ? 'choice--on' : ''}`}>
                  <input type="radio" name="trade-event" className="sr-only" checked={event === c.id} onChange={() => setEvent(c.id)} />
                  <span className="choice__emoji" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="choice__label">{c.label}</span>
                </label>
              ))}
            </div>
            {eventChoice && (
              <p className="hint">
                💭 생각해 볼 점: {consequence[eventChoice.id]} 정답은 없어요. 좋은 점과 아쉬운 점을 함께 생각해 봐요.
              </p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => (event ? saveStep(3, { giveUp: event }, 4) : setMsg('하나를 골라 주세요.'))}
              disabled={saving}
            >
              이렇게 할래요 →
            </button>
          </section>
        )}

        {stage === 4 && (
          <section className="card trade-card">
            <h3>4. 정리하기</h3>
            <div className="trade-compare">
              <OutcomeView o={before} title="무역 전" />
              <OutcomeView o={after} title="무역 후" />
            </div>
            <p>
              무역 없이는 과일을 구할 수 없었고 휴대폰이 최대 {BEST_ALONE.phone}대 남았어요. 무역하면 필요한 것을 모두 채우고도 최대{' '}
              {BEST_TRADE.phone}대가 남아요. 나라마다 <strong>자연환경, 자원, 기술</strong>이 달라서 서로 잘 만드는 것을 바꾸면 모두에게 이익이
              돼요.
            </p>
            {eventChoice && (
              <p className="hint">
                가뭄 때 고른 방법: {eventChoice.emoji} {eventChoice.label}
              </p>
            )}
            <p className="hint">오른쪽의 확인 문제를 풀고 생각을 적어 보세요.</p>
          </section>
        )}
        <p className="source">이 활동의 나라와 숫자는 이해를 돕기 위한 가상이에요.</p>
      </div>

      <aside className="panel" aria-live="polite">
        {doneStep < 3 ? (
          <p className="guide__text">
            왼쪽 순서대로 해 보세요. 무역 전과 후를 비교하면 나라끼리 무역하는 까닭을 알 수 있어요.{' '}
            <Speak text="왼쪽 순서대로 해 보세요. 무역 전과 후를 비교하면 나라끼리 무역하는 까닭을 알 수 있어요." />
          </p>
        ) : (
          <>
            <div className="progress" aria-label={`확인 문제 ${TRADE_CHECKS.length}개 중 ${score}개 해결`}>
              <span className="progress__bar" style={{ width: `${(score / TRADE_CHECKS.length) * 100}%` }} />
              <span className="progress__text">
                {score} / {TRADE_CHECKS.length} 해결
              </span>
            </div>
            <ol className="scenario-dots" aria-label="확인 문제 목록">
              {TRADE_CHECKS.map((q, i) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className={`dot ${i === idx ? 'dot--on' : ''} ${solved(i) ? 'dot--ok' : ''}`}
                    onClick={() => {
                      setIdx(i);
                      setFeedback(null);
                    }}
                    aria-label={`문제 ${i + 1}${solved(i) ? ' 해결' : ''}`}
                  >
                    {solved(i) ? '✅' : i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <p className="guide__text">
              {TRADE_CHECKS[idx].text} <Speak text={TRADE_CHECKS[idx].text} />
            </p>
            <div className="choice-cards">
              {TRADE_CHECKS[idx].choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`choice-card ${answers[idx] === c.id ? (c.id === TRADE_CHECKS[idx].answer ? 'choice-card--ok' : 'choice-card--no') : ''}`}
                  onClick={() => check(c.id)}
                >
                  {c.label}
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
            {feedback?.ok && idx < TRADE_CHECKS.length - 1 && (
              <button
                type="button"
                className="btn btn--block"
                onClick={() => {
                  setIdx(idx + 1);
                  setFeedback(null);
                }}
              >
                다음 문제 →
              </button>
            )}
            {allSolved && (
              <>
                <label className="field">
                  <span>우리 생활에서 다른 나라에서 온 물건을 하나 찾아 보고, 나라끼리 무역하는 까닭을 적어 보세요.</span>
                  <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
                </label>
                <button type="button" className="btn btn--primary btn--block" onClick={finish} disabled={saving}>
                  {saving ? '저장 중…' : '생각 저장하기'}
                </button>
              </>
            )}
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
