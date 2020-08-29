export default class Queries {
  getCampaign(key) {
    return {
      name: 'bms_campaigns.campaigns',
      columns: [
        {name: 'campaignKey'},
        {name: 'customerKey'},
        {name: 'partnerKey'},
        {name: 'campaignName'},
        {name: 'createdBy'},
        {name: 'packageKey'},
        {name: 'startDate'},
        {name: 'campaignUrl'},
        {name: 'citationText'},
        {name: 'campaignStart'},
        {name: 'campaignStatus'},
        {name: 'campaignDay'},
        {name: 'currentPeriod'},
        {name: 'nextPeriodDate'},
        {name: 'campaignDivKey'},
        {name: 'jsonBookings'},
        {name: 'targetKeywords'},
        {name: 'relativeDueDate'},
        {name: 'hotLinks'},
        {name: 'autoRenew'},
        {name: 'error'},
        {
          name: 'Biggly.partners',
          columns: [{name: 'partnerName'}],
          where: ['campaigns.partnerKey = partners.partnerKey']
        },
        {
          name: 'Biggly.customers',
          columns: [{name: 'customerName'}],
          where: ['customers.customerKey = campaigns.customerKey']
        },
        {
          name: 'bms_campaigns.campaignDivisions',
          columns: [{name: 'campaignDivName'}],
          where: ['campaigns.campaignDivKey = campaignDivisions.campaignDivKey']
        },
        {
          name: 'bms_campaigns.packages',
          columns: [
            {name: 'packageName'},
            {name: 'frequency'},
          ],
          where: ['campaigns.packageKey = packages.packageKey']
        },
        {
          name: 'bms_campaigns.periods',
          columns: [
            {name: 'max=>(period)', as: 'maxPeriod'}
          ],
          where: ['periods.packageKey = campaigns.packageKey']
        }
      ],
      where: [
        `campaigns.campaignKey = "${key}"`
      ]
    }
  }
  getCampaigns() {
    return {
      name: 'bms_campaigns.campaigns',
      columns: [
        {name: 'campaignKey'},
        {name: 'campaignDivName'},
        {name: 'campaignStatus'},
        {name: 'campaignName'},
        {name: 'nextPeriodDate'},
        {
          name: 'Biggly.partners',
          columns: [
            {name: 'partnerName'},
            {name: 'partnerKey'}
          ],
          where: ['partners.partnerKey = campaigns.partnerKey']
        },
        {
          name: 'Biggly.customers',
          columns: [
            {name: 'customerName'},
            {name: 'customerKey'}
          ],
          where: ['customers.customerKey = campaigns.customerKey']
        },
        {
          name: 'bms_campaigns.campaignDivisions',
          columns: [
            {name: 'campaignDivName'},
            {name: 'campaignDivKey'}
          ],
          where: ['campaignDivisions.campaignDivKey = campaigns.campaignDivKey']
        },
        {
          name: 'bms_campaigns.packages',
          columns: [
            {name: 'packageName'},
            {name: 'packageKey'}
          ],
          where: ['packages.packageKey = campaigns.packageKey']
        }
      ]
    }
  }
  getCampaignDivisions() {
    return {
      name: 'bms_campaigns.campaignDivisions', columns: [
        {name: 'campaignDivKey'},
        {name: 'campaignDivName'},
      ], sort: 'campaignDivName'
    }
  }
  getProducts() {
    return {
      name: 'bms_campaigns.products',
      columns: [
        {name: 'productKey'},
        {name: 'productName'},
        {name: 'supplierKey'},
        {name: 'costPrice'},
        {name: 'retailPrice'},
        {name: 'initialStatus'},
        {name: 'bookingTmpKey'},
        {name: 'description'},
        {name: 'quantity'},
        {name: 'created'},
        {name: 'updated'},
        {name: 'bms_campaigns.bookingTemplates', columns: [
          {name: 'bms_booking.bookingDivisions', columns: [
            {name: 'bookingDivName'}
          ], where: [
            'bookingDivisions.bookingDivKey = bookingTemplates.bookingDivKey'
          ]}
        ], where: [
          'products.bookingTmpKey = bookingTemplates.bookingTmpKey'
        ]}
      ]
    }
  }
  getProductsAndBookingTemplates() {
    return {
      name: 'bms_campaigns.products',
      columns: [
        {name: 'productKey'},
        {name: 'productName'},
        {name: 'costPrice'},
        {name: 'retailPrice'},
        {name: 'bookingTmpKey'},
        {name: 'description'},
        {name: 'quantity'},
        {name: 'created'},
        {name: 'updated'},
        {name: 'autoFillLabels'},
        {name: 'bms_campaigns.bookingTemplates', columns: [
          {name: 'bookingTmpKey'},
          {name: 'partnerKey'},
          {name: 'bookingName'},
          {name: 'customerKey'},
          {name: 'tmpKey'},
          {name: 'groupKey'},
          {name: 'bookingDivKey', as: 'tmpDivKey'},
        ],
          where: [
            'bookingTemplates.bookingTmpKey = products.bookingTmpKey'
          ]}, 
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'bookingDivName'}
        ], where: [
          'bookingDivisions.bookingDivKey = tmpDivKey'
        ]},
      ],
      sort: 'created desc'
    }
  }
  getBookingTemplatesByDivKeySmall(key) {
    return {
      name: 'bms_campaigns.bookingTemplates',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'bookingTmpKey'},
        {name: 'bookingTmpName'},
      ], where: [
        `bookingDivKey = "${key}"`
      ]
    }
  }
  getActivatedBookings(key) {
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'bookingsKey'},
        {name: 'bookingName'},
        {name: 'currentStatus'},
        {name: 'campaignKey'},
        {name: 'periodKey'},
        {name: 'created'},
        {name: 'dueDate'},
        {name: 'flags'},
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'bookingDivName'},
          {name: 'jsonFlags'}
        ], where: [
          'bookingDivisions.bookingDivKey = bookings.bookingDivKey'
        ]},
      ], where: [
        `bookings.campaignKey = "${key}"`
      ], sort: 'dueDate desc'
    }
  }
  getBookingTemplatesByDivKey(key) {
    return {
      name: 'bms_campaigns.bookingTemplates',
      columns: [
        {name: 'bookingTmpKey'},
        {name: 'partnerKey'},
        {name: 'createdUserKey'},
        {name: 'created'},
        {name: 'dueDate'},
        {name: 'assignedUserKey'},
        {name: 'bookingName'},
        {name: 'customerKey'},
        {name: 'tmpKey'},
        {name: 'assignedPartnerKey'},
        {name: 'colorLabel'},
        {name: 'updated'},
        {name: 'completedDate'},
        {name: 'groupKey'},
        {name: 'queried'},
        {name: 'currentStatus'},
        {name: 'jsonForm'},
        {name: 'jsonStatus'},
        {name: 'bookingDivKey'},
        {name: 'createdPartnerKey'},
        {name: 'flagged'},
        {name: 'actualDivKey'},
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'bookingDivName'}
        ], where: [
          'bookingTemplates.bookingDivKey = bookingDivisions.bookingDivKey'
        ]},
      ],
      where: [
        `bookingDivKey = "${key}"`
      ]
    }
  }
  getTemplatesByProductKey(where) {
    return {
      name: 'bms_campaigns.products',
      columns: [
        {name: 'productKey'},
        {name: 'quantity'},
        {name: 'bms_campaigns.bookingTemplates', columns: [
          {name: 'bookingTmpKey'},
          {name: 'partnerKey'},
          {name: 'assignedUserKey'},
          {name: 'bookingName'},
          {name: 'customerKey'},
          {name: 'assignedPartnerKey'},
          {name: 'colorLabel'},
          {name: 'groupKey'},
          {name: 'queried'},
          {name: 'currentStatus'},
          {name: 'jsonForm'},
          {name: 'jsonStatus'},
          {name: 'bookingDivKey'},
          {name: 'createdPartnerKey'},
          {name: 'tmpKey'},
        ], where: [
          'products.bookingTmpKey = bookingTemplates.bookingTmpKey'
        ]}
      ],
      where: [where.join(' OR ')]
    }
  }
  getPartnersNameAndKey() {
    return {
      name: 'Biggly.partners',
      columns: [
        {name: 'partnerKey'},
        {name: 'partnerName'},
      ]
    }
  }
  getCustomers() {
    return {
      name: 'Biggly.customers',
      columns: [
        {name: 'customerKey'},
        {name: 'customerName'},
      ]
    }
  }
  getCustomersByPartnerKey(partnerKey) {
    return {
      name: 'Biggly.customers',
      columns: [
        {name: 'customerName'},
        {name: 'customerKey'},
        {name: 'partnerKey'},
      ],
      where: [
        `partnerKey = "${partnerKey}"`
      ]
    }
  }
  getCampaignsNameAndKey() {
    return {
      name: 'bms_campaigns.campaignDivisions',
      columns: [
        {name: 'campaignDivName'},
        {name: 'campaignDivKey'},
      ]
    }
  }
  getPackageWithPeriodsAndProductNames(packageKey) {
    return {
      name: 'bms_campaigns.packages',
      columns: [
        {name: 'packageKey'},
        {name: 'packageName'},
        {name: 'partnerKey'},
        {name: 'frequency'},
        {name: 'campaignDivKey'},
        {name: 'bms_campaigns.periods', columns: [
          {name: 'periodKey'},
          {name: 'period'},
          {name: 'productKey'},
          {name: 'bms_campaigns.products', columns: [
            {name: 'productName'},
            {name: 'costPrice'},
            {name: 'retailPrice'},
            {name: 'productKey'},
            {name: 'quantity'},
            {name: 'bookingTmpKey'},
          ], where: [
            'products.productKey = periods.productKey'
          ], as: 'products'}
        ], where: [
          'periods.packageKey = packages.packageKey'
        ], as: 'periods'},
      ],
      where: [`packageKey = "${packageKey}"`]
    }
  }
  getPeriodsAndProductNamesFromCurrentPeriod(packageKey, currentPeriod) {
    return {
      name: 'bms_campaigns.periods', columns: [
        {name: 'periodKey'},
        {name: 'period'},
        {name: 'packageKey'},
        {name: 'bms_campaigns.packages', columns: [
          {name: 'packageName'},

        ], where: [
          'packages.packageKey = periods.packageKey'
        ]},
        {name: 'productKey'},
        {name: 'bms_campaigns.products', columns: [
          {name: 'productName'},
          {name: 'costPrice'},
          {name: 'quantity'},
          {name: 'autoFillLabels'},
          {name: 'bms_campaigns.bookingTemplates', columns: [
            {name: 'bookingTmpKey'},
            {name: 'partnerKey'},
            {name: 'createdUserKey'},
            {name: 'dueDate'},
            {name: 'assignedUserKey'},
            {name: 'bookingName'},
            {name: 'customerKey'},
            {name: 'tmpKey'},
            {name: 'assignedPartnerKey'},
            {name: 'colorLabel'},
            {name: 'updated'},
            {name: 'completedDate'},
            {name: 'groupKey'},
            {name: 'queried'},
            {name: 'currentStatus'},
            {name: 'jsonForm'},
            {name: 'jsonStatus'},
            {name: 'bookingDivKey'},
            {name: 'createdPartnerKey'},
            {name: 'flagged'},
            {name: 'actualDivKey'},
            {name: 'flags'},
          ], where: [
            'bookingTemplates.bookingTmpKey = products.bookingTmpKey'
          ], as: 'bookingTemplate'},
          {name: 'bms_campaigns.bookingTemplates', columns: [
            {name: 'bookingName'},
          ], where: [
            'bookingTemplates.bookingTmpKey = products.bookingTmpKey'
          ]},
        ], where: [
          'periods.productKey = products.productKey'
        ]},
      ], where: [
        `periods.packageKey = "${packageKey}"`,
        `periods.period >= ${currentPeriod}`
      ]
    }
  }
  getPackagesByCampDiv(campaignDivKey) {
    return {
      name: 'bms_campaigns.packages',
      columns: [
        {name: 'packageName'},
        {name: 'packageKey'},
        {name: 'campaignDivKey'},
        {name: 'bms_campaigns.periods', columns: [
          {name: 'periodKey'},
          {name: 'period'},
          {name: 'productKey'},
          {name: 'bms_campaigns.products', columns: [
            {name: 'productName'},
            {name: 'productKey'},
            {name: 'quantity'}
          ], where: [
            'products.productKey = periods.productKey'
          ], as: 'product'}
        ], where: [
          'periods.packageKey = packages.packageKey'
        ], as: 'periods'},
        {name: 'jsonPeriods'},
      ],
      where: [
        `packages.campaignDivKey = "${campaignDivKey}"`
      ]
    }
  }
  getDivTabs(campaignDivKey) {
    return {
      name: 'bms_campaigns.divTabs',
      columns: [
        {name: 'divTabsKey'},
        {name: 'jsonForm'},
        {name: 'divKey'},
        {name: 'divTabsName'},
        {name: 'campaignDivKey'},
      ],
      where: [
        `divTabs.campaignDivKey = "${campaignDivKey}"`
      ]
    }
  }
  getPackages() {
    return {
      name: 'bms_campaigns.packages',
      columns: [
        {name: 'packageKey'},
        {name: 'packageName'},
        {name: 'jsonPeriods'},
        {name: 'campaignDivKey'},
        {name: 'frequency'},
        {name: 'bms_campaigns.campaignDivisions', columns : [
          { name: 'campaignDivName' }, 
        ], where: [
            'packages.campaignDivKey = campaignDivisions.campaignDivKey'
        ]},
      ]
    }
  }
  getCampaignUploads(key) {
    return {
      name: 'Biggly.uploads',
      columns: [
        {name: 'campaignKey'},
        {name: 'created'},
        {name: 'fileName'},
        {name: 'uploadsKey'},
        {name: 'urlName'},
        {name: 'Biggly.users', columns: [
          {name: 'concat=>(firstName " " lastName)', as: 'uploadedUserName'}
        ], where: [
          'users.userKey = uploads.uploadedUserKey'
        ]},
      ],
      where: [
        `campaignKey = "${key}"`
      ]
    }
  }
  getNotesByCampaignKey(key) {
    return {
      name: 'bms_campaigns.campaign_notes',
      columns: [
        {name: 'campaignNoteKey'},
        {name: 'campaignKey'},
        {name: 'noteDetails'},
        {name: 'createdOn'},
        {name: 'userKey'},
      ],
      where: [
        `campaignKey = "${key}"`
      ]
    }
  }
  getSuppliers() {
    return {
      name: 'bms_campaigns.suppliers',
      columns: [
        {name: 'supplierKey'},
        {name: 'supplierName'},
        {name: 'supplierEmail'},
      ]
    }
  }
  getFullBookingDivisions() {
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
  getBookingDivisions() {
    return {
      name: 'bms_booking.bookingDivisions', columns: [
        {name: 'bookingDivKey'},
        {name: 'bookingDivName'},
        {name: 'jsonStatus'},
        {name: 'jsonFlags'},
      ]
    }
  }
  createPeriods(periods) {
    return {
      name: 'bms_campaigns.periods'
    }
  }
  createBookings(bookings) {
    return {
      name: 'bms_booking.bookings',
    }
  }
  createCampaign(data) {
    return {
      name: 'bms_campaigns.campaigns',
    }
  }
  createCampaignNotes(data) {
    return {
      name: 'bms_campaigns.campaign_notes'
    }
  }
  createProductAndReturnKey(product) {
    return {
      name: 'bms_campaigns.products',
    }
  }
  createPackage() {
    return {
      name: 'bms_campaigns.packages'
    }
  }
  createProduct() {
    return {
      name: 'bms_campaigns.products'
    }
  }
  createUploads(data) {
    return {
      name: 'Biggly.uploads'
    }
  }
  updateCampaign(key, data) {
    return {
      name: 'bms_campaigns.campaigns',
      where: [
        `campaignKey = "${key}"`
      ]
    }
  }
  updateCampaignNotes(key, data) {
    return {
      name: 'bms_campaigns.campaign_notes',
      where: [`campaignNoteKey = "${key}"`]
    }
  }
  updatePackage(key) {
    return {
      name: 'bms_campaigns.packages',
      where: [
        `packages.packageKey = "${key}"`
      ]
    }
  }
  updateProduct(key, product) {
    return {
      name: 'bms_campaigns.products',
      where: [
        `products.productKey = "${key}"`
      ]
    }
  }
  deletePeriod(key) {
    return {
      name: 'bms_campaigns.periods',
      where: [
        `periods.periodKey = "${key}"`
      ]
    }
  }
  deletePeriodsByPackageKeyAndPeriod(key, period) {
    return {
      name: 'bms_campaigns.periods',
      where: [
        `periods.packageKey = "${key}" AND periods.period = ${period}`
      ]
    }
  }
  deleteProductPeriod(productKey) {
    return {
      name: 'bms_campaigns.periods',
      where: [
        `productKey = "${productKey}"`
      ]
    }
  }
  deletePackage(packageKey) {
    return {
      name: 'bms_campaigns.packages',
      where: [
        `packageKey = "${packageKey}"`
      ]
    }
  }
  deleteProduct(productKey) {
    return {
      name: 'bms_campaigns.products',
      where: [
        `productKey = "${productKey}"`
      ]
    }
  }
  deleteNotes(key) {
    return {
      name: 'bms_campaigns.campaign_notes',
      where: [
        `campaignKey = "${key}"`
      ]
    }
  }
  deleteCampaign(key) {
    return {
      name: 'bms_campaigns.campaigns',
      where: [
        `campaignKey = "${key}"`
      ]
    }
  }
}
