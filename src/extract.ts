export async function extract(filePath: string): Promise<string> {
  try {
    const sourceCode = await Bun.file(filePath).text()

    return generateDtsTypes(sourceCode)
  }
  catch (error) {
    console.error(error)
    throw new Error(`Failed to extract and generate .d.ts file`)
  }
}

function generateDtsTypes(sourceCode: string): string {
  console.log('Starting generateDtsTypes')
  const lines = sourceCode.split('\n')
  const dtsLines: string[] = []
  const imports: string[] = []
  const exports: string[] = []
  let defaultExport = ''

  let isMultiLineDeclaration = false
  let currentDeclaration = ''
  let bracketCount = 0
  let lastCommentBlock = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    console.log(`Processing line ${i + 1}: ${line}`)

    if (line.startsWith('/**') || line.startsWith('*') || line.startsWith('*/')) {
      if (line.startsWith('/**'))
        lastCommentBlock = ''
      lastCommentBlock += `${line}\n`
      console.log('Comment line added to lastCommentBlock')
      continue
    }

    if (line.startsWith('import')) {
      const processedImport = processImport(line)
      imports.push(processedImport)
      console.log(`Processed import: ${processedImport}`)
      continue
    }

    if (line.startsWith('export default')) {
      defaultExport = `${line};`
      console.log(`Default export found: ${defaultExport}`)
      continue
    }

    if (line.startsWith('export const')) {
      isMultiLineDeclaration = true
      currentDeclaration = ''
      bracketCount = 0
    }

    if (isMultiLineDeclaration) {
      currentDeclaration += `${line}\n`
      bracketCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length

      if (bracketCount === 0 || i === lines.length - 1) {
        if (lastCommentBlock) {
          dtsLines.push(lastCommentBlock.trimEnd())
          console.log(`Comment block added to dtsLines: ${lastCommentBlock.trimEnd()}`)
          lastCommentBlock = ''
        }
        const processed = processConstDeclaration(currentDeclaration.trim())
        if (processed) {
          dtsLines.push(processed)
          console.log(`Processed const declaration added to dtsLines: ${processed}`)
        }
        isMultiLineDeclaration = false
        currentDeclaration = ''
      }
    }
    else if (line.startsWith('export')) {
      if (lastCommentBlock) {
        dtsLines.push(lastCommentBlock.trimEnd())
        console.log(`Comment block added to dtsLines: ${lastCommentBlock.trimEnd()}`)
        lastCommentBlock = ''
      }
      const processed = processDeclaration(line)
      if (processed) {
        dtsLines.push(processed)
        console.log(`Processed declaration added to dtsLines: ${processed}`)
      }
    }
  }

  const result = cleanOutput([...imports, '', ...dtsLines, '', ...exports, defaultExport].filter(Boolean).join('\n'))
  console.log('Final result:', result)
  return result
}

function processImport(importLine: string): string {
  console.log(`Processing import: ${importLine}`)
  if (importLine.includes('type')) {
    return importLine.replace('import', 'import type').replace('type type', 'type')
  }
  return importLine
}

function processDeclaration(declaration: string): string {
  console.log(`Processing declaration: ${declaration}`)
  if (declaration.startsWith('export const')) {
    return processConstDeclaration(declaration)
  }
  else if (declaration.startsWith('export interface')) {
    return processInterfaceDeclaration(declaration)
  }
  else if (declaration.startsWith('export type')) {
    return processTypeDeclaration(declaration)
  }
  else if (declaration.startsWith('export function') || declaration.startsWith('export async function')) {
    return processFunctionDeclaration(declaration)
  }
  else if (declaration.startsWith('export default')) {
    return `${declaration};`
  }
  console.log(`Declaration not processed: ${declaration}`)
  return declaration
}

function processConstDeclaration(declaration: string): string {
  console.log(`Processing const declaration: ${declaration}`)
  const lines = declaration.split('\n')
  const firstLine = lines[0]
  const name = firstLine.split('export const')[1].split('=')[0].trim()
  const type = firstLine.includes(':') ? firstLine.split(':')[1].split('=')[0].trim() : inferType(lines.slice(1, -1))

  const properties = lines.slice(1, -1).map((line) => {
    const [key, value] = line.split(':').map(part => part.trim())
    return `  ${key}: ${value.replace(',', ';')}`
  }).join('\n')

  return `export declare const ${name}: ${type} {\n${properties}\n};`
}

function processInterfaceDeclaration(declaration: string): string {
  console.log(`Processing interface declaration: ${declaration}`)
  const lines = declaration.split('\n')
  const interfaceName = lines[0].split('interface')[1].split('{')[0].trim()
  const interfaceBody = lines.slice(1, -1).map(line => `  ${line.trim()}`).join('\n')
  const result = `export declare interface ${interfaceName} {\n${interfaceBody}\n}`
  console.log(`Processed interface declaration: ${result}`)
  return result
}

function processTypeDeclaration(declaration: string): string {
  console.log(`Processing type declaration: ${declaration}`)
  const result = declaration.replace('export type', 'export declare type')
  console.log(`Processed type declaration: ${result}`)
  return result
}

function processFunctionDeclaration(declaration: string): string {
  console.log(`Processing function declaration: ${declaration}`)
  const functionSignature = declaration.split('{')[0].trim()
  const result = `export declare ${functionSignature.replace('export ', '')};`
  console.log(`Processed function declaration: ${result}`)
  return result
}

function parseObjectLiteral(objectLiteral: string): string {
  console.log(`Parsing object literal: ${objectLiteral}`)
  const content = objectLiteral.replace(/^\{|\}$/g, '').split(',').map(pair => pair.trim())
  const parsedProperties = content.map((pair) => {
    const [key, value] = pair.split(':').map(p => p.trim())
    console.log(`Parsing property: key=${key}, value=${value}`)
    return `  ${key}: ${value};`
  })
  const result = `{\n${parsedProperties.join('\n')}\n}`
  console.log(`Parsed object literal: ${result}`)
  return result
}

function inferType(properties: string[]): string {
  const types = properties.map((prop) => {
    const value = prop.split(':')[1].trim()
    if (value.startsWith('\'') || value.startsWith('"'))
      return 'string'
    if (value === 'true' || value === 'false')
      return 'boolean'
    if (!isNaN(Number(value)))
      return 'number'
    return 'any'
  })
  const uniqueTypes = [...new Set(types)]
  return uniqueTypes.length === 1 ? `{ [key: string]: ${uniqueTypes[0]} }` : '{ [key: string]: any }'
}

function cleanOutput(output: string): string {
  console.log('Cleaning output')
  const result = output
    .replace(/\{\s*\}/g, '{}')
    .replace(/\s*;\s*(?=\}|$)/g, ';')
    .replace(/\n+/g, '\n')
    .replace(/;\n\}/g, ';\n  }')
    .replace(/\{;/g, '{')
    .trim()
  console.log('Cleaned output:', result)
  return result
}
