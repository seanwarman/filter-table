import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { Breadcrumb, Layout, Icon, Row, Col } from 'antd' 

import { getDivisions } from './App.actions'
import color from './App.utils'

import Routes from './Routes'

import './App.css'
import 'antd/dist/antd.css'

const { Header, Sider } = Layout

class App extends Component {

  state = {
    collapsed: true,
    headerTitle: 'BMS',
  }

  componentDidMount() {
    this.props.getDivisions()
  }

  changeHeader = (icon, divisionName, array) => {
    this.setState({
      headerTitle: <div 
        className="bms-content-header-parent">
        <Icon style={{
          marginRight: 13,
          fontSize: 30 
        }} type={icon} />
        <h3 className='bms-text-light' 
        style={{ lineHeight: '1em', marginBottom: 20, marginTop: 20, paddingRight: '15px' }}>
          {array && array[array.length - 1].name}
          <Breadcrumb style={{ display: 'block', fontWeight: '300', marginTop: '5px' }}>
            <Breadcrumb.Item>{divisionName}</Breadcrumb.Item>
            {array && array.map((item, index) => (
              <Breadcrumb.Item key={index} className='breadcrumbChild'><Link to={item.url}>{item.name}</Link></Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </h3>
      </div>
    })
  }

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  HeaderPanel() {
    return (
      <Header
        style={{
          background: color('status', 'colorLabel', 'blue').color,
          color: '#ffffff',
          padding: 0,
          height: 'inherit',
          position: 'fixed', 
          zIndex: 11, 
          left: this.state.collapsed ? 80 : 200,
          right: '0',

        }}
      >
        
      <Row type="flex" align="middle">
        <Col span={24}>
          <div style={{
            display: "flex",
            alignContent: "center",
            paddingLeft: "15px"
          }}> 
            { this.state.collapsed ?
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>              
              <Icon
                style={{ fontSize: 20 }}
                type="caret-right" />
            </div>
            :
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>
              <Icon
                style={{ fontSize: 20 }}
                type="caret-left" />
            </div>
            }

            <div className={'bms_pageHeader'}>{this.state.headerTitle}</div>

          </div>
        </Col>
      </Row>
    </Header>
    )
  }

  render() {

    return (
      <div>
        <Layout style={{ minHeight: '100vh', paddingLeft: '0px', paddingRight: '0px' }}>
          <Sider
            theme="light"
            collapsed={true}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'inherit',
                maxHeight: '94px',
                margin: '0',
                left: '0',
                right: '0',
                width: '100%',
                maxWidth: this.state.collapsed ? 80 : 200,
                background: 'white',
                position: 'fixed',
                zIndex: 20
              }}
              className="bms_logo logo">
              <h1 style={{ color: color('template', 'colorLabel', 'blue').color, fontWeight: 'bold', marginBottom: '0' }}>
                {this.state.collapsed ? 'B' : 'BMS'}
              </h1>
            </div>
            <div 
              className="bms_sidebar_scrollable"
              style={{
                maxWidth: this.state.collapsed ? 80 : 200,
              }}
            >
            </div>
          </Sider>

          <Layout>
            {this.HeaderPanel()}
            <div id="app-wrapper" className="App auth container-fluid">
              <Routes changeHeader={this.changeHeader} />
            </div>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default connect(
  null,
  {
    getDivisions
  }
)(withRouter(App))
