import { useEffect, useState } from 'react';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function koreanVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('ko'));
}

export function speak(text: string) {
  if (!supported) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = 0.9;
  const voice = koreanVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

/** 🔊 읽어주기 버튼 (브라우저 내장 음성, 무료) */
export default function Speak({ text, label = '읽어주기' }: { text: string; label?: string }) {
  const [, setReady] = useState(false);
  useEffect(() => {
    if (!supported) return;
    const onVoices = () => setReady(true);
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
  }, []);
  if (!supported) return null;
  return (
    <button type="button" className="speak" onClick={() => speak(text)} aria-label={`${label}: ${text}`} title={label}>
      🔊
    </button>
  );
}
