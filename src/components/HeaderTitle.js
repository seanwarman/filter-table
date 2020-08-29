import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Icon,
  Breadcrumb
} from 'antd'

function HeaderTitle({
  header
}) {

  if(!header) return null

  const [ icon, divisionName, array ] = header

  return (
    !icon ? null :
    <div className={'bms_pageHeader'}>
      <div 
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
    </div>
  )
}

export default connect(
  ({ app }) => ({
    header: app.header 
  })
)(HeaderTitle)
