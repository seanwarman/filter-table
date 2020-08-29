import React from 'react'
import { connect } from 'react-redux'
import { 
  Card, 
} from 'antd'

import FilterSaver from './FilterSaver'
import HeadingParams from './HeadingParams'
import FilterOptions from './FilterOptions'
import ClearButton from './ClearButton'
import HideFilterIcon from './HideFilterIcon'

import './CustomFilterPanel.css'

function CustomFilterPanel({
  hideFilter = false,
}) {

  return (
    <div id="custom-filter-panel">
      <Card
        bordered={false}
        className="card"
        width={620}
        style={{ height: hideFilter ? 150 : 511 }}
      >
        <FilterSaver />

        <HeadingParams />

        <FilterOptions />

        <ClearButton />

      </Card>

      <HideFilterIcon />

    </div>
  )
}

export default connect(
  ({ customFilterPanel }) => ({

    hideFilter: customFilterPanel.hideFilter

  })
)(CustomFilterPanel)
