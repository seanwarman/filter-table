import React from 'react'
import { connect } from 'react-redux'
import {
  Input
} from 'antd'
import {
  updateSearchTerm
} from './BookingsFilter.actions'

import './SearchBar.css'

const { Search } = Input

function SearchBar({
  updateSearchTerm
}) {

  return (
    <div id="searchbar">
      <Search 
        onChange={e => updateSearchTerm(e.target.value)}
        placeholder="Search"
      />
    </div>
  )
}

export default connect(
  null,
  {
    updateSearchTerm
  }
)(SearchBar)
