import { defineConfig, loadEnv } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => {
  // Load the current env file (production in build case) located in the environment directory
  const env = loadEnv(mode, 'environment');

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      'import.meta.env.VITE_SDK_URL': 'https://sdk.incode.com/sdk/onBoarding-1.73.1.js'
    },
    server: {
      https: true,
    },
    plugins: [mkcert()],
    base: '/onboarding-core-javascript/',
    envDir: 'environment',
  }
})