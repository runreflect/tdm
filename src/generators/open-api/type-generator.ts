import { schemaFromRef, toTitleCase } from '../../utils'
import compact from 'lodash/compact'

const PRIMITIVE_OPEN_API_TYPES_TO_TYPESCRIPT = {
  'string': 'string',
  'number': 'number',
  'integer': 'number',
  'boolean': 'boolean',
}

/**
 * Converts an OpenAPI property into its equivalent in Typescript.
 */
export class TypeGenerator {
  references: Set<string>
  
  constructor() {
    this.references = new Set<string>()
  }

  generate(property: any): { type: string, references: Set<string> } {
    this.references.clear()

    const type = this.generateType(property)

    return {
      type,
      references: this.references,
    }
  }

  private generateType(property: any): string {
    const type = property['type'] as any
  
    if ('anyOf' in property) {
      return this.anyOf(property)
    } else if ('oneOf' in property) {
      return this.oneOf(property)
    } else if ('allOf' in property) {
      return this.allOf(property)
    } else if ('enum' in property) {
      return this.enum(property)
    } else if ('$ref' in property) {
      return this.ref(property)
    } else if (type in PRIMITIVE_OPEN_API_TYPES_TO_TYPESCRIPT) {
      //@ts-ignore
      return PRIMITIVE_OPEN_API_TYPES_TO_TYPESCRIPT[type]
    } else if (type === 'array') {
      return this.array(property)
    } else if (type === 'object') {
      return this.object(property)
    } else {
      console.warn(`Unable to generate type for property: ${JSON.stringify(property)}`)
      return 'any'
    } 
  }

  private array(property: any): string {
    return this.generateType(property['items']) + '[]'
  }

  private object(property: any): string {
    let typeStr = '{ '
    let isFirst = true

    const properties = property['properties']

    if (!properties) {
      return ''
    }

    for (const [key, value] of Object.entries(properties)) {
      if (!isFirst) {
        typeStr += ', '
      }

      const childType = this.generateType(value)

      typeStr += `'${key}': ${childType}`
      isFirst = false
    }

    typeStr += ' }'

    return typeStr
  }

  private anyOf(property: any): string {
    // @ts-ignore
    const unionInterfaces = property['anyOf'].map(childProperty => {
      return this.generateType(childProperty)
    })

    return compact(unionInterfaces).join(' | ')
  }

  private allOf(property: any): string {
    // @ts-ignore
    const unionInterfaces = property['allOf'].map(childProperty => {
      return this.generateType(childProperty)
    })

    return compact(unionInterfaces).join(' & ')
  }

  private oneOf(property: any): string {
    // @ts-ignore
    const unionInterfaces = property['oneOf'].map(childProperty => {
      return this.generateType(childProperty)
    })

    return compact(unionInterfaces).join(' | ')
  }

  private enum(property: any): string {
    return property['enum'].
    // @ts-ignore
      map(enumValue => `'${enumValue}'`).
      join(' | ')
  }

  private ref(property: any): string {
    const schemaName = schemaFromRef(property['$ref'])
  
    if (schemaName) {
      this.references.add(schemaName)
      return toTitleCase(schemaName)
    }
  
    throw new Error(`Missing $ref property: ${property}`)
  }
}
