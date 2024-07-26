import { test } from 'uvu'
// import * as assert from 'uvu/assert'
import { search } from '../src/index'

const sqliteDir = (process.env.SQLITE_DIR || __dirname + '/../data').toString()

function stats () {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  console.log('Memory Usage:')
  console.log(`- RSS: ${memoryUsage.rss / 1024 / 1024} MB`) // Resident Set Size
  console.log(`- Heap Total: ${memoryUsage.heapTotal / 1024 / 1024} MB`)
  console.log(`- Heap Used: ${memoryUsage.heapUsed / 1024 / 1024} MB`)
  console.log(`- External: ${memoryUsage.external / 1024 / 1024} MB`)
  console.log(`- User CPU Time: ${cpuUsage.user / 1000} ms`)
  console.log(`- System CPU Time: ${cpuUsage.system / 1000} ms`)
}

test('Reads', async () => {
  const result = await search('events', `entities LIKE '%king%'`, sqliteDir, (dbPath, current, total, rows) => {
    console.log(`${dbPath} (${(current / total * 100).toFixed(2)}%) - ${rows.length}`)
    stats()
  })
})

test.run()