export default class Queries {

  getDivisions() {
    return {
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'divName'},
        {name: 'statusJson'},
        {name: 'jsonStatus'},
        {name: 'divKey'},
        {name: 'bookingDivName'},
        {name: 'jsonFlags'},
        {name: 'icon'},
        {name: 'accessLevels'},
      ]
    }
  }
}
