import React, { Component } from 'react';
import '../../App.css';
import { Layout, Button, Table, Drawer, Form, Col, Row, Input, Icon, message, Card, Select } from 'antd';
import antIcons from '../../mixins/antIcons';

const { Content } = Layout;

const success = (message_details) => {
  message.success(message_details);
};

export default class DivisionsTable extends Component {

  state = {
    divisions: [],
    newDivisionForm: false,
    bookingDivName: '',
    clickButton: false,
    icon: '',
    search: '',
  };

  showDrawer = () => {
    this.setState({
      newDivisionForm: true,
      clickButton: false,
      bookingDivName: ''
    });
  };

  onClose = () => {
    this.setState({
      newDivisionForm: false,
    });
  };

  handleSearch = value => {
    // this.setState({search: value});
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    let stateCopy = { ...this.state };

    this.setState({ clickButton: true })
    // this.setState({ newdivisionForm: false });
    stateCopy.newDivisionForm = false;

    try {
      await this.props.createDivision({ 
        icon: this.state.icon,
        bookingDivName: this.state.bookingDivName 
      });
      stateCopy.divisions = await this.props.getDivisions();
      success('Division added');
    } catch (e) {
      alert(e);
    }

    this.setState(stateCopy);
  };

  validateForm() {
    return (
      this.state.bookingDivName.length > 0 &&
      this.state.icon.length > 0
    )
  }

  async componentDidMount() {

    try {
      await this.loadPage();
    } catch (e) {
      alert(e.message);
    }

  }

  loadPage = async () => {
    const divisions = await this.props.getDivisions();
    this.setState({ divisions });
  };

  render() {

    const columns = [{
      title: 'Name',
      dataIndex: 'bookingDivName',
      key: 'bookingDivName',
      sorter: (a, b) => a.bookingDivName.length - b.bookingDivName.length,
      sortDirections: ['descend', 'ascend'],
      render: (bookingDivName, div) => (
        <div>
          <Icon type={div.icon} />&nbsp; {bookingDivName}
        </div>
      )
    }];

    function onChange(pagination, filters, sorter) {
      //console.log('params', pagination, filters, sorter);
    }



    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
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
                    onChange={onChange}
                    onRow={record => (
                      {
                        onClick: () => this.props.handleRow(record)
                      }
                    )}
                    rowClassName={'bms_clickable'}
                    rowKey="bookingDivKey"
                    dataSource={this.state.divisions}
                    columns={columns}
                  >
                  </Table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Drawer
          title="Create a new division"
          width={620}
          onClose={this.onClose}
          visible={this.state.newDivisionForm}
        >
          <Form
            layout="horizontal"
            onSubmit={this.handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item label={"Name"}>
              <Input
                required
                id="bookingDivName"
                type={"text"}
                onChange={this.handleChange}
                value={this.state.bookingDivName}
              />
            </Form.Item>
            <Form.Item label="Icon">
              <Select
                id="icon"
                showSearch
                onChange={icon => this.setState({icon})}
                optionFilterProp="value"
                onSearch={this.handleSearch}
                filterOption={(input, option) =>
                    option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {
                  antIcons.map((icon, i) => (
                    <Select.Option 
                      key={icon + i}
                      value={icon}
                    >
                      <Icon type={icon} /> {icon}
                    </Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
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
            <Button type="dashed" style={{ marginRight: 8 }} onClick={this.onClose}>Cancel</Button>
            <Button disabled={!this.validateForm()} loading={this.state.clickButton} onClick={this.handleSubmit} type={"primary"}>Create</Button>
          </div>
        </Drawer>
      </Content>
    );
  }
}

