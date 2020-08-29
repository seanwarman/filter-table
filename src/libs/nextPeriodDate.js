import moment from 'moment';

export const addMonth = (date, campaignDay) => {
  let updatedDate = moment(date).add(1, 'months').format('YYYY-MM-DD');

  
  if(moment(updatedDate).format('D') !== campaignDay) {

    updatedDate = updatedDate.slice(0, 8) + campaignDay;
    if(moment(updatedDate).format('L') === 'Invalid date') {
      console.log('Not a date: ', updatedDate);
      updatedDate = moment(date).add(1, 'months').format('YYYY-MM-DD');
    }
  }
  return updatedDate;
}

export const addWeek = (date, campaignDay) => {
  // We have to remember when doing campaignDay weeks that a week starts on Sunday.
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let updatedDate = moment(date).add(1, 'weeks').format('YYYY-MM-DD');
  updatedDate = moment(updatedDate).day(weekdays[campaignDay - 1]).format('YYYY-MM-DD');
  return updatedDate;
}

function getNextPeriod(dateString, campaignDay, frequency) {
  if(!campaignDay) campaignDay = moment(dateString).format('D')
  // const dateString = '2020-01-26T00:00:00.000Z';
  // const campaignDay = 3;
  // const frequency = 'weekly';

  // Convert the day num in case there's no 0 at the beginning of a single digit.
  // Otherwise it'll break the date.. 
  campaignDay = campaignDay.toString().padStart(2, '0');

  const date = moment(dateString).format();

  if(frequency === 'Monthly') {
    return addMonth(date, campaignDay)
  }

  if(frequency === 'Weekly') {
    return addWeek(date, campaignDay);
  }
}

export default getNextPeriod;
