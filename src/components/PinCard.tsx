import type { ReactNode } from 'react';
import {
  FEELINGS,
  FIXES,
  PLACE_TYPES,
  PROBLEMS,
  HERITAGE_TYPES,
  PROMO_CATS,
  SOLUTIONS,
  SOLVE_STEPS,
  SYMBOLS,
  findChoice,
  findMission,
} from '../activities';
import type { Pin } from '../data/types';
import { isMissionCorrect, type LatLng } from '../geo';
import { pinEmoji } from './MapView';
import Speak from './Speak';
import { eulReul, iGa } from '../content/josa';

function optionText(type?: string, detail?: string): string {
  const c = findChoice(SOLUTIONS, type);
  return [c ? `${c.emoji} ${c.label}` : '', detail ?? ''].filter(Boolean).join(' – ');
}

export function describePin(pin: Pin): string {
  switch (pin.activity) {
    case 'better': {
      const p = findChoice(PROBLEMS, pin.problem)?.label ?? '';
      const f = findChoice(FIXES, pin.fix)?.label ?? '';
      return `${pin.placeName}. ${p}. ${f ? iGa(f) : ''} 있으면 좋겠어요. ${pin.text}`;
    }
    case 'mission':
      return `${findMission(pin.missionId)?.title ?? '미션'}. ${pin.placeName}.`;
    case 'legend': {
      const type = findChoice(PLACE_TYPES, pin.placeType)?.label ?? '';
      const sym = findChoice(SYMBOLS, pin.symbol)?.label ?? '';
      return `${pin.placeName}. ${type ? eulReul(type) : ''} ${sym} 기호로 나타냈어요. ${pin.text}`;
    }
    case 'promote':
      return `${pin.placeName}. ${pin.slogan ?? ''}. ${pin.text}`;
    case 'heritage':
      return `${pin.placeName}. ${pin.text} 지키는 방법: ${pin.slogan ?? ''}`;
    case 'timeline':
      return `${pin.year}년. ${pin.placeName}. ${pin.text}`;
    case 'solve': {
      const chosen = pin.chosen === 'A' ? optionText(pin.optAType, pin.optADetail) : optionText(pin.optBType, pin.optBDetail);
      return [
        `${pin.placeName}의 문제. ${pin.problemText ?? ''}`,
        pin.cause ? `원인은 ${pin.cause}` : '',
        pin.chosen ? `해결 방법은 ${chosen.replace(/[^\p{L}\p{N}\s.,–-]/gu, '')}. ${pin.text}` : '',
      ]
        .filter(Boolean)
        .join(' ');
    }
    default: {
      const feel = findChoice(FEELINGS, pin.feeling)?.label ?? '';
      return `${pin.placeName}. ${feel}. ${pin.text}`;
    }
  }
}

function SolveDetail({ pin }: { pin: Pin }) {
  const step = pin.step ?? 1;
  const opt = (k: 'A' | 'B') => {
    const type = k === 'A' ? pin.optAType : pin.optBType;
    if (!type) return null;
    const detail = k === 'A' ? pin.optADetail : pin.optBDetail;
    const good = k === 'A' ? pin.optAGood : pin.optBGood;
    const bad = k === 'A' ? pin.optABad : pin.optBBad;
    return (
      <div className={`option ${pin.chosen === k ? 'option--chosen' : ''}`}>
        <strong>
          방법 {k}. {optionText(type, detail)} {pin.chosen === k && <span className="tag tag--good">선택</span>}
        </strong>
        {good && <span>👍 {good}</span>}
        {bad && <span>🤔 {bad}</span>}
      </div>
    );
  };
  return (
    <dl className="solve-detail">
      <dt>① {SOLVE_STEPS[0]}</dt>
      <dd>{pin.problemText || '–'}</dd>
      {step >= 2 && (
        <>
          <dt>② {SOLVE_STEPS[1]}</dt>
          <dd>{pin.cause || '–'}</dd>
        </>
      )}
      {step >= 3 && (
        <>
          <dt>③ {SOLVE_STEPS[2]}</dt>
          <dd>
            {opt('A')}
            {opt('B')}
          </dd>
        </>
      )}
      {step >= 4 && (
        <>
          <dt>④ {SOLVE_STEPS[3]}</dt>
          <dd>{pin.text || '–'}</dd>
        </>
      )}
    </dl>
  );
}

interface Props {
  pin: Pin;
  /** 작성자 표시 (교사 화면은 번호까지) */
  author?: string;
  children?: ReactNode;
  compact?: boolean;
  /** 미션 정답 확인에 쓰는 학교 위치 */
  school?: LatLng;
}

export default function PinCard({ pin, author, children, compact, school }: Props) {
  const feel = findChoice(FEELINGS, pin.feeling);
  const problem = findChoice(PROBLEMS, pin.problem);
  const fix = findChoice(FIXES, pin.fix);
  const mission = findMission(pin.missionId);
  const category = findChoice(pin.activity === 'heritage' ? HERITAGE_TYPES : PROMO_CATS, pin.category);
  const placeType = findChoice(PLACE_TYPES, pin.placeType);
  const symbol = pin.activity === 'legend' ? findChoice(SYMBOLS, pin.symbol) : undefined;
  const missionOk = pin.activity === 'mission' && school ? isMissionCorrect(pin.missionId, school, pin) : undefined;
  const step = pin.step ?? 1;
  const body = pin.activity === 'solve' ? pin.problemText : pin.text;
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
            {mission && <span className="tag">{mission.title}</span>}
            {category && (
              <span className="tag">
                {category.emoji} {category.label}
              </span>
            )}
            {placeType && symbol && (
              <span className="tag">
                기호 {symbol.emoji} = {placeType.label}
              </span>
            )}
            {pin.activity === 'timeline' && pin.year && <span className="tag">{pin.year}년</span>}
            {missionOk !== undefined &&
              (missionOk ? <span className="tag tag--good">✅ 성공</span> : <span className="tag tag--warn">🔁 다시 도전</span>)}
            {pin.activity === 'mission' && pin.attempts ? <span className="tag tag--muted">{pin.attempts}번 시도</span> : null}
            {pin.activity === 'solve' &&
              (step >= 4 ? (
                <span className="tag tag--good">완성</span>
              ) : (
                <span className="tag tag--muted">
                  {step}/4 {SOLVE_STEPS[step - 1]}
                </span>
              ))}
            {!pin.approved && pin.activity !== 'mission' && <span className="tag tag--muted">선생님 확인 중</span>}
            {pin.hidden && <span className="tag tag--muted">숨김</span>}
          </span>
        </div>
        {!compact && <Speak text={describePin(pin)} />}
      </div>
      {pin.activity === 'promote' && pin.slogan && <p className={`slogan ${compact ? 'slogan--small' : ''}`}>“{pin.slogan}”</p>}
      {pin.activity === 'solve' && !compact ? (
        <SolveDetail pin={pin} />
      ) : (
        body && <p className="pin-card__text">{body}</p>
      )}
      {pin.activity === 'heritage' && pin.slogan && !compact && <p className="pin-card__text">🛡️ 지키는 방법: {pin.slogan}</p>}
      <div className="pin-card__foot">
        {author && <span className="pin-card__author">{author}</span>}
        {pin.activity !== 'mission' && pin.activity !== 'timeline' && (
          <span className="pin-card__likes" aria-label={`공감 ${pin.likes}개`}>
            💛 {pin.likes}
          </span>
        )}
      </div>
      {children && <div className="pin-card__actions">{children}</div>}
    </article>
  );
}
