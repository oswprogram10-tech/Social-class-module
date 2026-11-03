import { isClassMode } from '../config';
import { go, myClasses } from '../hooks';

export function ModeBanner() {
  if (isClassMode) return null;
  return (
    <div className="banner" role="note">
      <strong>체험 모드</strong> 기록이 이 브라우저에만 저장돼요. 탭을 여러 개 열면 한 크롬북에서 교사·학생 화면을 함께
      시연할 수 있어요. 여러 크롬북을 연결하려면 README의 “학급 모드 켜기”를 따라 하세요.
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
        <p className="home__sub">초등 사회 3~4학년 · 장소감 지도, 방위와 거리 미션, 지역문제 해결</p>

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
