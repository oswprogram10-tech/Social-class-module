import { useState } from 'react';
import { PRINCIPLES, SCENARIOS, findPrinciple } from '../content/election';
import { SOURCE_TYPES, TRUST_LEVELS, gradeLabels, splitSentences, type FactItem, type FactLabel } from '../content/factcheck';
import { MARKET_ITEMS, findMarketItem, won } from '../content/market';
import type { ClassRoom, Pin } from '../data/types';
import { factItemsFor } from './FactcheckActivity';
import { aiFactDraft } from '../ai/prompts';
import { loadAiConfig } from '../ai/localAi';
import { AiButton, AiDraftNote, useAiConfig } from './LocalAi';
import { QUIZZES, isCorrect, parseAnswers, quizScore } from '../content/quizzes';
import { HISTORY_ANSWER, HISTORY_EVENTS, findEvent, historyScore } from '../content/history';
import { CITIES, PROVINCES } from '../content/korea-data';
import { COUNTRY_KO } from '../content/countries-ko';
import { CONTINENTS } from '../content/world-pop';
import { worldCityName } from '../content/world-climate';
import {
  TRADE_CHECKS,
  alone,
  findEventChoice,
  outcomeText,
  parseTradePicks,
  tradeScore,
  withTrade,
} from '../content/trade';

const CONTINENT_NAME: Record<string, string> = Object.fromEntries(CONTINENTS.map((c) => [c.id, c.name]));

/** 학생별로 기록을 묶습니다 (체험 모드에서도 섞이지 않게 번호까지 함께) */
function byStudent(pins: Pin[]) {
  const map = new Map<string, { label: string; no: number; pins: Pin[] }>();
  pins.forEach((p) => {
    const key = `${p.authorUid}:${p.studentNo}`;
    const s = map.get(key) ?? { label: `${p.studentNo}${p.nickname ? ` ${p.nickname}` : ''}`, no: p.studentNo, pins: [] };
    s.pins.push(p);
    map.set(key, s);
  });
  return [...map.values()].sort((a, b) => a.no - b.no);
}

function Empty() {
  return <p className="hint">아직 참여한 학생이 없어요. 학생 화면에 이 활동이 열려 있어요.</p>;
}

const trustEmoji = (id?: string) => TRUST_LEVELS.find((t) => t.id === id)?.emoji ?? '';

export function FactcheckResults({ pins, cls, onSelect }: { pins: Pin[]; cls: ClassRoom; onSelect: (p: Pin) => void }) {
  const items = factItemsFor(cls);
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 팩트체크 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            {items.map((it, i) => (
              <th key={it.id} scope="col" title={it.title}>
                자료 {i + 1}
                <br />
                <small>{it.source}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {items.map((it) => {
                const p = r.pins.find((x) => x.itemId === it.id);
                if (!p?.labels) return <td key={it.id}>·</td>;
                const g = gradeLabels(it, p.labels);
                return (
                  <td key={it.id}>
                    <button type="button" className="cell" onClick={() => onSelect(p)} title={`${p.attempts ?? 1}번 확인`}>
                      {g.correct}/{g.total} {trustEmoji(p.trust)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">숫자: 사실·의견을 맞힌 문장 수(마지막으로 확인한 결과) · 👍 믿을 만해요 · 🤔 더 확인 · ⚠️ 믿기 어려워요</p>
    </div>
  );
}

export function MarketResults({ pins, onSelect }: { pins: Pin[]; onSelect: (p: Pin) => void }) {
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 기회비용 장터 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">산 것</th>
            <th scope="col">쓴 돈</th>
            <th scope="col">기회비용</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = r.pins[0];
            const picks = (p.picks ?? '').split(',').filter(Boolean);
            const spent = picks.reduce((s, id) => s + (findMarketItem(id)?.price ?? 0), 0);
            const g = findMarketItem(p.giveUp);
            return (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>
                  <button type="button" className="cell" onClick={() => onSelect(p)}>
                    {picks.map((id) => findMarketItem(id)?.emoji).join(' ')}
                  </button>
                </td>
                <td>{won(spent)}</td>
                <td>{g ? `${g.emoji} ${g.label}` : '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 무역 시뮬레이션: 무역 전·후 결과, 가뭄 때 선택, 확인 문제 */
function tradeOutcomes(p: Pin) {
  const t = parseTradePicks(p.picks);
  if (!t) return null;
  return { before: alone(t.aloneH), after: withTrade(t.tradeH, t.toWind, t.toSun) };
}

/** CSV 열: 무역 전, 무역 후, 가뭄 때 선택, 확인 문제 */
export function tradeCsv(p: Pin): string[] {
  if (p.activity !== 'trade') return ['', '', '', ''];
  const o = tradeOutcomes(p);
  const s = p.step ?? 1;
  return [
    o ? `밀${o.before.wheat} 과일${o.before.fruit} 휴대폰${o.before.phone}` : '',
    o && s >= 2 ? `밀${o.after.wheat} 과일${o.after.fruit} 휴대폰${o.after.phone}` : '',
    findEventChoice(p.giveUp)?.label ?? '',
    `${tradeScore(p.labels)}/${TRADE_CHECKS.length}`,
  ];
}

export function TradeResults({ pins, onSelect }: { pins: Pin[]; onSelect: (p: Pin) => void }) {
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 무역 시뮬레이션 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">단계</th>
            <th scope="col">무역 전</th>
            <th scope="col">무역 후</th>
            <th scope="col">가뭄 때</th>
            <th scope="col">확인 문제</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = r.pins[0];
            const o = tradeOutcomes(p);
            const s = p.step ?? 1;
            const ev = findEventChoice(p.giveUp);
            return (
              <tr key={r.label}>
                <th scope="row">
                  <button type="button" className="cell" onClick={() => onSelect(p)}>
                    {r.label}
                  </button>
                </th>
                <td>{s}/4</td>
                <td>{o ? outcomeText(o.before) : '–'}</td>
                <td>{o && s >= 2 ? outcomeText(o.after) : '–'}</td>
                <td>{ev ? `${ev.emoji} ${ev.label}` : '–'}</td>
                <td>
                  {tradeScore(p.labels)}/{TRADE_CHECKS.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ElectionResults({ pins, onSelect }: { pins: Pin[]; onSelect: (p: Pin) => void }) {
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 선거 4원칙 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            {SCENARIOS.map((s, i) => (
              <th key={s.id} scope="col" title={s.story}>
                {i + 1}
              </th>
            ))}
            <th scope="col">해결</th>
            <th scope="col">가장 중요한 원칙</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = r.pins[0];
            let ok = 0;
            return (
              <tr key={r.label}>
                <th scope="row">
                  <button type="button" className="cell" onClick={() => onSelect(p)}>
                    {r.label}
                  </button>
                </th>
                {SCENARIOS.map((s, i) => {
                  const a = p.labels?.[i];
                  if (!a || a === '-') return <td key={s.id}>·</td>;
                  if (a === s.answer) ok++;
                  return <td key={s.id}>{a === s.answer ? '✅' : '❌'}</td>;
                })}
                <td className="progress-table__sum">{ok}</td>
                <td>{findPrinciple(p.picks)?.label ?? '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint">❌는 마지막으로 고른 답이 틀린 이야기예요. 시도 횟수는 학생을 눌러 볼 수 있어요.</p>
    </div>
  );
}

/** 교사가 우리 반에 맞는 팩트체크 자료를 직접 만듭니다 */
export function FactItemEditor({ cls, onSave }: { cls: ClassRoom; onSave: (items: FactItem[]) => void }) {
  const custom = cls.factItems ?? [];
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState(SOURCE_TYPES[0]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [sentences, setSentences] = useState<{ text: string; answer: FactLabel }[] | null>(null);
  const [msg, setMsg] = useState('');
  const [topic, setTopic] = useState('');
  const [fromAi, setFromAi] = useState(false);
  const aiCfg = useAiConfig();

  function reset() {
    setFromAi(false);
    setTopic('');
    setTitle('');
    setAuthor('');
    setText('');
    setSentences(null);
    setMsg('');
  }

  function split() {
    const list = splitSentences(text).map((t) => t.slice(0, 120));
    if (list.length < 2) return setMsg('문장이 두 개 이상 필요해요. 문장 끝에 마침표를 찍어 주세요.');
    if (list.length > 12) return setMsg('문장은 12개까지 넣을 수 있어요.');
    setMsg('');
    setSentences(list.map((t) => ({ text: t, answer: 'F' })));
  }

  function save() {
    if (!title.trim() || !sentences) return setMsg('제목과 문장을 넣어 주세요.');
    const item: FactItem = {
      id: `c${Date.now().toString(36)}`,
      title: title.trim().slice(0, 60),
      source,
      author: author.trim().slice(0, 40) || '선생님이 만든 자료',
      sentences,
      custom: true,
    };
    onSave([...custom, item]);
    reset();
    setOpen(false);
  }

  return (
    <section className="card fact-editor">
      <h2>🗞️ 우리 반 자료</h2>
      <p className="hint">기본 자료 3개 외에 우리 반에 맞는 자료를 {10 - custom.length}개 더 만들 수 있어요.</p>
      {custom.length > 0 && (
        <ul className="fact-editor__list">
          {custom.map((it) => (
            <li key={it.id}>
              <span>
                {it.source} · {it.title}
              </span>
              <button
                type="button"
                className="btn btn--small btn--danger"
                onClick={() => confirm('이 자료를 지울까요? 학생 기록은 남아 있어요.') && onSave(custom.filter((c) => c.id !== it.id))}
              >
                지우기
              </button>
            </li>
          ))}
        </ul>
      )}
      {!open ? (
        <button type="button" className="btn btn--small" onClick={() => setOpen(true)} disabled={custom.length >= 10}>
          ➕ 자료 만들기
        </button>
      ) : (
        <div className="question-editor">
          <label className="field">
            <span>제목</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
          </label>
          <div className="row">
            <label className="field">
              <span>종류</span>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                {SOURCE_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field field--grow">
              <span>쓴 사람·채널</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={40} placeholder="지어낸 이름 권장" />
            </label>
          </div>
          {!sentences && aiCfg.enabled && aiCfg.model && (
            <div className="ai-box">
              <label className="field">
                <span>🤖 AI 초안 주제 (예: 학교 앞 문구점 자리에 편의점이 생긴다)</span>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={60} />
              </label>
              <AiButton
                label="AI로 자료 초안 만들기"
                disabled={!topic.trim()}
                run={async (ctl) => {
                  const d = await aiFactDraft(loadAiConfig(), topic.trim(), source, ctl);
                  setTitle(d.title);
                  setAuthor(d.author);
                  setSentences(d.sentences);
                  setFromAi(true);
                }}
              />
            </div>
          )}
          {fromAi && sentences && <AiDraftNote />}
          {!sentences ? (
            <>
              <label className="field">
                <span>본문 (문장마다 마침표)</span>
                <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
              </label>
              <button type="button" className="btn btn--small" onClick={split}>
                문장 나누기 →
              </button>
            </>
          ) : (
            <>
              <p className="hint">문장마다 정답을 정해 주세요.</p>
              <ul className="fact-editor__sentences">
                {sentences.map((s, i) => (
                  <li key={i}>
                    <span>{s.text}</span>
                    <span className="yn">
                      {(['F', 'O'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`yn__btn ${s.answer === v ? 'yn__btn--on' : ''}`}
                          aria-pressed={s.answer === v}
                          onClick={() => setSentences(sentences.map((x, j) => (j === i ? { ...x, answer: v } : x)))}
                        >
                          {v === 'F' ? '사실' : '의견'}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn--small" onClick={() => setSentences(null)}>
                ← 본문 고치기
              </button>
            </>
          )}
          {msg && <p className="error">{msg}</p>}
          <div className="row">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              취소
            </button>
            <button type="button" className="btn btn--small btn--primary" onClick={save} disabled={!sentences}>
              저장
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function eventSummary(pins: Pin[]): string {
  const counts = new Map<string, number>();
  pins.forEach((p) => p.giveUp && counts.set(p.giveUp, (counts.get(p.giveUp) ?? 0) + 1));
  return [...counts.entries()]
    .map(([id, n]) => `${findEventChoice(id)?.emoji ?? ''}${findEventChoice(id)?.label ?? id} ${n}`)
    .join(' · ');
}

/** 선택한 기록의 자세한 내용 (교사 화면 오른쪽) */
export function RecordDetail({ pin, cls }: { pin: Pin; cls: ClassRoom }) {
  if (['climate', 'population', 'globe', 'worldclimate', 'worldpop', 'history'].includes(pin.activity)) return <QuizDetail pin={pin} />;
  if (pin.activity === 'factcheck') {
    const item = factItemsFor(cls).find((i) => i.id === pin.itemId);
    if (!item) return <p className="hint">지워진 자료의 기록이에요.</p>;
    const g = pin.labels ? gradeLabels(item, pin.labels) : null;
    return (
      <div className="record">
        <p>
          <strong>{item.title}</strong> ({item.source})
        </p>
        {g && (
          <p>
            사실·의견: {g.correct}/{g.total} 맞음 · {pin.attempts ?? 1}번 확인
          </p>
        )}
        <ol className="record__sentences">
          {item.sentences.map((s, i) => (
            <li key={i} className={pin.labels?.[i] === s.answer ? 'ok' : 'no'}>
              {pin.labels?.[i] === s.answer ? '✅' : '❌'} {s.text} <small>(정답: {s.answer === 'F' ? '사실' : '의견'})</small>
            </li>
          ))}
        </ol>
        {pin.trust && (
          <p>
            판단: {TRUST_LEVELS.find((t) => t.id === pin.trust)?.emoji} {TRUST_LEVELS.find((t) => t.id === pin.trust)?.label}
          </p>
        )}
        {pin.text && <p className="hint">까닭: {pin.text}</p>}
      </div>
    );
  }
  if (pin.activity === 'trade') {
    const o = tradeOutcomes(pin);
    const s = pin.step ?? 1;
    const ev = findEventChoice(pin.giveUp);
    return (
      <div className="record">
        <p>진행: {s}/4단계</p>
        {o && <p>무역 전: {outcomeText(o.before)}</p>}
        {o && s >= 2 && <p>무역 후: {outcomeText(o.after)}</p>}
        {ev && (
          <p>
            가뭄 때 선택: {ev.emoji} {ev.label}
          </p>
        )}
        <ol className="record__sentences">
          {TRADE_CHECKS.map((q, i) => {
            const a = pin.labels?.[i];
            return (
              <li key={q.id} className={a === q.answer ? 'ok' : 'no'}>
                {a === q.answer ? '✅' : a && a !== '-' ? '❌' : '·'} {q.text}
              </li>
            );
          })}
        </ol>
        <p>시도 {pin.attempts ?? 0}번</p>
        {pin.text && <p className="hint">생각: {pin.text}</p>}
      </div>
    );
  }
  if (pin.activity === 'market') {
    const picks = (pin.picks ?? '').split(',').filter(Boolean);
    const g = findMarketItem(pin.giveUp);
    return (
      <div className="record">
        <p>산 것: {picks.map((id) => `${findMarketItem(id)?.emoji} ${findMarketItem(id)?.label}`).join(', ')}</p>
        <p>
          기회비용: <strong>{g ? `${g.emoji} ${g.label}` : '–'}</strong>
        </p>
        {pin.text && <p className="hint">까닭: {pin.text}</p>}
      </div>
    );
  }
  if (pin.activity === 'election') {
    return (
      <div className="record">
        <ol className="record__sentences">
          {SCENARIOS.map((s, i) => {
            const a = pin.labels?.[i];
            return (
              <li key={s.id} className={a === s.answer ? 'ok' : 'no'}>
                {a === s.answer ? '✅' : a && a !== '-' ? '❌' : '·'} {s.story}
                {a && a !== '-' && a !== s.answer && <small> (고른 답: {findPrinciple(a)?.label})</small>}
              </li>
            );
          })}
        </ol>
        <p>시도 {pin.attempts ?? 0}번</p>
        {pin.picks && <p>가장 중요한 원칙: {findPrinciple(pin.picks)?.label}</p>}
        {pin.text && <p className="hint">까닭: {pin.text}</p>}
      </div>
    );
  }
  return null;
}

/** 활동별 한눈에 보기 (지도 없는 활동) */
export function SelfSummary({ pins, cls }: { pins: Pin[]; cls: ClassRoom }) {
  const students = byStudent(pins).length;
  const activity = pins[0]?.activity;
  if (!activity) return <p className="summary__total">참여 학생 0명</p>;
  if (activity === 'history') {
    const done = pins.filter((p) => p.labels === HISTORY_ANSWER).length;
    return (
      <section className="summary">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명 · 완성 <strong>{done}</strong>명
        </p>
      </section>
    );
  }
  const quiz = QUIZZES[activity];
  if (quiz && (activity === 'climate' || activity === 'population' || activity === 'globe' || activity === 'worldclimate' || activity === 'worldpop')) {
    const per = quiz.questions.map((q, i) => pins.filter((p) => isCorrect(q, parseAnswers(p.picks)[i])).length);
    return (
      <section className="summary">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명
        </p>
        <p className="hint">질문별 맞힌 학생: {per.map((n, i) => `${i + 1}번 ${n}`).join(' · ')}</p>
      </section>
    );
  }
  if (activity === 'trade') {
    const after = pins.map(tradeOutcomes).filter(Boolean);
    const traded = pins.filter((p) => (p.step ?? 1) >= 2);
    const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((s, v) => s + v, 0) / xs.length) * 10) / 10 : 0);
    const ev = eventSummary(pins);
    return (
      <section className="summary">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명 · 무역까지 한 학생 <strong>{traded.length}</strong>명
        </p>
        {traded.length > 0 && (
          <p className="hint">
            남은 휴대폰 평균: 무역 전 {avg(after.map((o) => o!.before.phone))}대 → 무역 후{' '}
            {avg(traded.map((p) => tradeOutcomes(p)!.after.phone))}대
          </p>
        )}
        {ev && <p className="hint">가뭄 때 선택: {ev}</p>}
      </section>
    );
  }
  if (activity === 'market') {
    const giveUps = MARKET_ITEMS.map((m) => ({ m, n: pins.filter((p) => p.giveUp === m.id).length })).filter((x) => x.n);
    return (
      <section className="summary">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명
        </p>
        {giveUps.length > 0 && (
          <p className="hint">
            기회비용으로 많이 고른 것: {giveUps.sort((a, b) => b.n - a.n).map((x) => `${x.m.emoji}${x.n}`).join(' ')}
          </p>
        )}
      </section>
    );
  }
  if (activity === 'election') {
    const per = SCENARIOS.map((s, i) => pins.filter((p) => p.labels?.[i] === s.answer).length);
    const imp = PRINCIPLES.map((p) => `${p.emoji}${pins.filter((x) => x.picks === p.id).length}`).join(' ');
    return (
      <section className="summary">
        <p className="summary__total">
          참여 학생 <strong>{students}</strong>명
        </p>
        <p className="hint">이야기별 맞힌 학생: {per.map((n, i) => `${i + 1}번 ${n}`).join(' · ')}</p>
        <p className="hint">가장 중요한 원칙: {imp}</p>
      </section>
    );
  }
  const items = factItemsFor(cls);
  return (
    <section className="summary">
      <p className="summary__total">
        참여 학생 <strong>{students}</strong>명
      </p>
      <ul className="hint">
        {items.map((it, i) => {
          const rs = pins.filter((p) => p.itemId === it.id && p.labels);
          if (rs.length === 0) return null;
          const avg = rs.reduce((s, p) => s + gradeLabels(it, p.labels!).correct, 0) / rs.length;
          const trusts = TRUST_LEVELS.map((t) => `${t.emoji}${rs.filter((p) => p.trust === t.id).length}`).join(' ');
          return (
            <li key={it.id}>
              자료 {i + 1}: 평균 {avg.toFixed(1)}/{it.sentences.length} · {trusts}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------- 4단계: 기후·인구·지구본(탐구 질문)과 한국사 연표 ----------

/** 탐구 질문 활동(기후·인구·지구본)의 학생별 결과표 */
export function QuizResults({
  pins,
  activity,
  onSelect,
}: {
  pins: Pin[];
  activity: 'climate' | 'population' | 'globe' | 'worldclimate' | 'worldpop';
  onSelect: (p: Pin) => void;
}) {
  const set = QUIZZES[activity]!;
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 탐구 질문 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            {set.questions.map((q, i) => (
              <th key={q.id} scope="col" title={q.text}>
                {i + 1}
              </th>
            ))}
            <th scope="col">해결</th>
            <th scope="col">생각</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = r.pins[0];
            const a = parseAnswers(p.picks);
            return (
              <tr key={r.label}>
                <th scope="row">
                  <button type="button" className="cell" onClick={() => onSelect(p)}>
                    {r.label}
                  </button>
                </th>
                {set.questions.map((q, i) => (
                  <td key={q.id}>{!a[i] ? '·' : isCorrect(q, a[i]) ? '✅' : '❌'}</td>
                ))}
                <td className="progress-table__sum">{quizScore(set, p.picks)}</td>
                <td className="progress-table__text">{p.text ? '✏️' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint">❌는 마지막으로 고른 답이 틀린 질문이에요. 학생을 누르면 자세히 볼 수 있어요.</p>
    </div>
  );
}

export function HistoryResults({ pins, onSelect }: { pins: Pin[]; onSelect: (p: Pin) => void }) {
  const rows = byStudent(pins);
  if (rows.length === 0) return <Empty />;
  return (
    <div className="table-wrap">
      <table className="progress-table">
        <caption className="sr-only">학생별 한국사 연표 결과</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">제자리 사건</th>
            <th scope="col">확인 횟수</th>
            <th scope="col">완성</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = r.pins[0];
            const sc = historyScore(p.labels);
            return (
              <tr key={r.label}>
                <th scope="row">
                  <button type="button" className="cell" onClick={() => onSelect(p)}>
                    {r.label}
                  </button>
                </th>
                <td>
                  {sc}/{HISTORY_EVENTS.length}
                </td>
                <td>{p.attempts ?? 0}</td>
                <td>{p.labels === HISTORY_ANSWER ? '🎉' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const QUIZ_NAMES: Record<string, (id: string) => string> = {
  climate: (id) => CITIES.find((c) => c.id === id)?.name ?? id,
  population: (id) => PROVINCES.find((p) => p.id === id)?.name ?? id,
  globe: (id) => COUNTRY_KO[id] ?? id,
  worldclimate: worldCityName,
  worldpop: (id) => COUNTRY_KO[id] ?? CONTINENT_NAME[id] ?? id,
};

export function QuizDetail({ pin }: { pin: Pin }) {
  if (pin.activity === 'history') {
    return (
      <div className="record">
        <ol className="record__sentences">
          {(pin.labels ?? '').split('').map((id, i) => (
            <li key={i} className={HISTORY_ANSWER[i] === id ? 'ok' : 'no'}>
              {HISTORY_ANSWER[i] === id ? '✅' : '❌'} {findEvent(id)?.label}
            </li>
          ))}
        </ol>
        <p>확인 {pin.attempts ?? 0}번</p>
        {pin.text && <p className="hint">생각: {pin.text}</p>}
      </div>
    );
  }
  const set = QUIZZES[pin.activity];
  if (!set) return null;
  const a = parseAnswers(pin.picks);
  const name = QUIZ_NAMES[pin.activity] ?? ((x: string) => x);
  return (
    <div className="record">
      <ol className="record__sentences">
        {set.questions.map((q, i) => {
          const ans = a[i];
          const label = q.choices ? q.choices.find((c) => c.id === ans)?.label : ans ? name(ans) : '';
          return (
            <li key={q.id} className={isCorrect(q, ans) ? 'ok' : 'no'}>
              {!ans ? '·' : isCorrect(q, ans) ? '✅' : '❌'} {q.text} {ans && <small>(고른 답: {label})</small>}
            </li>
          );
        })}
      </ol>
      <p>시도 {pin.attempts ?? 0}번</p>
      {pin.text && <p className="hint">생각: {pin.text}</p>}
    </div>
  );
}
