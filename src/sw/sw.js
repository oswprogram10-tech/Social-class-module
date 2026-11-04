/*
 * 오프라인 대비 서비스 워커
 * ------------------------------------------------------------
 * 처음 한 번 앱을 열면 앱 파일(화면, 활동, 세계·우리나라 지도 자료)을 이 기기에 저장해 둡니다.
 * 학교 인터넷이 느리거나 잠깐 끊겨도 앱 화면은 바로 열립니다.
 *  - 앱 화면(index.html): 인터넷에서 먼저 받고, 3초 안에 안 오거나 끊겼으면 저장해 둔 것을 씁니다.
 *  - 새 버전을 올리면 새 서비스 워커가 새 앱 파일을 통째로 저장한 뒤 옛것을 지웁니다.
 *  - 나머지 앱 파일: 파일 이름에 버전이 들어 있어 저장해 둔 것을 바로 씁니다.
 *  - 다른 사이트(Firebase 기록, 지도 그림, 위키미디어 사진)는 건드리지 않습니다.
 * 빌드할 때 vite.config.ts가 __VERSION__과 __PRECACHE__를 채워 dist/sw.js로 만듭니다.
 */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = 'app-' + VERSION;
const SHELL = 'index.html';
const NAV_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function navigate(request) {
  // 저장한 화면은 이 버전의 앱 파일과 짝이 맞는 것만 씁니다(새 버전 화면은 새 서비스 워커가 통째로 저장).
  const network = fetch(request);
  const timeout = new Promise((resolve) => setTimeout(resolve, NAV_TIMEOUT_MS));
  return caches.match(SHELL, { ignoreVary: true }).then((cached) => {
    if (!cached) return network;
    // 느린 인터넷: 3초 안에 안 오면 저장해 둔 화면, 끊긴 인터넷: 바로 저장해 둔 화면
    return Promise.race([network.catch(() => cached), timeout.then(() => cached)]);
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
    return;
  }
  event.respondWith(caches.match(request, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(request)));
});
