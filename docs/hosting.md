# 다른 플랫폼에서 호스팅하기

이 문서는 「우리 동네 지도 탐구」를 교육청·학교·에듀테크 플랫폼의 서버에 올려 운영하는 담당자를 위한 안내입니다.

## 한눈에 보기

- **정적 웹앱입니다.** 서버 프로그램이나 데이터베이스 설치 없이, 빌드한 파일(`dist` 폴더, 약 1.7MB)을 웹 서버에 올리면 됩니다.
- **어느 주소에 올려도 됩니다.** 도메인 첫 화면(`https://edu.example.kr/`)이든 하위 폴더(`https://edu.example.kr/apps/social/`)든 그대로 동작합니다. 화면 이동은 주소의 `#` 뒷부분으로 하므로 서버 경로 재작성(rewrite) 설정이 필요 없습니다.
- **두 가지 방식으로 운영할 수 있습니다.**
  - **체험 모드:** 파일만 올리면 바로 쓸 수 있습니다. 기록은 각 브라우저에만 저장되어 여러 크롬북이 연결되지 않습니다.
  - **학급 모드:** Firebase 프로젝트를 하나 만들어 설정값을 넣고 빌드합니다. 교사 화면과 학생 크롬북들이 실시간으로 연결됩니다.

## 1. 서버 요구 사항

| 항목 | 내용 |
|---|---|
| 웹 서버 | 정적 파일을 보낼 수 있으면 됩니다(Nginx, Apache, IIS, 객체 저장소+CDN 등). |
| HTTPS | **필수**입니다. 오프라인 대비(서비스 워커), 주소 복사, Firebase 로그인은 HTTPS에서만 동작합니다. |
| 캐시 설정 (권장) | `index.html`, `sw.js`: `Cache-Control: no-cache` / `assets/` 아래 파일: `Cache-Control: public, max-age=31536000, immutable`(파일 이름에 버전이 들어 있음) |
| MIME 형식 | `.js` → `text/javascript`, `.webmanifest` → `application/manifest+json`(없어도 동작) |

`sw.js`는 반드시 `index.html`과 같은 폴더에 함께 올려 주세요. 빠지면 오프라인 대비가 꺼집니다(앱은 동작).

## 2. 보안 정책(CSP)에 허용할 주소

플랫폼이 콘텐츠 보안 정책(Content-Security-Policy)을 쓴다면 아래를 허용해 주세요. 앱은 학생 정보를 이 주소들로 보내지 않습니다.

| 쓰는 곳 | 주소 | 필요한 때 |
|---|---|---|
| 학교 주변 지도 그림 | `https://tile.openstreetmap.org` (img-src) | 항상(브이월드 키가 없을 때) |
| 브이월드 지도 | `https://api.vworld.kr` (img-src) | 브이월드 키를 넣었을 때 |
| 학교 찾기 | `https://nominatim.openstreetmap.org` (connect-src) | 교사가 학급을 만들 때 |
| 유물·지형 사진 | `https://commons.wikimedia.org`, `https://upload.wikimedia.org` (img-src) | 사진이 있는 활동 |
| 학급 모드 기록 | `https://firestore.googleapis.com`, `https://identitytoolkit.googleapis.com`, `https://securetoken.googleapis.com` (connect-src) | 학급 모드 |
| 교사 Google 계정 연결 | `https://apis.google.com` (script-src), `https://<프로젝트>.firebaseapp.com` (frame-src) | 교사가 Google 계정을 연결할 때만 |
| 교사 전용 로컬 AI | `http://localhost:11434` (connect-src) | 교사 PC에 Ollama를 설치해 쓸 때만 |

그 밖에 `script-src 'self'`, `style-src 'self' 'unsafe-inline'`(지도 라이브러리와 화면 요소가 인라인 스타일을 씀), `img-src 'self' data: blob:`, `worker-src 'self'`, `manifest-src 'self'`가 필요합니다.

**iframe 안에 넣는 경우:** 같은 도메인이면 그대로 동작합니다. 주소 복사 단추를 쓰려면 iframe에 `allow="clipboard-write"`를 넣어 주세요. Google 계정 연결은 팝업이라 iframe 설정에 따라 막힐 수 있습니다(익명으로 쓰는 학생 화면에는 영향 없음).

## 3. 체험 모드로 올리기 (가장 간단)

1. Node.js 22(또는 20.19 이상)가 있는 PC에서 저장소를 받습니다.
2. `npm ci`로 필요한 패키지를 설치하고 `npm run build`로 빌드합니다.
3. 만들어진 `dist` 폴더 안의 파일을 모두 웹 서버의 원하는 경로에 올립니다.

제출 꾸러미에 이미 빌드한 `dist`가 들어 있다면 1~2단계 없이 바로 올리면 됩니다.

## 4. 학급 모드로 올리기

### 4-1. Firebase 프로젝트 만들기 (처음 한 번)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만듭니다(Google Analytics는 꺼도 됩니다).
2. **Authentication → 로그인 방법**에서 **익명**을 켭니다. 교사가 다른 기기에서 학급을 관리하게 하려면 **Google**도 켭니다.
3. **Authentication → 설정 → 승인된 도메인**에 플랫폼 도메인(예: `edu.example.kr`)을 추가합니다.
4. **Firestore Database**를 만듭니다. 위치는 `asia-northeast3 (서울)`, **프로덕션 모드**로 시작합니다.
5. **Firestore → 규칙** 탭에 저장소의 `firestore.rules` 내용을 붙여 넣고 **게시**합니다.
6. **프로젝트 설정 → 일반 → 내 앱**에서 웹 앱(`</>`)을 추가하고 설정값(`firebaseConfig`)을 확인합니다.
7. (권장) [Google Cloud 콘솔](https://console.cloud.google.com/apis/credentials)에서 이 프로젝트의 API 키에 **HTTP 리퍼러 제한**을 걸어 플랫폼 도메인에서만 쓰이게 합니다.

Firebase 웹 설정값은 화면에 공개되어도 괜찮은 값입니다. 데이터는 `firestore.rules`가 지킵니다. 학급 코드를 아는 사람만 학급에 들어오고, 학생은 자기 기록만 고치며, 승인·숨김은 학급을 만든 교사만 할 수 있습니다.

### 4-2. 설정값을 넣어 빌드하기

소스 코드를 고치지 않고, 빌드할 때 환경 변수로 값을 줍니다. 저장소의 `.env.example`을 `.env.production`으로 복사해 값을 채운 뒤 빌드하면 됩니다.

```bash
cp .env.example .env.production
```

```bash
npm ci
```

```bash
npm run build
```

`dist` 폴더를 3번과 같이 올립니다. 첫 화면 위쪽에 “체험 모드” 띠가 보이지 않으면 학급 모드로 동작하는 것입니다.

### 4-3. 무료 요금제 한도

결제 수단을 등록하지 않은 Firebase 무료(Spark) 요금제는 하루에 Firestore 읽기 5만 건, 쓰기 2만 건까지입니다. 한도를 넘으면 그날만 멈추고 요금은 나오지 않습니다.

- 학교 하나나 몇 학급이 쓰기에는 충분합니다.
- 플랫폼 하나로 **여러 학교가 함께** 쓴다면 한도를 넘을 수 있습니다. 이때는 학교마다 Firebase 프로젝트를 따로 두어 빌드하거나, 종량제(Blaze)로 바꾸고 **예산 알림**을 설정해 주세요.

## 5. 업데이트

1. 저장소의 새 버전을 받습니다(`git pull` 또는 새 제출 꾸러미).
2. 같은 방법으로 빌드해 `dist`를 다시 올립니다. 학생 기기는 다음에 앱을 열 때나 30분 안에 새 파일을 받습니다.
3. **`firestore.rules`가 바뀌었다면** Firebase 규칙 탭에 다시 붙여 넣고 게시해야 합니다. 그러지 않으면 새 활동의 기록이 저장되지 않습니다. 바뀌었는지는 새 버전의 안내문이나 `git diff firestore.rules`로 확인합니다.

## 6. 심사·검토 담당자를 위한 요약

| 항목 | 내용 |
|---|---|
| 수집하는 정보 | 학급 코드, 출석 번호, 선택 별명(10자 이내), 활동 기록(장소, 글, 답). 이름·이메일·사진·음성·기기 위치는 받지 않음 |
| 학생 로그인 | Firebase 익명 로그인(기기마다 무작위 번호). 학생 계정을 만들지 않음 |
| 저장 위치 | 운영자가 만든 Firebase 프로젝트(권장 위치: 서울). 앱 개발자는 기록에 접근할 수 없음 |
| 공개 범위 | 지도에 남기는 일부 활동만 교사가 공개한 경우 같은 반 친구에게 보임(작성자 표시 없음). 나머지는 학생 본인과 교사만 |
| AI | 학생은 AI를 쓰지 않음. 교사가 자기 PC의 로컬 AI(선택)를 쓸 때도 데이터는 그 PC 밖으로 나가지 않음 |
| 외부 연결 | 지도 그림, 학교 검색, 사진(위 2번 표). 학생 정보는 보내지 않음 |
| 접근성 | WCAG 2.1 AA 자동 점검 위반 0건, 키보드만으로 활동 가능 ([accessibility.md](accessibility.md)) |
| 보호자 안내 | [학부모 안내문 견본](parent-notice.md) |
| 라이선스 | 코드와 활동 글은 MIT. 지도·사진·통계는 각 출처의 조건(앱 화면에 표시) |
| 기록 삭제 | 교사 화면의 “모두 지우기”로 학급 기록 전체 삭제 |
