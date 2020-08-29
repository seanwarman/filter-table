import React, { PureComponent } from 'react'
import { Row, Col, Layout, Typography, Button } from 'antd';
import color from '../../../libs/bigglyStatusColorPicker';

// AWS
import { Auth } from 'aws-amplify';

const { Header } = Layout;
const { Title } = Typography;

export default class HeaderNonApp extends PureComponent {
  
  state = {
    headerTitle: 'BMS'
  }

  handleSignOut = () => {
    Auth.signOut();
  }
  
  render() {
    return (
      <Header
        style={{
          width: '100%',
          background: '#ffffff',
          color: '#ffffff',
          padding: 0,
          height: 'inherit',
          position: 'relative', zIndex: 1
        }}
      >
        <Row style={{ maxWidth: '1280px', margin: '0 auto' }} type="flex" align="middle">
          <Col style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }} span={24}>
            {/* <div>{...this.state.headerTitle}</div> */}
            <Title style={{ margin: '20px 0', color: color('template', 'colorLabel', 'blue').color }} level={1}>BMS</Title>
            <Button type='primary' icon='user' onClick={() => this.handleSignOut()}>Sign Out</Button>
          </Col>
        </Row>
      </Header>
    )
  }
}
