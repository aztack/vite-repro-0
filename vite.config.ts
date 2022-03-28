import inject from '@rollup/plugin-inject';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: path.resolve(__dirname),
    plugins: [
        inject({Buffer: ['buffer', "Buffer"]})
    ],
    resolve: {
        preserveSymlinks: true
    },
    build: {
        sourcemap: true,
        outDir: './dist'
    },
    define: {
        global: 'window', // fix for packages that support both node and browser
    }
});
