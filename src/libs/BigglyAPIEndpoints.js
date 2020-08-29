export const endpoints = [
  {
    name: 'biggly',
    endpoint: 'https://api.biggly.co.uk',
    region: 'eu-west-1'
  },
  {
    name: 'staging',
    endpoint: 'https://staging-api.bigg.co.uk',
    region: 'eu-west-1'
  },
  {
    name: 'dev',
    endpoint: 'https://dev-api.bigg.co.uk',
    region: 'eu-west-1'
  },
  {
    name: 'localdev',
    endpoint: 'http://localhost:5000'
    // endpoint: 'http://192.168.1.4:5000',
  },
  {
    name: 'reports',
    endpoint: 'http://bms-reports.biggly.co.uk'
  }
]

export function basePath(name) {
  const item = endpoints.find(item => item.name === name)
  if(!item.endpoint) throw Error('Endpoints must have a valid stage name')
  return item.endpoint
}
