import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { Breadcrumb, Layout, Icon, Row, Col } from 'antd' 

import { getDivisions } from './App.actions'
import color from './App.utils'

import Routes from './Routes'

import './App.css'

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

  render() {

    return (

      <div id="app-wrapper" className="App auth container-fluid">
        <Routes changeHeader={this.changeHeader} />
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
