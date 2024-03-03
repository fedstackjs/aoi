<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol lg="4" xl="3">
        <VCard variant="text">
          <VCardTitle class="text-center">
            <div>
              <VAvatar size="180" rounded="0">
                <AoiLogo />
              </VAvatar>
            </div>
            <div>{{ t('pages.authorize') }}</div>
          </VCardTitle>
          <VDivider />

          <AsyncState :state="app.app">
            <template v-slot="{ value }">
              <VAlert
                v-if="value.settings.requireMfa && !hasMfaToken"
                type="info"
                color=""
                :title="t('msg.mfa-required')"
              >
                <VBtn variant="outlined" @click="doVerify" :text="t('action.verify')" />
              </VAlert>
              <template v-else>
                <VCardText class="text-center">
                  <I18nT keypath="msg.oauth-redirect">
                    <template #app>
                      <RouterLink :to="`/org/${value.orgId}/app/${value._id}`">
                        {{ value.title }}
                      </RouterLink>
                    </template>
                  </I18nT>
                  <div class="pt-4">{{ t('msg.app-provided-by') }}</div>
                  <div class="d-flex justify-center">
                    <OrgProfile :org-id="value.orgId" />
                  </div>
                </VCardText>
                <VCardActions>
                  <VBtn
                    block
                    variant="flat"
                    @click="loginTask.execute()"
                    :loading="loginTask.isLoading.value"
                  >
                    <I18nT keypath="action.login-into">
                      <template #app>
                        {{ value.title }}
                      </template>
                    </I18nT>
                  </VBtn>
                </VCardActions>
              </template>
            </template>
          </AsyncState>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import AoiLogo from '@/components/aoi/AoiLogo.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useLogin } from '@/stores/app'
import { useApp } from '@/utils/app/inject'
import { useRouteQuery } from '@vueuse/router'
import { useI18n } from 'vue-i18n'
import { useMfa } from '@/stores/app'
import { useAsyncTask } from '@/utils/async'
import { http, mfaTokenValue } from '@/utils/http'
import { withI18nTitle } from '@/utils/title'
import { useRouter } from 'vue-router'
import OrgProfile from '@/components/utils/OrgProfile.vue'

withI18nTitle('pages.authorize')

const { t } = useI18n()
const login = useLogin()
login.checkLogin()

const { hasMfaToken, doVerify } = useMfa()
const router = useRouter()

const clientId = useRouteQuery('client_id', '')
const redirectUri = useRouteQuery('redirect_uri', '')
const state = useRouteQuery('state', '')
const secret = useRouteQuery('secret', '')

const app = useApp('', clientId)

const loginTask = useAsyncTask(async () => {
  const appId = app.app.state.value._id
  if (redirectUri.value) {
    const { redirectUris } = app.app.state.value.settings
    if (
      !(redirectUris ?? []).some(({ uri }) => {
        return uri === redirectUri.value
      })
    )
      throw new Error('Invalid redirect_uri')
  }
  const { token } = await http
    .post(`app/${appId}/authorize`, {
      json: {
        mfaToken: mfaTokenValue.value,
        type: secret.value ? 'device' : 'web'
      }
    })
    .json<{ token: string }>()
  if (redirectUri.value) {
    const redirect = new URL(redirectUri.value)
    redirect.searchParams.set('code', token)
    redirect.searchParams.set('state', state.value)
    window.location.href = redirect.toString()
  } else if (secret.value) {
    await http.post('oauth/device/authorize', {
      json: {
        appId: clientId.value,
        secret: secret.value,
        code: token
      }
    })
    router.replace('/')
  }
})
</script>
