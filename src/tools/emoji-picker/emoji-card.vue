<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';
import { useCopy } from '@/composable/copy';

const props = (defineProps<{ emojiInfo: EmojiInfo }>());
const { emojiInfo } = toRefs(props);

const { t } = useI18n();
const { copy } = useCopy();

const flagImageError = ref(false);
const isFlagEmoji = computed(() => emojiInfo.value.group === 'Flags');
const twemojiUrl = computed(() => {
  const codePoints = Array.from(emojiInfo.value.emoji)
    .map(char => char.codePointAt(0))
    .filter((value): value is number => value !== undefined)
    .map(value => value.toString(16))
    .join('-');

  return `/twemoji/svg/${codePoints}.svg`;
});
const showFlagImage = computed(() => isFlagEmoji.value && !flagImageError.value);
</script>

<template>
  <c-card flex items-center gap-3 important:py-8px important:pl-10px important:pr-5px>
    <div class="emoji-glyph" cursor-pointer text-30px @click="copy(emojiInfo.emoji, { notificationMessage: t('tools.emoji-picker.emojiCopied', { emoji: emojiInfo.emoji }) })">
      <img
        v-if="showFlagImage"
        class="emoji-image"
        :src="twemojiUrl"
        :alt="emojiInfo.emoji"
        loading="lazy"
        @error="flagImageError = true"
      >
      <span v-else>{{ emojiInfo.emoji }}</span>
    </div>

    <div min-w-0 flex-1>
      <div truncate font-bold>
        {{ emojiInfo.title }}
      </div>

      <!-- <div>
        <c-link>
          {{ emojiInfo.codePoints }}
        </c-link>
      </div>
      <div />
      <div rounded op-70>
        Unicode:  <span border="1px solid current op-30" b-rd-xl px-12px py-4px>{{ emojiInfo.unicode }}</span>
      </div> -->

      <div flex gap-2 text-xs font-mono op-70>
        <span cursor-pointer transition hover:text-primary @click="copy(emojiInfo.codePoints, { notificationMessage: t('tools.emoji-picker.codePointsCopied', { codePoints: emojiInfo.codePoints }) })">
          {{ emojiInfo.codePoints }}
        </span>
        <span cursor-pointer truncate transition hover:text-primary @click="copy(emojiInfo.unicode, { notificationMessage: t('tools.emoji-picker.unicodeCopied', { unicode: emojiInfo.unicode }) })">
          {{ emojiInfo.unicode }}
        </span>
      </div>
    </div>
  </c-card>
</template>

<style scoped>
.emoji-glyph {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}

.emoji-image {
  width: 30px;
  height: 30px;
  display: block;
}
</style>
