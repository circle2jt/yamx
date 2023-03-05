import assert from 'assert'
import { RootScene } from 'src/components/root-scene'
import { Summary } from './analystic/summary'
import { ElementProxy } from './components/element-proxy'
import { RootSceneProps } from './components/root-scene.props'
import { Logger, LoggerLevel } from './libs/logger'

export class App {
  private readonly rootSceneProxy: ElementProxy<RootScene>

  constructor(public logger: Logger, rootSceneProps: RootSceneProps) {
    assert(rootSceneProps.path, 'Scene file is required')
    this.rootSceneProxy = new ElementProxy(new RootScene(rootSceneProps))
    this.rootSceneProxy.scene = this.rootSceneProxy.rootScene = this.rootSceneProxy.element
    this.rootSceneProxy.logger = this.logger.clone('root-scene')
  }

  setDirTags(dirs: string[]) {
    this.logger.debug('External sources %j', dirs)
    this.rootSceneProxy.element.tagsManager.tagDirs = dirs
  }

  async exec() {
    const summary = this.rootSceneProxy.logger.is(LoggerLevel.DEBUG) ? new Summary(this.rootSceneProxy) : undefined
    try {
      await this.rootSceneProxy.exec()
    } finally {
      await this.rootSceneProxy.dispose()
      summary?.print()
    }
  }
}
