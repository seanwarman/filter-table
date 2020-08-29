import React, { Component, Fragment } from 'react'
import {
  InputNumber,
  Select,
  Table,
  Icon,
  Input,
  Popconfirm,
} from 'antd'

let typingTimer

export default class EasyUpdateTable extends Component {

  state = {
    primaryKey: '',
    columns: [],
    dataSource: []
  }


  componentDidMount = async() => {
    let dataSource = []
    let columns = []

    if(typeof this.props.dataSource === 'function') {
      dataSource = await this.props.dataSource()
      columns = this.populateColumns(dataSource, this.props.columns)
    } else {
      columns = this.populateColumns(this.props.dataSource, this.props.columns)
    }

    this.setState({
      primaryKey: this.props.primaryKey,
      dataSource,
      columns,
    })
  }

  handleDelRow = async primaryKey => {

    if(typeof this.props.dataSource === 'function') {
      this.setState({
        dataSource: this.state.dataSource.filter(item => item[this.props.primaryKey] !== primaryKey)
      })

    }

    await this.props.delete(primaryKey)

    this.componentDidMount()

  }

  handleUpdate = async (dataIndex, value, primaryValue) => {

    const data = {
      [this.state.primaryKey]: primaryValue,
      [dataIndex]: value
    }

    // If the props dataSource was a promise function we have
    // the dataSource on state...
    if(typeof this.props.dataSource === 'function') {

      const dataSource = this.state.dataSource.map((item, index) => (
        item[this.state.primaryKey] === primaryValue ?
        { ...item, ...data }
        :
        item
      ))
      this.setState({ dataSource })
      await this.props.update(data)

    } else {

      // Otherwise it's on props and there's no need to do a setState...
      await this.props.update(data)
    }

    this.componentDidMount()

  }

  onChange = (primaryValue) => (dataIndex, value) => {

    if(!value && value !== 0) return

    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      this.handleUpdate(dataIndex, value, primaryValue)
    }, 200)
  }

  populateRender = (value, record, i, {
    disabled, 
    title, 
    placeholder, 
    dataIndex, 
    prefix,
    type = 'string', 
    props = {} 
  }) => {

    return (
      type === 'number' ?
      <Fragment>
        {prefix}
        <InputNumber
          className={record[this.state.primaryKey]}
          disabled={disabled === true}
          placeholder={placeholder}
          onPressEnter={() => this.props.onPressEnter()}
          style={{border: 'none'}}
          defaultValue={value || null}
          onChange={num => this.onChange(record[this.state.primaryKey])(dataIndex, num)}
          {...props}
        />
      </Fragment>
      :
      type === 'boolean' ?
      <Fragment>
        {prefix}
        <Select
          className={record[this.state.primaryKey]}
          disabled={disabled === true}
          placeholder={placeholder}
          onPressEnter={() => this.props.onPressEnter()}
          style={{border: 'none'}}
          defaultValue={false}
          onChange={e => this.onChange(record[this.state.primaryKey])(dataIndex, e.target.value)}
          {...props}
        >
          <Select.Option value={true}>True</Select.Option>
          <Select.Option value={false}>False</Select.Option>
        </Select>
      </Fragment>
      :
      type === 'string' ?
      <Fragment>
        {prefix}
        <Input
          className={record[this.state.primaryKey]}
          disabled={disabled === true}
          placeholder={placeholder}
          onPressEnter={() => this.props.onPressEnter()}
          style={{border: 'none'}}
          defaultValue={value}
          onChange={e => this.onChange(record[this.state.primaryKey])(dataIndex, e.target.value)}
          {...props}
        />
      </Fragment>
      :
      type === 'readonly' &&
      <div
        {...props}
        className={record[this.state.primaryKey]}
      >{prefix}{value}</div>
    )

  }

  populateColumns = (dataSource, columns) => {
    columns = columns.map((col,i) => {

      if(col.render) {
        return { ...col, render: (value, record, i) => col.render(value, record, i, this.onChange(record[this.state.primaryKey]).bind(this))}
      } else {
        return { ...col, render: (value, record, i) => this.populateRender(value, record, i, col) }
      }
    })

    // If the delete event isn't on props don't add the minus icon...
    if(!this.props.delete) return columns

    return columns.concat({
      title: '',
      dataIndex: 'deleteCol',
      key: 'deleteCol',
      render: (value, record, i) => (
        this.props.confirmDelete !== false ?
        <Popconfirm
          title="Are you sure you want to delete this record?"
          okText="Yes"
          cancelText="No"
          placement="topRight"
          onConfirm={() => this.handleDelRow(record[this.props.primaryKey])}
        >
          <Icon 
            style={{fontSize: 18}}
            type="minus-circle" 
          />
        </Popconfirm>
        :
        <Icon 
          onClick={() => this.handleDelRow(record[this.props.primaryKey])}
          style={{fontSize: 18}}
          type="minus-circle" 
        />
      )
    })
  }

  render() {
    return (

      <Table
        rowKey={this.props.primaryKey}
        size="small"
        // props has to go in this order because we dont want columns and dataSource to be replaced 
        {...this.props}
        columns={this.state.columns}
        dataSource={typeof this.props.dataSource === 'function' ? this.state.dataSource : this.props.dataSource}
      ></Table>







      // <EasyUpdateTable
      //   primaryKey="recordID"
      //   update={record => handleUpdate(record.recordID)}
      //   delete={recordID => handleDeleteRecord(recordID)}
      //   columns={[
      //     {
      //       title: String,
      //       dataIndex: String,
      //       // ... same as antd except if there's no render we attatch one on the inside
      //     }
      //   ]}
      //   dataSource={() => this.fetchAPI('tablename')}
      // ></EasyUpdateTable>

    )
  }

}

