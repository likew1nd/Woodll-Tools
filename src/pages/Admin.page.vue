<script setup lang="ts">
import { IconDragDrop } from '@tabler/icons-vue';
import Draggable from 'vuedraggable';
import { UNCATEGORIZED_ID, buildDefaultToolsConfig, normalizeToolsConfig } from '@/tools/tools-config';
import type { CategoryConfig, ToolConfig, ToolsConfig } from '@/tools/tools-config';
import { toolsWithCategory } from '@/tools';
import { useSiteConfigStore } from '@/stores/site-config.store';

const { t } = useI18n();
const message = useMessage();
const siteConfigStore = useSiteConfigStore();

const token = useStorage('admin_token', '');
const isLoggedIn = computed(() => token.value.length > 0);

const loginForm = reactive({
  username: '',
  password: '',
});
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const showPasswordModal = ref(false);
const showSiteSettingsModal = ref(false);
const lastActivityAt = ref(Date.now());
const AUTO_LOGOUT_MS = 60 * 60 * 1000;

const isSaving = ref(false);
const isLoading = ref(false);
const isSavingSite = ref(false);

const defaultConfig = buildDefaultToolsConfig();
const config = ref<ToolsConfig>(defaultConfig);
const siteConfig = reactive({
  title: '',
  titleDescription: '',
  description: '',
  logoUrl: '',
  canonicalUrl: '',
});

const toolMeta = computed(() =>
  toolsWithCategory.map((tool) => {
    const toolKey = tool.path.replace(/\//g, '');
    return {
      path: tool.path,
      defaultCategoryId: tool.category,
      title: t(`tools.${toolKey}.title`, tool.name),
    };
  }),
);

const categoryOptions = computed(() => config.value.categories
  .map(category => ({
    label: t(`tools.categories.${category.id.toLowerCase()}`, category.id),
    value: category.id,
  }))
  .sort((a, b) => a.label.localeCompare(b.label)),
);
const categoryOptionsWithUncategorized = computed(() => [
  ...categoryOptions.value,
  { label: t('tools.categories.uncategorized'), value: UNCATEGORIZED_ID },
]);

const sortedCategories = computed(() =>
  [...config.value.categories].sort((a, b) => a.order - b.order),
);

const activeCategoryId = ref(sortedCategories.value[0]?.id ?? UNCATEGORIZED_ID);
const newCategoryName = ref('');

const toolRows = ref<typeof toolMeta.value>([]);
const categoryRows = ref<CategoryConfig[]>([]);

function rebuildToolRows() {
  toolRows.value = toolMeta.value
    .filter(tool => getToolCategoryId(tool.path, tool.defaultCategoryId) === activeCategoryId.value)
    .sort((a, b) =>
      getToolConfig(a.path, a.defaultCategoryId).order - getToolConfig(b.path, b.defaultCategoryId).order,
    );
}

function rebuildCategoryRows() {
  categoryRows.value = [...config.value.categories]
    .filter(category => category.id !== UNCATEGORIZED_ID)
    .sort((a, b) => a.order - b.order);
}

watch(
  [
    activeCategoryId,
    () => config.value.tools.map(tool => `${tool.path}:${tool.categoryId}:${tool.order}`).join('|'),
  ],
  rebuildToolRows,
  { immediate: true },
);

watch(
  () => config.value.categories.map(category => `${category.id}:${category.order}`).join('|'),
  rebuildCategoryRows,
  { immediate: true },
);

function getToolConfig(path: string, defaultCategoryId: string): ToolConfig {
  let toolConfig = config.value.tools.find(tool => tool.path === path);

  if (!toolConfig) {
    toolConfig = {
      path,
      categoryId: defaultCategoryId,
      order: config.value.tools.length,
      enabled: true,
      featured: false,
    };
    config.value.tools.push(toolConfig);
  }

  return toolConfig;
}

function getCategoryConfig(id: string): CategoryConfig {
  let categoryConfig = config.value.categories.find(category => category.id === id);

  if (!categoryConfig) {
    categoryConfig = {
      id,
      order: config.value.categories.length,
      enabled: true,
    };
    config.value.categories.push(categoryConfig);
  }

  return categoryConfig;
}

function getToolCategoryId(path: string, defaultCategoryId: string) {
  const categoryId = getToolConfig(path, defaultCategoryId).categoryId;
  const exists = config.value.categories.some(category => category.id === categoryId);
  return exists ? categoryId : UNCATEGORIZED_ID;
}

const hasUncategorizedCategory = computed(() => config.value.categories.some(category => category.id === UNCATEGORIZED_ID));
const categoriesWithUncategorized = computed(() => (
  hasUncategorizedCategory.value
    ? sortedCategories.value
    : [...sortedCategories.value, { id: UNCATEGORIZED_ID, order: Number.MAX_SAFE_INTEGER, enabled: true }]
));
const activeCategory = computed(() => categoriesWithUncategorized.value.find(category => category.id === activeCategoryId.value));

watch(
  hasUncategorizedCategory,
  (hasUncategorized) => {
    if (!hasUncategorized && activeCategoryId.value === UNCATEGORIZED_ID) {
      activeCategoryId.value = sortedCategories.value[0]?.id ?? UNCATEGORIZED_ID;
    }
  },
);

function addCategory() {
  const name = newCategoryName.value.trim();
  if (!name) {
    message.error('请输入分类名称');
    return;
  }
  if (config.value.categories.some(category => category.id === name)) {
    message.error('分类名称已存在');
    return;
  }

  config.value.categories.push({
    id: name,
    order: config.value.categories.length,
    enabled: true,
  });
  newCategoryName.value = '';
  activeCategoryId.value = name;
  ensureUncategorizedLast();
  rebuildCategoryRows();
}

function renameCategory(categoryId: string, nextId: string) {
  const trimmed = nextId.trim();
  if (!trimmed || categoryId === UNCATEGORIZED_ID) {
    return;
  }
  if (trimmed === categoryId) {
    return;
  }
  if (config.value.categories.some(category => category.id === trimmed)) {
    message.error('分类名称已存在');
    return;
  }

  const category = config.value.categories.find(item => item.id === categoryId);
  if (!category) {
    return;
  }

  category.id = trimmed;
  config.value.tools.forEach((tool) => {
    if (tool.categoryId === categoryId) {
      tool.categoryId = trimmed;
    }
  });

  if (activeCategoryId.value === categoryId) {
    activeCategoryId.value = trimmed;
  }
}

function deleteCategory(categoryId: string) {
  if (categoryId === UNCATEGORIZED_ID) {
    return;
  }

  config.value.categories = config.value.categories.filter(category => category.id !== categoryId);
  config.value.tools.forEach((tool) => {
    if (tool.categoryId === categoryId) {
      tool.categoryId = UNCATEGORIZED_ID;
    }
  });

  if (activeCategoryId.value === categoryId) {
    activeCategoryId.value = UNCATEGORIZED_ID;
  }
  ensureUncategorizedLast();
  rebuildCategoryRows();
}

function updateToolOrder() {
  toolRows.value.forEach((tool, index) => {
    const configItem = getToolConfig(tool.path, tool.defaultCategoryId);
    configItem.order = index;
  });
}

function updateCategoryOrder() {
  categoryRows.value.forEach((category, index) => {
    const configItem = getCategoryConfig(category.id);
    configItem.order = index;
  });
  ensureUncategorizedLast();
}

function ensureUncategorizedLast() {
  if (hasUncategorizedCategory.value) {
    const uncategorized = getCategoryConfig(UNCATEGORIZED_ID);
    uncategorized.order = Number.MAX_SAFE_INTEGER;
  }
}

async function loadConfig() {
  isLoading.value = true;

  try {
    const response = await fetch('/api/tools-config');
    if (!response.ok) {
      throw new Error(`加载失败: ${response.status}`);
    }

    const data = await response.json();
    config.value = normalizeToolsConfig(data?.config ?? null, defaultConfig);
    const categoryIds = new Set(config.value.categories.map(category => category.id));
    config.value.tools.forEach((tool) => {
      if (!categoryIds.has(tool.categoryId)) {
        tool.categoryId = UNCATEGORIZED_ID;
      }
    });
    if (!categoryIds.has(UNCATEGORIZED_ID)) {
      activeCategoryId.value = config.value.categories[0]?.id ?? UNCATEGORIZED_ID;
    }
    ensureUncategorizedLast();
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败');
    config.value = defaultConfig;
  }
  finally {
    isLoading.value = false;
  }
}

async function loadSiteConfig() {
  try {
    const response = await fetch('/api/site-config');
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (data?.config) {
      siteConfig.title = data.config.title ?? '';
      siteConfig.titleDescription = data.config.titleDescription ?? '';
      siteConfig.description = data.config.description ?? '';
      siteConfig.logoUrl = data.config.logoUrl ?? '';
      siteConfig.canonicalUrl = data.config.canonicalUrl ?? '';
    }
  }
  catch (_err) {
    // Ignore loading errors.
  }
}

async function login() {
  isSaving.value = true;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    });
    if (!response.ok) {
      throw new Error('账号或密码错误');
    }

    const data = await response.json();
    token.value = data.token;
    message.success('登录成功');
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '登录失败');
  }
  finally {
    isSaving.value = false;
  }
}

async function saveConfig() {
  isSaving.value = true;
  try {
    const response = await fetch('/api/tools-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({ config: config.value }),
    });

    if (!response.ok) {
      throw new Error(`保存失败: ${response.status}`);
    }

    message.success('保存成功');
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败');
  }
  finally {
    isSaving.value = false;
  }
}

async function saveSiteConfig() {
  if (!token.value) {
    message.error('Unauthorized');
    return;
  }
  isSavingSite.value = true;
  try {
    const response = await fetch('/api/site-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        config: {
          title: siteConfig.title,
          titleDescription: siteConfig.titleDescription,
          description: siteConfig.description,
          logoUrl: siteConfig.logoUrl,
          canonicalUrl: siteConfig.canonicalUrl,
        },
      }),
    });
    if (!response.ok) {
      throw new Error('Save failed');
    }
    message.success('Saved');
    await siteConfigStore.fetchConfig();
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : 'Save failed');
  }
  finally {
    isSavingSite.value = false;
  }
}

async function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.error('请填写完整密码信息');
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的新密码不一致');
    return;
  }

  isSaving.value = true;
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error('旧密码不正确');
    }

    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    message.success('密码已更新');
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '修改失败');
  }
  finally {
    isSaving.value = false;
  }
}

function logout() {
  token.value = '';
}

function resetActivity() {
  lastActivityAt.value = Date.now();
}

function startAutoLogout() {
  window.setInterval(() => {
    if (!token.value) {
      return;
    }
    if (Date.now() - lastActivityAt.value >= AUTO_LOGOUT_MS) {
      token.value = '';
      message.info('已自动退出登录');
    }
  }, 60 * 1000);
}

onMounted(() => {
  startAutoLogout();
  window.addEventListener('mousemove', resetActivity);
  window.addEventListener('keydown', resetActivity);
  window.addEventListener('click', resetActivity);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resetActivity);
  window.removeEventListener('keydown', resetActivity);
  window.removeEventListener('click', resetActivity);
});

onMounted(loadConfig);
onMounted(loadSiteConfig);
</script>

<template>
  <div class="admin-shell">
    <n-card class="admin-card" title="管理后台">
      <template #header-extra>
        <n-space v-if="isLoggedIn" size="small">
          <n-button tertiary @click="showSiteSettingsModal = true">
            网站属性
          </n-button>
          <n-button tertiary @click="showPasswordModal = true">
            修改密码
          </n-button>
          <n-button tertiary @click="logout">
            退出登录
          </n-button>
        </n-space>
      </template>

      <div v-if="!isLoggedIn">
        <n-form label-placement="left" label-width="80">
          <n-form-item label="账号">
            <n-input v-model:value="loginForm.username" placeholder="输入账号" />
          </n-form-item>
          <n-form-item label="密码">
            <n-input v-model:value="loginForm.password" placeholder="输入密码" type="password" @keydown.enter="login" />
          </n-form-item>
          <n-button type="primary" :loading="isSaving" @click="login">
            登录
          </n-button>
        </n-form>
      </div>

      <div v-else>
        <n-space vertical size="large">
          <n-card title="分类与工具设置" size="small" :bordered="false">
            <div class="category-actions">
              <n-input v-model:value="newCategoryName" placeholder="新增分类名称" />
              <n-button type="primary" @click="addCategory">
                添加分类
              </n-button>
            </div>

            <div class="category-tabs">
              <Draggable
                v-model="categoryRows"
                item-key="id"
                class="category-tabs-list"
                ghost-class="ghost-tools-draggable"
                handle=".category-drag-handle"
                @end="updateCategoryOrder"
              >
                <template #item="{ element: category }">
                  <div
                    class="category-tab"
                    :class="{ active: activeCategoryId === category.id }"
                    @click="activeCategoryId = category.id"
                  >
                    <n-icon class="category-drag-handle" :component="IconDragDrop" size="14" />
                    <span>
                      {{ t(`tools.categories.${category.id.toLowerCase()}`, category.id) }}
                    </span>
                  </div>
                </template>
              </Draggable>
              <div
                class="category-tab category-tab-uncategorized"
                :class="{ active: activeCategoryId === UNCATEGORIZED_ID }"
                @click="activeCategoryId = UNCATEGORIZED_ID"
              >
                {{ t('tools.categories.uncategorized') }}
              </div>
            </div>

            <div class="category-panels">
              <div v-if="activeCategory">
                <n-table :bordered="true" :single-line="false">
                  <thead>
                    <tr>
                      <th>
                        分类
                      </th>
                      <th style="width: 120px;">
                        排序
                      </th>
                      <th style="width: 120px;">
                        显示
                      </th>
                      <th style="width: 140px;">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <n-input
                          :value="activeCategory.id"
                          :disabled="activeCategory.id === UNCATEGORIZED_ID"
                          placeholder="分类名称"
                          @update:value="value => renameCategory(activeCategory.id, value)"
                        />
                      </td>
                      <td>
                        <n-input-number
                          v-model:value="getCategoryConfig(activeCategory.id).order"
                          :min="0"
                          :disabled="activeCategory.id === UNCATEGORIZED_ID"
                        />
                      </td>
                      <td>
                        <n-switch
                          v-model:value="getCategoryConfig(activeCategory.id).enabled"
                          :disabled="activeCategory.id === UNCATEGORIZED_ID"
                        />
                      </td>
                      <td>
                        <n-button
                          tertiary
                          type="error"
                          :disabled="activeCategory.id === UNCATEGORIZED_ID"
                          @click="deleteCategory(activeCategory.id)"
                        >
                          删除
                        </n-button>
                      </td>
                    </tr>
                  </tbody>
                </n-table>

                <n-table :bordered="true" :single-line="false" class="tools-table">
                  <thead>
                    <tr>
                      <th style="width: 40px;" />
                      <th>
                        工具
                      </th>
                      <th style="width: 160px;">
                        分类
                      </th>
                      <th style="width: 120px;">
                        排序
                      </th>
                      <th style="width: 120px;">
                        推荐
                      </th>
                      <th style="width: 120px;">
                        显示
                      </th>
                    </tr>
                  </thead>
                  <Draggable
                    v-model="toolRows"
                    item-key="path"
                    tag="tbody"
                    ghost-class="ghost-tools-draggable"
                    handle=".drag-handle"
                    @end="updateToolOrder"
                  >
                    <template #item="{ element: tool }">
                      <tr>
                        <td>
                          <n-icon class="drag-handle" :component="IconDragDrop" size="18" />
                        </td>
                        <td>
                          <div>
                            {{ tool.title }}
                          </div>
                          <div class="path">
                            {{ tool.path }}
                          </div>
                        </td>
                        <td>
                          <n-select
                            v-model:value="getToolConfig(tool.path, tool.defaultCategoryId).categoryId"
                            :options="categoryOptionsWithUncategorized"
                          />
                        </td>
                        <td>
                          <n-input-number v-model:value="getToolConfig(tool.path, tool.defaultCategoryId).order" :min="0" />
                        </td>
                        <td>
                          <n-switch v-model:value="getToolConfig(tool.path, tool.defaultCategoryId).featured" />
                        </td>
                        <td>
                          <n-switch v-model:value="getToolConfig(tool.path, tool.defaultCategoryId).enabled" />
                        </td>
                      </tr>
                    </template>
                  </Draggable>
                </n-table>
              </div>
            </div>
          </n-card>

          <div class="actions">
            <n-button :loading="isSaving" type="primary" @click="saveConfig">
              保存配置
            </n-button>
            <n-button :loading="isLoading" @click="loadConfig">
              重新加载
            </n-button>
          </div>
        </n-space>
      </div>
    </n-card>
  </div>

  <n-modal v-model:show="showPasswordModal" preset="card" title="修改密码" style="width: 420px;">
    <n-form label-placement="left" label-width="120">
      <n-form-item label="旧密码">
        <n-input v-model:value="passwordForm.oldPassword" type="password" placeholder="输入旧密码" />
      </n-form-item>
      <n-form-item label="新密码">
        <n-input v-model:value="passwordForm.newPassword" type="password" placeholder="输入新密码" />
      </n-form-item>
      <n-form-item label="确认新密码">
        <n-input v-model:value="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" />
      </n-form-item>
      <n-space justify="end">
        <n-button @click="showPasswordModal = false">
          取消
        </n-button>
        <n-button type="primary" :loading="isSaving" @click="changePassword">
          确认修改
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
  <n-modal v-model:show="showSiteSettingsModal" preset="card" title="网站属性" style="width: 520px;">
    <n-form label-placement="left" label-width="140">
      <n-form-item label="站点标题">
        <n-input v-model:value="siteConfig.title" placeholder="请输入站点标题" />
      </n-form-item>
      <n-form-item label="标题描述">
        <n-input v-model:value="siteConfig.titleDescription" placeholder="用于标题后缀（可选）" />
      </n-form-item>
      <n-form-item label="SEO 描述">
        <n-input
          v-model:value="siteConfig.description"
          placeholder="请输入 SEO 描述"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>
      <n-form-item label="站点网址">
        <n-input v-model:value="siteConfig.canonicalUrl" placeholder="https://example.com" />
      </n-form-item>
      <n-space justify="end">
        <n-button @click="showSiteSettingsModal = false">
          取消
        </n-button>
        <n-button type="primary" :loading="isSavingSite" @click="saveSiteConfig">
          保存
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  padding: 32px;
}

.admin-card {
  max-width: 1200px;
  margin: 0 auto;
}

.path {
  color: #888;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.tools-table {
  margin-top: 12px;
}

.drag-handle {
  cursor: grab;
  color: #888;
}

.ghost-tools-draggable {
  opacity: 0.6;
  background-color: rgba(148, 163, 184, 0.2);
}

.category-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.category-tabs-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.12);
  color: inherit;
  cursor: pointer;
  user-select: none;
}

.category-tab.active {
  background: rgba(59, 130, 246, 0.22);
  color: #60a5fa;
}

.category-tab-uncategorized {
  margin-left: auto;
}

.category-drag-handle {
  cursor: grab;
  color: #94a3b8;
}
</style>
