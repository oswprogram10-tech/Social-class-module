import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type L from 'leaflet';
import { ACTIVITIES, isSelfKind, type ActivityId, type ActivityKind } from '../activities';
import MapView, { type LatLng } from '../components/MapView';
import LegendBox from '../components/LegendBox';
import MissionPanel from '../components/MissionPanel';
import PinCard from '../components/PinCard';
import PinForm, { type PinFormValues } from '../components/PinForm';
import SolvePanel from '../components/SolvePanel';
import Speak from '../components/Speak';
import { TimelinePanel, TimelineView } from '../components/Timeline';
import FactcheckActivity from '../components/FactcheckActivity';
import MarketActivity from '../components/MarketActivity';
import ElectionActivity from '../components/ElectionActivity';
import HistoryActivity from '../components/HistoryActivity';
import { ClimateActivity, PopulationActivity } from '../components/KoreaActivities';

// 세계 지도 자료가 커서 이 활동을 열 때만 내려받습니다.
const GlobeActivity = lazy(() => import('../components/GlobeActivity'));
import TradeActivity from '../components/TradeActivity';
import GlobalActivity from '../components/GlobalActivity';
const WorldPopActivity = lazy(() => import('../components/WorldPopActivity'));
const WorldClimateActivity = lazy(() => import('../components/WorldClimateActivity'));
import { questionsFor, visibleToStudent } from '../data/common';
import type { Pin, WatchPinsOptions } from '../data/types';
import { go, useClassRoom, usePins, useStore } from '../hooks';
import { loadStudent } from './StudentJoin';

const LIKED_KEY = 'scm:liked';

function loadLiked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

/** 장소감·개선 활동(핀 남기기)의 화면 상태 */
const STEP3: Partial<Record<ActivityId, string>> = {
  feel: '느낌을 고르고 이유를 적어요.',
  better: '문제와 바꾸고 싶은 것을 골라요.',
  legend: '장소 종류와 기호를 고르고, 그 기호를 고른 까닭을 적어요.',
  promote: '자랑거리 종류를 고르고 한 줄 홍보 문구를 만들어요.',
};

const OTHERS_HINT: Partial<Record<ActivityId, string>> = {
  feel: '친구들이 남긴 장소를 눌러 보고, 같은 곳에서 느낌이 어떻게 다른지 비교해 보세요.',
  better: '친구들이 찾은 문제와 개선 방법을 눌러 보세요.',
  legend: '오른쪽 아래 범례를 보세요. 같은 장소를 친구들은 어떤 기호로 나타냈나요?',
  promote: '친구들이 만든 홍보 문구를 눌러 보고 💛 공감해 보세요.',
};

type ActivityProps = Parameters<typeof MarketActivity>[0];

/** 지도 없이 화면 전체를 쓰는 활동 */
function SelfActivity({ kind, ...props }: ActivityProps & { kind: ActivityKind }) {
  switch (kind) {
    case 'factcheck':
      return <FactcheckActivity {...props} />;
    case 'global':
      return <GlobalActivity {...props} />;
    case 'trade':
      return <TradeActivity {...props} />;
    case 'market':
      return <MarketActivity {...props} />;
    case 'climate':
      return <ClimateActivity {...props} />;
    case 'population':
      return <PopulationActivity {...props} />;
    case 'history':
      return <HistoryActivity {...props} />;
    case 'globe':
      return (
        <Suspense fallback={<p className="page-msg">세계 지도를 불러오는 중…</p>}>
          <GlobeActivity {...props} />
        </Suspense>
      );
    case 'worldclimate':
      return (
        <Suspense fallback={<p className="page-msg">세계 지도를 불러오는 중…</p>}>
          <WorldClimateActivity {...props} />
        </Suspense>
      );
    case 'worldpop':
      return (
        <Suspense fallback={<p className="page-msg">세계 지도를 불러오는 중…</p>}>
          <WorldPopActivity {...props} />
        </Suspense>
      );
    default:
      return <ElectionActivity {...props} />;
  }
}

type Mode = { kind: 'idle' } | { kind: 'new'; pos: LatLng } | { kind: 'view'; id: string } | { kind: 'edit'; id: string };

export default function StudentMap({ code }: { code: string }) {
  const student = loadStudent(code);
  const { store, uid, error } = useStore();
  const cls = useClassRoom(store, code);
  const watchOpts = useMemo<WatchPinsOptions | null>(
    () => (uid && cls ? { role: 'student', uid, showOthers: cls.showOthers } : null),
    [uid, cls?.showOthers], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const allPins = usePins(store, code, watchOpts);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [saving, setSaving] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [liked, setLiked] = useState(loadLiked);
  const [toast, setToast] = useState('');
  // 미션·문제 해결 활동에서 쓰는 상태
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [picking, setPicking] = useState(false);
  const [openRequest, setOpenRequest] = useState<{ id: string; seq: number } | null>(null);
  const [viewOtherId, setViewOtherId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!student) go(`/join/${code}`);
  }, [student, code]);

  // 선생님이 활동을 바꾸면 열려 있던 창을 닫습니다.
  const activity = cls?.activeActivity ?? 'feel';
  useEffect(() => {
    setMode({ kind: 'idle' });
    setDraft(null);
    setViewOtherId(null);
    setOpenRequest(null);
    setToast('');
  }, [activity]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const onPickingChange = useCallback((v: boolean) => setPicking(v), []);

  if (!student) return null;
  if (error) return <p className="error page-msg">{error}</p>;
  if (cls === undefined || !uid || !store) return <p className="page-msg">불러오는 중…</p>;
  if (cls === null)
    return (
      <div className="page-msg">
        <p>학급을 찾을 수 없어요.</p>
        <a href="#/join">다시 들어가기</a>
      </div>
    );

  const def = ACTIVITIES[activity];
  const kind = def.kind;
  const questions = questionsFor(cls, activity);
  const pins = allPins.filter((p) => p.activity === activity && visibleToStudent(p, cls, uid));
  // 같은 기기(같은 익명 계정)를 여러 학생이 번갈아 쓸 수 있어서 번호까지 맞춰 봅니다.
  const isMine = (p: Pin) => p.authorUid === uid && p.studentNo === student.studentNo;
  const myPins = pins.filter(isMine);
  const selectedId =
    kind === 'pin'
      ? mode.kind === 'view' || mode.kind === 'edit'
        ? mode.id
        : null
      : (viewOtherId ?? openRequest?.id ?? null);
  const selected = pins.find((p) => p.id === selectedId);
  const viewOther = viewOtherId ? pins.find((p) => p.id === viewOtherId) : undefined;
  const school = { lat: cls.lat, lng: cls.lng };

  async function addPin(values: PinFormValues) {
    if (mode.kind !== 'new' || !store || !uid || !student) return;
    setSaving(true);
    try {
      await store.addPin(code, {
        ...values,
        activity,
        lat: mode.pos.lat,
        lng: mode.pos.lng,
        studentNo: student.studentNo,
        nickname: student.nickname,
        authorUid: uid,
      });
      setMode({ kind: 'idle' });
      setToast(cls?.requireApproval ? '저장했어요! 선생님이 확인하면 친구들에게 보여요.' : '지도에 남겼어요!');
    } catch (e) {
      console.error(e);
      setToast('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  async function editPin(pin: Pin, values: PinFormValues) {
    if (!store) return;
    setSaving(true);
    try {
      // 승인제 학급에서는 고친 내용도 다시 선생님이 확인합니다.
      await store.updatePin(code, pin.id, { ...values, ...(cls?.requireApproval ? { approved: false } : {}) });
      setMode({ kind: 'view', id: pin.id });
    } catch (e) {
      console.error(e);
      setToast('고치지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  async function removePin(pin: Pin) {
    if (!store || !confirm('이 장소를 지울까요?')) return;
    await store.deletePin(code, pin.id).catch(console.error);
    setMode({ kind: 'idle' });
  }

  async function like(pin: Pin) {
    if (!store || liked.has(pin.id)) return;
    const next = new Set(liked).add(pin.id);
    setLiked(next);
    localStorage.setItem(LIKED_KEY, JSON.stringify([...next]));
    await store.likePin(code, pin.id).catch(console.error);
  }

  function placeAtCenter() {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    const pos = { lat: c.lat, lng: c.lng };
    if (kind === 'pin') setMode({ kind: 'new', pos });
    else setDraft(pos);
  }

  function onMapClick(pos: LatLng) {
    if (kind === 'pin') {
      if (mode.kind !== 'edit') setMode({ kind: 'new', pos });
    } else if (picking) {
      setViewOtherId(null);
      setDraft(pos);
    }
  }

  function onPinClick(pin: Pin) {
    if (kind === 'pin') {
      setMode({ kind: 'view', id: pin.id });
    } else if (picking) {
      // 위치를 고르는 중에는 이미 있는 핀을 눌러도 그 자리를 고른 것으로 봅니다.
      setViewOtherId(null);
      setDraft({ lat: pin.lat, lng: pin.lng });
    } else if (isMine(pin)) {
      setViewOtherId(null);
      setOpenRequest({ id: kind === 'mission' ? pin.missionId! : pin.id, seq: Date.now() });
    } else {
      setViewOtherId(pin.id);
    }
  }

  const likeButton = (pin: Pin) => (
    <button type="button" className="btn" onClick={() => like(pin)} disabled={liked.has(pin.id)}>
      {liked.has(pin.id) ? '💛 공감했어요' : '💛 공감해요'}
    </button>
  );

  const activityProps: ActivityProps = { cls, store, uid, student, myRecords: myPins, questions, onToast: setToast };
  const showFab = kind === 'pin' ? mode.kind === 'idle' : picking;
  const who = `${student.studentNo}번${student.nickname ? ` ${student.nickname}` : ''}`;

  return (
    <div className="page page--map">
      <header className="topbar">
        <div className="topbar__main">
          <span className="std-chip">{def.standard}</span>
          <h1>{def.title}</h1>
          <Speak text={def.guide} label="활동 안내 읽어주기" />
        </div>
        <div className="topbar__side">
          <span className="who">
            {who}
            {(kind === 'pin' || kind === 'solve') && ` · 내 기록 ${myPins.length}개`}
          </span>
        </div>
      </header>

      <div className="split">
        {isSelfKind(kind) ? (
          <SelfActivity kind={kind} {...activityProps} />
        ) : (
          <>
        {kind === 'timeline' ? (
          <div className="timeline-area">
            <TimelineView
              title={`${who}의 연표`}
              events={myPins}
              selectedId={viewOtherId}
              onSelect={(p) => setViewOtherId(p.id)}
            />
          </div>
        ) : (
        <div className="map-area">
          <MapView
            center={school}
            radius={cls.radius}
            schoolName={cls.schoolName}
            pins={pins}
            draft={kind === 'pin' ? (mode.kind === 'new' ? mode.pos : null) : draft}
            selectedId={selectedId}
            onMapClick={onMapClick}
            onPinClick={onPinClick}
            onReady={(m) => (mapRef.current = m)}
          />
          {showFab && <div className="crosshair" aria-hidden />}
          {showFab && (
            <button type="button" className="btn btn--primary map-fab" onClick={placeAtCenter}>
              📍 지도 가운데에 {kind === 'pin' ? '장소 놓기' : '표시하기'}
            </button>
          )}
          {activity === 'legend' && <LegendBox pins={pins} />}
        </div>
        )}

        <aside className="panel" aria-live="polite">
          {kind === 'timeline' && (
            <TimelinePanel
              cls={cls}
              store={store}
              uid={uid}
              student={student}
              myPins={myPins}
              selected={myPins.find((p) => p.id === viewOtherId)}
              onSelect={setViewOtherId}
              questions={questions}
              onToast={setToast}
            />
          )}

          {kind === 'mission' && (
            <MissionPanel
              cls={cls}
              store={store}
              uid={uid}
              student={student}
              myPins={myPins}
              draft={draft}
              setDraft={setDraft}
              onPickingChange={onPickingChange}
              openRequest={openRequest}
              onToast={setToast}
            />
          )}

          {kind === 'solve' &&
            (viewOther ? (
              <>
                <PinCard pin={viewOther}>{likeButton(viewOther)}</PinCard>
                <button type="button" className="btn btn--block" onClick={() => setViewOtherId(null)}>
                  닫기
                </button>
              </>
            ) : (
              <SolvePanel
                cls={cls}
                store={store}
                uid={uid}
                student={student}
                myPins={myPins}
                draft={draft}
                setDraft={setDraft}
                onPickingChange={onPickingChange}
                openRequest={openRequest}
                questions={questions}
                onToast={setToast}
              />
            ))}

          {kind === 'pin' && (
            <>
              {mode.kind === 'new' && (
                <PinForm activity={activity} saving={saving} onSubmit={addPin} onCancel={() => setMode({ kind: 'idle' })} />
              )}
              {mode.kind === 'edit' && selected && (
                <PinForm
                  activity={activity}
                  initial={selected}
                  saving={saving}
                  onSubmit={(v) => editPin(selected, v)}
                  onCancel={() => setMode({ kind: 'view', id: selected.id })}
                />
              )}
              {mode.kind === 'view' && selected && (
                <>
                  <PinCard pin={selected} author={isMine(selected) ? '내가 남긴 장소' : undefined}>
                    {isMine(selected) ? (
                      <>
                        <button type="button" className="btn" onClick={() => setMode({ kind: 'edit', id: selected.id })}>
                          ✏️ 고치기
                        </button>
                        <button type="button" className="btn btn--danger" onClick={() => removePin(selected)}>
                          🗑️ 지우기
                        </button>
                      </>
                    ) : (
                      likeButton(selected)
                    )}
                  </PinCard>
                  <button type="button" className="btn btn--block" onClick={() => setMode({ kind: 'idle' })}>
                    닫기
                  </button>
                </>
              )}
              {(mode.kind === 'idle' || ((mode.kind === 'view' || mode.kind === 'edit') && !selected)) && (
                <div className="guide">
                  <p className="guide__text">
                    {def.guide} <Speak text={def.guide} />
                  </p>
                  <ol className="guide__steps">
                    <li>지도를 움직여 장소를 찾아요.</li>
                    <li>장소를 누르거나 “가운데에 놓기”를 눌러요.</li>
                    <li>{STEP3[activity] ?? '내용을 골라 적어요.'}</li>
                  </ol>
                  <button
                    type="button"
                    className="btn btn--block"
                    onClick={() => setShowQuestions((v) => !v)}
                    aria-expanded={showQuestions}
                  >
                    💭 생각 도우미 {showQuestions ? '접기' : '열기'}
                  </button>
                  {showQuestions && (
                    <ul className="questions">
                      {questions.map((q) => (
                        <li key={q}>
                          {q} <Speak text={q} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {cls.showOthers ? (
                    <p className="hint">{OTHERS_HINT[activity] ?? '친구들이 남긴 장소를 눌러 보세요.'}</p>
                  ) : (
                    <p className="hint">지금은 내 장소만 보여요.</p>
                  )}
                </div>
              )}
            </>
          )}

          {kind === 'mission' && (
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
          )}
        </aside>
          </>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
