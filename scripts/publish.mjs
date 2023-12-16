/* eslint-disable no-undef */
import 'zx/globals'

const workspace = path.resolve(__dirname, '..')
cd(workspace)

let { stdout } = await $`yarn version apply --json --all`
const items = stdout
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line)
  .map((line) => JSON.parse(line))
for (const { ident } of items) {
  console.log(`Publishing ${chalk.greenBright(ident)}...`)
  await $`yarn workspace ${ident} npm publish --access public`
}
