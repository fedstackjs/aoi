import { Command } from 'commander'
import { packageJson } from '../utils/package.js'

const program = new Command()

program // The main program
  .name('aoi-ranker')
  .version(packageJson.version)

program
  .command('register')
  .option('-t, --token <token>', 'Registration token')
  .action((options) => {
    console.log(options)
  })
