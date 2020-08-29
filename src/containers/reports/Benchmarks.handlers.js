import { message, } from 'antd'

export const basePath = '/reports/benchmarks'

export async function getBenchmark(benchmarksKey, actions, defaultBenchmark) {

  if(!benchmarksKey) return undefined

  const benchmark = await actions.getBenchmark(benchmarksKey)
  if(!benchmark) return fail(
    'There was an error getting the reocrds for this benchmark.',
    defaultBenchmark
  )

  return benchmark
}

export function onClickLink({
  page,
  history,
  customerSiteKey,
  benchmarksKey,
  callback
}) {

  history.push(`${basePath}/${page}/${customerSiteKey}/${benchmarksKey}`)

  callback(benchmarksKey)
}

export function onChangePage(page, match, history) {

  const { customerSiteKey, benchmarksKey } = match.params

  history.push(
    customerSiteKey && benchmarksKey ?
    `${basePath}/${page}/${customerSiteKey}/${benchmarksKey}`
    :
    customerSiteKey ?
    `${basePath}/${page}/${customerSiteKey}`
    :
    `${basePath}/${page}`
  )
}

export async function getCustomerSites(actions) {

  const customerSites = await actions.getCustomerSites()

  if(!customerSites) return fail(
    'Sorry there was a problem getting the customer sites.',
    this.state.customerSites
  )

  return customerSites

}

export function sortBenchmarks(benchmarks) {

  return benchmarks.sort((a,b) => {

    if (a.created > b.created) { return -1 };
    if (a.created < b.created) { return 1 };

    return 0;

  })

}

export function fail(text, deflt = undefined) {
  message.error(text)
  return deflt
}
