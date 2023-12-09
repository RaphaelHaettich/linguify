import { existsSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import prompts from 'prompts'
import { defaultConfig } from '@lib/defaults'
import { configPath } from '@lib/utils'

/**
 * init linguify command
 */
const init = async () => {
  try {
    console.log(chalk.blue('Initiating linguify'))

    // checking if the config file excists, if so asking to overwrite it
    if (existsSync(configPath)) {
      const { overwrite } = await prompts.prompt({
        type: 'toggle',
        name: 'overwrite',
        message: 'A linguify config file already exists. Do you want to overwrite it?',
        initial: false,
        active: 'yes',
        inactive: 'no'
      })

      if (!Boolean(overwrite)) {
        console.log(chalk.yellow('Exiting linguify initiating'))
        process.exit(0)
      }

      console.log(chalk.yellow('Overwriting linguify config'))
    }

    // TODO: prompt for config values

    // saving the config file
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, defaultConfig.jsonIndentation))
    console.log(`Linguify config saved to ${chalk.cyan(chalk.underline(configPath))} successfully`)

    console.log(chalk.green('Linguify initiated successfully'))
  } catch (error: any) {
    console.error(chalk.red(error.message))
    process.exit(0)
  }
}

export default init
