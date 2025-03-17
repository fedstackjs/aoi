import ky, { HTTPError } from 'ky'
import { useRoute, useRouter } from 'vue-router'

import { sleep } from '../async'

const UAAA_URL = import.meta.env.VITE_UAAA_URL
const UAAA_UI_APP_ID = import.meta.env.VITE_UI_APP_ID
const UAAA_AOI_APP_ID = import.meta.env.VITE_AOI_APP_ID
const uaaa = ky.create({ prefixUrl: UAAA_URL })

export interface IOpenIdConfiguration {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  // end_session_endpoint: string
  jwks_uri: string
  response_types_supported: string[]
  subject_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
  code_challenge_methods_supported: string[]
}

export interface IOpenIdTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  id_token: string
  refresh_token: string
}

export const resolveOAuth = (path: string) => {
  return new URL(path, UAAA_URL).href
}

export const loadOAuthConfiguration = async () => {
  return uaaa.get('.well-known/openid-configuration').json<IOpenIdConfiguration>()
}

export const useUAAALogin = () => {
  const route = useRoute()
  const router = useRouter()
  const configPromise = loadOAuthConfiguration()

  // Generate a random string for code_verifier
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, (byte) => String.fromCharCode(byte))
      .join('')
      .replace(/[^\w-]/g, '')
      .substring(0, 43)
  }

  // Generate code challenge from verifier using SHA-256
  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const startLogin = async (redirectType: string) => {
    const { authorization_endpoint } = await configPromise
    const url = new URL(authorization_endpoint)
    url.searchParams.set('client_id', UAAA_UI_APP_ID)
    url.searchParams.set(
      'scope',
      ['openid', 'profile', 'email', `uperm://uaaa/session/claim`].map(encodeURIComponent).join(' ')
    )
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('confidential', '0')
    const redirect = router.resolve(`/auth/${redirectType}/uaaa`).href
    url.searchParams.set('redirect_uri', new URL(redirect, location.origin).href)

    // Generate and store code verifier, and create code challenge
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    localStorage.setItem('uaaa_code_verifier', codeVerifier)

    // Add PKCE parameters
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')

    const state = Math.random().toString(36).substring(2)
    localStorage.setItem('uaaa_state', state)
    url.searchParams.set('state', state)
    window.location.href = url.href
  }

  const getToken = async (redirectType = 'login') => {
    const { token_endpoint } = await configPromise
    if (!route.query.code) return startLogin(redirectType)
    const state = localStorage.getItem('uaaa_state')
    if (!state || route.query.state !== state) return startLogin(redirectType)
    const codeVerifier = localStorage.getItem('uaaa_code_verifier')
    if (!codeVerifier) return startLogin(redirectType)
    const body = new URLSearchParams()
    body.set('client_id', UAAA_UI_APP_ID)
    body.set('grant_type', 'authorization_code')
    body.set('code', route.query.code as string)
    const redirect = router.resolve(`/auth/${redirectType}/uaaa`).href
    body.set('redirect_uri', new URL(redirect, location.origin).href)
    body.set('code_verifier', codeVerifier)
    try {
      const resp = await ky.post(token_endpoint, { body }).json<IOpenIdTokenResponse>()
      console.log(`UAAA ID Token:`, resp.id_token)
      return resp.access_token
    } catch (error) {
      // startLogin(redirectType)
      console.log(error)
      await sleep(10000000)
    }
  }
  return { getToken }
}
