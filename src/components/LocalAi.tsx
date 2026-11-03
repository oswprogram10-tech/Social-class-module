import { useEffect, useRef, useState } from 'react';
import { AiError, isAiReady, listModels, loadAiConfig, saveAiConfig, type AiConfig, type ModelInfo } from '../ai/localAi';
import type { AiCtl } from '../ai/prompts';

/** 이 브라우저의 로컬 AI 설정 (다른 화면에서 바꿔도 함께 바뀜) */
export function useAiConfig(): AiConfig {
  const [cfg, setCfg] = useState(loadAiConfig);
  useEffect(() => {
    const on = () => setCfg(loadAiConfig());
    window.addEventListener('scm-ai-config', on);
    return () => window.removeEventListener('scm-ai-config', on);
  }, []);
  return cfg;
}

/** 교사 화면 설정: 선생님 PC의 Ollama 연결 */
export function LocalAiSettings() {
  const cfg = useAiConfig();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(cfg.baseUrl);
  const [models, setModels] = useState<ModelInfo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function check() {
    setBusy(true);
    setMsg('');
    try {
      const list = await listModels({ ...cfg, baseUrl: url });
      setModels(list);
      if (list.length === 0) setMsg('연결됐지만 설치된 모델이 없어요. 명령 프롬프트에서 “ollama pull 모델이름”으로 받아 주세요.');
      saveAiConfig({ ...cfg, baseUrl: url, model: list.some((m) => m.name === cfg.model) ? cfg.model : (list[0]?.name ?? '') });
    } catch (e) {
      setModels(null);
      setMsg(e instanceof AiError ? e.message : '연결하지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  const ready = isAiReady(cfg);
  return (
    <section className="card ai-settings">
      <h2>🤖 로컬 AI 도우미 (선택)</h2>
      <p className="hint">
        선생님 PC의 Ollama로 질문·자료·소견 <strong>초안</strong>을 만들어요. 학생은 AI를 쓰지 않고, 기록은 인터넷의 AI 서비스로
        나가지 않아요.
      </p>
      <label className="check">
        <input
          type="checkbox"
          checked={cfg.enabled}
          onChange={(e) => {
            saveAiConfig({ ...cfg, enabled: e.target.checked });
            if (e.target.checked) setOpen(true);
          }}
        />
        로컬 AI 도우미 쓰기 {ready && <span className="tag tag--good">연결됨 · {cfg.model}</span>}
      </label>
      {cfg.enabled && (
        <>
          <button type="button" className="btn btn--small" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? '설정 접기' : '연결 설정'}
          </button>
          {open && (
            <div className="question-editor">
              <label className="field">
                <span>Ollama 주소</span>
                <input value={url} onChange={(e) => setUrl(e.target.value)} />
              </label>
              <button type="button" className="btn btn--small btn--primary" onClick={check} disabled={busy}>
                {busy ? '확인 중…' : '연결 확인'}
              </button>
              {models && models.length > 0 && (
                <label className="field">
                  <span>모델</span>
                  <select value={cfg.model} onChange={(e) => saveAiConfig({ ...cfg, model: e.target.value })}>
                    {models.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.sizeGB.toFixed(1)}GB)
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {msg && <p className="error">{msg}</p>}
              <p className="hint">설정은 이 브라우저에만 저장돼요. 처음 설정 방법은 README의 “로컬 AI 도우미”를 보세요.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * AI로 초안을 만드는 버튼: 진행 상황(글자 수, 걸린 시간)과 취소를 보여 줍니다.
 * run 이 끝나면 결과를 편집 칸에 넣는 일은 부르는 쪽이 합니다.
 */
export function AiButton({
  label,
  run,
  disabled,
}: {
  label: string;
  run: (ctl: AiCtl) => Promise<void>;
  disabled?: boolean;
}) {
  const cfg = useAiConfig();
  const [busy, setBusy] = useState(false);
  const [chars, setChars] = useState(0);
  const [secs, setSecs] = useState(0);
  const [msg, setMsg] = useState('');
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  useEffect(() => () => ctrl.current?.abort(), []);

  if (!isAiReady(cfg)) return null;

  async function go() {
    ctrl.current = new AbortController();
    setBusy(true);
    setChars(0);
    setSecs(0);
    setMsg('');
    try {
      await run({ onProgress: setChars, signal: ctrl.current.signal });
    } catch (e) {
      if (ctrl.current?.signal.aborted) setMsg('취소했어요.');
      else setMsg(e instanceof AiError ? e.message : 'AI가 초안을 만들지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-run">
      {busy ? (
        <div className="ai-run__busy" role="status">
          <span className="spinner" aria-hidden />
          <span>
            AI가 생각하는 중… {secs}초 · 글자 {chars}개
            <br />
            <small>컴퓨터 성능에 따라 1~2분 걸릴 수 있어요.</small>
          </span>
          <button type="button" className="btn btn--small" onClick={() => ctrl.current?.abort()}>
            취소
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--small btn--ai" onClick={go} disabled={disabled}>
          🤖 {label}
        </button>
      )}
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}

export function AiDraftNote() {
  return <p className="ai-note">🤖 AI가 만든 초안이에요. 내용이 맞는지 확인하고 고쳐서 저장해 주세요.</p>;
}
