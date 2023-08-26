<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('about-us')">
          <VCardText>
            <div align="center">
              <AppLogo width="128" />
              <q class="u-text-lg u-font-italic">The <b>AOI</b> Project</q>
            </div>
            <MarkdownRenderer :md="t('about-us-content')" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import AppLogo from '@/components/app/AppLogo.vue'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withTitle(computed(() => t('pages.about')))
</script>

<i18n>
en:
  about-us: About This Project
  about-us-content: |
    The AOI Project. \
    [GitHub Repository](https://github.com/zhzxdev/aoi) \
    [Issues & Bug Report](https://github.com/zhzxdev/aoi/issues/new) \
    [Wiki](https://github.com/zhzxdev/aoi/wiki) \
    [Discussions](https://github.com/zhzxdev/aoi/discussions)
zh-Hans:
  about-us: 关于本项目
  about-us-content: |
    欢迎使用AOI项目. \
    [GitHub仓库](https://github.com/zhzxdev/aoi) \
    [问题反馈](https://github.com/zhzxdev/aoi/issues/new) \
    [文档](https://github.com/zhzxdev/aoi/wiki) \
    [讨论](https://github.com/zhzxdev/aoi/discussions)
</i18n>
