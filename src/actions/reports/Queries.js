export default class Queries {
  updateContentCapacity(key) {
    return {
      name: 'bms_reports.contentCapacity',
      where: [
        `contentCapacityKey = "${key}"`
      ]
    }
  }

  createContentCapacity() {
    return {
      name: 'bms_reports.contentCapacity'
    }
  }

  getContentCapacity(from, to) {
    return {
      name: 'bms_reports.contentCapacity',
      columns: [
        {name: 'contentCapacityKey'},
        {name: 'created'},
        {name: 'date'},
        {name: 'teamResource'},
      ],
      where: [
        `date >= "${from}"`,
        `date <= "${to}"`
      ]
    }
  }

  getDailyUnitCount(from, to) {
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'sum=>("$jsonForm[?Units].value")', as: 'units'},
        {name: 'date=>(bookings.dueDate)', as: 'date'}
      ],
      where: [
        'bookingDivKey = "f5932140-97f6-11e9-b1e1-a95197988676"',
        'currentStatus != "Complete"',
        'currentStatus != "Draft"',
      ],
      having: [
        `date >= "${from}"`,
        `date <= "${to}"`,
        'units IS NOT NULL'
      ], 
      group: [ 'date' ],
      sort: 'date'
    }
  }

  getExcessUnitsByStatus(from, to) {

    return {
      name: 'bms_booking.bookings', columns: [
        {name: 'sum=>("$jsonForm[?Units].value")', as: 'excessUnits'},
        {name: 'currentStatus'}
      ], where: [
        // Only look at the Scribr bookingDivision...
        'bookingDivKey = "f5932140-97f6-11e9-b1e1-a95197988676"',
        'currentStatus != "Complete"',
        'currentStatus != "Draft"',
        `dueDate < "${from}"`
      ], group: ['currentStatus']
    }
  }

  getExcessUnits(from, to) {
    return {
      name: 'bms_booking.bookings',
      columns: [

        {name: 'sum=>("$jsonForm[?Units].value")', as: 'excessUnits'},

      ], where: [
        // Only look at the Scribr bookingDivision...
        'bookingDivKey = "f5932140-97f6-11e9-b1e1-a95197988676"',
        'currentStatus != "Complete"',
        'currentStatus != "Draft"',
        `dueDate < "${from}"`
      ]
    }
  }


  getPersonalTotalUnits(startDate, endDate) {
    startDate = startDate+'T00:00:00Z';
    endDate = endDate+'T23:59:59Z';
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'sum=>("$jsonForm[?Units].value")', as: 'units'},
        {name: 'Biggly.users', columns: [ {name: 'concat=>(firstName " " lastName)', as: 'name'}
        ], where: [
          'users.userKey = bookings.assignedUserKey'
        ]},
      ],
      where: [
        `completedDate IS NOT NULL`,
        `assignedUserKey IS NOT NULL`,
        `completedDate >= '${startDate}'`,
        `completedDate <='${endDate}'`,
        // `foo`
      ],
      group:[
        'name',
      ],
      having:[
        'units IS NOT NULL',
        'name IS NOT NULL',
      ]
    }
  }




  getPersonalBreakdownUnits(startDate, endDate) {
    startDate = startDate+'T00:00:00Z';
    endDate = endDate+'T23:59:59Z';
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'sum=>("$jsonForm[?Units].value")', as: 'units'},
        {name: 'Biggly.users', columns: [ {name: 'concat=>(firstName " " lastName)', as: 'name'}
        ], where: [
          'users.userKey = bookings.assignedUserKey'
        ]},
        {name: 'bms_booking.divisionTemplates', columns: [ {name: 'tmpName', as: 'type'}
        ], where: [
          'divisionTemplates.tmpKey = bookings.tmpKey'
        ]},
      ],
      where: [
        // `completedDate IS NOT NULL`,
        `assignedUserKey IS NOT NULL`,
        `completedDate >= '${startDate}'`,
        `completedDate <='${endDate}'`,
      ],
      group:[
        'name',
        'type',
      ],
      having:[
        'units IS NOT NULL',
        'name IS NOT NULL',
      ]
    }
  }

  getCustomers() {
    return {
      name: 'Biggly.customers',
      columns: [
        {name: 'customerName'},
        {name: 'customerKey'}
      ],
      sort: 'customerName'
    }
  }

  getCustomerSites() {
    return {
      name: 'Biggly.customerSites',
      columns: [
        {name: 'customerSiteKey'},
        {name: 'customerKey'},
        {
          name: 'Biggly.customers',
          columns: [
            {name: 'customerName'}
          ],
          where: [
            'customers.customerKey = customerSites.customerKey'
          ]
        },
        {name: 'siteName'},
        {name: 'siteUrl'},
        {
          name: 'bms_reports.benchmarks',
          columns: [
            {name: 'created'},
            {name: 'benchmarksKey'},
            {name: 'benchmarkName'},
          ],
          as: 'benchmarks',
          where: [
            'benchmarks.customerSiteKey = customerSites.customerSiteKey'
          ],
        }
      ],
      sort: 'customerName'
    }
  }

  getCustomerSitesByCustomerKey(customerKey) {
    return {
      name: 'Biggly.customerSites',
      columns: [
        {name: 'customerSiteKey'},
        {name: 'customerKey'},
        {
          name: 'Biggly.customers',
          columns: [
            {name: 'customerName'}
          ],
          where: [
            'customers.customerKey = customerSites.customerKey'
          ]
        },
        {name: 'siteName'},
        {name: 'siteUrl'},
        {
          name: 'bms_reports.benchmarks',
          columns: [
            {name: 'created'},
            {name: 'benchmarksKey'},
            {name: 'benchmarkName'},
          ],
          as: 'benchmarks',
          where: [
            'benchmarks.customerSiteKey = customerSites.customerSiteKey'
          ]
        }
      ],
      where: [
        `customerKey = "${customerKey}"`
      ]
    }
  }

  getBenchmark(benchmarksKey) {
    return {
      name: 'bms_reports.benchmarks',
      columns: [
        {name: 'benchmarkName'},
        {name: 'benchmarksKey'},
        {name: 'created'},
        {name: 'pageBenchmarks'},
        {name: 'browserBenchmarks'},
      ],
      where: [
        `benchmarksKey = "${benchmarksKey}"`
      ]
    }
  }
}
