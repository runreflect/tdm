import { Generator, GeneratedFile } from '../generator'
import SwaggerParser from '@apidevtools/swagger-parser'
import { JSDocStructure, OptionalKind, Project, PropertySignatureStructure, Type } from 'ts-morph'
import { toTitleCase } from '../utils'
import { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from "openapi-types"
import { TypeGenerator } from './open-api/type-generator'
import fs from 'fs'

export class OpenAPIGenerator implements Generator {

  async parse(source: string, destinationDir: string): Promise<GeneratedFile[] | undefined> {
    const result = await SwaggerParser.parse(source)

    // Verify destination exists and is a directory
    if (!fs.existsSync(destinationDir) || !fs.statSync(destinationDir).isDirectory()) {
      throw new Error(`Destination is not a valid directory: ${destinationDir}`)
    }

    if (!isOpenAPIV3(result)) {
      console.warn('Unable to parse OpenAPI document that is not v3.0 or above')
      return undefined
    }

    const project = new Project({})
    const schemas = result.components?.schemas

    if (!schemas) {
      console.warn('No schemas defined in OpenAPI document. Exiting.')
      return undefined
    }

    for (const [key, value] of Object.entries(schemas)) {
      const interfaceName = toTitleCase(key)
      const title = value['title']

      if (('type' in value && value['type'] === 'array') || 'allOf' in value || 'anyOf' in value || 'oneOf' in value) {
        const { type, references } = new TypeGenerator().generate(value)
        const importsString = generateImports(key, references)
        
        const sourceFile = project.createSourceFile(`${destinationDir}/${key}.ts`, importsString, { overwrite: true })

        sourceFile.addTypeAlias({
          name: interfaceName,
          isExported: true,
          type,
          docs: generateComment(title),
        })
      } else {
        const { properties, references } = this.generateProperties(value) || { properties: undefined, references: new Set<string>() }
        const importsString = generateImports(key, references)

        const sourceFile = project.createSourceFile(`${destinationDir}/${key}.ts`, importsString, { overwrite: true })

        sourceFile.addInterface({
          name: interfaceName,
          isExported: true,
          properties,
          docs: generateComment(title),
        })
      }
    }

    await project.save()

    return project.getSourceFiles().map(sourceFile => {
      return {
        source: sourceFile.getFullText(),
        filename: sourceFile.getBaseName(),
      }
    })
  }

  private generateProperties(value: any): { properties: OptionalKind<PropertySignatureStructure>[], references: Set<string> } | undefined {
    // Defines which properties should be marked required vs. optional
    const required = new Set(value['required'])

    let allReferences = new Set<string>()

    if ('properties' in value) {
      const keys = Object.entries(value['properties'])

      const properties = keys.map(t => {
        const name = '"' + sanitizePropertyName(t[0]) + '"' + (required.has(t[0]) ? '' : '?')

        const property = t[1] as any

        const docs = ('description' in property) ? generateComment(property['description']) : undefined

        const { type, references } = new TypeGenerator().generate(property)

        references.forEach(allReferences.add, allReferences) // Combine both sets

        return {
          docs,
          name,
          type,
        }
      })

      return {
        properties,
        references: allReferences,
      }
    }
  }
}

function generateComment(title: string | undefined): OptionalKind<JSDocStructure>[] | undefined {
  if (title && title.trim().length > 0) {
    return [{
      description: title.trim(),
    }]
  }
}

function generateImports(clazz: string, references: Set<string>, defaultImports?: string) {
  let importsString = !!defaultImports ? defaultImports + '\n' : ''

  Array.from(references).
    filter(reference => reference !== clazz). // remove self-references
    forEach(reference => {
      importsString += `import { ${toTitleCase(reference)} } from './${reference}'\n`
    })

  return importsString
}

function isOpenAPIV3(value: OpenAPI.Document): value is OpenAPIV3.Document | OpenAPIV3_1.Document {
  return value.hasOwnProperty('components')
}

function sanitizePropertyName(str: string): string {
  return str.replace(/\@/g, '')
}