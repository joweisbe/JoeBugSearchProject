import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // define: {
  //   _global: ({})
  // }
  // base: "/",
  // build: {
  //   outDir: 'build', // Specify the output directory
  //   assetsDir: 'assets', // Specify the directory for assets
  //   rollupOptions: {
  //     input: {
  //       main: 'src/main.jsx', // Specify the entry point
  //     },
  //   },
  //   emptyOutDir: true, // Ensure the output directory is emptied before building
  // }
})
