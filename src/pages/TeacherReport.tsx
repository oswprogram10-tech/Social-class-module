import { useEffect, useMemo, useState } from 'react';
import type { WatchPinsOptions } from '../data/types';
import { useClassRoom, usePins, useStore } from '../hooks';
import { activityTitle, buildReports, pct, type StudentReport } from '../report';

const TEACHER_OPTS: WatchPinsOptions = { role: 'teacher' };

function memoKey(code: string, key: string) {
  return `scm:memo:${code}:${key}`;
}

function loadMemo(code: string, key: string): string {
  try {
    return localStorage.getItem(memoKey(code, key)) ?? '';
  } catch {
    return '';
  }
}

function label(r: StudentReport) {
  return `${r.studentNo}번${r.nickname ? ` ${r.nickname}` : ''}`;
}

function downloadCsv(name: string, code: string, reports: StudentReport[]) {
  const header = [
    '번호', '별명', '참여 활동 수', '지식·이해 정답률', '지식·이해 근거',
    '문제 해결 완성', '출처 판단', '근거 쓴 기록', '다시 도전', '연표 정리',
    '생각 쓰기', '공동체 참여 기록', '친구들의 공감', '교사 메모',
  ];
  const rows = reports.map((r) => [
    r.studentNo,
    r.nickname,
    r.activities.length,
    pct(r.knowledgeRate),
    r.knowledge.map((k) => `${k.label} ${k.correct}/${k.total}${k.total < k.all ? `(전체 ${k.all})` : ''}`).join(' / '),
    `${r.process.solveDone}/${r.process.solveStarted}`,
    r.process.sourceJudged,
    `${r.process.reasoned}/${r.process.reasonable}`,
    r.process.retries,
    r.process.timelineEvents,
    r.attitude.reflections,
    r.attitude.community,
    r.attitude.likesReceived,
    loadMemo(code, r.key),
  ]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}_${code}_성장리포트.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** 학생 한 명의 3범주 성장 기록 카드 (인쇄용으로도 씀) */
export function ReportCard({ r, code, editable }: { r: StudentReport; code: string; editable?: boolean }) {
  const [memo, setMemo] = useState(() => loadMemo(code, r.key));
  useEffect(() => setMemo(loadMemo(code, r.key)), [code, r.key]);

  function saveMemo(v: string) {
    setMemo(v);
    try {
      localStorage.setItem(memoKey(code, r.key), v);
    } catch {
      /* 저장 공간이 없으면 무시 */
    }
  }

  return (
    <article className="report-card">
      <header className="report-card__head">
        <h2>{label(r)}</h2>
        <span className="hint">참여한 활동 {r.activities.length}개: {r.activities.map(activityTitle).join(', ')}</span>
      </header>

      <section className="report-sec report-sec--k">
        <h3>
          📘 지식·이해 <small>앱이 자동으로 확인한 기록</small>
        </h3>
        {r.knowledge.length === 0 ? (
          <p className="hint">자동 확인 활동 기록이 아직 없어요.</p>
        ) : (
          <>
            <p className="report-big">
              정답률 {pct(r.knowledgeRate)} <small className="hint">도전한 문제 기준</small>
            </p>
            <ul className="bars">
              {r.knowledge.map((k, i) => (
                <li key={i} className="bars__row--wide">
                  <span className="bars__label">{k.label}</span>
                  <span className="bars__track">
                    <span className="bars__fill" style={{ width: `${(k.correct / k.total) * 100}%` }} />
                  </span>
                  <span className="bars__n bars__n--wide" title={`전체 ${k.all}개 중 ${k.total}개 도전`}>
                    {k.correct}/{k.total}
                    {k.total < k.all && <small className="bars__sub"> ({k.all}개 중 {k.total}개 도전)</small>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="report-sec report-sec--p">
        <h3>
          🔍 과정·기능 <small>탐구 과정의 근거</small>
        </h3>
        <ul className="report-list">
          <li>
            까닭이나 생각을 적은 기록: <strong>{r.process.reasoned}</strong> / {r.process.reasonable}
          </li>
          {r.processEvidence.map((e, i) => (
            <li key={i}>{e.text}</li>
          ))}
        </ul>
      </section>

      <section className="report-sec report-sec--a">
        <h3>
          🤝 가치·태도 <small>점수 없이 학생의 생각과 참여 기록만 모았어요</small>
        </h3>
        <p className="hint">
          공동체를 위한 기록(개선·문제 해결·지역 알리기) {r.attitude.community}개 · 친구들의 공감 {r.attitude.likesReceived}개
        </p>
        {r.quotes.length === 0 ? (
          <p className="hint">아직 적은 생각이 없어요.</p>
        ) : (
          <ul className="quotes">
            {r.quotes.map((q, i) => (
              <li key={i}>
                <span className="tag">{activityTitle(q.activity)}</span> “{q.text}”
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="report-sec">
        <h3>✏️ 선생님 메모</h3>
        {editable ? (
          <>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => saveMemo(e.target.value)}
              placeholder="관찰한 내용, 칭찬할 점, 도울 점을 적어 두세요."
              aria-label={`${label(r)} 선생님 메모`}
            />
            <p className="hint no-print">메모는 이 브라우저에만 저장돼요(학생·서버에 보내지 않음).</p>
          </>
        ) : (
          <p className="memo-print">{memo || ' '}</p>
        )}
      </section>
    </article>
  );
}

export default function TeacherReport({ code }: { code: string }) {
  const { store, uid, error } = useStore();
  const cls = useClassRoom(store, code);
  const isOwner = !!cls && !!uid && cls.teacherUid === uid;
  const pins = usePins(store, code, isOwner ? TEACHER_OPTS : null);
  const reports = useMemo(() => (cls ? buildReports(cls, pins) : []), [cls, pins]);
  const [selected, setSelected] = useState<string | null>(null);
  const [printAll, setPrintAll] = useState(false);

  useEffect(() => {
    if (!printAll) return;
    const done = () => setPrintAll(false);
    window.addEventListener('afterprint', done);
    const t = setTimeout(() => window.print(), 100);
    return () => {
      clearTimeout(t);
      window.removeEventListener('afterprint', done);
    };
  }, [printAll]);

  if (error) return <p className="error page-msg">{error}</p>;
  if (cls === undefined || !store || !uid) return <p className="page-msg">불러오는 중…</p>;
  if (!cls || !isOwner)
    return (
      <div className="page-msg">
        <p>이 학급의 리포트를 볼 권한이 없어요.</p>
        <a href="#/">처음으로</a>
      </div>
    );

  const current = reports.find((r) => r.key === selected);

  return (
    <div className={`page report-page ${printAll ? 'print-all' : ''}`}>
      <header className="topbar no-print">
        <div className="topbar__main">
          <a href={`#/teacher/${code}`} className="topbar__back" aria-label="교사 화면으로">
            ←
          </a>
          <h1>
            📊 3범주 성장 리포트 <small>· {cls.name}</small>
          </h1>
        </div>
        <button type="button" className="btn" onClick={() => downloadCsv(cls.name, code, reports)} disabled={reports.length === 0}>
          📥 엑셀로 저장
        </button>
        <button type="button" className="btn" onClick={() => setPrintAll(true)} disabled={reports.length === 0}>
          🖨️ 전체 인쇄
        </button>
      </header>

      <div className="report-body no-print">
        <section className="card report-intro">
          <p>
            2022 개정 교육과정의 세 범주로 학생의 기록을 모았어요. <strong>지식·이해</strong>는 앱이 자동으로 확인한 정답 비율(아직 안 한 문제는 빼고 계산),{' '}
            <strong>과정·기능</strong>은 탐구 과정의 근거입니다. <strong>가치·태도</strong>는 점수를 매기지 않고 학생이 직접 쓴
            생각과 참여 기록만 보여 줍니다. 평가는 이 근거와 수업 중 관찰을 함께 보고 선생님이 판단해 주세요.
          </p>
        </section>

        {reports.length === 0 ? (
          <p className="hint">아직 학생 기록이 없어요.</p>
        ) : (
          <div className="report-split">
            <div className="table-wrap">
              <table className="progress-table report-table">
                <caption className="sr-only">학생별 3범주 요약</caption>
                <thead>
                  <tr>
                    <th scope="col">번호</th>
                    <th scope="col">참여 활동</th>
                    <th scope="col">📘 지식·이해</th>
                    <th scope="col">🔍 근거 쓰기</th>
                    <th scope="col">🔍 문제 해결</th>
                    <th scope="col">🔍 다시 도전</th>
                    <th scope="col">🤝 생각 쓰기</th>
                    <th scope="col">🤝 공동체 참여</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.key} className={r.key === selected ? 'row--on' : ''}>
                      <th scope="row">
                        <button type="button" className="cell" onClick={() => setSelected(r.key)}>
                          {label(r)}
                        </button>
                      </th>
                      <td>{r.activities.length}</td>
                      <td>{pct(r.knowledgeRate)}</td>
                      <td>
                        {r.process.reasoned}/{r.process.reasonable}
                      </td>
                      <td>
                        {r.process.solveDone}/{r.process.solveStarted}
                      </td>
                      <td>{r.process.retries}</td>
                      <td>{r.attitude.reflections}</td>
                      <td>{r.attitude.community}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="hint">학생 번호를 누르면 자세한 기록과 메모 칸이 나와요.</p>
            </div>
            <div className="report-detail">
              {current ? (
                <>
                  <ReportCard r={current} code={code} editable />
                  <button type="button" className="btn no-print" onClick={() => window.print()}>
                    🖨️ 이 학생 인쇄
                  </button>
                </>
              ) : (
                <p className="hint">왼쪽 표에서 학생을 골라 주세요.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 인쇄용: 한 명 또는 전체 */}
      <div className="print-only">
        {(printAll ? reports : current ? [current] : []).map((r) => (
          <ReportCard key={r.key} r={r} code={code} />
        ))}
      </div>
    </div>
  );
}
