import React from 'react'
import { connect } from 'react-redux'

import {
  getJsonFilter,
} from './CustomFilterPanel.actions.js'

import {
  filterTitleStyles,
} from './CustomFilterPanel.handlers.js'

import LittleScrollyGrid from './LittleScrollyGrid'

class FilterOptions extends React.PureComponent {

  componentDidMount() {
    this.props.getJsonFilter(this.props.jsonFilter)
  }

  render() {

    const {
      jsonFilter,
    } = this.props

    return (
      <div className="bms--filter-options-row">
        <div className="bms--filter-options-wrapper">
          {
            jsonFilter && jsonFilter
              .filter(item => item.options.length > 1 && item.options[0] !== 'null')
              .map((item, itemIndex) => (
                item.type !== 'date' && item.options.length > 0 &&
                  <div 
                    key={itemIndex} 
                    className="bms--filter-options"
                  >
                    <div style={filterTitleStyles}><strong>{item.prettyName}</strong></div>

                    <LittleScrollyGrid item={item} />

                  </div>
              ))
          }
        </div>
      </div>

    )
  }
}

export default connect(
  ({ customFilterPanel, app }) => ({
    jsonFilter: customFilterPanel.jsonFilter,
  }),
  {
    getJsonFilter,
  }
)(FilterOptions)
