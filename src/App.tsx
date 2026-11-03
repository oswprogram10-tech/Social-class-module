import { useHashRoute } from './hooks';
import Home from './pages/Home';
import TeacherCreate from './pages/TeacherCreate';
import TeacherBoard from './pages/TeacherBoard';
import TeacherLogin from './pages/TeacherLogin';
import TeacherReport from './pages/TeacherReport';
import StudentJoin from './pages/StudentJoin';
import StudentMap from './pages/StudentMap';
import { normalizeCode } from './data/common';

/**
 * 화면 주소
 *   #/                  첫 화면
 *   #/teacher/new       학급 만들기
 *   #/teacher/login     다른 기기에서 Google 로그인
 *   #/teacher/코드      교사 화면
 *   #/teacher/코드/report  3범주 성장 리포트
 *   #/join(/코드)       학생 입장
 *   #/class/코드        학생 활동 화면
 */
export default function App() {
  const [page, param, sub] = useHashRoute();
  const code = param ? normalizeCode(param) : '';

  if (page === 'teacher' && param === 'new') return <TeacherCreate />;
  if (page === 'teacher' && param === 'login') return <TeacherLogin />;
  if (page === 'teacher' && code && sub === 'report') return <TeacherReport code={code} />;
  if (page === 'teacher' && code) return <TeacherBoard code={code} />;
  if (page === 'join') return <StudentJoin initialCode={code} />;
  if (page === 'class' && code) return <StudentMap code={code} />;
  return <Home />;
}
