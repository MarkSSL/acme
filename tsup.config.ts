import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs', 'esm'],
  target: 'es2022',
  platform: 'node',
  sourcemap: true,
  shims: false,
  dts: true,
  clean: true,
  entry: ['src/index.ts']
})
