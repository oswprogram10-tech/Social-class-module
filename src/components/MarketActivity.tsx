import { useEffect, useState } from 'react';
import { MARKET_BUDGET, MARKET_ITEMS, findMarketItem, won } from '../content/market';
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

/** [4사07-01] 기회비용 장터: 한정된 용돈으로 고르고, 포기한 것 중 가장 아쉬운 것(기회비용)을 찾습니다. */
export default function MarketActivity({ cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const [picks, setPicks] = useState<string[]>([]);
  const [giveUp, setGiveUp] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    setPicks(record.picks ? record.picks.split(',').filter(Boolean) : []);
    setGiveUp(record.giveUp);
    setReason(record.text ?? '');
    setStep(record.giveUp ? 3 : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const spent = picks.reduce((sum, id) => sum + (findMarketItem(id)?.price ?? 0), 0);
  const left = MARKET_BUDGET - spent;

  function toggle(id: string) {
    if (step !== 1) return;
    setMsg('');
    if (picks.includes(id)) {
      setPicks(picks.filter((p) => p !== id));
      if (giveUp === id) setGiveUp(undefined);
      return;
    }
    const price = findMarketItem(id)?.price ?? 0;
    if (price > left) {
      setMsg(`돈이 ${won(price - left)} 모자라요. 다른 것을 빼야 살 수 있어요.`);
      return;
    }
    setPicks([...picks, id]);
  }

  async function save() {
    if (!giveUp) return setMsg('가장 아쉬운 것을 하나 골라 주세요.');
    if (!reason.trim()) return setMsg('그것을 포기한 까닭을 적어 주세요.');
    setSaving(true);
    try {
      const patch = { picks: picks.join(','), giveUp, text: reason.trim() };
      if (record) await store.updatePin(cls.code, record.id, patch);
      else
        await store.addPin(cls.code, {
          activity: 'market',
          lat: cls.lat,
          lng: cls.lng,
          placeName: '기회비용 장터',
          studentNo: student.studentNo,
          nickname: student.nickname,
          authorUid: uid,
          ...patch,
        });
      setStep(3);
      onToast('저장했어요!');
    } catch (e) {
      console.error(e);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const unpicked = MARKET_ITEMS.filter((m) => !picks.includes(m.id));
  const g = findMarketItem(giveUp);

  return (
    <>
      <div className="work-area">
        <div className="wallet" aria-live="polite">
          <span>👛 내 용돈 {won(MARKET_BUDGET)}</span>
          <span>
            쓴 돈 <strong>{won(spent)}</strong>
          </span>
          <span className={left === 0 ? 'wallet__left wallet__left--zero' : 'wallet__left'}>
            남은 돈 <strong>{won(left)}</strong>
          </span>
        </div>
        <ul className="shelf">
          {MARKET_ITEMS.map((m) => {
            const on = picks.includes(m.id);
            const lost = step >= 2 && m.id === giveUp;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className={`goods ${on ? 'goods--on' : ''} ${lost ? 'goods--lost' : ''} ${!on && m.price > left && step === 1 ? 'goods--cant' : ''}`}
                  onClick={() => (step === 2 && !on ? setGiveUp(m.id) : toggle(m.id))}
                  aria-pressed={on}
                  disabled={step === 3 || (step === 2 && on)}
                >
                  <span className="goods__emoji" aria-hidden>
                    {m.emoji}
                  </span>
                  <span className="goods__label">{m.label}</span>
                  <span className="goods__price">{won(m.price)}</span>
                  {on && <span className="goods__badge">✔ 골랐어요</span>}
                  {lost && <span className="goods__badge goods__badge--lost">기회비용</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="panel" aria-live="polite">
        {step === 1 && (
          <>
            <p className="guide__text">
              용돈 {won(MARKET_BUDGET)}으로 사고 싶은 것을 골라요. 모두 살 수는 없어요!{' '}
              <Speak text={`용돈 ${MARKET_BUDGET}원으로 사고 싶은 것을 골라요. 모두 살 수는 없어요.`} />
            </p>
            <p className="hint">고른 것: {picks.map((p) => findMarketItem(p)?.emoji).join(' ') || '없음'}</p>
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={picks.length === 0}
              onClick={() => {
                setMsg('');
                setStep(2);
              }}
            >
              다 골랐어요 →
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <p className="guide__text">
              고르지 못한 것 중에서 가장 아쉬운 것을 왼쪽에서 하나 눌러요. 그것이 나의 <strong>기회비용</strong>이에요.{' '}
              <Speak text="고르지 못한 것 중에서 가장 아쉬운 것을 하나 눌러요. 그것이 나의 기회비용이에요." />
            </p>
            {unpicked.length === 0 && <p className="hint">모든 것을 골랐어요! 정말 아쉬운 것이 없나요?</p>}
            <p className="hint">{g ? `가장 아쉬운 것: ${g.emoji} ${g.label}` : '아직 고르지 않았어요.'}</p>
            <label className="field">
              <span>왜 그것을 포기했나요?</span>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={LIMITS.text}
                placeholder="예: 만화책도 갖고 싶었지만, 친구와 나눠 먹을 과자가 더 필요했어요."
              />
            </label>
            <div className="row">
              <button type="button" className="btn" onClick={() => setStep(1)}>
                ← 다시 고르기
              </button>
              <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>
                {saving ? '저장 중…' : '저장하기'}
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="result-card">
            <h2>나의 선택</h2>
            <p>
              산 것: {picks.map((p) => `${findMarketItem(p)?.emoji} ${findMarketItem(p)?.label}`).join(', ')} ({won(spent)})
            </p>
            <p>
              기회비용: <strong>{g ? `${g.emoji} ${g.label}` : '–'}</strong>
            </p>
            <p className="hint">{reason}</p>
            <button type="button" className="btn btn--block" onClick={() => setStep(1)}>
              다시 해 보기
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
