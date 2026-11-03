import { useEffect, useState } from 'react';
import { MISSIONS, findMission } from '../activities';
import { LIMITS } from '../data/common';
import type { ClassRoom, Pin, Store } from '../data/types';
import { checkMission, isMissionCorrect, type LatLng, type MissionResult } from '../geo';
import type { StudentSession } from '../pages/StudentJoin';
import Speak from './Speak';

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  /** 내 미션 핀 */
  myPins: Pin[];
  draft: LatLng | null;
  setDraft: (pos: LatLng | null) => void;
  /** 지도를 눌러 위치를 고를 수 있는 상태인지 알려 줍니다 */
  onPickingChange: (picking: boolean) => void;
  /** 지도에서 내 미션 핀을 누르면 그 미션을 엽니다 (seq가 바뀔 때마다) */
  openRequest: { id: string; seq: number } | null;
  onToast: (msg: string) => void;
}

/** [4사05] 방위와 거리 미션: 지도에 표시하면 자동으로 확인하고, 틀리면 답 대신 힌트를 줍니다. */
export default function MissionPanel({
  cls,
  store,
  uid,
  student,
  myPins,
  draft,
  setDraft,
  onPickingChange,
  openRequest,
  onToast,
}: Props) {
  const [missionId, setMissionId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [result, setResult] = useState<MissionResult | null>(null);
  const [saving, setSaving] = useState(false);

  const school = { lat: cls.lat, lng: cls.lng };
  const byMission = new Map(myPins.map((p) => [p.missionId, p]));
  const solved = (id: string) => {
    const p = byMission.get(id);
    return !!p && isMissionCorrect(id, school, p);
  };
  const doneCount = MISSIONS.filter((m) => solved(m.id)).length;
  const mission = findMission(missionId ?? undefined);

  useEffect(() => {
    onPickingChange(!!mission);
  }, [mission, onPickingChange]);

  useEffect(() => {
    if (openRequest) open(openRequest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest?.seq]);

  function open(id: string | null) {
    setMissionId(id);
    setResult(null);
    setDraft(null);
    setPlaceName(id ? (byMission.get(id)?.placeName ?? '') : '');
  }

  async function submit() {
    if (!mission || !draft) return;
    if (!placeName.trim()) {
      setResult({ ok: false, message: '찾은 장소의 이름을 적어 주세요.' });
      return;
    }
    const r = checkMission(mission, school, draft);
    setSaving(true);
    try {
      const existing = byMission.get(mission.id);
      if (existing) {
        await store.updatePin(cls.code, existing.id, {
          lat: draft.lat,
          lng: draft.lng,
          placeName: placeName.trim(),
          attempts: (existing.attempts ?? 1) + 1,
        });
      } else {
        await store.addPin(cls.code, {
          activity: 'mission',
          missionId: mission.id,
          attempts: 1,
          lat: draft.lat,
          lng: draft.lng,
          placeName: placeName.trim(),
          text: '',
          studentNo: student.studentNo,
          nickname: student.nickname,
          authorUid: uid,
        });
      }
      setResult(r);
      if (r.ok) setDraft(null);
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const next = MISSIONS.find((m) => m.id !== missionId && !solved(m.id));

  if (!mission) {
    return (
      <div className="mission">
        <p className="guide__text">
          방위표와 축척 막대를 이용해 미션을 해결해요. <Speak text="방위표와 축척 막대를 이용해 미션을 해결해요. 미션을 하나 골라 보세요." />
        </p>
        <div className="progress" aria-label={`미션 ${MISSIONS.length}개 중 ${doneCount}개 성공`}>
          <span className="progress__bar" style={{ width: `${(doneCount / MISSIONS.length) * 100}%` }} />
          <span className="progress__text">
            {doneCount} / {MISSIONS.length} 성공
          </span>
        </div>
        <ul className="mission-list">
          {MISSIONS.map((m) => {
            const tried = byMission.has(m.id);
            const ok = solved(m.id);
            return (
              <li key={m.id}>
                <button type="button" className={`mission-item ${ok ? 'mission-item--ok' : ''}`} onClick={() => open(m.id)}>
                  <span className="mission-item__emoji" aria-hidden>
                    {m.emoji}
                  </span>
                  <span className="mission-item__title">{m.title}</span>
                  <span className="mission-item__state">{ok ? '✅ 성공' : tried ? '🔁 다시 도전' : '도전하기'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {doneCount === MISSIONS.length && <p className="celebrate">🎉 모든 미션을 해결했어요! 친구에게 찾은 장소를 방위와 거리로 설명해 볼까요?</p>}
      </div>
    );
  }

  return (
    <div className="mission">
      <div className="mission-head">
        <span className="mission-item__emoji" aria-hidden>
          {mission.emoji}
        </span>
        <h2>{mission.title}</h2>
      </div>
      <p className="guide__text">
        {mission.guide} <Speak text={mission.guide} />
      </p>
      <ol className="guide__steps">
        <li className={draft ? 'done' : ''}>지도를 눌러 장소를 표시해요. {draft && '✔'}</li>
        <li className={placeName.trim() ? 'done' : ''}>찾은 장소의 이름을 적어요.</li>
        <li>“확인하기”를 눌러요.</li>
      </ol>
      <label className="field">
        <span>장소 이름</span>
        <input
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="예: 편의점, 공원, 아파트"
          maxLength={LIMITS.placeName}
        />
      </label>
      {result && (
        <div className={`feedback ${result.ok ? 'feedback--ok' : 'feedback--hint'}`} role="status">
          <span>{result.ok ? '🎉' : '💡'}</span>
          <p>
            {result.message} <Speak text={result.message} />
          </p>
        </div>
      )}
      <div className="row">
        <button type="button" className="btn" onClick={() => open(null)}>
          목록으로
        </button>
        {result?.ok && next ? (
          <button type="button" className="btn btn--primary" onClick={() => open(next.id)}>
            다음 미션 ➡
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={submit} disabled={!draft || saving}>
            {saving ? '확인 중…' : '확인하기'}
          </button>
        )}
      </div>
      {!draft && !result?.ok && <p className="hint">지도를 누르거나 “지도 가운데에 놓기”를 눌러 장소를 표시해요.</p>}
    </div>
  );
}
