import chalk from 'chalk'
import { Level } from '../level'
import { LoggerLevel } from '../logger-level'

export class WarnLevel extends Level {
  readonly icon = 'warn'

  constructor() {
    super(LoggerLevel.warn)
  }

  override format(msg: string) {
    return chalk.yellow(msg)
  }
}
