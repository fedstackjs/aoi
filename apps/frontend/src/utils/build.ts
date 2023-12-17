import { version } from '../../package.json'

export const appBuildInfo = {
  version,
  hash: __GIT_HASH__,
  branch: __GIT_BRANCH__,
  time: __BUILD_TIME__
}
