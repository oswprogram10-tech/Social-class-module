import { PLACE_TYPES, SYMBOLS, findChoice } from '../activities';
import type { Pin } from '../data/types';

/**
 * 우리 반 범례: 장소 종류마다 학생들이 고른 기호를 모아 보여 줍니다.
 * 같은 장소에 기호가 여러 가지면 표시해서 "왜 기호를 약속해야 할까?"를 토의하게 합니다.
 */
export default function LegendBox({ pins }: { pins: Pin[] }) {
  const rows = PLACE_TYPES.map((type) => {
    const counts = new Map<string, number>();
    pins
      .filter((p) => p.placeType === type.id && p.symbol)
      .forEach((p) => counts.set(p.symbol!, (counts.get(p.symbol!) ?? 0) + 1));
    const symbols = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, n]) => ({ choice: findChoice(SYMBOLS, id), n }))
      .filter((x) => x.choice);
    return { type, symbols };
  }).filter((r) => r.symbols.length > 0);

  if (rows.length === 0) return null;
  return (
    <section className="legend-box" aria-label="우리 반 범례">
      <h3>범례</h3>
      <ul>
        {rows.map(({ type, symbols }) => (
          <li key={type.id}>
            <span className="legend-box__symbols">
              {symbols.map(({ choice, n }) => (
                <span key={choice!.id} title={`${choice!.label} ${n}명`}>
                  {choice!.emoji}
                  {symbols.length > 1 && <small>{n}</small>}
                </span>
              ))}
            </span>
            <span className="legend-box__label">{type.label}</span>
            {symbols.length > 1 && (
              <span className="legend-box__warn" title="같은 장소를 서로 다른 기호로 나타냈어요">
                ⚠️
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
