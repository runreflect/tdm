import * as Diff from 'diff'

export class Printer {
  /**
   * Console logging that is disabled in unit tests.
   */
  static print(message?: any, ...optionalParams: any[]): void {
    console.log(message, optionalParams)
  }

  static printDiff(existingValue: object, newValue: object) {
    const diff = Diff.diffJson(existingValue, newValue, { ignoreWhitespace: false })
    diff.forEach((part) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'green' :
      part.removed ? 'red' : 'grey';
      
      console.log(part.value[color])
    })
  }
}
