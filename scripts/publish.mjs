/* eslint-disable no-undef */
import 'zx/globals'

const workspace = path.resolve(__dirname, '..')
cd(workspace)

/** @type {Record<string, string>} */
const packages = await $`yarn workspaces list --json`
  .then(({ stdout }) =>
    stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map(({ location, name }) => [name, location])
  )
  .then(Object.fromEntries)

const { stdout } = await $`yarn version apply --json --all`
const items = stdout
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line)
  .map((line) => JSON.parse(line))

for (const { ident } of items) {
  console.log(`Publishing ${chalk.greenBright(ident)}...`)
  await $`yarn workspace ${ident} pack --out package.tgz`
  try {
    await $`cd ${packages[ident]} && npm publish package.tgz --provenance`
  } catch (err) {
    const stdout = /** @type {ProcessOutput} */ (err).stdout
    if (stdout.includes('You cannot publish over the previously published versions')) {
      console.log(`${ident} already published, skip it.`)
    } else {
      throw err
    }
  }
  if (process.env.CI) {
    const name = ident.split('/')[1]
    await $`echo "${name}_updated=true" >> "$GITHUB_OUTPUT"`
  }
}

if (items.length) {
  if (process.env.CI) {
    await $`git config user.name aoi-js-bot`
    await $`git config user.email aoi@fedstack.org`
    await $`git add .`
    await $`git commit -m "chore: apply versions and publish [skip ci]"`
    await $`git push`
  } else {
    console.log(`Time to commit and push!`)
  }
}
