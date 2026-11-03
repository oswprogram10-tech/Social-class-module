import { useState, type FormEvent } from 'react';
import { ACTIVITIES, FEELINGS, FIXES, PROBLEMS, type ActivityId, type Choice } from '../activities';
import { LIMITS } from '../data/common';
import type { Pin } from '../data/types';
import Speak from './Speak';

export interface PinFormValues {
  placeName: string;
  text: string;
  feeling?: string;
  problem?: string;
  fix?: string;
}

interface Props {
  activity: ActivityId;
  initial?: Pin;
  saving?: boolean;
  onSubmit: (values: PinFormValues) => void;
  onCancel: () => void;
}

export function ChoiceGrid({
  legend,
  choices,
  value,
  onChange,
  name,
  columns = 4,
}: {
  legend: string;
  choices: Choice[];
  value?: string;
  onChange: (id: string) => void;
  name: string;
  columns?: number;
}) {
  return (
    <fieldset className="choices">
      <legend>
        {legend} <Speak text={legend} />
      </legend>
      <div className="choices__grid" role="radiogroup" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {choices.map((c) => (
          <label key={c.id} className={`choice ${value === c.id ? 'choice--on' : ''}`}>
            <input
              type="radio"
              name={name}
              value={c.id}
              checked={value === c.id}
              onChange={() => onChange(c.id)}
              className="sr-only"
            />
            <span className="choice__emoji" aria-hidden>
              {c.emoji}
            </span>
            <span className="choice__label">{c.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function PinForm({ activity, initial, saving, onSubmit, onCancel }: Props) {
  const [placeName, setPlaceName] = useState(initial?.placeName ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [feeling, setFeeling] = useState(initial?.feeling);
  const [problem, setProblem] = useState(initial?.problem);
  const [fix, setFix] = useState(initial?.fix);
  const [msg, setMsg] = useState('');

  const isFeel = activity === 'feel';
  const textLabel = isFeel ? '왜 그런 느낌이 들었나요?' : '왜 그렇게 하면 좋아질까요?';

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!placeName.trim()) return setMsg('장소 이름을 적어 주세요.');
    if (isFeel && !feeling) return setMsg('느낌을 하나 골라 주세요.');
    if (!isFeel && (!problem || !fix)) return setMsg('문제와 바꾸고 싶은 것을 골라 주세요.');
    onSubmit({
      placeName: placeName.trim(),
      text: text.trim(),
      ...(isFeel ? { feeling } : { problem, fix }),
    });
  }

  return (
    <form className="pin-form" onSubmit={submit}>
      <h2>
        {initial ? '고치기' : ACTIVITIES[activity].title}
      </h2>
      <label className="field">
        <span>
          장소 이름 <Speak text="장소 이름을 적어 주세요" />
        </span>
        <input
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder={isFeel ? '예: 놀이터, 문구점, 도서관' : '예: 학교 앞 큰길'}
          maxLength={LIMITS.placeName}
          autoFocus
        />
      </label>

      {isFeel ? (
        <ChoiceGrid legend="어떤 느낌이 드나요?" name="feeling" choices={FEELINGS} value={feeling} onChange={setFeeling} />
      ) : (
        <>
          <ChoiceGrid legend="어떤 문제가 있나요?" name="problem" choices={PROBLEMS} value={problem} onChange={setProblem} />
          <ChoiceGrid legend="무엇이 생기면 좋을까요?" name="fix" choices={FIXES} value={fix} onChange={setFix} />
        </>
      )}

      <label className="field">
        <span>
          {textLabel} <Speak text={textLabel} />
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={LIMITS.text}
          placeholder="한두 문장으로 적어 보세요."
        />
        <span className="counter">
          {text.length}/{LIMITS.text}
        </span>
      </label>

      {msg && (
        <p className="error" role="alert">
          {msg}
        </p>
      )}
      <div className="row">
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? '저장 중…' : initial ? '고치기 완료' : '지도에 남기기'}
        </button>
      </div>
    </form>
  );
}
