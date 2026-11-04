import { useState, type FormEvent } from 'react';
import {
  ACTIVITIES,
  FEELINGS,
  FIXES,
  PLACE_TYPES,
  PROBLEMS,
  HERITAGE_TYPES, PROMO_CATS,
  SYMBOLS,
  type ActivityId,
  type Choice,
} from '../activities';
import { LIMITS } from '../data/common';
import type { Pin } from '../data/types';
import Speak from './Speak';

export interface PinFormValues {
  placeName: string;
  text: string;
  feeling?: string;
  problem?: string;
  fix?: string;
  category?: string;
  slogan?: string;
  placeType?: string;
  symbol?: string;
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

const PLACEHOLDER: Partial<Record<ActivityId, string>> = {
  feel: '예: 놀이터, 문구점, 도서관',
  better: '예: 학교 앞 큰길',
  legend: '예: 행복소아과, 꿈나무도서관',
  promote: '예: 한강 공원, ○○ 축제',
  heritage: '예: ○○ 향교, ○○ 3·1 운동 기념비',
};

const TEXT_LABEL: Partial<Record<ActivityId, string>> = {
  feel: '왜 그런 느낌이 들었나요?',
  better: '왜 그렇게 하면 좋아질까요?',
  legend: '왜 이 기호를 골랐나요?',
  promote: '무엇을 자랑하고 싶나요?',
  heritage: '이 문화유산은 왜 소중할까요?',
};

export default function PinForm({ activity, initial, saving, onSubmit, onCancel }: Props) {
  const [placeName, setPlaceName] = useState(initial?.placeName ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [feeling, setFeeling] = useState(initial?.feeling);
  const [problem, setProblem] = useState(initial?.problem);
  const [fix, setFix] = useState(initial?.fix);
  const [category, setCategory] = useState(initial?.category);
  const [slogan, setSlogan] = useState(initial?.slogan ?? '');
  const [placeType, setPlaceType] = useState(initial?.placeType);
  const [symbol, setSymbol] = useState(initial?.symbol);
  const [msg, setMsg] = useState('');

  const textLabel = TEXT_LABEL[activity] ?? '왜 그렇게 생각했나요?';

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!placeName.trim()) return setMsg('장소 이름을 적어 주세요.');
    let extra: Partial<PinFormValues> = {};
    switch (activity) {
      case 'feel':
        if (!feeling) return setMsg('느낌을 하나 골라 주세요.');
        extra = { feeling };
        break;
      case 'better':
        if (!problem || !fix) return setMsg('문제와 바꾸고 싶은 것을 골라 주세요.');
        extra = { problem, fix };
        break;
      case 'legend':
        if (!placeType || !symbol) return setMsg('장소 종류와 기호를 골라 주세요.');
        if (!text.trim()) return setMsg('이 기호를 고른 까닭을 적어 주세요.');
        extra = { placeType, symbol };
        break;
      case 'heritage':
        if (!category) return setMsg('문화유산 종류를 골라 주세요.');
        if (!text.trim()) return setMsg('왜 소중한지 적어 주세요.');
        if (!slogan.trim()) return setMsg('지키는 방법을 적어 주세요.');
        extra = { category, slogan: slogan.trim() };
        break;
      case 'promote':
        if (!category) return setMsg('자랑거리 종류를 골라 주세요.');
        if (!slogan.trim()) return setMsg('한 줄 홍보 문구를 만들어 주세요.');
        extra = { category, slogan: slogan.trim() };
        break;
    }
    onSubmit({ placeName: placeName.trim(), text: text.trim(), ...extra });
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
          placeholder={PLACEHOLDER[activity]}
          maxLength={LIMITS.placeName}
          autoFocus
        />
      </label>

      {activity === 'feel' && (
        <ChoiceGrid legend="어떤 느낌이 드나요?" name="feeling" choices={FEELINGS} value={feeling} onChange={setFeeling} />
      )}
      {activity === 'better' && (
        <>
          <ChoiceGrid legend="어떤 문제가 있나요?" name="problem" choices={PROBLEMS} value={problem} onChange={setProblem} />
          <ChoiceGrid legend="무엇이 생기면 좋을까요?" name="fix" choices={FIXES} value={fix} onChange={setFix} />
        </>
      )}
      {activity === 'legend' && (
        <>
          <ChoiceGrid legend="어떤 장소인가요?" name="placeType" choices={PLACE_TYPES} value={placeType} onChange={setPlaceType} />
          <ChoiceGrid legend="어떤 기호로 나타낼까요?" name="symbol" choices={SYMBOLS} value={symbol} onChange={setSymbol} />
        </>
      )}
      {activity === 'promote' && (
        <>
          <ChoiceGrid legend="어떤 자랑거리인가요?" name="category" choices={PROMO_CATS} value={category} onChange={setCategory} columns={3} />
          <label className="field">
            <span>
              한 줄 홍보 문구 <Speak text="다른 지역 사람이 가 보고 싶어지는 한 줄 홍보 문구를 만들어요" />
            </span>
            <input
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="예: 봄꽃이 가득한 우리 동네로 놀러 오세요!"
              maxLength={LIMITS.slogan}
            />
          </label>
        </>
      )}

      {activity === 'heritage' && (
        <ChoiceGrid legend="어떤 문화유산인가요?" name="category" choices={HERITAGE_TYPES} value={category} onChange={setCategory} columns={3} />
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

      {activity === 'heritage' && (
        <label className="field">
          <span>
            🛡️ 이 문화유산을 지키려면? <Speak text="이 문화유산을 지키려면 우리가 무엇을 할 수 있을까요?" />
          </span>
          <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="예: 낙서하지 않고 친구들에게 알리기" maxLength={LIMITS.slogan} />
        </label>
      )}

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
