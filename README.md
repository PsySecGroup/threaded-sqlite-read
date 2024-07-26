# threaded-sqlite-read

Extreme speed SQLite bulk reads spread across multiple databases and threads.

## Benchmark

**System**:
* Ubuntu 20.04 LTS
* AMD Ryzen 7 5700U
* 16 cores

**Target**:
* 250 SQLite databases over LAN
* Each database is unindexed and between 200MB and 2GB

**Results**:
* For single `LIKE %...%` search on a comma-separated field, _650 seconds_

## Examples

For a simple case:

```ts
const { search } = require('@psysecgroup/threaded-sqlite-read')

async function main () {
  const results =  await search('events', `entities LIKE '%coffee%'`, '/dir/containing/sqliteFiles')
}

main()
```

For a more elaborate use case where you can see progress of the search:

```ts
const { search } = require('@psysecgroup/threaded-sqlite-read')

async function main () {
  const result = await search('events', `entities LIKE '%king%'`, sqliteDir, (dbPath, current, total, rows) => {
    console.log(`${dbPath} (${(current / total * 100).toFixed(2)}%) - ${rows.length}`)
  })
}

main()
```

## Install

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/psysecgroup/threaded-sqlite-read)

(Bindings for `sqlite3` do not exist for StackBlitz's POSIX shell 😥)

First, install `sqlite3`:

```bash
# Debian/Ubuntu
sudo apt-get install sqlite3

# CentOS / Fedora / RedHat
sudo yum install sqlite3

# MacPorts
sudo port install sqlite3

# Brew
sudo brew install sqlite3

#Choco
choco install sqlite
```

Then, install the module:

```bash
# NPM
npm install -S https://github.com/psysecgroup/threaded-sqlite-read

# Yarn
yarn add https://github.com/psysecgroup/threaded-sqlite-read
```

## Testing

Add your tests to the [`tests`](tests) folder, then import them in the [`tests/index.ts`](tests/index.ts) file.

Make sure you specify what directory to run tests on with the `SQLITE_DIR` constant:

```bash
SQLITE_DIR=/dir/containing/sqliteFiles npm test
```

If no `SQLITE_DIR` path is specified, the test will try to find SQLite databases in the `data` folder instead.

## Research

* Is there a faster way to do everything?