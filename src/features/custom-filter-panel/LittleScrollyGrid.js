import React from 'react'
import { connect } from 'react-redux'
import { 
  Card,
  Tooltip,
} from 'antd'

import {
  selectFilterOption,
} from './CustomFilterPanel.actions.js'

import {
  filterSorting,
  gridStyle,
} from './CustomFilterPanel.handlers.js'

import RenderFlag from '../bookings-table/RenderFlag'

function LittleScrollyGrid({
  item,
  disableFilterOptions,
  selectFilterOption
}) {

  return (
    <div className="filter-wrapper" style={{ height: 230, overflowY: 'scroll' }}>
      {
        item.options
          .sort((a, b) => filterSorting(a.option, b.option, item))
          .filter(optionItem => optionItem.option !== 'null')
          .map((optionItem, filtIndex) => { 
            return <Card.Grid
              onClick={() => selectFilterOption(item.dataIndex, optionItem.option, !optionItem.selected)}
              key={filtIndex}
              style={{
                ...gridStyle(optionItem, disableFilterOptions),
              }}
            >
              <Tooltip
                placement="left"
                title={
                  (optionItem.option || '').length > 16 ? 
                    item.type=== 'json' ?
                      <div style={{
                        display: 'flex',
                      }}>
                        {
                          JSON.parse(optionItem.option).map((flag, i) => (
                            <RenderFlag key={i} flag={flag} />
                          ))
                        }
                      </div>
                      :
                    optionItem.option 
                    : 
                    null
                }
              >
                <small
                  style={{
                    color: 
                    optionItem.selected ? 'white' : disableFilterOptions ? 
                    '#a9a9a9' 
                    : 
                    'unset'
                  }}
                >
                  {
                    item.type === 'json' ?
                      <div style={{
                        display: 'flex',
                        marginBottom: 4,
                      }}>
                        {
                          optionItem.option !== 'null' &&
                            JSON.parse(optionItem.option).map((flag, i) => (
                              <RenderFlag key={i} flag={flag} />
                            ))
                        }
                      </div>
                      :
                      optionItem.option
                  }
                </small>
                <span
                  style={{
                    position: 'absolute',
                    fontSize: 9,
                    top: 4,
                    right: 0,
                    paddingRight: 7,
                    paddingLeft: 7,
                    color: optionItem.selected ? 'white' : '#adadad',
                  }}
                >{
                  optionItem.count
                  }</span>
              </Tooltip>
            </Card.Grid>
          })
      }
    </div>

  )
}

export default connect(
  ({ customFilterPanel }) => ({
    disableFilterOptions: customFilterPanel.disableFilterOptions
  }),
  {
    selectFilterOption
  }
)(LittleScrollyGrid)
