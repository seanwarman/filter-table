import moment from 'moment'
import uuid from 'uuid'

export function findLeadDayRecord({
  dailyUnitCount,
  leadLagCalculator,
  excessUnits
}) {
  if(dailyUnitCount.length === 0) return {}

  let index = 0
  let leadLag = 0

  for(let record of dailyUnitCount) {

    leadLag = leadLagCalculator({
      record,
      index,
      excessUnits
    })


    if(leadLag < 1) {
      break
    }

    index++

  }

  return { ...dailyUnitCount[index], leadLag }

}


export function mapDailyUnitCount(defaultTeamResource, weekendTeamResource, dailyUnitCount, contentCapacity) {

  return prepareDailyUnitCount(dailyUnitCount, contentCapacity, {
    defaultTeamResource,
    weekendTeamResource,
  }).map(record => (
    // dailyUnitCount isn't a real database table so we'll add
    // a fake primary key called dailyUnitCountKey so that the 
    // table can track it's dataSource...

    {
      ...record,
      dailyUnitCountKey: uuid.v1(),
    }
  ))
}


export function leadLagInitialiser(leadLag = 0) {

  return function({
    record,
    excessUnits,
    index
  }) {

    if(index === 0) {
      leadLag = calculateLeadLag(record, excessUnits)
    } else {
      leadLag = calculateLeadLag(record, leadLag)
    }

    return leadLag

  }
}


export const format = date => {
  return moment(date).format('YYYY-MM-DD')
}

export const convertContentCapacityToObject = contentCapacity => {

  return contentCapacity.reduce((obj, contentCapacityRecord) => {

    // Dont'inlcude the date because we already have that on the dailyUnitCount
    const { date, ...record } = contentCapacityRecord
    return {
      ...obj,
      [format(contentCapacityRecord.date)]: record
    }

  }, {})
}

export const setClassIfWeekend = date => {

  return dateIsWeekend(date) ? 'greyed-out' : ''

}

export const dateIsWeekend = date => {
  return (
    moment(date).format('ddd') === 'Sat' ||
    moment(date).format('ddd') === 'Sun'
  ) 
}

export const setTeamResourceByDay = (date, { defaultTeamResource, weekendTeamResource }) => { 

  if(dateIsWeekend(date)) return weekendTeamResource

  return defaultTeamResource

}

export const prepareDailyUnitCount = (dailyUnitCount, contentCapacity, { defaultTeamResource, weekendTeamResource }) => {

  return dailyUnitCount.map(item => {

    const { date } = item

    const teamResource = setTeamResourceByDay(date, {
      defaultTeamResource,
      weekendTeamResource
    })

    return {
      ...item,
      date,
      dailyUnitCountKey: uuid.v1(),
      // Add all the fields from the matching contentCapacity record if there is one, otherwise
      // just add the default teamResource value 
      ...convertContentCapacityToObject(contentCapacity)[date] || { teamResource }
    }

  })
}

export const createContentCapacity = (contentCapacity, data, createApi) => {

  createApi(data)

  return [
    ...contentCapacity,
    data
  ]

}

export const updateContentCapacity = (contentCapacity, { contentCapacityKey, ...data }, updateApi) => {

  updateApi(contentCapacityKey, data)

  const index = contentCapacity.findIndex(item => item.contentCapacityKey === contentCapacityKey)


  return contentCapacity.map((item, i) => {
    if(i === index) return {
      ...item,
      ...data
    }
    return item
  })
}

export const initialiseContentCapacityState = contentCapacity => {
  return {
    contentCapacity: contentCapacity.map(item => ({
      ...item,
      date: format(item.date)})
    ),
  }
}

export const calculateLeadLag = (record, excessUnits) => {
  const { units, teamResource } = record

  return (excessUnits + units) - teamResource
}

