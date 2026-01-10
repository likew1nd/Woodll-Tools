import { createRouter, createWebHistory } from 'vue-router';
import { layouts } from './layouts/index';
import HomePage from './pages/Home.page.vue';
import AdminPage from './pages/Admin.page.vue';
import NotFound from './pages/404.page.vue';
import { tools, toolsWithCategory } from './tools';
import { config } from './config';
import { routes as demoRoutes } from './ui/demo/demo.routes';
import { useToolsConfigStore } from './stores/tools-config.store';
import { buildDefaultToolsConfig } from './tools/tools-config';

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
}));
const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map(redirectSource => ({ path: redirectSource, redirect: path })) ?? [],
  );

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/About.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { layout: layouts.base },
    },
    ...toolsRoutes,
    ...toolsRedirectRoutes,
    ...(config.app.env === 'development' ? demoRoutes : []),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

const defaultConfig = buildDefaultToolsConfig();
const defaultCategoryByPath = new Map(toolsWithCategory.map(tool => [tool.path, tool.category]));

router.beforeEach(async (to) => {
  if (!to.meta?.isTool) {
    return true;
  }

  const toolsConfigStore = useToolsConfigStore();
  await toolsConfigStore.fetchConfig();

  const currentConfig = toolsConfigStore.config ?? defaultConfig;
  const toolConfig = currentConfig.tools.find(tool => tool.path === to.path);
  const categoryId = toolConfig?.categoryId ?? defaultCategoryByPath.get(to.path);
  const categoryConfig = categoryId
    ? currentConfig.categories.find(category => category.id === categoryId)
    : undefined;
  const enabled = (toolConfig?.enabled ?? true) && (categoryConfig?.enabled ?? true);

  if (!enabled) {
    return { name: 'NotFound' };
  }

  return true;
});

export default router;
