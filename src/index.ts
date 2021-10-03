import { Command } from 'commander'
import { OpenAPIGenerator } from './generators/open-api'

const program = new Command()

program.
  command('generate <source-type> <source>').
  description('Generates fixture definition files from the source URL').
  action(async (sourceType, source) => {
    switch (sourceType) {
      case 'openapi':
        const generator = new OpenAPIGenerator()
        const result = await generator.parse(source)
        //TODO pass in a destination folder and save everything to that folder
        break;
      default:
        throw new Error(`Unsupported source type: ${sourceType}`)
    }
  })

program.
  command('run').
  description('Runs the TDM framework').
  action(() => {
    console.log("TODO") // TODO implement this
  })

program.parse(process.argv)
