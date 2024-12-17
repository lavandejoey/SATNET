import {defineConfig} from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
    build: {
        target: 'esnext',
        minify: false,
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    define: {
        CESIUM_BASE_URL: JSON.stringify('/'),
    },
    plugins: [cesium()],
    optimizeDeps: {
        include: ["cesium"],
    },
    publicDir: "public",
    server: {
        host: "127.0.0.1",
        port: 4170,
        strictPort: true,
    },
    preview: {
        host: "127.0.0.1",
        port: 4170,
        strictPort: true,
    }
});
