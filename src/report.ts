/**
 * 3범주 성장 리포트 계산 (2022 개정 교육과정: 지식·이해 / 과정·기능 / 가치·태도)
 *
 * - 지식·이해: 앱이 자동으로 확인한 기록의 정답 비율
 * - 과정·기능: 탐구 과정의 근거 (단계 완성, 출처 판단, 근거 쓰기, 다시 도전)
 * - 가치·태도: 점수를 매기지 않고, 학생이 쓴 생각과 공동체 참여 기록을 근거로 모읍니다.
 *   판단은 선생님이 합니다.
 */
import { ACTIVITIES, MISSIONS, type ActivityId } from './activities';
import { electionScore } from './components/ElectionActivity';
import { factItemsFor } from './components/FactcheckActivity';
import { SCENARIOS } from './content/election';
import { gradeLabels } from './content/factcheck';
import { HISTORY_EVENTS, historyScore } from './content/history';
import { QUIZZES, quizScore } from './content/quizzes';
import { TRADE_CHECKS, tradeScore } from './content/trade';
import type { ClassRoom, Pin } from './data/types';
import { isMissionCorrect } from './geo';

export interface KnowledgeItem {
  activity: ActivityId;
  label: string;
  /** 도전한 것 중 맞힌 수 */
  correct: number;
  /** 도전한 수 (안 한 문제는 틀린 것으로 치지 않음) */
  total: number;
  /** 활동 전체 문제 수 */
  all: number;
}

export interface Evidence {
  activity: ActivityId;
  text: string;
}

export interface StudentReport {
  key: string;
  studentNo: number;
  nickname: string;
  activities: ActivityId[];
  knowledge: KnowledgeItem[];
  knowledgeRate: number | null;
  process: {
    solveDone: number;
    solveStarted: number;
    sourceJudged: number;
    reasoned: number;
    reasonable: number;
    retries: number;
    timelineEvents: number;
  };
  processEvidence: Evidence[];
  attitude: {
    community: number;
    reflections: number;
    likesReceived: number;
  };
  /** 학생이 직접 쓴 생각 (가치·태도 근거) */
  quotes: Evidence[];
}

/** 근거를 적었다고 볼 최소 글자 수 */
const MIN_REASON = 10;

/** 까닭·생각을 적는 칸이 있는 활동 */
const REASON_ACTIVITIES: ActivityId[] = [
  'feel', 'better', 'legend', 'promote', 'solve', 'market', 'election', 'factcheck', 'climate', 'population', 'globe', 'worldclimate', 'worldpop', 'history', 'trade', 'global', 'landform',
];

/** 가치 판단이 드러나는 생각 (점수 없이 그대로 보여 줌) */
const VALUE_ACTIVITIES: ActivityId[] = [
  'better', 'solve', 'promote', 'election', 'market', 'climate', 'population', 'globe', 'worldclimate', 'worldpop', 'history', 'factcheck', 'trade', 'global', 'landform',
];

/** 우리 동네·공동체를 위한 참여 기록 */
const COMMUNITY_ACTIVITIES: ActivityId[] = ['better', 'solve', 'promote', 'global'];

export function studentKey(p: Pin): string {
  return `${p.authorUid}:${p.studentNo}`;
}

function title(a: ActivityId): string {
  return ACTIVITIES[a]?.title ?? a;
}

export function buildReports(cls: ClassRoom, pins: Pin[]): StudentReport[] {
  const groups = new Map<string, Pin[]>();
  pins.forEach((p) => {
    const k = studentKey(p);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  });
  const school = { lat: cls.lat, lng: cls.lng };
  const factItems = factItemsFor(cls);

  return [...groups.entries()]
    .map(([key, list]) => {
      const by = (a: ActivityId) => list.filter((p) => p.activity === a);
      const knowledge: KnowledgeItem[] = [];
      const processEvidence: Evidence[] = [];
      const quotes: Evidence[] = [];
      let retries = 0;

      // ---- 지식·이해: 자동 확인 기록 ----
      const missions = by('mission');
      if (missions.length) {
        const ok = MISSIONS.filter((m) => missions.some((p) => p.missionId === m.id && isMissionCorrect(m.id, school, p))).length;
        const tried = new Set(missions.map((p) => p.missionId)).size;
        knowledge.push({ activity: 'mission', label: '방위와 거리 미션', correct: ok, total: tried, all: MISSIONS.length });
        retries += missions.reduce((s, p) => s + Math.max(0, (p.attempts ?? 1) - 1), 0);
      }
      by('election').forEach((p) => {
        const tried = [...(p.labels ?? '')].filter((c) => c !== '-').length;
        if (tried) knowledge.push({ activity: 'election', label: '선거 4원칙 이야기', correct: electionScore(p.labels), total: tried, all: SCENARIOS.length });
        retries += Math.max(0, (p.attempts ?? 0) - SCENARIOS.length);
      });
      by('factcheck').forEach((p) => {
        const item = factItems.find((i) => i.id === p.itemId);
        if (!item || !p.labels) return;
        const g = gradeLabels(item, p.labels);
        if (g.total === 0) return;
        knowledge.push({ activity: 'factcheck', label: `사실·의견 구분: ${item.title}`, correct: g.correct, total: g.total, all: g.total });
        retries += Math.max(0, (p.attempts ?? 1) - 1);
      });
      (['climate', 'population', 'globe', 'worldclimate', 'worldpop', 'landform'] as const).forEach((a) => {
        const set = QUIZZES[a]!;
        by(a).forEach((p) => {
          const tried = (p.picks ?? '').split(',').filter(Boolean).length;
          if (tried)
            knowledge.push({ activity: a, label: `${title(a)} 탐구 질문`, correct: quizScore(set, p.picks), total: tried, all: set.questions.length });
          retries += Math.max(0, (p.attempts ?? 0) - set.questions.length);
        });
      });
      by('trade').forEach((p) => {
        const tried = [...(p.labels ?? '')].filter((c) => c !== '-').length;
        if (tried) knowledge.push({ activity: 'trade', label: '무역 확인 문제', correct: tradeScore(p.labels), total: tried, all: TRADE_CHECKS.length });
        retries += Math.max(0, (p.attempts ?? 0) - TRADE_CHECKS.length);
      });
      by('history').forEach((p) => {
        knowledge.push({ activity: 'history', label: '한국사 연표 순서', correct: historyScore(p.labels), total: HISTORY_EVENTS.length, all: HISTORY_EVENTS.length });
        retries += Math.max(0, (p.attempts ?? 1) - 1);
      });
      const kc = knowledge.reduce((s, k) => s + k.correct, 0);
      const kt = knowledge.reduce((s, k) => s + k.total, 0);

      // ---- 과정·기능 ----
      const solves = by('solve');
      const solveDone = solves.filter((p) => (p.step ?? 1) >= 4).length;
      solves.forEach((p) =>
        processEvidence.push({
          activity: 'solve',
          text: `문제 해결 “${p.placeName}”: ${(p.step ?? 1) >= 4 ? '4단계 모두 완성' : `${p.step ?? 1}단계까지`}`,
        }),
      );
      const judged = by('factcheck').filter((p) => p.trust);
      if (judged.length) processEvidence.push({ activity: 'factcheck', text: `미디어 자료 ${judged.length}개의 출처를 따져 믿을 만한지 판단` });
      const timelineEvents = by('timeline').length;
      if (timelineEvents) processEvidence.push({ activity: 'timeline', text: `나의 연표에 일 ${timelineEvents}개를 연도와 함께 정리` });
      const legends = by('legend').length;
      if (legends) processEvidence.push({ activity: 'legend', text: `지도 기호 ${legends}개를 직접 정하고 까닭을 설명` });
      by('global').forEach((p) => {
        const s = p.step ?? 1;
        processEvidence.push({ activity: 'global', text: `지구촌 문제 해결 “${p.placeName}”: ${s >= 4 ? '4단계 모두 완성' : `${s}단계까지`}` });
        if (s >= 4 && p.slogan) quotes.push({ activity: 'global', text: `실천 약속: ${p.slogan}` });
      });
      by('trade').forEach((p) => {
        const s = p.step ?? 1;
        processEvidence.push({ activity: 'trade', text: `무역 시뮬레이션: ${s >= 2 ? '무역 전과 후를 비교' : '혼자 만들기까지'}${s >= 3 ? ', 가뭄 사건에 대처할 방법 선택' : ''}${s >= 4 ? ', 정리 완료' : ''}` });
      });
      if (retries > 0) processEvidence.push({ activity: 'mission', text: `틀린 뒤 힌트를 보고 다시 도전한 횟수 ${retries}번` });

      const reasonable = list.filter((p) => REASON_ACTIVITIES.includes(p.activity));
      const reasoned = reasonable.filter((p) => (p.text ?? '').trim().length >= MIN_REASON);

      // ---- 가치·태도 (근거만) ----
      list
        .filter((p) => VALUE_ACTIVITIES.includes(p.activity) && (p.text ?? '').trim().length >= MIN_REASON)
        .forEach((p) => quotes.push({ activity: p.activity, text: p.text.trim() }));
      const community = list.filter((p) => COMMUNITY_ACTIVITIES.includes(p.activity)).length;
      const likesReceived = list.reduce((s, p) => s + (p.likes ?? 0), 0);

      const first = list[0];
      return {
        key,
        studentNo: first.studentNo,
        nickname: first.nickname,
        activities: [...new Set(list.map((p) => p.activity))],
        knowledge,
        knowledgeRate: kt > 0 ? kc / kt : null,
        process: {
          solveDone,
          solveStarted: solves.length,
          sourceJudged: judged.length,
          reasoned: reasoned.length,
          reasonable: reasonable.length,
          retries,
          timelineEvents,
        },
        processEvidence,
        attitude: { community, reflections: quotes.length, likesReceived },
        quotes,
      } satisfies StudentReport;
    })
    .sort((a, b) => a.studentNo - b.studentNo);
}

export function pct(rate: number | null): string {
  return rate === null ? '–' : `${Math.round(rate * 100)}%`;
}

export function activityTitle(a: ActivityId): string {
  return title(a);
}
