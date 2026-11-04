import { isClassMode } from '../config';
import { go, myClasses } from '../hooks';
import { ACTIVITY_ORDER } from '../activities';

const ACTIVITY_COUNT = ACTIVITY_ORDER.length;

export function ModeBanner() {
  if (isClassMode) return null;
  return (
    <div className="banner" role="note">
      <strong>체험 모드</strong> 기록이 이 브라우저에만 저장돼요. 탭을 두 개 열어 교사·학생 화면을 미리 살펴보세요. 학생
      크롬북들을 연결해 수업에 쓰려면 <a href="#/guide">📖 사용 안내</a>의 “우리 학교에서 수업에 쓰기”를 보세요.
    </div>
  );
}

export default function Home() {
  const classes = myClasses();
  return (
    <div className="page page--center">
      <ModeBanner />
      <main className="home">
        <h1 className="home__title">
          <span aria-hidden>🗺️</span> 우리 동네 지도 탐구
        </h1>
        <p className="home__sub">초등 사회 3~6학년 · 지도·연표·경제·선거·미디어·세계지리 활동 {ACTIVITY_COUNT}가지</p>

        <div className="home__actions">
          <button type="button" className="big-btn big-btn--student" onClick={() => go('/join')}>
            <span className="big-btn__icon" aria-hidden>
              🧒
            </span>
            학생으로 참여하기
          </button>
          <button type="button" className="big-btn big-btn--teacher" onClick={() => go('/teacher/new')}>
            <span className="big-btn__icon" aria-hidden>
              🧑‍🏫
            </span>
            선생님: 학급 만들기
          </button>
        </div>

        <p className="home__login">
          <a href="#/guide">📖 사용 안내 (처음 쓰는 선생님·다른 학교 선생님)</a>
        </p>

        {isClassMode && (
          <p className="home__login">
            <a href="#/teacher/login">🔑 다른 기기에서 내 학급 관리하기</a>
          </p>
        )}

        {classes.length > 0 && (
          <section className="card my-classes" aria-labelledby="my-classes-title">
            <h2 id="my-classes-title">이 브라우저에서 만든 학급</h2>
            <ul>
              {classes.map((c) => (
                <li key={c.code}>
                  <a href={`#/teacher/${c.code}`}>
                    {c.name} <span className="code-chip">{c.code}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
