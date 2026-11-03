import { useEffect, useMemo, useState } from 'react';
import { ACTIVITIES, ACTIVITY_ORDER, FEELINGS, FIXES, PROBLEMS, findChoice, type ActivityId } from '../activities';
import MapView from '../components/MapView';
import PinCard from '../components/PinCard';
import type { ClassRoom, Pin, WatchPinsOptions } from '../data/types';
import { joinUrl, rememberClass, useClassRoom, usePins, useStore } from '../hooks';
import { ModeBanner } from './Home';

const TEACHER_OPTS: WatchPinsOptions = { role: 'teacher' };

function authorLabel(pin: Pin) {
  return `${pin.studentNo}번${pin.nickname ? ` ${pin.nickname}` : ''}`;
}

function downloadCsv(cls: ClassRoom, pins: Pin[]) {
  const header = ['활동', '번호', '별명', '장소', '느낌', '문제', '바꾸고 싶은 것', '이유', '공감', '승인', '숨김', '위도', '경도', '작성시각'];
  const rows = pins.map((p) => [
    ACTIVITIES[p.activity].title,
    p.studentNo,
    p.nickname,
    p.placeName,
    findChoice(FEELINGS, p.feeling)?.label ?? '',
    findChoice(PROBLEMS, p.problem)?.label ?? '',
    findChoice(FIXES, p.fix)?.label ?? '',
    p.text,
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
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${cls.name}_${cls.code}_장소감지도.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Summary({ pins, activity }: { pins: Pin[]; activity: ActivityId }) {
  const list = activity === 'feel' ? FEELINGS : FIXES;
  const counts = list
    .map((c) => ({ c, n: pins.filter((p) => (activity === 'feel' ? p.feeling : p.fix) === c.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...counts.map((x) => x.n));
  const students = new Set(pins.map((p) => p.studentNo)).size;
  return (
    <section className="summary" aria-label="한눈에 보기">
      <p className="summary__total">
        장소 <strong>{pins.length}</strong>개 · 참여 학생 <strong>{students}</strong>명
      </p>
      {counts.length > 0 && (
        <ul className="bars">
          {counts.map(({ c, n }) => (
            <li key={c.id}>
              <span className="bars__label">
                {c.emoji} {c.label}
              </span>
              <span className="bars__track">
                <span className="bars__fill" style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="bars__n">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
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
  const waiting = actPins.filter((p) => !p.approved && !p.hidden);

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
        <p className="hint">학급을 만든 크롬북(브라우저)에서 열어 주세요.</p>
        <a href="#/">처음으로</a>
      </div>
    );

  const selected = actPins.find((p) => p.id === selectedId);
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
    if (!confirm(`“${cls.name}” 학급의 모든 장소(${pins.length}개)를 지울까요? 되돌릴 수 없어요.`)) return;
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
        <button type="button" className="btn" onClick={() => setProjector((v) => !v)}>
          {projector ? '↩ 관리 화면' : '🖥️ 발표 화면'}
        </button>
      </header>

      <nav className="tabs" aria-label="활동 고르기">
        {ACTIVITY_ORDER.map((id) => (
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
        {!projector && <span className="tabs__hint">누른 활동이 학생 화면에 바로 나타나요.</span>}
      </nav>

      <div className="split">
        <div className="map-area">
          <MapView
            center={{ lat: cls.lat, lng: cls.lng }}
            radius={cls.radius}
            schoolName={cls.schoolName}
            pins={projector ? actPins.filter((p) => !p.hidden) : actPins}
            selectedId={selectedId}
            showStatus={!projector}
            onPinClick={(p) => setSelectedId(p.id)}
            onMapClick={() => setSelectedId(null)}
          />
        </div>

        <aside className="panel">
          {selected ? (
            <>
              <PinCard pin={selected} author={!projector || showNames ? authorLabel(selected) : undefined}>
                {!projector && pinActions(selected)}
              </PinCard>
              <button type="button" className="btn btn--block" onClick={() => setSelectedId(null)}>
                목록으로
              </button>
            </>
          ) : projector ? (
            <>
              <Summary pins={actPins.filter((p) => !p.hidden)} activity={activity} />
              <section className="card">
                <h2>💭 함께 생각해요</h2>
                <ol className="questions questions--big">
                  {ACTIVITIES[activity].questions.map((q) => (
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
              </section>

              <Summary pins={actPins} activity={activity} />

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

              <ul className="pin-list">
                {[...actPins].reverse().map((p) => (
                  <li key={p.id}>
                    <button type="button" className="pin-list__item" onClick={() => setSelectedId(p.id)}>
                      <PinCard pin={p} author={authorLabel(p)} compact />
                    </button>
                  </li>
                ))}
                {actPins.length === 0 && <li className="hint">아직 남긴 장소가 없어요. 학생들에게 학급 코드를 알려 주세요.</li>}
              </ul>

              <div className="row">
                <button type="button" className="btn" onClick={() => downloadCsv(cls, pins)} disabled={pins.length === 0}>
                  📥 엑셀로 저장
                </button>
                <button type="button" className="btn btn--danger" onClick={clearAll}>
                  🧹 모두 지우기
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
