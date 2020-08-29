export function filter(targetOutputs, method) {
  return targetOutputs.filter(targetOutput => targetOutput.method === method)
}
