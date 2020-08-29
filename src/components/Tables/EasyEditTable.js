import React, { Component } from 'react'
import {
  InputNumber,
  Select,
  message,
  Table,
  Card,
  Row,
  Col,
  Icon,
  Input,
  Popconfirm,
} from 'antd'

let plusOne = false
let typingTimer

export default class EasyEditTable extends Component {

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


  handlePlusRow = async() => {
    if(plusOne) return
    plusOne = true

    const key = this.props.createPrimaryKey()


    let { dataSource, columns } = this.state

    let data = {}

    columns.forEach(col => {
      let value

      if(col.type === 'boolean') {
        value = false
      } else
      if(col.type === 'number') {
        value = 0
      } else
      if(col.type === 'string') {
        value = ''
      } else {
        value = null
      }

      data[col.dataIndex] = value
    })

    data = {...data, [this.state.primaryKey]: key}


    const result = await this.props.create(data)
    if(result) plusOne = false
    else message.error('There was an error creating the record, please try reloading the page.')

    dataSource.unshift(data)

    await this.setState({dataSource})

  }

  handleDelRow = i => {
    const record = this.state.dataSource.find((item, indx) => indx === i)

    if(typeof this.props.dataSource === 'function') {
      this.setState({
        dataSource: this.state.dataSource.filter((item, indx) => indx !== i)
      })

    }

    if(!record[this.state.primaryKey]) {
      plusOne = false
      return;
    }

    this.props.delete(record[this.state.primaryKey]);

  }

  handleUpdate = (dataIndex, value, i) => {

    // If the props dataSource was a promise function we have
    // the dataSource on state...
    if(typeof this.props.dataSource === 'function') {

      const dataSource = this.state.dataSource.map((item, index) => (
        i === index ?
        { ...item, [dataIndex]: value }
        :
        item
      ))
      this.setState({ dataSource })
      this.props.update(dataSource[i])

    } else {

      // Otherwise it's on props and there's no need to do a setState...
      this.props.update({
        ...this.props.dataSource[i],
        [dataIndex]: value 
      })
    }

  }

  onChange = (dataIndex, value, i) => {

    if(!value && value !== 0) return

    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      this.handleUpdate(dataIndex, value, i)
    }, 200)
  }

  populateRender = (dataIndex, value, record, i, type = 'string', props = {}) => {

    return (
      type === 'number' ?
      <InputNumber
        style={{border: 'none'}}
        defaultValue={value}
        onChange={num => this.onChange(dataIndex, num, i)}
        {...props}
      />
      :
      type === 'boolean' ?
      <Select
        style={{border: 'none'}}
        defaultValue={false}
        onChange={e => this.onChange(dataIndex, e.target.value, i)}
        {...props}
      >
        <Select.Option value={true}>True</Select.Option>
        <Select.Option value={false}>False</Select.Option>
      </Select>
      :
      type === 'string' ?
      <Input
        style={{border: 'none'}}
        defaultValue={value}
        onChange={e => this.onChange(dataIndex, e.target.value, i)}
        {...props}
      />
      :
      type === 'readonly' &&
      <div {...props}>{value}</div>
    )

  }

  populateColumns = (dataSource, columns) => {
    columns = columns.map((col,i) => {

      if(col.render) {
        return { ...col, render: (value, record, i) => col.render(col.dataIndex, value, record, i, this.onChange.bind(this))}
      } else {
        return { ...col, render: (value, record, i) => this.populateRender(col.dataIndex, value, record, i, col.type, col.props) }
      }
    })

    // If the delete event isn't on props don't add the minus icon...
    if(!this.props.delete) return columns

    return columns.concat({
      title: '',
      dataIndex: 'deleteCol',
      key: 'deleteCol',
      render: (value, record, i) => (
        <Popconfirm
          title="Are you sure you want to delete this record?"
          okText="Yes"
          cancelText="No"
          placement="topRight"
          onConfirm={() => this.handleDelRow(i)}
        >
          <Icon 
            style={{fontSize: 18}}
            type="minus-circle" 
          />
        </Popconfirm>
      )
    })
  }

  render() {
    return (

      <Card bordered={false} style={{ 'width': '100%' }}>
        <Row>
          <Col span={24} style={{ 'textAlign': 'right' }}>

            {
              this.props.mainButton ?
              this.props.mainButton(this.handlePlusRow.bind(this))
              :
              this.props.create &&
              <Icon
                type="plus-circle"
                onClick={this.handlePlusRow}
                style={{
                  marginBottom: 12,
                  fontSize: 20
                }}
              ></Icon>
            }

          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              rowKey={this.props.primaryKey}
              size="small"
              // props has to go in this order because we dont want columns and dataSource to be replaced 
              {...this.props}
              columns={this.state.columns}
              dataSource={typeof this.props.dataSource === 'function' ? this.state.dataSource : this.props.dataSource}
            ></Table>
          </Col>
        </Row>
      </Card>







// <EasyEditTable
//   createKey={() => uuid.v1()}
//   create={key => handleCreateRecord(key)}
//   update={key => handleUpdate(key)}
//   delete={key => handleDeleteRecord(key)}
//   columns={[
//     {
//       title: String,
//       dataIndex: String,
//       // ... same as antd except if there's no render we attatch one on the inside
//     }
//   ]}
//   dataSource={recordsArray}
// ></EasyEditTable>

    )
  }

}
