/** 지도 계산 도우미: 거리, 방위, 미션 확인 */
import { findMission, type Direction, type MissionDef } from './activities';

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

/** 두 지점 사이의 거리 (미터) */
export function distance(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** a에서 b를 바라본 방위각 (북쪽 0°, 시계 방향) */
export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIR8 = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
export const DIR_NAME: Record<Direction, string> = { N: '북', E: '동', S: '남', W: '서' };
const DIR_CENTER: Record<Direction, number> = { N: 0, E: 90, S: 180, W: 270 };

/** 8방위 이름 (북, 북동, …) */
export function dir8(deg: number): string {
  return DIR8[Math.round(deg / 45) % 8];
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** 표시한 곳이 미션 기준(학교에서 너무 가까우면 방위를 판단하기 어려움) */
const MIN_DIR_DISTANCE = 50;

export interface MissionResult {
  ok: boolean;
  /** 학생에게 보여 줄 말 (정답이 아니면 답 대신 힌트) */
  message: string;
}

export function checkMission(mission: MissionDef, school: LatLng, pos: LatLng): MissionResult {
  const d = distance(school, pos);
  const rounded = Math.round(d / 10) * 10;
  if (mission.check.type === 'dir') {
    const target = DIR_NAME[mission.check.dir];
    if (d < MIN_DIR_DISTANCE) {
      return { ok: false, message: `학교와 너무 가까워요. 학교에서 조금 더 떨어진 ${target}쪽 장소를 찾아볼까요?` };
    }
    const b = bearing(school, pos);
    if (angleDiff(b, DIR_CENTER[mission.check.dir]) <= 45) {
      return { ok: true, message: `정답! 학교에서 ${dir8(b)}쪽으로 약 ${rounded}m 떨어진 곳이에요.` };
    }
    return {
      ok: false,
      message: `표시한 곳은 학교의 ${dir8(b)}쪽이에요. 방위표를 보고 ${target}쪽이 지도의 어느 방향인지 다시 찾아볼까요?`,
    };
  }
  const { target, min, max } = mission.check;
  if (d >= min && d <= max) {
    return { ok: true, message: `정답! 학교에서 약 ${rounded}m 떨어진 곳이에요.` };
  }
  const hint = '축척 막대의 길이를 손가락이나 종이로 재어, 학교에서부터 몇 번 들어가는지 세어 보세요.';
  return {
    ok: false,
    message: d < min ? `${target}m보다 가까워요. ${hint}` : `${target}m보다 멀어요. ${hint}`,
  };
}

/** 저장된 미션 핀이 정답인지 (교사 화면·학생 진행표에서 사용) */
export function isMissionCorrect(missionId: string | undefined, school: LatLng, pos: LatLng): boolean {
  const m = findMission(missionId);
  return !!m && checkMission(m, school, pos).ok;
}
