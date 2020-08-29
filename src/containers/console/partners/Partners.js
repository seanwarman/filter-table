import React, { Component } from 'react';
import '../../../App.css';
import { API } from '../../../libs/apiMethods';
import { Layout, Button, Table, Drawer, Form, Col, Row, Input, Icon, message, Card, } from 'antd';
import Highlighter from 'react-highlight-words';

const { Content } = Layout;

const success = (message_details) => {
  message.success(message_details);
};

export default class Partners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      partners: [],
      newPartnerForm: false,
      partnerKey: "",
      partnerName: "",
      partnerTelephone: "",
      partnerAd1: "",
      partnerAd2: "",
      partnerAd3: "",
      partnerTown: "",
      partnerPostCode: "",
      apiKey: "",
      disableButtonSubmit: false
    };

    //this.viewCustomer = this.viewCustomer.bind(this);
  }

  // █▀▀ █▀▀ █▀▀█ █▀▀█ █▀▀ █░░█   █▀▀ █░░█ █▀▀▄ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄ █▀▀
  // ▀▀█ █▀▀ █▄▄█ █▄▄▀ █░░ █▀▀█   █▀▀ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀   ▀░░ ░▀▀▀ ▀░░▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀

  /**
   *
   * --------------------------------------------------------------------------
   * Added search to the columns for the table
   * @param { dataIndex, columnName }
   * The latter has been added and seems to work - if it presents any issues,
   * we can delete this - prettifys the placeholder on the dropdown input
   *
   * @author KR
   * --------------------------------------------------------------------------
   * @version 1.0.0
   * @since 1.0.0
   * --------------------------------------------------------------------------
   *
   */

  searchHandle = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  searchHandleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  searchGetColumnProps = (dataIndex, columnName) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => { this.searchInput = node; }}
            placeholder={`Search ${columnName}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.searchHandle(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => this.searchHandle(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
                    </Button>
          <Button
            onClick={() => this.searchHandleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
                    </Button>
        </div>
      ),
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      if (record[dataIndex]) {
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      }
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text ? text : 'unknown'}
      />
    ),
  });

  /**
   *
   * End of Search Function
   *
   */

  showDrawer = () => {
    this.setState({
      newPartnerForm: true,
      disableButtonSubmit: false,
      partnerKey: "",
      partnerName: "",
      partnerTelephone: "",
      partnerAd1: "",
      partnerAd2: "",
      partnerAd3: "",
      partnerTown: "",
      partnerPostCode: "",
    });
  };
  onClose = () => {
    this.setState({
      newPartnerForm: false,
    });
  };
  handleChange = event => {

    this.setState({
      [event.target.id]: event.target.value
    });
  }
  handleSubmit = async event => {
    if(!this.validateForm()) return;
    event.preventDefault();

    this.setState({ newPartnerForm: false, disableButtonSubmit: true });

    try {

      var partnerEntry = {
        partnerName: this.state.partnerName,
        partnerTelephone: this.state.telephone,
        partnerAd1: this.state.addressLine1,
        partnerAd2: this.state.addressLine2,
        partnerAd3: this.state.addressLine3,
        partnerTown: this.state.townName,
        partnerPostCode: this.state.postCode,
      };

      console.log(partnerEntry);

      await this.createPartner(partnerEntry);

      const partners = await this.partners();
      this.setState({ partners });

      success("Partner added");

    } catch (e) {
      alert(e);

    }
  }
  validateForm() {
    return this.state.partnerName.length > 0;
  }
  createPartner(partner) {
    // KEEP this endpoint must stay legacy because it also creates an api_key record.
    return API.post('biggly', `/partners/key/${this.props.user.apiKey}/partners`, partner);
  }

  async componentDidMount() {

    try {

      const partners = await this.partners();
      this.setState({ partners });

      // this.props.changeHeader("Partners");
      this.props.changeHeader('appstore', 'Console', [{ name: 'Partners', url: '/console/customers' }]);


    } catch (e) {
      alert(e.message);
    }
  }

  partners() {
    return this.props.api.listAdmin({
      name: 'Biggly.partners',
      columns: [
        { name: 'partnerKey' },
        { name: 'partnerName' },
        { name: 'apiKey' }
      ]
    });
  }

  render() {

    var that = this;

    const columns = [{
      title: 'Name',
      dataIndex: 'partnerName',
      key: 'partnerName',
      sorter: (a, b) => {
        if (a.partnerName < b.partnerName) { return -1 };
        if (a.partnerName > b.partnerName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('partnerName', 'partner name')
    }, {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      ...this.searchGetColumnProps('apiKey', 'API key')
    }];

    function onChange(pagination, filters, sorter) {
      //console.log('params', pagination, filters, sorter);
    }

    function viewPartner(record) {

      that.props.history.push(`/console/partners/` + record.partnerKey);
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
                  <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={"plus-circle"} onClick={this.showDrawer} />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Table size="small" onChange={onChange} onRow={(record, rowIndex) => { return { onClick: (event) => { viewPartner(record); } } }} rowClassName={'bms_clickable'} rowKey="partnerKey" dataSource={this.state.partners} columns={columns}>
                  </Table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>



        <Drawer
          title="Create a new partner"
          width={620}
          onClose={this.onClose}
          visible={this.state.newPartnerForm}
        >
          <Form
            layout="horizontal" 
            onSubmit={this.handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item label={"Name"}>
              <Input required id="partnerName" type={"text"} onChange={this.handleChange} value={this.state.partnerName} />
            </Form.Item>
            <Form.Item label={"Address"}>
              <Input id="partnerAd1" type={"text"} onChange={this.handleChange} value={this.state.partnerAd1} />
              <Input id="partnerAd2" type={"text"} onChange={this.handleChange} value={this.state.partnerAd2} />
              <Input id="partnerAd3" type={"text"} onChange={this.handleChange} value={this.state.partnerAd3} />
            </Form.Item>
            <Form.Item label="Town">
              <Input id="partnerTown" onChange={this.handleChange} value={this.state.partnerTown} />
            </Form.Item>
            <Form.Item label="Post code">
              <Input id="partnerPostCode" onChange={this.handleChange} value={this.state.partnerPostCode} />
            </Form.Item>
            <Form.Item label="Phone number">
              <Input id="partnerTelephone" onChange={this.handleChange} value={this.state.partnerTelephone} />
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
            <Button disabled={!this.validateForm()} loading={this.state.disableButtonSubmit} onClick={this.handleSubmit} type={"primary"}>Create</Button>
          </div>
        </Drawer>


      </Content>


    );
  }
}

