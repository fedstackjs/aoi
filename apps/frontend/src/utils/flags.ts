export const gravatarBase = import.meta.env.VITE_GRAVATAR_BASE ?? `https://www.gravatar.com/avatar`
export const enableMfa = !import.meta.env.VITE_DISABLE_MFA_BIND
export const appName = import.meta.env.VITE_APP_NAME ?? 'AOI'
export const showCountdown = !!import.meta.env.VITE_APPBAR_SHOW_COUNTDOWN
export const extraFooterText = import.meta.env.VITE_EXTRA_FOOTER_TEXT
export const loginHint = import.meta.env.VITE_LOGIN_HINT
export const verifyHint = import.meta.env.VITE_VERIFY_HINT
