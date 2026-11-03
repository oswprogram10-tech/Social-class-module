import { useEffect, useMemo, useState } from 'react';
import {
  ACTIVITIES,
  FEELINGS,
  FIXES,
  PLACE_TYPES,
  PROBLEMS,
  PROMO_CATS,
  SOLUTIONS,
  SYMBOLS,
  UNITS,
  findChoice,
  findMission,
  isSelfKind,
} from '../activities';
import LegendBox from '../components/LegendBox';
import MapView from '../components/MapView';
import PinCard from '../components/PinCard';
import { TimelineView } from '../components/Timeline';
import {
  ElectionResults,
  FactItemEditor,
  FactcheckResults,
  HistoryResults,
  MarketResults,
  QuizResults,
  RecordDetail,
  SelfSummary,
} from '../components/TeacherResults';
import { findMarketItem } from '../content/market';
import { findPrinciple, SCENARIOS } from '../content/election';
import { TRUST_LEVELS } from '../content/factcheck';
import { QUIZZES, quizScore } from '../content/quizzes';
import { historyScore } from '../content/history';
import { MissionProgress, QuestionEditor, Summary, TeacherAccount } from '../components/TeacherWidgets';
import { LocalAiSettings } from '../components/LocalAi';
import { SHARED_ACTIVITIES, questionsFor } from '../data/common';
import type { ClassRoom, Pin, WatchPinsOptions } from '../data/types';
import { isMissionCorrect } from '../geo';
import { joinUrl, rememberClass, useClassRoom, usePins, useStore } from '../hooks';
import { ModeBanner } from './Home';

const TEACHER_OPTS: WatchPinsOptions = { role: 'teacher' };

function authorLabel(pin: Pin) {
  return `${pin.studentNo}번${pin.nickname ? ` ${pin.nickname}` : ''}`;
}

function downloadCsv(cls: ClassRoom, pins: Pin[]) {
  const school = { lat: cls.lat, lng: cls.lng };
  const opt = (type?: string, detail?: string) => [findChoice(SOLUTIONS, type)?.label, detail].filter(Boolean).join(': ');
  const header = [
    '활동', '번호', '별명', '장소', '느낌', '문제', '바꾸고 싶은 것', '이유·결론', '미션', '미션 결과', '시도 횟수',
    '문제 해결 단계', '문제 설명', '원인', '방법 A', 'A 좋은 점', 'A 아쉬운 점', '방법 B', 'B 좋은 점', 'B 아쉬운 점', '선택',
    '자랑거리', '홍보 문구', '장소 종류', '기호', '연도',
    '팩트체크 자료', '사실·의견 표시', '믿을 만한 정도', '산 것', '기회비용', '선거 이야기 맞힘', '가장 중요한 원칙',
    '탐구 질문 맞힘', '연표 제자리',
    '공감', '승인', '숨김', '위도', '경도', '작성시각',
  ];
  const rows = pins.map((p) => [
    ACTIVITIES[p.activity]?.title ?? p.activity,
    p.studentNo,
    p.nickname,
    p.placeName,
    findChoice(FEELINGS, p.feeling)?.label ?? '',
    findChoice(PROBLEMS, p.problem)?.label ?? '',
    findChoice(FIXES, p.fix)?.label ?? '',
    p.text,
    findMission(p.missionId)?.title ?? '',
    p.activity === 'mission' ? (isMissionCorrect(p.missionId, school, p) ? '성공' : '다시 도전') : '',
    p.attempts ?? '',
    p.activity === 'solve' ? `${p.step ?? 1}/4` : '',
    p.problemText ?? '',
    p.cause ?? '',
    opt(p.optAType, p.optADetail),
    p.optAGood ?? '',
    p.optABad ?? '',
    opt(p.optBType, p.optBDetail),
    p.optBGood ?? '',
    p.optBBad ?? '',
    p.chosen ?? '',
    findChoice(PROMO_CATS, p.category)?.label ?? '',
    p.slogan ?? '',
    findChoice(PLACE_TYPES, p.placeType)?.label ?? '',
    p.activity === 'legend' ? (findChoice(SYMBOLS, p.symbol)?.label ?? '') : '',
    p.year ?? '',
    p.itemId ?? '',
    p.activity === 'factcheck' ? (p.labels ?? '').replace(/F/g, '사').replace(/O/g, '의') : '',
    TRUST_LEVELS.find((t) => t.id === p.trust)?.label ?? '',
    p.activity === 'market' ? (p.picks ?? '').split(',').map((id) => findMarketItem(id)?.label).filter(Boolean).join(' ') : '',
    p.activity === 'market' ? (findMarketItem(p.giveUp)?.label ?? '') : '',
    p.activity === 'election' ? `${SCENARIOS.filter((sc, i) => p.labels?.[i] === sc.answer).length}/${SCENARIOS.length}` : '',
    p.activity === 'election' ? (findPrinciple(p.picks)?.label ?? '') : '',
    QUIZZES[p.activity] ? `${quizScore(QUIZZES[p.activity]!, p.picks)}/${QUIZZES[p.activity]!.questions.length}` : '',
    p.activity === 'history' ? `${historyScore(p.labels)}/8` : '',
    p.likes,
    p.approved ? 'O' : 'X',
    p.hidden ? 'O' : 'X',
    p.lat.toFixed(6),
    p.lng.toFixed(6),
    new Date(p.createdAt).toLocaleString('ko-KR'),
  ]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  // 엑셀에서 한글이 깨지지 않도록 BOM을 붙입니다.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${cls.name}_${cls.code}_사회탐구.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function TeacherBoard({ code }: { code: string }) {
  const { store, uid, error } = useStore();
  const cls = useClassRoom(store, code);
  const isOwner = !!cls && !!uid && cls.teacherUid === uid;
  const pins = usePins(store, code, isOwner ? TEACHER_OPTS : null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projector, setProjector] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [copied, setCopied] = useState(false);

  const activity = cls?.activeActivity ?? 'feel';
  const actPins = useMemo(() => pins.filter((p) => p.activity === activity), [pins, activity]);
  const kind = ACTIVITIES[activity].kind;
  /** 지도 없이 결과표를 보여 주는 활동 */
  const isSelf = isSelfKind(kind);
  // 연표: 학생별로 묶기
  const timelines = useMemo(() => {
    if (kind !== 'timeline') return [];
    const map = new Map<string, { uid: string; label: string; no: number; events: Pin[] }>();
    actPins.forEach((p) => {
      // 체험 모드에서는 한 브라우저의 탭들이 같은 ID를 쓰므로 번호까지 함께 묶습니다.
      const key = `${p.authorUid}:${p.studentNo}`;
      const t = map.get(key) ?? { uid: key, label: `${authorLabel(p)}의 연표`, no: p.studentNo, events: [] };
      t.events.push(p);
      map.set(key, t);
    });
    return [...map.values()].sort((a, b) => a.no - b.no);
  }, [actPins, kind]);
  // 미션은 승인할 필요가 없고, 문제 해결은 완성한 것만 승인 대상입니다.
  const waiting = actPins.filter(
    (p) =>
      !p.approved &&
      !p.hidden &&
      SHARED_ACTIVITIES.includes(p.activity) &&
      (p.activity !== 'solve' || (p.step ?? 1) >= 4),
  );

  // 이 브라우저의 "내가 만든 학급" 목록에 기억해 둡니다.
  useEffect(() => {
    if (cls && uid && cls.teacherUid === uid) rememberClass(cls.code, cls.name);
  }, [cls?.code, cls?.name, cls?.teacherUid, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="error page-msg">{error}</p>;
  if (cls === undefined || !store || !uid) return <p className="page-msg">불러오는 중…</p>;
  if (cls === null)
    return (
      <div className="page-msg">
        <p>학급({code})을 찾을 수 없어요.</p>
        <a href="#/">처음으로</a>
      </div>
    );
  if (cls.teacherUid !== uid)
    return (
      <div className="page-msg">
        <p>이 학급의 관리 권한이 없어요.</p>
        <p className="hint">학급을 만든 크롬북(브라우저)에서 열거나, Google 계정을 연결했다면 첫 화면의 “다른 기기에서 내 학급 관리하기”로 로그인해 주세요.</p>
        <a href="#/">처음으로</a>
      </div>
    );

  const selected = actPins.find((p) => p.id === selectedId);
  const school = { lat: cls.lat, lng: cls.lng };
  const pinLabel = kind !== 'pin' && (!projector || showNames) ? (p: Pin) => String(p.studentNo) : undefined;
  const url = joinUrl(cls.code);
  const update = (patch: Parameters<typeof store.updateClass>[1]) => store.updateClass(code, patch).catch(console.error);
  const patchPin = (pin: Pin, patch: Parameters<typeof store.updatePin>[2]) =>
    store.updatePin(code, pin.id, patch).catch(console.error);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('아래 주소를 복사하세요', url);
    }
  }

  async function clearAll() {
    if (!store || !cls) return;
    if (!confirm(`“${cls.name}” 학급의 모든 기록(${pins.length}개)을 지울까요? 되돌릴 수 없어요.`)) return;
    if (pins.length > 0 && !confirm('정말 지울까요? 필요하면 먼저 “엑셀로 저장”을 눌러 주세요.')) return;
    await store.clearPins(code).catch(console.error);
    setSelectedId(null);
  }

  const pinActions = (pin: Pin) => (
    <>
      {!pin.approved && (
        <button type="button" className="btn btn--primary" onClick={() => patchPin(pin, { approved: true })}>
          ✅ 승인
        </button>
      )}
      <button type="button" className="btn" onClick={() => patchPin(pin, { hidden: !pin.hidden })}>
        {pin.hidden ? '👁️ 다시 보이기' : '🙈 숨기기'}
      </button>
      <button
        type="button"
        className="btn btn--danger"
        onClick={() => confirm('이 장소를 지울까요?') && store.deletePin(code, pin.id).catch(console.error)}
      >
        🗑️ 지우기
      </button>
    </>
  );

  return (
    <div className={`page page--map ${projector ? 'projector' : ''}`}>
      {!projector && <ModeBanner />}
      <header className="topbar">
        <div className="topbar__main">
          {!projector && (
            <a href="#/" className="topbar__back" aria-label="처음으로">
              ←
            </a>
          )}
          <h1>
            {cls.name}
            {cls.schoolName && <small> · {cls.schoolName}</small>}
          </h1>
        </div>
        <div className="join-box">
          <span className="join-box__label">학급 코드</span>
          <span className="join-box__code">{cls.code}</span>
          {!projector && (
            <button type="button" className="btn btn--small" onClick={copyLink}>
              {copied ? '복사됨!' : '입장 주소 복사'}
            </button>
          )}
        </div>
        {!projector && (
          <a className="btn btn--small" href="#/guide" title="사용 안내">
            📖
          </a>
        )}
        {!projector && (
          <a className="btn" href={`#/teacher/${cls.code}/report`}>
            📊 성장 리포트
          </a>
        )}
        <button type="button" className="btn" onClick={() => setProjector((v) => !v)}>
          {projector ? '↩ 관리 화면' : '🖥️ 발표 화면'}
        </button>
      </header>

      <nav className="tabs" aria-label="활동 고르기">
        {UNITS.map((u) => (
          <div key={u.title} className="tab-group">
            <span className="tab-group__label">
              {u.grade} {u.title}
            </span>
            <div className="tab-group__tabs">
              {u.activities.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`tab ${activity === id ? 'tab--on' : ''}`}
                  aria-pressed={activity === id}
                  onClick={() => {
                    setSelectedId(null);
                    update({ activeActivity: id });
                  }}
                >
                  <span className="std-chip">{ACTIVITIES[id].standard}</span> {ACTIVITIES[id].title}
                  <span className="tab__count">{pins.filter((p) => p.activity === id).length}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {!projector && <span className="tabs__hint">누른 활동이 학생 화면에 바로 나타나요.</span>}
      </nav>

      <div className="split">
        {isSelf ? (
          <div className="work-area">
            {projector ? (
              <SelfSummary pins={actPins} cls={cls} />
            ) : kind === 'factcheck' ? (
              <FactcheckResults pins={actPins} cls={cls} onSelect={(p) => setSelectedId(p.id)} />
            ) : kind === 'market' ? (
              <MarketResults pins={actPins} onSelect={(p) => setSelectedId(p.id)} />
            ) : kind === 'climate' || kind === 'population' || kind === 'globe' || kind === 'worldclimate' || kind === 'worldpop' ? (
              <QuizResults pins={actPins} activity={kind} onSelect={(p) => setSelectedId(p.id)} />
            ) : kind === 'history' ? (
              <HistoryResults pins={actPins} onSelect={(p) => setSelectedId(p.id)} />
            ) : (
              <ElectionResults pins={actPins} onSelect={(p) => setSelectedId(p.id)} />
            )}
          </div>
        ) : kind === 'timeline' ? (
          <div className="timeline-area">
            {timelines.length === 0 && <p className="hint">아직 연표를 만든 학생이 없어요.</p>}
            {timelines.map((t) => (
              <TimelineView
                key={t.uid}
                title={!projector || showNames ? t.label : undefined}
                events={t.events}
                selectedId={selectedId}
                onSelect={(p) => setSelectedId(p.id)}
              />
            ))}
          </div>
        ) : (
        <div className="map-area">
          <MapView
            center={{ lat: cls.lat, lng: cls.lng }}
            radius={cls.radius}
            schoolName={cls.schoolName}
            pins={projector ? actPins.filter((p) => !p.hidden) : actPins}
            selectedId={selectedId}
            showStatus={!projector}
            pinLabel={pinLabel}
            onPinClick={(p) => setSelectedId(p.id)}
            onMapClick={() => setSelectedId(null)}
          />
          {activity === 'legend' && <LegendBox pins={projector ? actPins.filter((p) => !p.hidden) : actPins} />}
        </div>
        )}

        <aside className="panel">
          {selected && isSelf ? (
            <>
              <section className="card">
                <h2>{authorLabel(selected)}</h2>
                <RecordDetail pin={selected} cls={cls} />
                {!projector && (
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={() => confirm('이 기록을 지울까요?') && store.deletePin(code, selected.id).catch(console.error)}
                  >
                    🗑️ 기록 지우기
                  </button>
                )}
              </section>
              <button type="button" className="btn btn--block" onClick={() => setSelectedId(null)}>
                목록으로
              </button>
            </>
          ) : selected ? (
            <>
              <PinCard pin={selected} school={school} author={!projector || showNames ? authorLabel(selected) : undefined}>
                {!projector && pinActions(selected)}
              </PinCard>
              <button type="button" className="btn btn--block" onClick={() => setSelectedId(null)}>
                목록으로
              </button>
            </>
          ) : projector ? (
            <>
              {!isSelf && <Summary pins={actPins.filter((p) => !p.hidden)} activity={activity} cls={cls} />}
              <section className="card">
                <h2>💭 함께 생각해요</h2>
                <ol className="questions questions--big">
                  {questionsFor(cls, activity).map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              </section>
              <label className="check">
                <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} />
                장소를 누르면 번호 보이기
              </label>
            </>
          ) : (
            <>
              <section className="card settings">
                <h2>설정</h2>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={cls.showOthers}
                    onChange={(e) => update({ showOthers: e.target.checked })}
                  />
                  학생들이 친구 장소 보기
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={cls.requireApproval}
                    onChange={(e) => update({ requireApproval: e.target.checked })}
                  />
                  선생님이 승인한 장소만 친구에게 공개
                </label>
                <p className="hint">{ACTIVITIES[activity].standardText}</p>
                <QuestionEditor
                  key={activity}
                  cls={cls}
                  activity={activity}
                  onSave={(qs) => {
                    const next = { ...(cls.questions ?? {}) };
                    if (qs) next[activity] = qs;
                    else delete next[activity];
                    update({ questions: next });
                  }}
                />
              </section>

              {isSelf ? <SelfSummary pins={actPins} cls={cls} /> : <Summary pins={actPins} activity={activity} cls={cls} />}
              {kind === 'factcheck' && <FactItemEditor cls={cls} onSave={(items) => update({ factItems: items })} />}

              {waiting.length > 0 && (
                <div className="row row--between">
                  <strong>승인 기다리는 장소 {waiting.length}개</strong>
                  <button
                    type="button"
                    className="btn btn--small btn--primary"
                    onClick={() => waiting.forEach((p) => patchPin(p, { approved: true }))}
                  >
                    모두 승인
                  </button>
                </div>
              )}

              {isSelf ? null : kind === 'mission' ? (
                <MissionProgress pins={actPins} cls={cls} onSelect={(p) => setSelectedId(p.id)} />
              ) : (
                <ul className="pin-list">
                  {[...actPins].reverse().map((p) => (
                    <li key={p.id}>
                      <button type="button" className="pin-list__item" onClick={() => setSelectedId(p.id)}>
                        <PinCard pin={p} author={authorLabel(p)} compact />
                      </button>
                    </li>
                  ))}
                  {actPins.length === 0 && <li className="hint">아직 기록이 없어요. 학생들에게 학급 코드를 알려 주세요.</li>}
                </ul>
              )}

              <div className="row">
                <button type="button" className="btn" onClick={() => downloadCsv(cls, pins)} disabled={pins.length === 0}>
                  📥 엑셀로 저장
                </button>
                <button type="button" className="btn btn--danger" onClick={clearAll}>
                  🧹 모두 지우기
                </button>
              </div>

              <TeacherAccount store={store} />
              <LocalAiSettings />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
