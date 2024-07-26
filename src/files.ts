import { readdir, stat } from 'fs/promises'
import { join } from 'path'

/**
 * 
 */
export async function getSqliteFiles(dir: string): Promise<string[]> {
  let results: string[] = []
  
  const entries = await readdir(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      // Recur into subdirectories
      const subResults = await getSqliteFiles(fullPath)
      results = results.concat(subResults)
    } else if (stats.isFile() && fullPath.endsWith('.sqlite')) {
      // Collect .sqlite files
      results.push(fullPath)
    }
  }

  return results
}
