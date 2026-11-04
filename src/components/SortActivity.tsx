import { useEffect, useState } from 'react';
import type { ActivityId } from '../activities';
import { cardChoices, isRight, sortCards, sortScore, type SortSet } from '../content/sorts';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import CommonsPhoto from './CommonsPhoto';
import StoryChart from './StoryChart';
import Speak from './Speak';

interface Props {
  activity: ActivityId;
  set: SortSet;
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

/** 분류하기: 카드마다 알맞은 무리를 고르면 바로 확인하고, 틀리면 힌트를 줍니다. */
export default function SortActivity({ activity, set, cls, store, uid, student, myRecords, questions, onToast }: Props) {
  const record = myRecords[0];
  const cards = sortCards(set);
  const n = cards.length;
  const [labels, setLabels] = useState('-'.repeat(n));
  const [section, setSection] = useState(0);
  const [hint, setHint] = useState<{ i: number; text: string } | null>(null);
  /** 화면 읽기 프로그램에 바로 알려 줄 확인 결과 */
  const [announce, setAnnounce] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    const l = (record.labels ?? '').padEnd(n, '-').slice(0, n);
    setLabels(l);
    setReason(record.text ?? '');
    // 처음으로 덜 끝낸 무리부터 보여 줍니다.
    const firstOpen = set.sections.findIndex((_, si) => cards.some((c, i) => c.section === si && !isRight(c, l[i])));
    setSection(firstOpen === -1 ? set.sections.length - 1 : firstOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  const score = sortScore(set, labels);
  const allDone = score === n;
  const sec = set.sections[section];
  const secDone = (si: number) => cards.every((c, i) => c.section !== si || isRight(c, labels[i]));

  async function save(patch: Partial<Pin>) {
    if (record) await store.updatePin(cls.code, record.id, patch);
    else
      await store.addPin(cls.code, {
        activity,
        lat: cls.lat,
        lng: cls.lng,
        placeName: set.placeName.slice(0, LIMITS.placeName),
        text: '',
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
        ...patch,
      });
  }

  async function pick(i: number, cat: string) {
    if (isRight(cards[i], labels[i])) return;
    const next = labels.slice(0, i) + cat + labels.slice(i + 1);
    setLabels(next);
    const right = cards[i].answer.includes(cat);
    setHint(right ? null : { i, text: cards[i].hint });
    setAnnounce(right ? `${cards[i].text}: 맞아요!` : `${cards[i].text}: 다시 생각해 볼까요? 힌트: ${cards[i].hint}`);
    try {
      await save({ labels: next, attempts: (record?.attempts ?? 0) + 1 });
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요.');
    }
  }

  async function finish() {
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

  return (
    <>
      <div className="work-area sort">
        {set.sections.length > 1 && (
          <div className="sort-tabs" role="group" aria-label="활동 순서">
            {set.sections.map((s, si) => (
              <button
                key={s.title}
                type="button"
                aria-pressed={si === section}
                className={`chip-btn ${si === section ? 'chip-btn--on' : ''}`}
                onClick={() => {
                  setSection(si);
                  setHint(null);
                }}
              >
                {secDone(si) ? '✅' : `${si + 1}.`} {s.title}
              </button>
            ))}
          </div>
        )}
        <h3 className="sort-title">{sec.title}</h3>
        <p className="guide__text">
          {sec.prompt} <Speak text={sec.prompt} />
        </p>
        {sec.story && (
          <article className="sort-story">
            <p className="sort-story__label">
              {sec.story.emoji && <span aria-hidden>{sec.story.emoji} </span>}
              {sec.story.label}
            </p>
            {sec.story.photo && (
              <CommonsPhoto photo={sec.story.photo} alt={sec.title} fallback={sec.story.emoji ?? '🖼️'} width={480} className="lf-photo sort-photo" />
            )}
            {sec.story.paragraphs.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {sec.story.chart && <StoryChart chart={sec.story.chart} />}
            <Speak
              text={[
                ...sec.story.paragraphs,
                ...(sec.story.chart
                  ? [`${sec.story.chart.title}, 단위 ${sec.story.chart.unit}.`, ...sec.story.chart.points.map((p) => `${p.label}년 ${p.value}`)]
                  : []),
              ].join(' ')}
              label="읽을거리 읽어주기"
            />
          </article>
        )}
        {sec.categories.length > 0 && (
        <div className="sort-legend">
          {sec.categories.map((c) => (
            <span key={c.id} className="sort-legend__item">
              <strong>
                {c.emoji} {c.label}
              </strong>
              {c.note && <small>{c.note}</small>}
            </span>
          ))}
        </div>
        )}
        <p className="sr-only" role="status">
          {announce}
        </p>
        <ol className="sort-cards">
          {cards.map((card, i) => {
            if (card.section !== section) return null;
            const chosen = labels[i];
            const ok = isRight(card, chosen);
            const wrong = chosen !== '-' && !ok;
            return (
              <li key={i} className={`sort-card ${ok ? 'sort-card--ok' : ''} ${wrong ? 'sort-card--no' : ''}`}>
                {card.photo && <CommonsPhoto photo={card.photo} alt={card.text} fallback={card.emoji ?? '🖼️'} width={480} className="lf-photo sort-photo" />}
                <p className="sort-card__text">
                  {card.emoji && <span aria-hidden>{card.emoji} </span>}
                  {card.text} <Speak text={card.text} />
                </p>
                <div className="sort-card__choices" role="group" aria-label={`“${card.text}” 어디에 들어갈까요?`}>
                  {cardChoices(set, card).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`sort-choice ${chosen === c.id ? (ok ? 'sort-choice--ok' : 'sort-choice--no') : ''}`}
                      aria-pressed={chosen === c.id}
                      onClick={() => pick(i, c.id)}
                      disabled={ok && chosen !== c.id}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
                {ok && <p className="sort-card__ok">✅ 맞아요!</p>}
                {wrong && hint?.i === i && <p className="sort-card__hint">💡 {hint.text}</p>}
                {wrong && hint?.i !== i && <p className="sort-card__hint">💡 다시 생각해 볼까요?</p>}
              </li>
            );
          })}
        </ol>
        {secDone(section) && section < set.sections.length - 1 && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setSection(section + 1);
              setHint(null);
            }}
          >
            다음: {set.sections[section + 1].title} →
          </button>
        )}
      </div>

      <aside className="panel" aria-live="polite">
        <div className="progress" aria-label={`카드 ${n}개 중 ${score}개 해결`}>
          <span className="progress__bar" style={{ width: `${(score / n) * 100}%` }} />
          <span className="progress__text">
            {score} / {n} 해결
          </span>
        </div>
        {allDone ? (
          <>
            <p className="guide__text">
              🎉 모두 알맞게 나눴어요! {set.open} <Speak text={`모두 알맞게 나눴어요! ${set.open}`} />
            </p>
            <label className="field">
              <span className="sr-only">{set.open}</span>
              <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={LIMITS.text} />
            </label>
            <button type="button" className="btn btn--primary btn--block" onClick={finish} disabled={saving}>
              {saving ? '저장 중…' : '생각 저장하기'}
            </button>
          </>
        ) : (
          <p className="guide__text">
            카드마다 알맞은 것을 눌러요. 틀리면 힌트가 나와요. 모두 맞히면 마지막 질문이 나와요.{' '}
            <Speak text="카드마다 알맞은 것을 눌러요. 틀리면 힌트가 나와요. 모두 맞히면 마지막 질문이 나와요." />
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
      </aside>
    </>
  );
}
