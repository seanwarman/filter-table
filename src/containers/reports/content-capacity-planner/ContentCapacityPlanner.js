import React from 'react'
import Actions from '../../../actions/reports/Actions.js'
import * as handlers from '../../../handlers/reports/ContentCapacityPlanner.js'
import EasyEditTable from '../../../components/Tables/EasyEditTable.js'
import { Layout, Col, Row, Card } from 'antd';
import moment from 'moment'
import uuid from 'uuid'

import LeadLag from './LeadLag'
import LeadDate from './LeadDate'
import ExcessUnits from './ExcessUnits'

import './ContentCapacityPlanner.css'

const { Content } = Layout;

class ContentCapacityPlanner extends React.Component {

  state = {
    excessUnits: [],
    excessUnitsByStatus: [],
    contentCapacity: null,
    defaultTeamResource: 150,
    weekendTeamResource: 0,

    from: handlers.format(),
    to: handlers.format(moment().add(2, 'weeks')),

    dailyUnitCount: [],
  }

  actions = new Actions(this.props.user.apiKey, this.props.user.userKey)

  async componentDidMount() {

    this.props.changeHeader('line-chart', 'Reports', [
      { name: `Content Capacity Planner`, url: `/reports/content-capacity-planner` },
    ]);

    const { from, to } = this.state

    const excessUnitsRecord = await this.actions.getExcessUnits(from, to)
    const excessUnitsByStatus = await this.actions.getExcessUnitsByStatus(from, to)


    const contentCapacity = await this.actions.getContentCapacity(from, to)
    
    const dailyUnitCount = await this.getDailyUnitCountAndAddMissingDates(from, to)


    this.setState({
      dailyUnitCount,
      excessUnitsByStatus,
      excessUnits: excessUnitsRecord?.excessUnits,
      ...handlers.initialiseContentCapacityState(contentCapacity)
    })
  }

  getDailyUnitCountAndAddMissingDates = async(from, to) => {
    const { format } = handlers

    // The dailyUnitCount query doesn't include dates where no
    // bookings are due.
    let dailyUnitCount = await this.actions.getDailyUnitCount(from, to)

    // This is the difference in days between the "to" and "from" dates
    const num = moment(to).diff(moment(from), 'days')

    // Make an array of total days between to and from
    let days = []; for(let i = 0; i < num; i++) days.push(
      format(moment().add(i, 'days'))
    )

    // Add in those days wherever they're missing from dailyUnitCount
    return days.map(day => { 

      const i = dailyUnitCount.findIndex(dUC => format(dUC.date) === day)

      if(i > -1) return {
        date: format(dailyUnitCount[i].date),
        units: dailyUnitCount[i].units
      }

      // The days with no bookings due will have 0 units to complete.
      return {
        date: day,
        units: 0
      }
    })

  }

  updateOrCreateContentCapacityRecord = ({
    date,
    teamResource,
    contentCapacityKey
  }) => {

    const { contentCapacity } = this.state

    let contentCapacityRecord = {
      teamResource
    }

    // If there's a contentCapacityKey this record should already be on state.contentCapacity
    if(contentCapacityKey) {

      contentCapacityRecord.contentCapacityKey = contentCapacityKey

      return handlers.updateContentCapacity(
        contentCapacity, 
        contentCapacityRecord, 
        this.actions.updateContentCapacity.bind(this.actions)
      )

    }

    contentCapacityRecord.contentCapacityKey = uuid.v1()
    contentCapacityRecord.date = date
  
    return handlers.createContentCapacity(
      contentCapacity, 
      contentCapacityRecord, 
      this.actions.createContentCapacity.bind(this.actions)
    )

  }

  updateOrCreateContentCapacity = async record => {

    const date = handlers.format(record.date)

    const contentCapacity = this.updateOrCreateContentCapacityRecord({ ...record, date })

    this.setState({ contentCapacity })

  }

  render = () => {

    const {
      defaultTeamResource, 
      weekendTeamResource, 
      dailyUnitCount: currentDUCount,
      contentCapacity
    } = this.state

    const leadLagCalculator = handlers.leadLagInitialiser()
    const dailyUnitCount = handlers.mapDailyUnitCount(
      defaultTeamResource,
      weekendTeamResource,
      currentDUCount,
      contentCapacity
    )

    console.log('dailyUnitCount: ', dailyUnitCount)

    return <Content style={{
      margin: '94px 16px 24px', padding: 24, minHeight: 280,
    }}>
      <Row gutter={16}>
        <Col xs={24}>
          <Card bordered={false} style={{ 'width': '100%' }}>

            <LeadDate
              leadLag={handlers.findLeadDayRecord({
                excessUnits: this.state.excessUnits,
                dailyUnitCount,
                leadLagCalculator
              }).leadLag}
              date={handlers.findLeadDayRecord({
                excessUnits: this.state.excessUnits,
                dailyUnitCount,
                leadLagCalculator
              }).date}
            >
            </LeadDate>


            <ExcessUnits
              excessUnitsByStatus={this.state.excessUnitsByStatus}
              excessUnits={this.state.excessUnits}
            >
            </ExcessUnits>

            {
              this.state.dailyUnitCount.length > 0 &&
              <EasyEditTable
                rowClassName={record => handlers.setClassIfWeekend(record.date)}
                pagination={false}
                primaryKey="dailyUnitCountKey"
                dataSource={dailyUnitCount}
                update={record => {
                  this.updateOrCreateContentCapacity(record)
                }}
                columns={[
                  {
                    title: 'Bookings Due Date',
                      dataIndex: 'date',
                      key: 'date',
                      render: (dataIndex, value) =>
                      <div>{moment(value).format('ddd MMM Do')}</div>
                  },
                  {
                    title: 'Units to complete',
                    dataIndex: 'units',
                    key: 'units',
                    render: (dataIndex, value) => 
                    <div
                      style={{color: '#2baae0'}}
                    >{value}</div>
                  },
                  {
                    title: 'Team Resource',
                    dataIndex: 'teamResource',
                    key: 'teamResource',
                    type: 'number',
                    props: {
                      min: 0,
                      step: 25
                    }
                  },
                  {
                    title: 'Lead/Lag',
                    render: (dataIndex, val, record, index) => 
                    <LeadLag
                      leadLag={leadLagCalculator({
                        record,
                        index,
                        excessUnits: this.state.excessUnits
                      })}
                    >
                    </LeadLag>
                  }
                ]}
              >
              </EasyEditTable>
            }

          </Card>
        </Col>
      </Row>
      </Content>


  }

}

export default ContentCapacityPlanner
