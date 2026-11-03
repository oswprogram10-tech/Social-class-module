import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' 로 두면 GitHub Pages 등 어느 하위 경로에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Firebase는 학급 모드에서만 따로 내려받으므로 크기 경고 기준을 넉넉히 둡니다.
  build: { chunkSizeWarningLimit: 700 },
});
