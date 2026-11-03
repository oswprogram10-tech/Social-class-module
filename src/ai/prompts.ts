/**
 * 교사 전용 AI 도우미의 지시문과 결과 검사
 * 결과는 항상 “초안”이며, 선생님이 확인하고 고친 뒤에만 학생에게 보입니다.
 */
import { ACTIVITIES, type ActivityId } from '../activities';
import type { FactLabel } from '../content/factcheck';
import { LIMITS } from '../data/common';
import type { StudentReport } from '../report';
import { activityTitle, pct } from '../report';
import { AiError, chatJson, type AiConfig } from './localAi';

/** 진행 표시와 취소 */
export interface AiCtl {
  onProgress?: (chars: number) => void;
  signal?: AbortSignal;
}

const BASE_RULES = `너는 대한민국 초등학교 사회과 교사를 돕는 조수야.
- 반드시 한국어로, 초등학생이 이해할 수 있는 쉬운 말로 써.
- 실제 사람 이름, 실제 회사·언론사·학교 이름을 쓰지 마.
- 확실하지 않은 사실(숫자, 연도)은 지어내지 마.
- 요청한 JSON 형식으로만 답해.`;

const clean = (s: unknown, max: number) =>
  String(s ?? '')
    .replace(/^\s*(\d+[.)]|[-*•])\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

// ---------- 1. 생각 도우미 질문 ----------

export async function aiQuestions(
  cfg: AiConfig,
  activity: ActivityId,
  current: string[],
  ctl: AiCtl = {},
): Promise<string[]> {
  const def = ACTIVITIES[activity];
  const user = `다음 사회 수업 활동에서 학생에게 보여 줄 “생각 도우미 질문” 4개를 만들어 줘.

활동: ${def.title}
성취기준 ${def.standard}: ${def.standardText}
학생 안내: ${def.guide}
지금 쓰는 질문: ${current.map((q) => `“${q}”`).join(', ')}

조건:
- 정답을 알려 주지 말고, 학생이 스스로 관찰하고 까닭을 생각하게 하는 질문(소크라테스식 발문)
- 질문 하나는 40자 안쪽, 물음표로 끝내기
- 지금 쓰는 질문과 겹치지 않게
형식: {"questions": ["질문1", "질문2", "질문3", "질문4"]}`;
  const out = await chatJson<{ questions?: unknown }>(cfg, { system: BASE_RULES, user, ...ctl });
  const list = Array.isArray(out.questions) ? out.questions : [];
  const qs = list.map((q) => clean(q, LIMITS.question)).filter((q) => q.length >= 5);
  if (qs.length === 0) throw new AiError('AI가 질문을 만들지 못했어요. 한 번 더 시도해 보세요.');
  return qs.slice(0, LIMITS.questionCount);
}

// ---------- 2. 팩트체크 자료 초안 ----------

export interface FactDraft {
  title: string;
  author: string;
  sentences: { text: string; answer: FactLabel }[];
}

export async function aiFactDraft(
  cfg: AiConfig,
  topic: string,
  source: string,
  ctl: AiCtl = {},
): Promise<FactDraft> {
  const user = `초등학교 6학년 미디어 수업용 연습 자료를 만들어 줘. 학생들이 문장마다 사실과 의견을 구분하는 연습을 해.

주제: ${topic}
자료 종류: ${source}

조건:
- 모두 지어낸 이야기. 지역·기관·사람 이름은 “행복구”, “○○초”처럼 지어낸 이름만
- 문장 6개. 사실(F)은 숫자·날짜처럼 확인할 수 있는 내용, 의견(O)은 생각·느낌·판단
- 사실 3개, 의견 3개쯤 섞기. 한 문장에 사실과 의견을 섞지 않기
- ${source === '광고' || source === '개인 방송' ? '자료 종류에 맞게 과장된 말투를 조금 넣기' : '자료 종류에 맞는 말투'}
- 제목은 30자 안쪽, 글쓴이는 지어낸 이름과 “(지어낸 자료)”
형식: {"title": "...", "author": "...", "sentences": [{"text": "...", "answer": "F"}, {"text": "...", "answer": "O"}]}`;
  const out = await chatJson<{ title?: unknown; author?: unknown; sentences?: unknown }>(cfg, {
    system: BASE_RULES,
    user,
    ...ctl,
  });
  const sentences = (Array.isArray(out.sentences) ? out.sentences : [])
    .map((s) => s as { text?: unknown; answer?: unknown })
    .map((s) => ({ text: clean(s.text, 120), answer: String(s.answer).toUpperCase().startsWith('O') ? 'O' : 'F' }) as const)
    .filter((s) => s.text.length >= 4)
    .slice(0, 12);
  if (sentences.length < 3) throw new AiError('AI가 문장을 충분히 만들지 못했어요. 한 번 더 시도해 보세요.');
  return {
    title: clean(out.title, 60) || topic.slice(0, 60),
    author: clean(out.author, 40) || '지어낸 자료',
    sentences,
  };
}

// ---------- 3. 성장 리포트 소견 초안 ----------

/** 학생 이름·번호는 보내지 않고, 기록 요약만 보냅니다 */
export function reportSummaryForAi(r: StudentReport): string {
  const k = r.knowledge.map((x) => `${x.label} ${x.correct}/${x.total}`).join(', ') || '없음';
  const p = r.process;
  const quotes = r.quotes
    .slice(0, 6)
    .map((q) => `- (${activityTitle(q.activity)}) “${q.text}”`)
    .join('\n');
  return `참여한 활동: ${r.activities.map(activityTitle).join(', ')}
지식·이해(자동 확인, 도전한 문제 기준): 정답률 ${pct(r.knowledgeRate)} (${k})
과정·기능: 까닭을 적은 기록 ${p.reasoned}/${p.reasonable}, 문제 해결 4단계 완성 ${p.solveDone}/${p.solveStarted}, 출처 판단 ${p.sourceJudged}개, 틀린 뒤 다시 도전 ${p.retries}번, 연표 정리 ${p.timelineEvents}개
가치·태도 근거: 공동체 참여 기록 ${r.attitude.community}개, 친구들의 공감 ${r.attitude.likesReceived}개
학생이 쓴 생각:
${quotes || '- 없음'}`;
}

export async function aiReportComment(cfg: AiConfig, r: StudentReport, ctl: AiCtl = {}): Promise<string> {
  const user = `아래는 한 학생의 사회 수업 기록 요약이야. 선생님이 참고할 소견 초안을 써 줘.

${reportSummaryForAi(r)}

조건:
- 3문장 안쪽, 존댓말 아닌 평어체 소견 문장(예: “~함.”, “~을 보임.”)
- 기록에 있는 근거만 쓰고, 없는 내용은 지어내지 않기
- 잘한 점 1~2가지와 앞으로 도울 점 1가지
- 학생 이름은 쓰지 않기
형식: {"comment": "..."}`;
  const out = await chatJson<{ comment?: unknown }>(cfg, { system: BASE_RULES, user, ...ctl });
  const c = String(out.comment ?? '').trim().slice(0, 400);
  if (c.length < 10) throw new AiError('AI가 소견을 만들지 못했어요. 한 번 더 시도해 보세요.');
  return c;
}
