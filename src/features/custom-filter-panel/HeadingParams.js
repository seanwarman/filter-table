import React from 'react'
import { connect } from 'react-redux'
import { 
  DatePicker, 
  Badge, 
  Icon, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Form, 
  Select, 
} from 'antd'
import moment from 'moment'

import {
  mapMoments,
} from './CustomFilterPanel.handlers.js'

import {
  updateFilterParams,
  updateDateParams,
} from './CustomFilterPanel.actions.js'

import Brand from './Brand'

const { RangePicker } = DatePicker

function HeadingParams({
  completedFilterDates = [],
  createdFilterDates = [],
  dueFilterDates = [],
  filterLoading,
  ascOrDesc,
  jsonFilterSelectedCount,
  maxFilterBookings,
  sortBy,
  bookingsFiltered,
  updateFilterParams,
  updateDateParams,
}) {

  return (
    <Row gutter={16} className="top-row">
      <Col span={3}>

        <Brand />

        <div className="heading-loading-icon-wrapper">
          {
            filterLoading ?
              <Icon type="loading" className="loading-icon" />
              :
              jsonFilterSelectedCount > 0 &&
              <Badge
                overflowCount={9999}
                count={(bookingsFiltered || []).length}
                className="badge"
              >
              </Badge>
          }
        </div>

      </Col>
      <Col span={3}>
        <Form.Item
          label="Max Bookings"
        >
          <InputNumber
            size="small"
            // onKeyUp={onKeyUpEnterFilter}
            value={maxFilterBookings}
            onChange={num => updateFilterParams('maxFilterBookings', num)}
            min={1}
          />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item 
          label="Sort By"
          style={{
            paddingRight: '35%',
            position: 'relative'
          }}
        >
          <Button
            shape="circle"
            size="small"
            icon={ascOrDesc === 'desc' ? 'sort-descending' : 'sort-ascending'}
            style={{ 
              position: 'absolute',
              top: -9,
              right: -34,
              border: 'none',
              zIndex: 1,
              color: '#488eff', 
            }}
            onClick={() => updateFilterParams(
              'ascOrDesc', 
              ascOrDesc === 'desc' ?
              'asc' : 'desc'
            )}
          />
          <Select
            size="small"
            style={{ width: '100%' }}
            value={sortBy}
            onChange={selection => updateFilterParams('sortBy', selection)}
          >
            <Select.Option value="bookingName">Booking Name</Select.Option>
            <Select.Option value="periodKey">Campaign Period</Select.Option>
            <Select.Option value="tmpName">Template Name</Select.Option>
            <Select.Option value="currentStatus">Status</Select.Option>
            <Select.Option value="strategy">Strategy</Select.Option>
            <Select.Option value="bookingMonth">Booking Month</Select.Option>
            <Select.Option value="partnerName">Partner Name</Select.Option>
            <Select.Option value="customerName">Customer Name</Select.Option>
            <Select.Option value="units">Units</Select.Option>
            <Select.Option value="created">Created Date</Select.Option>
            <Select.Option value="createdByFullName">Created By</Select.Option>
            <Select.Option value="assignedFullName">Assigned To</Select.Option>
            <Select.Option value="dueDate">Due Date</Select.Option>
            <Select.Option value="completedDate">Completed Date</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <div
        style={{
          height: 70,
          border: '.5px solid #eaeaea',
          position: 'relative',
          right: 1,
          bottom: 9,
        }}
      ></div>
      <Col span={12}>
        <Row
          style={{
            display: 'flex', 
            justifyContent: 'space-around',
            position: 'relative',
          }}
        >
          <Col span={5}>
            <Form.Item label="Created Date">
              <RangePicker
                placeholder={['Start', 'End']}
                size="small"
                onChange={moments => {
                  // updateFilterParams('createdFilterDates', mapMoments(moments))
                  updateDateParams('created', mapMoments(moments))
                }}
                value={
                  createdFilterDates.length === 2 &&
                    [moment(createdFilterDates[0]), moment(createdFilterDates[1])]
                }
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="Due Date">
              <RangePicker
                placeholder={['Start', 'End']}
                size="small"
                onChange={moments => {
                  // updateFilterParams('dueFilterDates', mapMoments(moments))
                  updateDateParams('dueDate', mapMoments(moments))
                }}
                value={
                  dueFilterDates.length === 2 &&
                    [moment(dueFilterDates[0]), moment(dueFilterDates[1])]
                }
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="Completed Date">
              <RangePicker
                placeholder={['Start', 'End']}
                size="small"
                onChange={moments => {
                  // updateFilterParams('completedFilterDates', mapMoments(moments))
                  updateDateParams('completedDate', mapMoments(moments))
                }}
                value={
                  completedFilterDates.length === 2 &&
                    [moment(completedFilterDates[0]), moment(completedFilterDates[1])]
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default connect(
  ({ customFilterPanel }) => ({
    completedFilterDates:    customFilterPanel.completedFilterDates,
    createdFilterDates:      customFilterPanel.createdFilterDates,
    dueFilterDates:          customFilterPanel.dueFilterDates,
    filterLoading:           customFilterPanel.filterLoading,
    ascOrDesc:               customFilterPanel.ascOrDesc,
    jsonFilterSelectedCount: customFilterPanel.jsonFilterSelectedCount,
    maxFilterBookings:       customFilterPanel.maxFilterBookings,
    sortBy:                  customFilterPanel.sortBy,
    bookingsFiltered:        customFilterPanel.bookingsFiltered,
  }),
  {
    updateFilterParams,
    updateDateParams
  }
)(HeadingParams)
