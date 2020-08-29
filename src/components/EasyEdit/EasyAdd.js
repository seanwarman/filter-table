import React, { Fragment } from 'react'
import {
  Button,
} from 'antd'
import uuid from 'uuid'
import EasyUpdateTable from './EasyUpdateTable.js'

class EasyAdd extends React.Component {

  state = {
    recordsToAdd: []
  }

  componentDidMount() {
    this.addRow()
  }

  setValByType(dataIndex, type, defaultValue) {

    if(type === 'boolean') return {
      [dataIndex]: defaultValue || false
    }
    if(type === 'number') return {
      [dataIndex]: defaultValue || 0
    }
    if(type === 'readonly') return {}

    return {
      [dataIndex]: defaultValue || ''
    }
  }

  focusInput = className => {

    if(!className) return

    setTimeout(() => {
      let elements = document.getElementsByClassName(className)

      elements[0].focus()

    }, 100)
  }

  makeRow = (columns) => {
    const easyAddID = uuid.v1()

    return {
      easyAddID,
      ...columns.reduce((record, { dataIndex, type = 'string', defaultValue }, i) => {

        return {
          ...record,
          ...this.setValByType(dataIndex, type, defaultValue)
        }

      }, {})

    }
  }

  update = recordToUpdate => {

    this.setState({
      recordsToAdd: this.state.recordsToAdd.map(record => {
        if(record.easyAddID === recordToUpdate.easyAddID) return {
          ...record,
          ...recordToUpdate
        }
        return record
      })
    })

  }

  delete = easyAddID => {
    const recordsToAdd = this.state.recordsToAdd.filter(rec => rec.easyAddID !== easyAddID)

    this.setState({ recordsToAdd })

    this.focusInput(recordsToAdd[recordsToAdd.length - 1].easyAddID)
  }

  addRow = () => {

    const row = this.makeRow(this.props.columns)

    this.setState({
      recordsToAdd: [
        ...this.state.recordsToAdd,
        row
      ]
    })
    
    this.focusInput(row.easyAddID)

  }

  dupRow = () => {
    const { recordsToAdd } = this.state
    if(!recordsToAdd.length) return

    const lastRecord = recordsToAdd[recordsToAdd.length - 1]

    const easyAddID = uuid.v1()

    this.setState({
      recordsToAdd: [
        ...this.state.recordsToAdd,
        {
          ...lastRecord,
          easyAddID,
        }
      ]
    })
    
    this.focusInput(easyAddID)

  }

  create = recordsToAdd => {

    this.setState({recordsToAdd: [this.makeRow(this.props.columns)]})

    return this.props.create(this.state.recordsToAdd.map(recordToAdd => {
      const { easyAddID, ...record } = recordToAdd
      return record
    }))
  }

  render() {

    const { columns, create, ...tableProps} = this.props

    const buttonStyle = {
      width: '100px'
    }

    return (
      <Fragment>

        <EasyUpdateTable
          {...tableProps}
          onPressEnter={this.addRow}
          easyAdd={false}
          primaryKey="easyAddID"
          update={record => this.update(record)}
          columns={this.props.columns}
          dataSource={this.state.recordsToAdd}
          delete={easyAddID => this.delete(easyAddID)}
          pagination={{
            disabled: true,
            hideOnSinglePage: true
          }}
          confirmDelete={false}
        ></EasyUpdateTable>

        <div style={{
          position: 'relative',
          textAlign: 'center',
          marginTop: 16,
          marginBottom: 16
        }}>

          <Button
            style={buttonStyle}
            onClick={this.addRow}
          >Add</Button>

          <Button
            style={buttonStyle}
            onClick={this.dupRow}
          >Duplicate</Button>

          <Button
            style={buttonStyle}
            type="primary"
            onClick={this.create}
          >Save</Button>

        </div>

      </Fragment>
    )
  }
}

export default EasyAdd
