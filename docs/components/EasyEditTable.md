# EasyEditTable Component

Allows you to create a table with rows that the user can edit without
having to hit *Save*.

**Note**: All the `action` functions here are just examples and don't
reflect how they're actually used in BMS.

```js
  <EasyEditTable
    primaryKey="recordKey"
    createPrimaryKey={() => uuid.v1()}
    dataSource={() => 
      // dataSource must be a function that returns a promise so
      // this can be the full api call...
      this.actions.listRecords()
    }
    create={record => 
      this.props.actions.createRecord(record)
    }
    update={record => 
      this.props.actions.updateRecord(record.recordId, record)
    }
    delete={key => 
      // Adding this prop will add a delete icon to
      // every row.
      this.props.actions.deletePublic(key)
    }
    columns={[
      {
        title: 'My Record Name',
        dataIndex: 'recordName',
        key: 'recordName',
        type: 'string' // < Can be one of 'boolean', 'number', 
                            'string' or 'readonly'
      },
      // If the 'type's above don't apply you can render your own input
      // type and update it using the onChange callback function...
      {
        title: 'My Record Other',
        dataIndex: 'otherName',
        key: 'otherName',
        render: (dataIndex, value, record, index, onChange) => (
          <Input
            onChange={val => onChange(dataIndex, val, index)}
            defaultValue={value}
          />
        )
      }
    ]}
  >
  </EasyEditTable>
```

It's a good idea to make sure that you fetch the records in order of date
created, this will ensure that the table's order doesn't change
unexpectedly.
