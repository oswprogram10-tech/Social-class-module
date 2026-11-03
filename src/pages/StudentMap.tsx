import { useEffect, useMemo, useRef, useState } from 'react';
import type L from 'leaflet';
import { ACTIVITIES } from '../activities';
import MapView, { type LatLng } from '../components/MapView';
import PinCard from '../components/PinCard';
import PinForm, { type PinFormValues } from '../components/PinForm';
import Speak from '../components/Speak';
import { visibleToStudent } from '../data/common';
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
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!student) go(`/join/${code}`);
  }, [student, code]);

  // 선생님이 활동을 바꾸면 열려 있던 창을 닫습니다.
  const activity = cls?.activeActivity ?? 'feel';
  useEffect(() => setMode({ kind: 'idle' }), [activity]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

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
  const pins = allPins.filter((p) => p.activity === activity && visibleToStudent(p, cls, uid));
  const myCount = pins.filter((p) => p.authorUid === uid).length;
  const selectedId = mode.kind === 'view' || mode.kind === 'edit' ? mode.id : null;
  const selected = pins.find((p) => p.id === selectedId);

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
    if (c) setMode({ kind: 'new', pos: { lat: c.lat, lng: c.lng } });
  }

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
            {who} · 내 장소 {myCount}개
          </span>
        </div>
      </header>

      <div className="split">
        <div className="map-area">
          <MapView
            center={{ lat: cls.lat, lng: cls.lng }}
            radius={cls.radius}
            schoolName={cls.schoolName}
            pins={pins}
            draft={mode.kind === 'new' ? mode.pos : null}
            selectedId={selectedId}
            onMapClick={(pos) => mode.kind !== 'edit' && setMode({ kind: 'new', pos })}
            onPinClick={(pin) => setMode({ kind: 'view', id: pin.id })}
            onReady={(m) => (mapRef.current = m)}
          />
          <div className="crosshair" aria-hidden />
          {mode.kind === 'idle' && (
            <button type="button" className="btn btn--primary map-fab" onClick={placeAtCenter}>
              📍 지도 가운데에 장소 놓기
            </button>
          )}
        </div>

        <aside className="panel" aria-live="polite">
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
              <PinCard pin={selected} author={selected.authorUid === uid ? '내가 남긴 장소' : undefined}>
                {selected.authorUid === uid ? (
                  <>
                    <button type="button" className="btn" onClick={() => setMode({ kind: 'edit', id: selected.id })}>
                      ✏️ 고치기
                    </button>
                    <button type="button" className="btn btn--danger" onClick={() => removePin(selected)}>
                      🗑️ 지우기
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => like(selected)}
                    disabled={liked.has(selected.id)}
                  >
                    {liked.has(selected.id) ? '💛 공감했어요' : '💛 공감해요'}
                  </button>
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
                <li>{activity === 'feel' ? '느낌을 고르고 이유를 적어요.' : '문제와 바꾸고 싶은 것을 골라요.'}</li>
              </ol>
              <button type="button" className="btn btn--block" onClick={() => setShowQuestions((v) => !v)} aria-expanded={showQuestions}>
                💭 생각 도우미 {showQuestions ? '접기' : '열기'}
              </button>
              {showQuestions && (
                <ul className="questions">
                  {def.questions.map((q) => (
                    <li key={q}>
                      {q} <Speak text={q} />
                    </li>
                  ))}
                </ul>
              )}
              {cls.showOthers ? (
                <p className="hint">친구들이 남긴 장소를 눌러 보고, 같은 곳에서 느낌이 어떻게 다른지 비교해 보세요.</p>
              ) : (
                <p className="hint">지금은 내 장소만 보여요.</p>
              )}
            </div>
          )}
        </aside>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
