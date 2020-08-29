import React, {Component} from 'react';
import '../../App.css';
import {Button, Table, Drawer, Form, Col, Row, Input, Icon, message, Card} from 'antd';

export default class SimpleCreationTable extends Component {

  state = {
    // using...
    loadSubmit: false,
    showDrawer: false,
    form: {},
    records: [],
    columns: [],
  };

  async componentDidMount() {
    await this.loadDataAndSetState();
  }

  loadDataAndSetState = async () => {
    if(!this.props.tableRecords) {
      console.log('Add tableRecords() to the SimpleCreationTable props to populate the table.');
      return;
    }

    let newColumns = this.props.columns;
    if(this.props.deleteRow) {
      newColumns = this.addDeleteIcon(newColumns)
    }

    let records = null;
    try {
      records = await this.props.tableRecords();
    } catch (error) {
      console.log('error :', error);
    }
    if(!records) message.error('There was an error getting any records for the table');

    this.setState({records, loadSubmit: false, showDrawer: false, columns: newColumns});
  };

  addDeleteIcon = columns => (
    [...columns, {
      title: '',
      dataIndex: this.props.rowKey,
      key: this.props.rowKey,
      render: key =>
        <Button 
          onClick={() => {this.delete(key)}}
        ><Icon type={"delete"}/>
        </Button>
    }]
  )

  delete = async key => {
    // I'm doing this a bit of a weird way because the del method
    // isn't returning anything for some reason.
    try {
      await this.props.deleteRow(key);
    } catch (error) {
      console.log('error :', error);
      message.error('Unable to delete record.');
      this.loadDataAndSetState()
      return;
    }
    message.warn('Row deleted!');
    this.loadDataAndSetState();
  }

  showDrawer = () => {
    this.setState({
      showDrawer: true,
      form: {}
    });
  };

  onClose = () => {
    this.setState({showDrawer: false});
  };

  handleChange = (key, value) => {
    let form = JSON.parse(JSON.stringify(this.state.form));
    form[key] = value
    this.setState({form});
  };

  handleSubmit = async() => {
    this.setState({loadSubmit: true})
    if(this.props.submitForm) {
      await this.props.submitForm(this.state.form);
    }
    this.loadDataAndSetState();
  };

  validateForm() {
    const {form} = this.state;
    let valid = true;
    if(!this.props.formFields) return valid;
    this.props.formFields.forEach(item => {
      if(typeof form[item.dataIndex] === 'string') {
        if(item.required && form[item.dataIndex].length === 0) {
          valid = false;
        }
      } else {
        if(item.required && form[item.dataIndex] === undefined) {
          valid = false;
        }
      }
    })
    return valid;
  }

  render() {

    return (
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              <Row>
                <Col span={24} style={{ 'textAlign': 'right' }}>
                  <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={'plus-circle'} onClick={this.showDrawer} />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Table size="small" 
                    pagination={false}
                    onRow={record => { return { onClick: e => 
                      this.props.handleRow && this.props.handleRow(record) 
                    }}}
                    rowClassName={'bms_clickable'}
                    rowKey={this.props.rowKey && this.props.rowKey}
                    dataSource={this.state.records}
                    columns={this.state.columns && this.state.columns}
                  >
                  </Table>
                </Col>
              </Row>
            </Card>
          </Col>

        <Drawer
          title={this.props.drawerTitle && this.props.drawerTitle}
          width={620}
          onClose={this.onClose}
          visible={this.state.showDrawer}
        >
          <Form
            layout="horizontal"
            onSubmit={this.handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            {
              this.props.formFields &&
              this.props.formFields.map((field, i) => (
                field.render ?
                <Form.Item key={field + i} label={field.prettyName}>
                  {
                    field.render(this.handleChange.bind(this), this.state.showDrawer)
                  }
                </Form.Item>
                :
                <Form.Item key={field + i} label={field.prettyName}>
                  <Input
                    required={field.required}
                    type={field.type}
                    onChange={e => this.handleChange(field.dataIndex, e.target.value)}
                    value={this.state.form[field.dataIndex]}
                  />
                </Form.Item>
              ))
            }
          </Form>

          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e9e9e9',
              padding: '10px 16px',
              background: '#fff',
              textAlign: 'right',
            }}
          >
            {
              this.props.drawerButtons ?
              this.props.drawerButtons(
                this.state.form,
                this.validateForm.bind(this),
                this.loadDataAndSetState.bind(this),
                this.handleSubmit.bind(this)
              )
              :
              <Button
                disabled={!this.validateForm()}
                loading={this.state.loadSubmit}
                onClick={this.handleSubmit}
                type={"primary"}
              >Create</Button>
            }
          </div>
        </Drawer>
      </Row>

    );
  }
}

