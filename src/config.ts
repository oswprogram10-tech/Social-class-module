/**
 * 앱 설정 파일
 * ------------------------------------------------------------
 * 아무것도 채우지 않아도 앱은 동작합니다(체험 모드).
 *  - 체험 모드: 데이터가 이 브라우저에만 저장됩니다.
 *    같은 크롬북의 여러 탭끼리는 실시간으로 공유되므로 활동을 미리 살펴볼 때 좋습니다.
 *  - 학급 모드: 아래 firebase 값을 채우면 여러 크롬북이 실시간으로 연결됩니다.
 *
 * 설정 방법은 README.md의 "② 우리 학교에서 수업에 쓰기"를 보세요.
 * Firebase 웹 설정값과 브이월드 키는 공개되어도 괜찮은 값입니다
 * (보안은 firestore.rules 와 브이월드 도메인 등록으로 지킵니다).
 */

/** Firebase 웹 설정값: Firebase 콘솔에서 복사한 값을 여기에 붙여 넣으세요 (README “② 우리 학교에서 수업에 쓰기”). */
const pasted = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/**
 * 다른 플랫폼에서 호스팅할 때는 소스를 고치지 않고, 빌드할 때 환경 변수(VITE_FIREBASE_*)로 값을 줄 수 있어요.
 * 환경 변수가 있으면 그 값을, 없으면 위에 붙여 넣은 값을 씁니다. 자세한 방법은 docs/hosting.md.
 */
const env = import.meta.env;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || pasted.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || pasted.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || pasted.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || pasted.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || pasted.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || pasted.appId,
};

/**
 * 브이월드(VWorld) 지도 API 키.
 * 비워 두면 OpenStreetMap 지도를 사용합니다.
 * 키를 넣으면 국토교통부 브이월드 배경지도와 영상(항공사진)지도를 쓸 수 있습니다.
 */
export const vworldKey: string = env.VITE_VWORLD_KEY || '';
// ↑ 브이월드 키도 '' 안에 직접 넣거나, VITE_VWORLD_KEY 환경 변수로 줄 수 있어요.

/** 개발용: `VITE_FIREBASE_EMULATOR=1 npm run dev` 로 실행하면 내 컴퓨터의 Firebase 에뮬레이터에 연결합니다. */
export const useEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === '1';

/** Firebase 설정이 채워져 있으면 학급 모드로 동작합니다. */
export const isClassMode = useEmulator || Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

/**
 * 고칠 점과 제안을 받는 GitHub 저장소.
 * 복사(Fork)해서 쓰는 학교도 기본값을 그대로 두면 원래 저장소로 의견이 모여, 모든 학교가 함께 고친 내용을 받습니다.
 */
export const feedbackRepo: string = env.VITE_FEEDBACK_REPO || 'https://github.com/oswprogram10-tech/Social-class-module';

export type FeedbackTemplate = '1-bug.yml' | '2-content.yml' | '3-idea.yml';

/** 의견 보내기 주소. fields의 값은 이슈 양식의 같은 id 칸에 미리 채워집니다. */
export function issueUrl(template: FeedbackTemplate, fields: Record<string, string> = {}): string {
  const q = new URLSearchParams({ template, ...fields });
  return `${feedbackRepo}/issues/new?${q.toString().replace(/\+/g, '%20')}`;
}
