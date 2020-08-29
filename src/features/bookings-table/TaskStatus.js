import React, { Fragment } from 'react'
import {
  Tooltip,
  Icon
} from 'antd'

const TaskStatus = ({
  fillColor, 
  iconStyle, 
  icon, 
  description, 
  dueDateFormat
}) => {
  return (
    <Fragment>
      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '80px',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          position: 'relative'
        }}>
          {
            fillColor ?
            <svg style={{
              display: 'block',
              margin: '10px auto',
              width: '30px',
              height: '30px'
            }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle fill={ fillColor } cx="50" cy="50" r="35"/>
            </svg>
            :
            dueDateFormat
          }
          {
            icon &&
            <Tooltip placement="top" title={ description }>
              <Icon style={ iconStyle } type={ icon } />
            </Tooltip>
          }
        </div>
        <span>
          &nbsp;{ dueDateFormat }
        </span>
      </div>
    </Fragment>
  )
}

export default TaskStatus
