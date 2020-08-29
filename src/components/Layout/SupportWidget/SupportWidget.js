import React, { Component, Fragment } from 'react'
import {Card, Button, Icon, Typography, Popover} from 'antd';

class SupportWidget extends Component {

  state = {
    visible: false
  }

  handleVisibleChange = visible => {
    this.setState({ visible });
  };

  render() {
    return (
      <div 
        className='bms--support-widget-parent'
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px'
        }}
      >
        <Fragment>
          <Popover
            content={<Fragment><img style={{ width: '100%' }} src='http://giphygifs.s3.amazonaws.com/media/5xtDarKaxbNRjKhGe2c/giphy.gif' /></Fragment>}
            overlayClassName='bms--support-widget-content-parent'
            title={<div 
              style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <p style={{ marginBottom: '0', padding: '12px 0' }}>BMS Support Widget</p>
              <Icon type='phone' />
            </div>}

            trigger="click"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
            placement='topLeft'
          >
            <Button 
              onClick={() => this.onClick}
              style={{
                width: '50px',
                height: '50px',
                cursor: 'pointer'
              }}
              type="primary" 
              shape="circle" 
              icon="search" />
          </Popover>
        </Fragment>
      </div>
    )
  }
}

export default SupportWidget