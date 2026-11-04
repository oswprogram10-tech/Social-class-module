import { useEffect, useState } from 'react';
import { isClassMode } from '../config';

/** 인터넷이 끊기면 화면 위에 알려 줍니다. */
export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      📡 인터넷이 끊겼어요.{' '}
      {isClassMode
        ? '다시 연결되면 기록이 저장돼요. 그때까지 이 창을 닫지 말아 주세요.'
        : '활동은 계속할 수 있어요. 지도 그림과 사진은 다시 연결되면 보여요.'}
    </div>
  );
}
