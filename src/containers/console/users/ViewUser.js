import React, { Component } from 'react';
import PageWrapper from '../../../components/Layout/PageWrapper';
import {Icon, Drawer, Table, Row, Col, Button, message, Modal} from 'antd';

class ViewUser extends Component {

  state = {
    loaded: false,
    user: null,
    partners: null,
    openPartnerKeyDrawer: false,
    selectedPartnerKeys: [],
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀

  componentDidMount = () => {
    this.props.changeHeader('appstore', 'Console', [
      { name: 'Users', url: '/console/users' },
      { name: 'User', url: this.props.location.pathname },
    ]);
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async() => {
    let stateCopy = {...this.state};
    stateCopy.user = await this.getUser(this.props.user.apiKey, this.props.match.params.userKey);
    stateCopy.partners = await this.getPartners(this.props.user.apiKey);
    if(stateCopy.user && stateCopy.partners) {
      stateCopy.loaded = true;
      stateCopy.openPartnerKeyDrawer = false;
      stateCopy.selectedPartnerKeys = [];
    }
    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀█ ░▀░
  // █▄▄█ █░░█ ▀█▀
  // ▀░░▀ █▀▀▀ ▀▀▀

  getPartners = async (apiKey) => {
    return this.props.api.listAdmin({
      name: 'Biggly.partners',
      columns: [
        {name: 'partnerName'},
        {name: 'partnerKey'}
      ]
    });
  }

  getUser = async (apiKey, userKey) => {
    let result = await this.props.api.getAdmin({
      name: 'Biggly.users',
      columns: [
        {name: 'userKey'},
        {name: 'cognitoIdentityId'},
        {name: 'partnerKey'},
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'emailAddress'},
        {name: 'telephone'},
        {name: 'companyName'},
        {name: 'cognitoUserName'},
        {name: 'created'},
        {name: 'updated'},
        {name: 'partnerKeys'},
        {name: 'jsonState'},
      ],
      where: [
        `userKey = "${userKey}"`
      ]
    });
    console.log('result :', result);
    return result;
  }
  
  updateUser = async (apiKey, userKey, body) => {
    return this.props.api.updateAdmin({
      name: 'Biggly.users',
      where: [
        `userKey = "${userKey}"`
      ]
    }, body)
  } 
  
  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleOpenAddPartnerKeyDrawer = () => {
    this.setState({openPartnerKeyDrawer: true});
  }

  handlePartnerSelections = keys => {
    let {selectedPartnerKeys} = this.state;
    selectedPartnerKeys = keys;
    this.setState({selectedPartnerKeys});
  }

  handleAddPartnerKeys = async() => {
    const { selectedPartnerKeys } = this.state;
    const { partnerKeys } = this.state.user;
    let result = await this.updateUser(this.props.user.apiKey, this.props.match.params.userKey, {
      partnerKeys: JSON.stringify([...partnerKeys, ...selectedPartnerKeys])
    });
    if(!result) message.error('Unable to update this user!');
    this.loadDataAndSetState();
  }

  handleDeletePartnerKey = async partnerKey => {
    let {partnerKeys} = this.state.user;
    if(partnerKeys.length === 1) {
      message.error('Cannot delete the user\'s only key!');
      return;
    }
    partnerKeys = JSON.stringify(partnerKeys.filter(userPartnerKey => userPartnerKey !== partnerKey));
    let result = await this.updateUser(this.props.user.apiKey, this.props.match.params.userKey, {partnerKeys});
    if(!result) message.error('Unable to delete this partner key.');
    this.loadDataAndSetState();
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderDrawer = () => {

    const addPartnerColumns = [ 
      {
        title: 'Partner Name',
        dataIndex: 'partnerName'
      },
    ]

    return <Drawer
      title="Add partner keys to this user"
      width={620}
      onClose={() => this.setState({openPartnerKeyDrawer: false})}
      visible={this.state.openPartnerKeyDrawer}
    >
      {
        this.state.openPartnerKeyDrawer &&
        <Table
          scroll={{ y: 380 }}
          pagination={false}
          dataSource={this.state.partners.map((partner,i) => (
            {
              ...partner,
              partnerName: partner.partnerName ? partner.partnerName : 'None',
              key: partner.partnerKey,
            }
          ))}
          rowSelection={{
            onChange: keys => this.handlePartnerSelections(keys),
            getCheckboxProps: record => ({
              disabled: (this.state.user.partnerKeys.indexOf(record.partnerKey) !== -1)
            })
          }}
          columns={addPartnerColumns}
          size="small"
        />
      }

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
        <Row>
          <Col span={24}>
            <Button 
              disabled={!(this.state.selectedPartnerKeys.length > 0)} 
              onClick={this.handleAddPartnerKeys} 
              type="primary"
            >Add</Button>
          </Col>
        </Row>
      </div>
    </Drawer>
  }

  render() {
    const {user, partners, loaded} = this.state;
    const {handleDeletePartnerKey} = this;
    const showConfirmDelete = (partnerKey) => {
      Modal.confirm({
        title: 'Do you Want to delete ' + (partners.find(partner => partner.partnerKey === partnerKey) || {}).partnerName,
        content: 'This cannot be reversed',
        async onOk() {
          handleDeletePartnerKey(partnerKey)
        }
      });
    }
    return (
      user &&
      <PageWrapper
        loading={!loaded}
        plus={this.handleOpenAddPartnerKeyDrawer}
        header={
          <div>
            <h5>{user.firstName} {user.lastName}</h5>
            <Row>
              <Col span={12}>
                Email: {user.emailAddress}<br />
                Phone: {user.telephone}<br />
                Cognito User Name: {user.cognitoUserName}<br />
              </Col>
            </Row>
          </div>
        }
      >
        <div>
          {this.renderDrawer()}
          {
            loaded &&
            <Table size="small" 
              columns={[
                {
                  title: 'Partners',
                  dataIndex: 'partnerName',
                  key: 'partnerName'
                },
                {
                  title: '',
                  dataIndex: 'partnerKey',
                  key: 'partnerKey',
                  render: (item) => {
                    return (
                      <Button onClick={() => {showConfirmDelete(item)}}><Icon type={"delete"}/></Button>
                    )
                  }
                }
              ]}
              dataSource={user.partnerKeys.map((partnerKey, i) => (
                { partnerKey, partnerName: (partners.find(partner => partner.partnerKey === partnerKey) || {}).partnerName }
              ))}
              rowKey="partnerKey"
            />
          }
        </div>
      </PageWrapper>
    );
  }
}

export default ViewUser;
