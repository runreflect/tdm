import cliProgress from 'cli-progress'
import colors from 'colors'

interface CollectionProgressBarItem {
  name: string
}

export class CollectionProgressBar {
  items: CollectionProgressBarItem[]
  multibar: cliProgress.MultiBar
  progressBars: cliProgress.SingleBar[]

  constructor(items: CollectionProgressBarItem[]) {
    this.items = items

    const maxNameLength = Math.max(...this.items.map(item => item.name.length))

    this.multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: function(options, params, payload) {
        const barsize = options.barsize ?? 0
        const incompleteBar = options.barIncompleteString?.substr(0, Math.round((1 - params.progress) * barsize)) || ''
        const completeBar = options.barCompleteString?.substr(0, Math.round(params.progress * barsize)) || ''

        return ` ${spaces(maxNameLength - payload.name.length)} ${payload.name}: ${colors.grey(completeBar)}${colors.grey(incompleteBar)}`
      },
    }, cliProgress.Presets.shades_grey)

    this.progressBars = this.items.map(item => {
      return this.multibar.create(1, 0, { name: item.name })
    })
  }

  complete(name: string) {
    const idx = this.items.findIndex(item => item.name === name)

    if (idx === -1) {
      throw new Error(`Unable to find associated item with name ${name} in progress bar list`)
    }

    this.progressBars[idx]?.increment()
  }

  stop() {
    this.multibar.stop()
  }
}

function spaces(numSpaces: number): string {
  return ' '.repeat(numSpaces)
}
