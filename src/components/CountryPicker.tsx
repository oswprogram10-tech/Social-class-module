import { useId, useMemo } from 'react';
import { COUNTRIES, countryName } from '../content/worldGeo';

interface Props {
  selected: string | null;
  onPick: (id: string) => void;
}

/** 지도를 누르기 어려울 때(키보드, 화면 읽기 프로그램) 목록에서 나라를 고르는 칸 */
export default function CountryPicker({ selected, onPick }: Props) {
  const id = useId();
  const options = useMemo(
    () =>
      COUNTRIES.map((c) => ({ id: String(c.id), name: countryName(String(c.id)) }))
        .filter((o, i, all) => all.findIndex((x) => x.id === o.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    [],
  );
  return (
    <p className="country-picker">
      <label htmlFor={id}>
        <span aria-hidden>⌨️ </span>목록에서 나라 고르기
      </label>{' '}
      <select id={id} value={selected ?? ''} onChange={(e) => e.target.value && onPick(e.target.value)}>
        <option value="">나라를 고르세요</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </p>
  );
}
