import React, { Component, Fragment } from 'react';
import {Layout, Row, Col, Card, Form, Input, Button, Alert, Icon} from 'antd';
import color from '../../libs/bigglyStatusColorPicker';
import Header from '../../components/Layout/Header/HeaderNonApp';

const { Content } = Layout;

class NewPartner extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      firstName: null,
      lastName: null,
      
      partnerName:        '',
      partnerAd1:         '',
      partnerAd2:         '',
      partnerAd3:         '',
      partnerTown:        '',
      partnerPostCode:    '',
      partnerTelephone:   '',
      
      partnerKey:         '',
      
      partnerKeys: [],
    };

    this.props.changeHeader('Partner Account');
  }

  async componentDidMount() {

    let stateCopy = {...this.state};

    const { partnerKeys, firstName, lastName } = this.props.user;

    stateCopy.partnerKeys = (partnerKeys || []).length > 0 ? partnerKeys : [''];
    stateCopy.firstName = firstName;
    stateCopy.lastName = lastName;

    this.setState(stateCopy);
    
  }

  validateForm = () => ( 
    this.state.partnerName.length > 0 && this.state.firstName && this.state.lastName 
  )
  

  validateFormJoin = () => (
    this.state.partnerKeys.find(partnerKey => (
      partnerKey.length !== 36
    )) ?
    false
    :
    true
  )

handleChange = event => {
  this.setState({
    [event.target.id]: event.target.value
  });
}

onPartnerKeyInput = (e, i) => {
  let {partnerKeys, partnerKey} = this.state;
  partnerKeys = JSON.parse(JSON.stringify(partnerKeys));
  partnerKeys[i] = e.target.value;
  if(i === 0) partnerKey = e.target.value;
  this.setState({partnerKeys, partnerKey});
}

handleAddPartnerKeyInput = () => {
  let stateCopy = { ...this.state };
  stateCopy.partnerKeys.push('');
  this.setState(stateCopy);
}

handleMinusPartnerKeyInput = () => {
  let stateCopy = { ...this.state };
  stateCopy.partnerKeys.pop();
  this.setState(stateCopy);
}


async savePartner(partner) {

  const partnerKey = await this.props.api.createPublic({
    name: 'Biggly.partners',
  }, partner, 'partnerKey', true, true)

  // UPDATE USER WITH PARTNER KEY

  const user = {
    partnerKey: partnerKey,
    partnerKeys: JSON.stringify([partnerKey]),
    firstName: this.state.firstName,
    lastName: this.state.lastName
  };
  await this.props.api.updatePublic({
    name: 'Biggly.users',
    where: [
      `users.cognitoUserName = "${this.props.user.cognitoUserName}"`
    ]
  }, user)

  return;
  // const partnerKey = await this.props.api.createPublic({
  //   name: 'Biggly.partners',
  // }, partner, 'partnerKey', true, true)

  // // UPDATE USER WITH PARTNER KEY

  // const user = {
  //   partnerKey: partnerKey,
  //   partnerKeys: JSON.stringify([partnerKey]),
  //   firstName: this.state.firstName,
  //   lastName: this.state.lastName
  // };
  // const result = await this.props.api.updatePublic({
  //   name: 'Biggly.users',
  //   where: [
  //     `users.cognitoUserName = "${this.props.user.cognitoUserName}"`
  //   ]
  // }, user)

  // return;
}

handleSubmitJoin = async event => {


  event.preventDefault();

  console.log('this.state :', this.state);
  console.log('this.props :', this.props);

  try {

    var user = {
      partnerKey: this.state.partnerKey && (this.state.partnerKey || '').length === 36 ? this.state.partnerKey : this.state.partnerKeys[0],

      // I'm cheating here, if one of the partnerKeys is the wrong length we shouldn't be able to submit
      // this form but for some reason this view doesn't re-render when a new input is added with the plus button
      // so i'm just filtering out any empty items here as well...
      partnerKeys: JSON.stringify(this.state.partnerKeys.filter(partnerKey => (
        partnerKey.length === 36
      ))),

      firstName: this.state.firstName,
      lastName: this.state.lastName
    };

    await this.props.api.updatePublic({
      name: 'Biggly.users',
      where: [
        `cognitoUserName = "${this.props.user.cognitoUserName}"`
      ]
    }, user)

    window.location.href='/';

  } catch (e) {
    alert(e);
  }
}

renderPartnerKeyInputs = () => {
  let {partnerKeys} = this.state;
  return (
    <div>
      {
        this.state.partnerKeys.map((partnerKey,i) => (
          <Form.Item 
            key={i} 
            required={i === 0} 
            label={
              i === 0 &&
              'Primary Partner Key'
            }
            validateStatus={
              partnerKey.length !== 36 &&
              'error'
            }
          >
            <Input
              value={partnerKeys[i]} 
              onChange={e => this.onPartnerKeyInput(e,i)}
            />
          </Form.Item>
        ))
      }
      <div style={{textAlign: 'center'}}>
        <Icon
          style={{marginRight: 4}}
          type="plus-circle"
          onClick={this.handleAddPartnerKeyInput}
        />
        {
          this.state.partnerKeys.length > 1 &&
          <Icon
            style={{marginLeft: 4}}
            type="minus-circle"
            onClick={this.handleMinusPartnerKeyInput}
          />
        }
      </div>
    </div>
  )
}


render() {

  return (

    <Fragment>
    <Header />

    <Content style={{
      background: color('template', 'colorLabel', 'blue').color,
      padding: '24px 16px 24px', minHeight: 280,
    }}
    >
      <Row style={{ maxWidth: '1280px', margin: '0 auto' }} gutter={16}>
        <Col span={24} style={{ marginBottom: '16px', padding: '0' }}>
          <Card title="Add Your First and Last Name" bordered={false} style={{'width': '100%'}}>
            <Form.Item label="First Name" required>
              <Input id="firstName" onChange={this.handleChange} value={this.state.firstName}/>
            </Form.Item>
            <Form.Item label="Last Name" required>
              <Input id="lastName" onChange={this.handleChange} value={this.state.lastName}/>
            </Form.Item>
          </Card>
        </Col>
        <Col span={12} style={{ paddingLeft: '0' }}>
          <Card title="Create a partner account" bordered={false} style={{'width': '100%'}}>
            <Form onSubmit={this.handleSubmit}>
              <Form.Item label={"Company Name"}>
                <Input id="partnerName" type={"text"} onChange={this.handleChange} value={this.state.partnerName}/>
              </Form.Item>
              <Form.Item label="Address">
                <Input id="partnerAd1" onChange={this.handleChange} value={this.state.partnerAd1}/>
                <Input id="partnerAd2" onChange={this.handleChange} value={this.state.partnerAd2}/>
                <Input id="partnerAd3" onChange={this.handleChange} value={this.state.partnerAd3}/>
                <Input id="partnerTown" onChange={this.handleChange} value={this.state.partnerTown}/>
                <Input id="partnerPostCode" onChange={this.handleChange} value={this.state.partnerPostCode}/>
              </Form.Item>
              <Form.Item label="Telephone">
                <Input id="partnerTelephone" onChange={this.handleChange} value={this.state.partnerTelephone}/>
              </Form.Item>
              <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={"primary"}>Create account</Button>
            </Form>
          </Card>
        </Col>

        <Col span={12} style={{ paddingRight: '0' }}>
          <Card title="Join an existing partner account" bordered={false} 
            style={{
              width: '100%',
              minHeight: 639
            }}
          >
            <Form onSubmit={this.handleSubmit}>
              {
                this.validateFormJoin() &&
                <Form.Item>
                  <Alert message="Please enter one or more existing partner keys" type="info" />
                </Form.Item>
              }
              {
                !this.validateFormJoin() &&
                <Form.Item>
                  <Alert message="Invalid partner key" type="error" />
                </Form.Item>
              }
              {this.renderPartnerKeyInputs()}
              <Button disabled={!this.validateFormJoin()} onClick={this.handleSubmitJoin} type={"primary"}>Join account</Button>
            </Form>
          </Card>
        </Col>

      </Row>
    </Content>
  </Fragment>


  );
}
}

export default NewPartner;
