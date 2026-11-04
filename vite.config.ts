import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** 빌드한 파일 목록으로 오프라인 대비 서비스 워커(dist/sw.js)를 만듭니다. */
function offlineServiceWorker(): Plugin {
  let outDir = 'dist';
  let root = '.';
  return {
    name: 'offline-service-worker',
    apply: 'build',
    configResolved(c) {
      root = c.root;
      outDir = resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      const walk = (d: string): string[] =>
        readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map'))
        .sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)));
      const version = hash.digest('hex').slice(0, 12);
      const template = readFileSync(resolve(root, 'src/sw/sw.js'), 'utf8');
      const sw = template
        .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(version)};`)
        .replace('const PRECACHE = __PRECACHE__;', `const PRECACHE = ${JSON.stringify(files)};`);
      if (sw.includes("'__VERSION__';") || sw.includes('= __PRECACHE__;')) throw new Error('sw.js 자리표시를 채우지 못했어요');
      writeFileSync(join(outDir, 'sw.js'), sw);
    },
  };
}

// base: './' 로 두면 GitHub Pages 등 어느 하위 경로에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react(), offlineServiceWorker()],
  // Firebase는 학급 모드에서만 따로 내려받으므로 크기 경고 기준을 넉넉히 둡니다.
  build: { chunkSizeWarningLimit: 700 },
});
