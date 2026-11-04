import { useState, type FormEvent, useId } from 'react';
import { TIMELINE_ICONS, findChoice } from '../activities';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import { ChoiceGrid } from './PinForm';
import Speak from './Speak';

const THIS_YEAR = new Date().getFullYear();

/** 연표 그림: 왼쪽이 옛날, 오른쪽이 최근 */
export function TimelineView({
  events,
  selectedId,
  onSelect,
  title,
}: {
  events: Pin[];
  selectedId?: string | null;
  onSelect?: (pin: Pin) => void;
  title?: string;
}) {
  const sorted = [...events].sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || a.createdAt - b.createdAt);
  return (
    <section className="timeline" aria-label={title ?? '연표'}>
      {title && <h3 className="timeline__title">{title}</h3>}
      {sorted.length === 0 ? (
        <p className="hint">아직 적은 일이 없어요.</p>
      ) : (
        <ol className="timeline__track">
          {sorted.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`timeline__item ${p.id === selectedId ? 'timeline__item--on' : ''}`}
                onClick={() => onSelect?.(p)}
                disabled={!onSelect}
              >
                <span className="timeline__year">{p.year}년</span>
                <span className="timeline__dot" aria-hidden>
                  {findChoice(TIMELINE_ICONS, p.symbol)?.emoji ?? '⭐'}
                </span>
                <span className="timeline__event">{p.placeName}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="timeline__arrow" aria-hidden>
        <span>옛날</span>
        <span>→</span>
        <span>지금</span>
      </div>
    </section>
  );
}

interface PanelProps {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myPins: Pin[];
  selected: Pin | undefined;
  onSelect: (id: string | null) => void;
  questions: string[];
  onToast: (msg: string) => void;
}

/** [4사02-01] 나의 연표: 사건을 연도와 함께 적습니다. 나와 선생님만 볼 수 있습니다. */
export function TimelinePanel({ cls, store, uid, student, myPins, selected, onSelect, questions, onToast }: PanelProps) {
  const fieldId = useId();
  const [editing, setEditing] = useState<Pin | 'new' | null>(null);
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<string | undefined>();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function start(p?: Pin) {
    setEditing(p ?? 'new');
    setYear(p?.year ? String(p.year) : '');
    setTitle(p?.placeName ?? '');
    setIcon(p?.symbol);
    setText(p?.text ?? '');
    setMsg('');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1950 || y > THIS_YEAR + 1) return setMsg(`연도를 1950~${THIS_YEAR} 사이의 숫자로 적어 주세요.`);
    if (!title.trim()) return setMsg('어떤 일이 있었는지 적어 주세요.');
    if (!icon) return setMsg('그림을 하나 골라 주세요.');
    setSaving(true);
    try {
      if (editing === 'new') {
        await store.addPin(cls.code, {
          activity: 'timeline',
          lat: cls.lat,
          lng: cls.lng,
          year: y,
          placeName: title.trim(),
          symbol: icon,
          text: text.trim(),
          studentNo: student.studentNo,
          nickname: student.nickname,
          authorUid: uid,
        });
        onToast('연표에 넣었어요!');
      } else if (editing) {
        await store.updatePin(cls.code, editing.id, { year: y, placeName: title.trim(), symbol: icon, text: text.trim() });
      }
      setEditing(null);
    } catch (err) {
      console.error(err);
      setMsg('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Pin) {
    if (!confirm('이 일을 연표에서 지울까요?')) return;
    await store.deletePin(cls.code, p.id).catch(console.error);
    onSelect(null);
  }

  if (editing) {
    return (
      <form className="pin-form" onSubmit={save} noValidate>
        <h2>{editing === 'new' ? '연표에 일 넣기' : '고치기'}</h2>
        <div className="row">
          <label className="field">
            <span>연도</span>
            <input
              type="number"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={String(THIS_YEAR - 3)}
              min={1950}
              max={THIS_YEAR + 1}
              autoFocus
            />
          </label>
          <div className="field field--grow">
            <span>
              <label htmlFor={`${fieldId}-1`}>어떤 일이 있었나요?</label> <Speak text="어떤 일이 있었나요?" />
            </span>
            <input id={`${fieldId}-1`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={LIMITS.placeName} placeholder="예: 동생이 태어났어요" />
          </div>
        </div>
        <ChoiceGrid legend="그림 고르기" name="icon" choices={TIMELINE_ICONS} value={icon} onChange={setIcon} columns={5} />
        <label className="field">
          <span>더 적고 싶은 이야기 (안 적어도 돼요)</span>
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.text} />
        </label>
        {msg && (
          <p className="error" role="alert">
            {msg}
          </p>
        )}
        <div className="row">
          <button type="button" className="btn" onClick={() => setEditing(null)}>
            취소
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    );
  }

  if (selected) {
    return (
      <>
        <article className="pin-card">
          <div className="pin-card__head">
            <span className="pin-card__emoji" aria-hidden>
              {findChoice(TIMELINE_ICONS, selected.symbol)?.emoji ?? '⭐'}
            </span>
            <div className="pin-card__title">
              <strong>{selected.placeName}</strong>
              <span className="pin-card__tags">
                <span className="tag">{selected.year}년</span>
              </span>
            </div>
            <Speak text={`${selected.year}년. ${selected.placeName}. ${selected.text}`} />
          </div>
          {selected.text && <p className="pin-card__text">{selected.text}</p>}
          <div className="pin-card__actions">
            <button type="button" className="btn" onClick={() => start(selected)}>
              ✏️ 고치기
            </button>
            <button type="button" className="btn btn--danger" onClick={() => remove(selected)}>
              🗑️ 지우기
            </button>
          </div>
        </article>
        <button type="button" className="btn btn--block" onClick={() => onSelect(null)}>
          닫기
        </button>
      </>
    );
  }

  return (
    <div className="guide">
      <p className="guide__text">
        내가 태어난 해부터 지금까지 기억에 남는 일을 연도와 함께 넣어요.{' '}
        <Speak text="내가 태어난 해부터 지금까지 기억에 남는 일을 연도와 함께 넣어요. 연표는 나와 선생님만 볼 수 있어요." />
      </p>
      <p className="hint">🔒 연표는 나와 선생님만 볼 수 있어요.</p>
      <button type="button" className="btn btn--primary btn--block" onClick={() => start()}>
        ➕ 연표에 일 넣기
      </button>
      <p className="hint">지금까지 {myPins.length}개를 넣었어요. 연표의 일을 누르면 고칠 수 있어요.</p>
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
    </div>
  );
}
