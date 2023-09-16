'use strict'

function noOpPrepareStackTrace (_, stack) {
  return stack
}

module.exports = function getCallers () {
  const originalPrepare = Error.prepareStackTrace
  Error.prepareStackTrace = noOpPrepareStackTrace
  let stack = new Error().stack
  Error.prepareStackTrace = originalPrepare

  if (!Array.isArray(stack)) {
    if (global.Bun) {
      // This is a hacky workaround for Bun runtime 1.0.2
      stack = stack.split('\n').map((line) => {
        return {
          getFileName: () => {
            const omittedBeginning = line.split(' (/')[1]
            return omittedBeginning ? omittedBeginning.split(':')[0] : null
          }
        }
      })
    } else {
      throw new Error('could not get callers') // we expect to get an array of Callsite objects
    }
  }

  const entries = stack.slice(2)

  const fileNames = []

  for (const entry of entries) {
    if (!entry) {
      continue
    }

    fileNames.push(entry.getFileName())
  }

  return fileNames
}
