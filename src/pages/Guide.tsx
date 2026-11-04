import { ACTIVITIES, UNITS } from '../activities';
import { usePageTitle } from '../hooks';
import { useState } from 'react';
import { feedbackRepo, isClassMode, issueUrl } from '../config';
import { NOTICE_CHECKLIST, PARENT_NOTICE } from '../content/parentNotice';

const REPO = feedbackRepo;

/** 처음 쓰는 선생님과 다른 학교 선생님을 위한 안내 */
export default function Guide() {
  usePageTitle('사용 안내');
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar__main">
          <a href="#/" className="topbar__back" aria-label="처음으로">
            ←
          </a>
          <h1>📖 사용 안내</h1>
        </div>
      </header>
      <main className="guide-page">
        <nav className="card guide-toc" aria-label="차례">
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('start')?.scrollIntoView(); }}>1. 처음 시작하기</a>
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('lesson')?.scrollIntoView(); }}>2. 수업 흐름</a>
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('acts')?.scrollIntoView(); }}>3. 활동 목록</a>
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('safety')?.scrollIntoView(); }}>4. 안전과 개인정보</a>
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('copy')?.scrollIntoView(); }}>5. 우리 학교에서 수업에 쓰기</a>
          <a href="#/guide" onClick={(e) => { e.preventDefault(); document.getElementById('feedback')?.scrollIntoView(); }}>6. 고칠 점과 제안 보내기</a>
        </nav>

        <section id="start" className="card">
          <h2>1. 처음 시작하기</h2>
          <p className={isClassMode ? 'tag tag--good' : 'tag tag--warn'}>
            지금: {isClassMode ? '학급 모드 (여러 크롬북이 실시간으로 연결돼요)' : '체험 모드 (이 브라우저에만 저장돼요)'}
          </p>
          <ol className="guide-steps">
            <li>
              <strong>선생님: 학급 만들기</strong> — 학교를 찾거나 지도에서 눌러 위치를 정하고, 탐색 범위를 골라요.
            </li>
            <li>
              교사 화면 위쪽의 <strong>학급 코드</strong>를 TV에 띄우거나 <strong>입장 주소 복사</strong>로 클래스룸에 올려요.
            </li>
            <li>
              학생은 <strong>학생으로 참여하기</strong> → 학급 코드·번호(·별명) → “우리의 약속”에 동의하고 들어와요. 실명은 받지 않아요.
            </li>
            <li>
              교사 화면에서 <strong>활동 탭</strong>을 누르면 모든 학생 화면이 그 활동으로 바로 바뀌어요.
            </li>
          </ol>
          {!isClassMode && (
            <p className="hint">
              지금은 체험 모드라 기록이 이 브라우저에만 저장돼요. 학생 크롬북들을 연결하려면 아래 “5. 우리 학교에서 수업에
              쓰기”를 따라 우리 학교용 주소를 만들어 주세요(처음 한 번, 약 20분, 무료).
            </p>
          )}
        </section>

        <section id="lesson" className="card">
          <h2>2. 수업 흐름 (예시)</h2>
          <ol className="guide-steps">
            <li>
              <strong>도입:</strong> 활동 탭을 고르고 🖥️ <strong>발표 화면</strong>으로 TV에 생각 도우미 질문을 띄워요.
            </li>
            <li>
              <strong>활동:</strong> 학생들이 크롬북으로 활동해요. 🔊 버튼으로 안내를 들을 수 있어요. 교사 화면에서 실시간으로 결과가 모여요.
            </li>
            <li>
              <strong>나눔:</strong> 발표 화면에서 장소나 결과를 하나씩 눌러 함께 이야기해요. 학생 이름은 “번호 보이기”를 켤 때만 보여요.
            </li>
            <li>
              <strong>정리:</strong> 📊 <strong>성장 리포트</strong>에서 3범주 기록을 보고 메모를 남겨요. 📥 엑셀로 저장할 수 있어요.
            </li>
          </ol>
          <ul className="hint guide-tips">
            <li>첫 수업에서는 “선생님이 승인한 장소만 친구에게 공개”를 켜 두면 안심이에요.</li>
            <li>✏️ 생각 도우미 질문은 우리 반에 맞게 고칠 수 있어요. 🤖 로컬 AI 도우미를 켜면 초안도 만들 수 있어요.</li>
            <li>학기 말에는 🧹 모두 지우기로 학급 기록을 정리해요(먼저 엑셀로 저장).</li>
          </ul>
        </section>

        <section id="acts" className="card">
          <h2>3. 활동 목록</h2>
          {UNITS.map((u) => (
            <div key={u.title} className="guide-unit">
              <h3>
                {u.grade} {u.title}
              </h3>
              <ul>
                {u.activities.map((id) => (
                  <li key={id}>
                    <span className="std-chip">{ACTIVITIES[id].standard}</span> <strong>{ACTIVITIES[id].title}</strong> — {ACTIVITIES[id].guide}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="safety" className="card">
          <h2>4. 안전과 개인정보</h2>
          <ul className="guide-steps">
            <li>학생의 실명·이메일·사진·음성은 받지 않아요. 학급 코드와 번호, 선택 별명만 써요.</li>
            <li>학생은 입장할 때 “집 위치는 표시하지 않기, 친구의 느낌 존중하기”에 약속해요.</li>
            <li>연표·미션·퀴즈형 기록은 학생 본인과 선생님만 볼 수 있어요(보안 규칙으로도 막혀 있어요). 발표 화면에는 이름 없이 반 전체 요약만 나와요.</li>
            <li>한 크롬북을 여러 학생이 번갈아 써도, 학생은 자기 번호로 남긴 기록만 이어서 고칠 수 있어요.</li>
            <li>로컬 AI 도우미는 선생님 PC 안에서만 동작하고, 학생 이름을 보내지 않아요. 학생은 AI를 쓰지 않아요.</li>
            <li>학교에서 쓰기 전에 학교의 개인정보 처리 절차를 확인하고, 아래 견본으로 학부모님께 안내해 주세요.</li>
          </ul>
          <ParentNotice />
        </section>

        <section id="copy" className="card">
          <h2>5. 우리 학교에서 수업에 쓰기 (학급 모드)</h2>
          <p>
            공개 주소는 체험 모드로만 동작해요. 학생 크롬북들을 연결하려면 이 앱을 복사(Fork)해 우리 학교만의 주소와 저장소를
            만들어요. 기록이 다른 학교와 섞이지 않고, 비용은 들지 않아요. GitHub 계정과 Google 계정이 필요해요.
          </p>
          <ol className="guide-steps">
            <li>
              GitHub 계정을 만들고{' '}
              <a href={REPO} target="_blank" rel="noreferrer">
                이 저장소
              </a>
              에서 <strong>Fork</strong>를 눌러 내 계정으로 복사해요.
            </li>
            <li>
              내 저장소의 <strong>Settings → Pages → Source</strong>를 <strong>GitHub Actions</strong>로 바꾸고,{' '}
              <strong>Actions</strong> 탭에서 워크플로를 켠 뒤 <strong>Run workflow</strong>를 눌러요. 1~2분 뒤 내 주소가 생겨요.
            </li>
            <li>
              무료 Firebase 프로젝트를 만들어 익명 로그인과 Firestore를 켜고, <code>firestore.rules</code>를 규칙 탭에 붙여 넣어
              게시한 뒤, 설정값을 내 저장소의 <code>src/config.ts</code>에 넣어요. 자세한 순서는{' '}
              <a href={REPO} target="_blank" rel="noreferrer">
                README
              </a>
              의 “② 우리 학교에서 수업에 쓰기”에 있어요.
            </li>
            <li>
              새 활동이 나오면 내 저장소 첫 화면의 <strong>Sync fork</strong>를 눌러 받아요. 보안 규칙이 바뀌었다면 Firebase 규칙 탭에도
              다시 붙여 넣어 주세요.
            </li>
            <li>
              학교 검색이 잘 안 되면 지도에서 학교를 직접 눌러 위치를 정하면 돼요.
            </li>
          </ol>
        </section>

        <section id="feedback" className="card">
          <h2>6. 고칠 점과 제안 보내기</h2>
          <p>
            앱을 쓰며 불편한 점, 틀린 내용, 있었으면 하는 활동을 알려 주세요. GitHub 계정으로 글을 남기면 함께
            고쳐 나가요(고친 내용은 내 저장소의 Sync fork로 받아요). 남긴 글과 진행 상황은{' '}
            <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
              의견 게시판
            </a>
            에서 볼 수 있어요.
          </p>
          <div className="feedback-links">
            <a className="btn" href={issueUrl('1-bug.yml')} target="_blank" rel="noreferrer">
              🐞 고칠 점 알리기
            </a>
            <a className="btn" href={issueUrl('2-content.yml')} target="_blank" rel="noreferrer">
              📚 내용 바로잡기
            </a>
            <a className="btn" href={issueUrl('3-idea.yml')} target="_blank" rel="noreferrer">
              💡 새 활동·기능 제안
            </a>
          </div>
          <ul className="guide-steps">
            <li>
              <strong>게시판은 누구나 볼 수 있어요.</strong> 학생 이름, 학급 코드, 학생 글이 보이는 화면 사진은 올리지 마세요.
            </li>
            <li>내용을 바로잡을 때는 교과서나 국가기관 자료 같은 출처를 함께 적어 주세요.</li>
            <li>교사 화면에서 활동을 고른 뒤 아래쪽의 “이 활동 의견 보내기”를 누르면 활동 이름이 미리 채워져요.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

/** 학부모 안내문 견본: 복사해서 학교 가정통신문 양식에 붙여 씁니다 */
function ParentNotice() {
  const [msg, setMsg] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(PARENT_NOTICE);
      setMsg('복사했어요. 학교 가정통신문 양식에 붙여 넣고 [ ] 빈칸을 채워 주세요.');
    } catch {
      setMsg('복사하지 못했어요. 아래 글을 직접 선택해서 복사해 주세요.');
    }
  }
  return (
    <details className="notice-box" id="parent-notice">
      <summary>
        <strong>📄 학부모 안내문 견본</strong> (복사해서 가정통신문에 붙여 쓰기)
      </summary>
      <h3>보내기 전에 확인해 주세요</h3>
      <ul className="guide-steps">
        {NOTICE_CHECKLIST.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="row">
        <button type="button" className="btn btn--primary" onClick={copy}>
          📋 안내문 복사하기
        </button>
        <span className="hint" role="status">
          {msg}
        </span>
      </div>
      <textarea className="notice-text" readOnly value={PARENT_NOTICE} rows={18} aria-label="학부모 안내문 견본" />
      <p className="hint">이 견본은 법률 자문이 아니에요. 학교의 절차와 양식이 우선이에요.</p>
    </details>
  );
}
