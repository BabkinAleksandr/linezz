const fs = require('fs')
const readline = require('readline')
const path = require('path')

const RESULT_TEXT = 'Total lines count:'

function countLinesInFile(filePath) {
  let count = 0

  return new Promise((resolve) => {
    fs.createReadStream(filePath, { autoClose: true })
      .on('data', (chunk) => {
          for (let i = 0; i < chunk.length; ++i) {
            if (chunk[i] == 10) {
              count++
            }
          }
      })
      .on('end', () => resolve(count))
  })
}

function readFilesInDirectory(dir) {
  let count = 0

  return new Promise((resolve) => {
    fs.readdir(dir, { withFileTypes: true }, async (err, dirents) => {
      if (err) {
        throw err
      }

      for (let i = 0; i < dirents.length; i++) {
        const dirent = dirents[i]
        const pathname = path.resolve(dir, dirent.name)

        count += dirent.isDirectory()
          ? await readFilesInDirectory(pathname)
          : await countLinesInFile(pathname)
      }

      resolve(count)
    })
  })
}

function readDirOrFile(dirOrFile) {
  // check if path in argument is file
  return new Promise((resolve) => {
    fs.stat(dirOrFile, async (err, stats) => {
      if (err) {
        throw err
      }

      const count = stats.isDirectory()
        ? await readFilesInDirectory(dirOrFile)
        : await countLinesInFile(dirOrFile)

      resolve(count)
    })
  })
}

async function handleArgs(args = []) {
  const paths = [args[0] || './'].concat(args.slice(1))

  let count = 0

  for (let i = 0; i < paths.length; i++) {
    count += await readDirOrFile(paths[i])
  }

  return count
}

async function count() {
  const totalCount = await handleArgs(process.argv.slice(2))

  console.log(RESULT_TEXT, totalCount)
  process.exit()
}

module.exports = {
  countLinesInFile,
  readFilesInDirectory,
  readDirOrFile,
  handleArgs,
  count,
  RESULT_TEXT,
}
