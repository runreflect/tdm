#!/usr/bin/env node

import { Command } from 'commander'
import { OpenAPIGenerator } from './generators/open-api'

const program = new Command()

program.
  command('generate <source-type> <source> <destination>').
  description('Generates fixture definition files from the source URL').
  action(async (sourceType, source, destination) => {
    switch (sourceType) {
      case 'openapi':
        const generator = new OpenAPIGenerator()
        await generator.parse(source, destination)
        break;
      default:
        throw new Error(`Unsupported source type: ${sourceType}`)
    }
  })

program.parse(process.argv)
