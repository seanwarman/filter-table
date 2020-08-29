export default function filterBySearchTerm(searchTerm, arr) {
  if(!arr) return

  try {
    let regex = new RegExp(escape(searchTerm), 'gi')
    return arr.filter(item => {
      let condition = false
      for (let i in item) {
        let value = escape(JSON.stringify(item[i]))
        if (value.search(regex) > -1) {
          condition = true
        }
      }
      return item && condition
    })

  } catch (error) {
    return false
  }
}
