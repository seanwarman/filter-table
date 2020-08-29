import React, { Fragment } from 'react'
import {
  Tooltip
} from 'antd'

const TaskIncomplete = ({
  dueDateFormat,
  fillColor,
  daysRemaining,
  percentage
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
        <Tooltip placement="top" title={`${ typeof daysRemaining === 'number' ? daysRemaining : 'unknown' } days remaining`}>
          <svg style={{
            display: 'block',
            margin: '10px auto', 
            width: '20px',
            height: '20px'
          }} viewBox="0 0 16 16" stroke={ fillColor } className="circular-chart">
            <path style={{
              fill: 'none',
              stroke: '#eeeeee',
              strokeWidth: '2.9'
            }} className="circle-bg"
              d="M8 1
              a 7 7 0 0 1 0 14
              a 7 7 0 0 1 0 -14"
            />
            <path style={{
              fill: 'none',
              strokeLinecap: 'round'
            }} className="circle"
              strokeWidth="1.9"
              strokeDasharray={ `${ percentage }, 44` } 
              d="M8 1
              a 7 7 0 0 1 0 14
              a 7 7 0 0 1 0 -14"
            />
          </svg>
        </Tooltip>
        <span>
          &nbsp;{ dueDateFormat } 
        </span>
      </div>
    </Fragment>
  )
}

export default TaskIncomplete
