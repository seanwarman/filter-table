export function checkForFatalErrors(key, expect, result) {

  if(typeof result[key] === 'undefined') {
    throw Error('There\'s problem with the targetOutput for this Report. The "result" for keyword tests must always have the same keywords as the "expect".')
  }

  if(typeof expect[key].range === 'undefined') {
    throw Error('There\'s a fatal problem with the targetOutput for this Report. The "expect" param for targetOutputs must always contain a "range" array.')
  }

}

export function calulateMetricsResult(expect, result) {

  const keys = Object.keys(expect)

  let score = 0

  for(const key of keys) {

    checkForFatalErrors(key, expect, result)

    const [ min, max ] = expect[key].range


    if(result[key] <= min) { score += 2; continue }

    if(result[key] <= max) { score += 1; continue }

    if(result[key] > max) { score -= 1; continue }

  }

  return score

}

export function calulateKeywordsResult(expect, result) {

  const keywords = Object.keys(expect)

  let score = 0

  for(const keyword of keywords) {

    checkForFatalErrors(keyword, expect, result)

    score += calculateRange(expect[keyword], result[keyword])

  }

  return score
}

export function calculateRange({
  range
}, result) {

  if(!Array.isArray(range)) throw Error('Fatal error: A "range" target param must always be an array type with two numbers.')
  if(range.length < 2) throw Error('Fatal error: A "range" target param must have two numbers in it.')

  const [ min, max ] = range

  return (min <= result && max >= result) ? 1 : -1
}

export function checkDetailedResult(targetOutput) {

  if(typeof targetOutput.expect === 'undefined') return false
  if(typeof targetOutput.output?.result === 'undefined') return false
  if(targetOutput.output?.result === 'error') return false

  return true
}

export function goodOrBad(targetOutput) {

  if(!checkDetailedResult(targetOutput)) return -1

  const { result } = targetOutput.output
  const { expect, method } = targetOutput

  if(method === 'checkForTargetKeywords') return calulateKeywordsResult(expect, result)
  if(method === 'checkForTargetKeywordsInAttr') return calulateKeywordsResult(expect, result)
  if(method === 'pageLoadMetrics') return calulateMetricsResult(expect, result)

  // Some methods output a range: [0, 9] type array...
  if(expect.range) return calculateRange(expect, result)

  // For everything else we just want the result and the expect to be equal...
  return result === expect ? 1 : -1

}

export function score(category, targetOutputs) {

  return targetOutputs.filter(targetOutput => targetOutput.category === category).reduce((total, targetOutput) => {

    const score = goodOrBad(targetOutput)

    return total + score


  }, 0)

}

