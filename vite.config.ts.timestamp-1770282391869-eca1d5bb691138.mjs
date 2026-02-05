// vite.config.ts
import { resolve } from "node:path";
import VueI18n from "file:///E:/VScode/it-tools-main/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import vue from "file:///E:/VScode/it-tools-main/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///E:/VScode/it-tools-main/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import Unocss from "file:///E:/VScode/it-tools-main/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///E:/VScode/it-tools-main/node_modules/unplugin-auto-import/dist/vite.js";
import IconsResolver from "file:///E:/VScode/it-tools-main/node_modules/unplugin-icons/dist/resolver.mjs";
import Icons from "file:///E:/VScode/it-tools-main/node_modules/unplugin-icons/dist/vite.mjs";
import { NaiveUiResolver } from "file:///E:/VScode/it-tools-main/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import Components from "file:///E:/VScode/it-tools-main/node_modules/unplugin-vue-components/dist/vite.mjs";
import { defineConfig } from "file:///E:/VScode/it-tools-main/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///E:/VScode/it-tools-main/node_modules/vite-plugin-pwa/dist/index.js";
import markdown from "file:///E:/VScode/it-tools-main/node_modules/vite-plugin-vue-markdown/dist/index.mjs";
import svgLoader from "file:///E:/VScode/it-tools-main/node_modules/vite-svg-loader/index.js";
import { configDefaults } from "file:///E:/VScode/it-tools-main/node_modules/vitest/dist/config.js";
var __vite_injected_original_dirname = "E:\\VScode\\it-tools-main";
var baseUrl = process.env.BASE_URL ?? "/";
var projectRoot = resolve(process.cwd());
var srcDir = resolve(projectRoot, "src");
var vite_config_default = defineConfig({
  plugins: [
    VueI18n({
      runtimeOnly: true,
      jitCompilation: true,
      compositionOnly: true,
      fullInstall: true,
      strictMessage: false,
      include: [
        resolve(__vite_injected_original_dirname, "locales/**")
      ]
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        "vue-i18n",
        {
          "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"]
        }
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true
      }
    }),
    Icons({ compiler: "vue3" }),
    vue({
      include: [/\.vue$/, /\.md$/]
    }),
    vueJsx(),
    markdown(),
    svgLoader(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      manifest: {
        name: "IT Tools",
        description: "Aggregated set of useful tools for developers.",
        display: "standalone",
        lang: "fr-FR",
        start_url: `${baseUrl}?utm_source=pwa&utm_medium=pwa`,
        orientation: "any",
        theme_color: "#18a058",
        background_color: "#f1f5f9",
        icons: [
          {
            src: "/favicon-16x16.png",
            type: "image/png",
            sizes: "16x16"
          },
          {
            src: "/favicon-32x32.png",
            type: "image/png",
            sizes: "32x32"
          },
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    Components({
      dirs: ["src/"],
      extensions: ["vue", "md"],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [NaiveUiResolver(), IconsResolver({ prefix: "icon" })]
    }),
    Unocss()
  ],
  base: baseUrl,
  root: projectRoot,
  resolve: {
    alias: {
      "@": srcDir
    }
  },
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(process.env.npm_package_version)
  },
  server: {
    fs: {
      allow: [projectRoot]
    },
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  test: {
    exclude: [...configDefaults.exclude, "**/*.e2e.spec.ts"]
  },
  build: {
    target: "esnext"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxWU2NvZGVcXFxcaXQtdG9vbHMtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcVlNjb2RlXFxcXGl0LXRvb2xzLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1ZTY29kZS9pdC10b29scy1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBVUkwsIGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmltcG9ydCBWdWVJMThuIGZyb20gJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBVbm9jc3MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgSWNvbnNSZXNvbHZlciBmcm9tICd1bnBsdWdpbi1pY29ucy9yZXNvbHZlcic7XG5pbXBvcnQgSWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSc7XG5pbXBvcnQgeyBOYWl2ZVVpUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuaW1wb3J0IG1hcmtkb3duIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1tYXJrZG93bic7XG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcic7XG5pbXBvcnQgeyBjb25maWdEZWZhdWx0cyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuXG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuQkFTRV9VUkwgPz8gJy8nO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKHByb2Nlc3MuY3dkKCkpO1xuY29uc3Qgc3JjRGlyID0gcmVzb2x2ZShwcm9qZWN0Um9vdCwgJ3NyYycpO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIFZ1ZUkxOG4oe1xuICAgICAgcnVudGltZU9ubHk6IHRydWUsXG4gICAgICBqaXRDb21waWxhdGlvbjogdHJ1ZSxcbiAgICAgIGNvbXBvc2l0aW9uT25seTogdHJ1ZSxcbiAgICAgIGZ1bGxJbnN0YWxsOiB0cnVlLFxuICAgICAgc3RyaWN0TWVzc2FnZTogZmFsc2UsXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnbG9jYWxlcy8qKicpLFxuICAgICAgXSxcbiAgICB9KSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgJ3Z1ZScsXG4gICAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAgICd2dWUtaTE4bicsXG4gICAgICAgIHtcbiAgICAgICAgICAnbmFpdmUtdWknOiBbJ3VzZURpYWxvZycsICd1c2VNZXNzYWdlJywgJ3VzZU5vdGlmaWNhdGlvbicsICd1c2VMb2FkaW5nQmFyJ10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gICAgICBlc2xpbnRyYzoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBJY29ucyh7IGNvbXBpbGVyOiAndnVlMycgfSksXG4gICAgdnVlKHtcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC5tZCQvXSxcbiAgICB9KSxcbiAgICB2dWVKc3goKSxcbiAgICBtYXJrZG93bigpLFxuICAgIHN2Z0xvYWRlcigpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBzdHJhdGVnaWVzOiAnZ2VuZXJhdGVTVycsXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnSVQgVG9vbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FnZ3JlZ2F0ZWQgc2V0IG9mIHVzZWZ1bCB0b29scyBmb3IgZGV2ZWxvcGVycy4nLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIGxhbmc6ICdmci1GUicsXG4gICAgICAgIHN0YXJ0X3VybDogYCR7YmFzZVVybH0/dXRtX3NvdXJjZT1wd2EmdXRtX21lZGl1bT1wd2FgLFxuICAgICAgICBvcmllbnRhdGlvbjogJ2FueScsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzE4YTA1OCcsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZjFmNWY5JyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvZmF2aWNvbi0xNngxNi5wbmcnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBzaXplczogJzE2eDE2JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9mYXZpY29uLTMyeDMyLnBuZycsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnMzJ4MzInLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2FuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGRpcnM6IFsnc3JjLyddLFxuICAgICAgZXh0ZW5zaW9uczogWyd2dWUnLCAnbWQnXSxcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwubWQkL10sXG4gICAgICByZXNvbHZlcnM6IFtOYWl2ZVVpUmVzb2x2ZXIoKSwgSWNvbnNSZXNvbHZlcih7IHByZWZpeDogJ2ljb24nIH0pXSxcbiAgICB9KSxcbiAgICBVbm9jc3MoKSxcbiAgXSxcbiAgYmFzZTogYmFzZVVybCxcbiAgcm9vdDogcHJvamVjdFJvb3QsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBzcmNEaXIsXG4gICAgfSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgJ2ltcG9ydC5tZXRhLmVudi5QQUNLQUdFX1ZFUlNJT04nOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgZnM6IHtcbiAgICAgIGFsbG93OiBbcHJvamVjdFJvb3RdLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgfSxcbiAgfSxcbiAgdGVzdDoge1xuICAgIGV4Y2x1ZGU6IFsuLi5jb25maWdEZWZhdWx0cy5leGNsdWRlLCAnKiovKi5lMmUuc3BlYy50cyddLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlAsU0FBUyxlQUFlO0FBR3JSLE9BQU8sYUFBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sWUFBWTtBQUNuQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFdBQVc7QUFDbEIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sY0FBYztBQUNyQixPQUFPLGVBQWU7QUFDdEIsU0FBUyxzQkFBc0I7QUFoQi9CLElBQU0sbUNBQW1DO0FBa0J6QyxJQUFNLFVBQVUsUUFBUSxJQUFJLFlBQVk7QUFDeEMsSUFBTSxjQUFjLFFBQVEsUUFBUSxJQUFJLENBQUM7QUFDekMsSUFBTSxTQUFTLFFBQVEsYUFBYSxLQUFLO0FBR3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLGdCQUFnQjtBQUFBLE1BQ2hCLGlCQUFpQjtBQUFBLE1BQ2pCLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxNQUNmLFNBQVM7QUFBQSxRQUNQLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQ2pDO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxVQUNFLFlBQVksQ0FBQyxhQUFhLGNBQWMsbUJBQW1CLGVBQWU7QUFBQSxRQUM1RTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNLEVBQUUsVUFBVSxPQUFPLENBQUM7QUFBQSxJQUMxQixJQUFJO0FBQUEsTUFDRixTQUFTLENBQUMsVUFBVSxPQUFPO0FBQUEsSUFDN0IsQ0FBQztBQUFBLElBQ0QsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2IsU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sV0FBVyxHQUFHLE9BQU87QUFBQSxRQUNyQixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsTUFBTTtBQUFBLFlBQ04sT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxNQUFNO0FBQUEsWUFDTixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsTUFBTSxDQUFDLE1BQU07QUFBQSxNQUNiLFlBQVksQ0FBQyxPQUFPLElBQUk7QUFBQSxNQUN4QixTQUFTLENBQUMsVUFBVSxjQUFjLE9BQU87QUFBQSxNQUN6QyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsY0FBYyxFQUFFLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFBQSxJQUNsRSxDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixtQ0FBbUMsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxFQUNuRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0YsT0FBTyxDQUFDLFdBQVc7QUFBQSxJQUNyQjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixTQUFTLENBQUMsR0FBRyxlQUFlLFNBQVMsa0JBQWtCO0FBQUEsRUFDekQ7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
