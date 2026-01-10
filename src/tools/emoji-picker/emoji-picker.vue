<script setup lang="ts">
import emojiUnicodeData from 'unicode-emoji-json';
import emojiKeywords from 'emojilib';
import _ from 'lodash';
import emojiNameTranslationsRaw from './emoji-zh-names.json';
import type { EmojiInfo } from './emoji.types';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import useDebouncedRef from '@/composable/debouncedref';

const { t } = useI18n();

const emojiNameTranslations = emojiNameTranslationsRaw as Record<string, string>;

function escapeUnicode({ emoji }: { emoji: string }) {
  return emoji.split('').map(unit => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}

function getEmojiCodePoints({ emoji }: { emoji: string }) {
  const codePoints = Array.from(emoji)
    .map(char => char.codePointAt(0))
    .filter((value): value is number => value !== undefined)
    .map(value => `0x${value.toString(16)}`);
  return codePoints.length > 0 ? codePoints.join(' ') : undefined;
}

const emojis = _.map(emojiUnicodeData, (emojiInfo, emoji) => ({
  ...emojiInfo,
  emoji,
  title: emojiNameTranslations[emojiInfo.name] ?? _.capitalize(emojiInfo.name),
  titleZh: emojiNameTranslations[emojiInfo.name],
  keywords: emojiKeywords[emoji as keyof typeof emojiKeywords],
  codePoints: getEmojiCodePoints({ emoji }),
  unicode: escapeUnicode({ emoji }),
}));

const emojisGroups: { emojiInfos: EmojiInfo[]; group: string }[] = _
  .chain(emojis)
  .groupBy('group')
  .map((emojiInfos, group) => ({ group, emojiInfos }))
  .value();

const groupLabels: Record<string, string> = {
  'Smileys & Emotion': 'tools.emoji-picker.groups.smileysEmotion',
  'People & Body': 'tools.emoji-picker.groups.peopleBody',
  'Component': 'tools.emoji-picker.groups.component',
  'Animals & Nature': 'tools.emoji-picker.groups.animalsNature',
  'Food & Drink': 'tools.emoji-picker.groups.foodDrink',
  'Travel & Places': 'tools.emoji-picker.groups.travelPlaces',
  'Activities': 'tools.emoji-picker.groups.activities',
  'Objects': 'tools.emoji-picker.groups.objects',
  'Symbols': 'tools.emoji-picker.groups.symbols',
  'Flags': 'tools.emoji-picker.groups.flags',
};

function getGroupLabel(group: string) {
  const key = groupLabels[group];
  return key ? t(key) : group;
}

const searchQuery = useDebouncedRef('', 500);

const { searchResult } = useFuzzySearch({
  search: searchQuery,
  data: emojis,
  options: {
    keys: ['group', { name: 'name', weight: 3 }, { name: 'title', weight: 3 }, { name: 'titleZh', weight: 3 }, 'keywords', 'unicode', 'codePoints', 'emoji'],
    threshold: 0.3,
    useExtendedSearch: true,
    isCaseSensitive: false,
  },
});
</script>

<template>
  <div mx-auto max-w-2400px important:flex-1>
    <div flex items-center gap-3>
      <c-input-text
        v-model:value="searchQuery"
        :placeholder="t('tools.emoji-picker.searchPlaceholder')"
        mx-auto max-w-600px
      >
        <template #prefix>
          <icon-mdi-search mr-6px color-black op-70 dark:color-white />
        </template>
      </c-input-text>
    </div>

    <div v-if="searchQuery.trim().length > 0">
      <div
        v-if="searchResult.length === 0"
        mt-4
        text-20px
        font-bold
      >
        {{ t('tools.emoji-picker.noResults') }}
      </div>

      <div v-else>
        <div mt-4 text-20px font-bold>
          {{ t('tools.emoji-picker.searchResult') }}
        </div>

        <emoji-grid :emoji-infos="searchResult" />
      </div>
    </div>

    <div
      v-for="{ group, emojiInfos } in emojisGroups"
      v-else
      :key="group"
    >
      <div mt-4 text-20px font-bold>
        {{ getGroupLabel(group) }}
      </div>

      <emoji-grid :emoji-infos="emojiInfos" />
    </div>
  </div>
</template>
