export const endpoints = [
  {
    name: 'localdev',
    endpoint: 'http://localhost:5000'
  }
]

export function basePath(name) {
  const item = endpoints.find(item => item.name === name)
  if(!item.endpoint) throw Error('Endpoints must have a valid stage name')
  return item.endpoint
}
