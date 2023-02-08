import { PackagesManager } from 'src/managers/packages-manager'
import { InstallAbstract } from './install.abstract'
import { InstallProps } from './install.props'

/** |**  npm'install
  Install librarries to use in the scene.
  @example
  ```yaml
    - npm'install: module1, module2

    - npm'install:
        - module1
        - myapp: git+ssh:git@github.com:...

    - npm'install:
        packages:
          - lodash
          - ymlr-telegram@latest     // Always get latest ymlr-telegram librarry

    # How to used
    - exec'js: |
        vars.newObject = require('lodash').merge({a: 2, b: 2}, {a: 1})
        require('myapp')

    - echo'pretty: ${vars.newObject}
  ```

  Install from github
  ```yaml
    - npm'install:
        title: Install from github
        if: ${vars.useExternalPackage}
        packages:
          - myapp: git+ssh:git@github.com:...
          - ymlr...

    # How to used
    - myapp:
        title: This is my first application

  ```

*/
export class Install extends InstallAbstract {
  constructor(props: InstallProps) {
    super(props)
  }

  async action(...packsInstall: string[]) {
    const packageManager = new PackagesManager(this.scene)
    await packageManager.install(...packsInstall)
  }
}