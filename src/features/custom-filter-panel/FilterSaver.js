import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Dropdown,
  Menu,
  Icon,
  Input,
  Badge,
} from 'antd'

import {
  deleteBookingsState,
  getStateRecords,
  createBookingState,
  selectBookingState,
} from '../bookings-filter/BookingsFilter.actions'

import './FilterSaver.css'

class FilterSaver extends Component {

  componentDidMount() {
    this.props.getStateRecords()
  }

  state = {
    bookingStateName: '',
    visible: false,
  }

  onChange = e => {

    e.preventDefault()

    let bookingStateName = e.target.value

    this.setState({ bookingStateName })

  }

  onKeyUp = e => {

    if(e.keyCode === 13) {
      this.props.createBookingState(this.state.bookingStateName)
      this.setState({ bookingStateName: '' })
    }

  }


  onVisibleChange = visible => {

    if(this.state.bookingStateName.length > 0) return this.setState({ visible: true })

    this.setState({ visible })
  }

  render() {

    const {
      bookingStateRecords,
    }  = this.props

    return (
      <Dropdown
        id="dropdown"
        placement="bottomRight"
        visible={this.state.visible}
        onVisibleChange={this.onVisibleChange}
        overlay={
          <Menu 
            id="filtersaver"
            style={{
              minWidth: 400
            }}
          >
            <Menu.Item
              // onClick={this.handleShowSavedStateDrawer}
              style={{
                borderBottom: '1px solid #d9d9d9',
                position: 'relative',
              }}
            >

              <Input
                className="filterinput"
                onChange={this.onChange}
                onKeyUp={this.onKeyUp}
                value={this.state.bookingStateName}
                placeholder="Save Current Selection As..."
              />

            </Menu.Item>
            {
              bookingStateRecords.map(bookingState => (
                <Menu.Item
                  className="menuitem"
                  key={bookingState.bookingStateKey}
                  onClick={() => {
                    this.props.selectBookingState(bookingState.jsonState)
                  }}
                >
                  {bookingState.bookingStateName}

                  <Icon 
                    onClick={e => {
                      e.stopPropagation()
                      this.props.deleteBookingsState(bookingState.bookingStateKey)
                    }}
                    type="close" 
                    className="icon" 
                  />
                </Menu.Item>
              ))
            }
          </Menu>
        }
      >
        <div 
          className="filterbutton"
        >
          Filters <Icon type="down" />
        </div>
      </Dropdown>
    )
  }

}

export default connect(
  ({ bookingsFilter }) => ({
    bookingStateRecords: bookingsFilter.bookingStateRecords
  }),
  {
    deleteBookingsState,
    selectBookingState,
    getStateRecords,
    createBookingState,
  }
)(FilterSaver)
