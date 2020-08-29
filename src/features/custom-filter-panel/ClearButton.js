import React from 'react'
import { connect } from 'react-redux'

import {
  clearJsonFilterOptions,
} from './CustomFilterPanel.actions.js'

import Clear from './Clear.js'

function ClearButton({
  clearJsonFilterOptions,
  jsonFilterSelectedCount,
  disableFilterOptions
}) {
  return jsonFilterSelectedCount > 0 && !disableFilterOptions &&
    <Clear onClick={() => clearJsonFilterOptions()} />
}

export default connect(
  ({ customFilterPanel }) => ({
    jsonFilterSelectedCount: customFilterPanel.jsonFilterSelectedCount,
    disableFilterOptions: customFilterPanel.disableFilterOptions
  }),
  {
    clearJsonFilterOptions
  }
)(ClearButton)
