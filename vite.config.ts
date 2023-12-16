import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig(({command, mode})=>{
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      vueJsx(),
      ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      GOOGLE_API_KEY: `"${env.GOOGLE_API_KEY}"`,
      MAP_TILER_API_KEY: `"${env.MAP_TILER_API_KEY}"`,
      BING_API_KEY: `"${env.BING_API_KEY}"`
    }
  };
});
