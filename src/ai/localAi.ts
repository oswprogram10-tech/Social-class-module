/**
 * 교사 전용 로컬 AI (선생님 PC의 Ollama)
 *
 * - 학생 화면에서는 쓰지 않습니다. 교사 화면에서 초안을 만들 때만 씁니다.
 * - 요청은 선생님 PC(localhost)로만 가고, 인터넷의 AI 서비스로 나가지 않습니다.
 * - 설정은 이 브라우저(localStorage)에만 저장합니다.
 *
 * Ollama API: https://github.com/ollama/ollama/blob/main/docs/api.md
 */

export interface AiConfig {
  enabled: boolean;
  baseUrl: string;
  model: string;
}

const KEY = 'scm:ai';
export const DEFAULT_AI: AiConfig = { enabled: false, baseUrl: 'http://localhost:11434', model: '' };

export function loadAiConfig(): AiConfig {
  try {
    return { ...DEFAULT_AI, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<AiConfig>) };
  } catch {
    return { ...DEFAULT_AI };
  }
}

export function saveAiConfig(cfg: AiConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* 저장 공간이 없으면 무시 */
  }
  window.dispatchEvent(new Event('scm-ai-config'));
}

export function isAiReady(cfg: AiConfig): boolean {
  return cfg.enabled && !!cfg.model && !!cfg.baseUrl;
}

export class AiError extends Error {}

function base(cfg: AiConfig) {
  return cfg.baseUrl.replace(/\/+$/, '');
}

/** 연결 실패를 선생님이 고칠 수 있는 말로 바꿉니다 */
function connectionHelp(cfg: AiConfig, err: unknown): AiError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return new AiError('시간이 너무 오래 걸려 멈췄어요. 더 작은 모델을 고르거나 잠시 뒤 다시 시도해 주세요.');
  }
  return new AiError(
    `선생님 PC의 Ollama(${base(cfg)})에 연결하지 못했어요. ` +
      '① Ollama가 켜져 있는지(작업 표시줄 오른쪽 아래 라마 아이콘), ' +
      '② 환경 변수 OLLAMA_ORIGINS에 이 앱 주소를 넣고 Ollama를 다시 켰는지, ' +
      '③ 크롬이 “로컬 네트워크 접근”을 물으면 “허용”을 눌렀는지 확인해 주세요. 자세한 방법은 README의 “로컬 AI”를 보세요.',
  );
}

export interface ModelInfo {
  name: string;
  sizeGB: number;
}

/** 설치된 모델 목록 (연결 확인 겸용) */
export async function listModels(cfg: AiConfig): Promise<ModelInfo[]> {
  let res: Response;
  try {
    res = await fetch(`${base(cfg)}/api/tags`, { signal: AbortSignal.timeout(8000) });
  } catch (e) {
    throw connectionHelp(cfg, e);
  }
  if (!res.ok) throw new AiError(`Ollama가 응답했지만 오류가 났어요 (${res.status}).`);
  const data = (await res.json()) as { models?: { name: string; size?: number }[] };
  return (data.models ?? []).map((m) => ({ name: m.name, sizeGB: (m.size ?? 0) / 1e9 }));
}

export interface ChatOptions {
  system: string;
  user: string;
  /** 지금까지 만든 글자 수 (진행 표시용) */
  onProgress?: (chars: number) => void;
  signal?: AbortSignal;
  /** 기본 3분: CPU만 있는 PC에서는 오래 걸릴 수 있어요 */
  timeoutMs?: number;
}

/** 모델에게 JSON으로 답하게 하고, 받은 JSON을 돌려줍니다 */
export async function chatJson<T = unknown>(cfg: AiConfig, opts: ChatOptions): Promise<T> {
  const timeout = AbortSignal.timeout(opts.timeoutMs ?? 180_000);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
  let res: Response;
  try {
    res = await fetch(`${base(cfg)}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: cfg.model,
        stream: true,
        format: 'json',
        options: { temperature: 0.6 },
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
    });
  } catch (e) {
    throw connectionHelp(cfg, e);
  }
  if (res.status === 404) throw new AiError(`모델 “${cfg.model}”을(를) 찾지 못했어요. 설정에서 모델을 다시 골라 주세요.`);
  if (!res.ok || !res.body) throw new AiError(`AI가 오류로 답했어요 (${res.status}).`);

  // 스트리밍(NDJSON): 한 줄에 한 조각씩 옵니다.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let text = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const chunk = JSON.parse(line) as { message?: { content?: string }; error?: string };
        if (chunk.error) throw new AiError(`AI 오류: ${chunk.error}`);
        text += chunk.message?.content ?? '';
        opts.onProgress?.(text.length);
      }
    }
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw connectionHelp(cfg, e);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError('AI의 답을 읽지 못했어요. 한 번 더 시도해 보세요. 계속 안 되면 다른 모델을 골라 주세요.');
  }
}
