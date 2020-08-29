export function sortByAlpha(a, b, dataIndex) {

  const A = a[dataIndex]?.toUpperCase()
  const B = b[dataIndex]?.toUpperCase()

  if(A < B) return -1
  if(A > B) return 1
  return 0

}

