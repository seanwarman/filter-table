export const mapMoments = moments => {
  if(moments.length > 0) {
    return [
      moments[0].format('YYYY-MM-DDT00:00:00.000Z'),
      moments[1].format('YYYY-MM-DDT23:59:59.999Z')
    ]
  }
  return moments
}

export function statusOrder(status) {
  const statusOrder = {
    Draft: 1,
    Live: 2,
    "In Progress": 3,
    Other: 4,
    Complete: 5
  }
  return statusOrder[status] || statusOrder.Other
}

export function monthOrder(month) {
  const monthOrder = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
  }
  return monthOrder[month]
}


export function filterSorting(a, b, item) {
  if(item.prettyName === 'Status') {
    if (statusOrder(a) > statusOrder(b)) return 1
    if (statusOrder(a) < statusOrder(b)) return -1
    return 0
  }
  if(item.prettyName === 'Booking Month') {
    if (monthOrder(a) > monthOrder(b)) return 1
    if (monthOrder(a) < monthOrder(b)) return -1
    return 0
  }
  if(item.type === 'string') {
    const valA = a.toUpperCase()
    const valB = b.toUpperCase()
    if(valA < valB) {
      return -1
    }
    if(valA > valB) {
      return 1
    }
    return 0
  }
  if(item.type === 'number') {
    return a - b
  }
}

export const gridStyle = (optionItem, disableFilterOptions) => (
  {
    width: '100%',
    height: 29,
    fontSize: 13,
    padding: '0px 0px 2px 5px',
    cursor: 'default',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    color: optionItem.selected && 'white',
    backgroundColor: optionItem.selected && '#0dc48a',
    pointerEvents: disableFilterOptions ? 'none' : 'auto',
  }
)

export const filterTitleStyles = {
  marginTop: 16,
  marginBottom: 6,
  fontSize: '80%',
}


