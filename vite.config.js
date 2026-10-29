import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    var model = env.VITE_GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-1.5-flash';
    return {
        plugins: [react()],
        define: {
            'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
            'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify(model),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        charts: ['recharts'],
                        icons: ['lucide-react'],
                    },
                },
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
        },
    };
});
