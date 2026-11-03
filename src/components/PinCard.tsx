import type { ReactNode } from 'react';
import { FEELINGS, FIXES, PROBLEMS, findChoice } from '../activities';
import type { Pin } from '../data/types';
import { pinEmoji } from './MapView';
import Speak from './Speak';

export function describePin(pin: Pin): string {
  if (pin.activity === 'better') {
    const p = findChoice(PROBLEMS, pin.problem)?.label ?? '';
    const f = findChoice(FIXES, pin.fix)?.label ?? '';
    return `${pin.placeName}. ${p}. ${f}이(가) 있으면 좋겠어요. ${pin.text}`;
  }
  const feel = findChoice(FEELINGS, pin.feeling)?.label ?? '';
  return `${pin.placeName}. ${feel}. ${pin.text}`;
}

interface Props {
  pin: Pin;
  /** 작성자 표시 (교사 화면은 번호까지) */
  author?: string;
  children?: ReactNode;
  compact?: boolean;
}

export default function PinCard({ pin, author, children, compact }: Props) {
  const feel = findChoice(FEELINGS, pin.feeling);
  const problem = findChoice(PROBLEMS, pin.problem);
  const fix = findChoice(FIXES, pin.fix);
  return (
    <article className={`pin-card ${compact ? 'pin-card--compact' : ''}`}>
      <div className="pin-card__head">
        <span className="pin-card__emoji" aria-hidden>
          {pinEmoji(pin)}
        </span>
        <div className="pin-card__title">
          <strong>{pin.placeName || '이름 없는 장소'}</strong>
          <span className="pin-card__tags">
            {feel && <span className="tag">{feel.label}</span>}
            {problem && (
              <span className="tag tag--warn">
                {problem.emoji} {problem.label}
              </span>
            )}
            {fix && (
              <span className="tag tag--good">
                {fix.emoji} {fix.label}
              </span>
            )}
            {!pin.approved && <span className="tag tag--muted">선생님 확인 중</span>}
            {pin.hidden && <span className="tag tag--muted">숨김</span>}
          </span>
        </div>
        {!compact && <Speak text={describePin(pin)} />}
      </div>
      {pin.text && <p className="pin-card__text">{pin.text}</p>}
      <div className="pin-card__foot">
        {author && <span className="pin-card__author">{author}</span>}
        <span className="pin-card__likes" aria-label={`공감 ${pin.likes}개`}>
          💛 {pin.likes}
        </span>
      </div>
      {children && <div className="pin-card__actions">{children}</div>}
    </article>
  );
}
