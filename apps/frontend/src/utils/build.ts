import { version } from '../../package.json'

export const appBuildInfo = {
  version,
  hash: __GIT_HASH__,
  branch: __GIT_BRANCH__,
  time: __BUILD_TIME__
}

console.log(
  `%cAOI-UI%c${version}%c${__GIT_HASH__}@${__GIT_BRANCH__} ${__BUILD_TIME__}`,
  'background: #35495e; color: #fff; padding: 2px 4px; border-radius: 4px 0 0 4px',
  'background: #1966c0; color: #fff; padding: 2px 4px',
  'background: #afddff; color: #000; padding: 2px 4px; border-radius: 0 4px 4px 0'
)
