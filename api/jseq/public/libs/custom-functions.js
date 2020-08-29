const schema = require('../../../schema/public')

module.exports = {
  listOptions: function(db, table) {
    const tableSchema = schema[db][table]
    return Object.keys(tableSchema).map(key => {
      return `
        SELECT
        '${key}' as 'column',
        '${tableSchema[key].type}' as 'type'
      `
    }).join(' UNION ')
  }
}
