import { useMemo, useState } from 'react';
import { QUIZZES } from '../content/quizzes';
import { TERRITORY_PLACES, TERRITORY_TYPES, findTerritory, territoryName } from '../content/territory';
import type { ClassRoom, Pin, Store } from '../data/types';
import type { StudentSession } from '../pages/StudentJoin';
import KoreaMap, { type MapPoint } from './KoreaMap';
import QuizPanel from './QuizPanel';
import Speak from './Speak';

interface Props {
  cls: ClassRoom;
  store: Store;
  uid: string;
  student: StudentSession;
  myRecords: Pin[];
  questions: string[];
  onToast: (msg: string) => void;
}

/** [6사01-01·02] 우리나라 국토 여행: 산지·하천·해안 지형과 독도 */
export default function TerritoryActivity(props: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const points = useMemo<MapPoint[]>(
    () =>
      TERRITORY_PLACES.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        radius: 9,
        color: TERRITORY_TYPES.find((t) => t.id === p.type)!.color,
        label: p.name,
        labelOffset: p.labelOffset,
      })),
    [],
  );
  const place = findTerritory(selected ?? undefined);
  const type = place && TERRITORY_TYPES.find((t) => t.id === place.type);

  return (
    <>
      <div className="work-area work-area--map">
        <div className="pop-legend">
          {TERRITORY_TYPES.map((t) => (
            <span key={t.id}>
              <i style={{ background: t.color, borderRadius: '50%' }} /> {t.emoji} {t.name}
            </span>
          ))}
        </div>
        <div className="map-box">
          <KoreaMap points={points} selectedId={selected} onSelect={setSelected} ariaLabel="우리나라 국토 지도: 산지, 하천, 해안, 독도" />
        </div>
        <section className="pop-card" aria-live="polite">
          {place && type ? (
            <>
              <h3>
                {place.name}{' '}
                <span className="zone-chip" style={{ background: type.color }}>
                  {type.emoji} {type.name}
                </span>
              </h3>
              <p>
                {place.about} <Speak text={`${place.name}. ${place.about}`} />
              </p>
            </>
          ) : (
            <p className="hint">지도에서 이름을 누르면 그곳의 지형 이야기가 나와요. 동쪽과 서쪽의 높이를 비교해 보세요.</p>
          )}
        </section>
        <p className="source">높이와 길이: 국토지리정보원 등 공식 자료 · 독도: 외교부 독도 누리집</p>
      </div>
      <QuizPanel
        {...props}
        activity="territory"
        set={QUIZZES.territory!}
        record={props.myRecords[0]}
        selection={selected}
        nameOf={territoryName}
        targetWord="곳"
      />
    </>
  );
}
