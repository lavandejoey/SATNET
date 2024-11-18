// /vite.config.js
import {defineConfig} from 'vite';

export default defineConfig({
    // build: {
    //     rollupOptions: {
    //         // exclude Cesium from bundle
    //         external: ['cesium'],
    //         output: {
    //             // global variables
    //             globals: {
    //                 cesium: 'Cesium',
    //             },
    //         },
    //     },
    //     assetsInlineLimit: 0,
    // },
    optimizeDeps: {
        // prevent warnings
        include: ['cesium'],
    },
    publicDir: 'public',
});