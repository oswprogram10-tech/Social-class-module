import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import OfflineBanner from './components/OfflineBanner';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <OfflineBanner />
  </StrictMode>,
);

// 오프라인 대비: 배포한 앱에서만 앱 파일을 이 기기에 저장합니다(src/sw/sw.js).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        // 새 버전이 올라왔는지 열 때, 30분마다, 인터넷이 다시 연결될 때 확인합니다.
        const check = () => reg.update().catch(() => {});
        check();
        setInterval(check, 30 * 60 * 1000);
        window.addEventListener('online', check);
      })
      .catch((e) => console.warn('오프라인 대비를 켜지 못했어요', e));
  });
}

// 새 버전이 올라온 뒤 옛 화면이 지운 파일을 찾으면, 한 번만 새로고침해 새 버전으로 엽니다.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('scm:reloadedAt') ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem('scm:reloadedAt', String(Date.now()));
  } catch {
    // 몇 번 새로고침했는지 기억할 수 없으면, 계속 새로고침하지 않도록 그만둡니다.
    return;
  }
  event.preventDefault();
  location.reload();
});
