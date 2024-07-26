import { Worker } from 'worker_threads'
import { getSqliteFiles } from './files'

const workerFunction = `const { parentPort } = require('worker_threads')
const Database = require('better-sqlite3')

parentPort.on('message', (msg) => {
  const { attaches, dbPath, query } = msg
  console.log('Querying ' + dbPath)
  try {
    const db = new Database(dbPath)
    db.exec(attaches)
    const rows = db.prepare(query).all()
    parentPort.postMessage(rows)
  } catch (e) {
    console.error(e)
    throw e
  }
})`

/**
 * 
 */
export async function search (table: string, match: string, path: string, onComplete: (dbPath: string, current: number, total: number, rows: any[]) => void = () => {}) {
  const start = Date.now()
  const paths = await getSqliteFiles(path)
  
  const commands: { attach?: string, select?: string, db?: string }[][] = []
  let actions: { attach?: string, select?: string, db?: string }[] = []

  for (let j = 0; j < paths.length; j++) {
    const path = paths[j] as string
    
    const mod = j % 10

    if (mod === 0) {
      // Attached ten, start over
      if (actions.length > 0) {
        commands.push(actions)
        actions = []
      }

      actions.push({
        select: `SELECT * FROM ${table} WHERE ${match}`,
        db: path
      })
      
    } else {
      actions.push({
        attach: `ATTACH DATABASE '${path}' AS db${mod};\n`,
        select: `SELECT * FROM db${mod}.${table} WHERE ${match}`
      })
    }
  }

  if (actions.length > 0) {
    commands.push(actions)
  }

  const promises: Promise<string[]>[] = commands.map(command => {
    let attaches = ''
    let selects: string[] = []
    let dbPath = ''

    command.forEach(action => {
      if (action.attach) {
        attaches += action.attach
      }

      selects.push(action.select as string)

      if (action.db) {
        dbPath = action.db
      }
    })

    const query = selects.join(' UNION ALL ')
    let i = 0

    return new Promise((resolve, reject) => {
      const worker = new Worker(workerFunction, {
        eval: true
      })

      worker.postMessage({ attaches, dbPath, query })
      worker.on('message', rows => {
        i += 1

        if (onComplete) {
          onComplete(dbPath, i, commands.length, rows)
        }  

        resolve(rows)
      })
      worker.on('error', reject)
    })
  })

  const result = await Promise.all(promises)
  console.log('Run time', (Date.now() - start) / 1000)
  return result
}
