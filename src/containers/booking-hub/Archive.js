import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Actions from '../../actions/booking-hub/Actions'
import moment from 'moment'
import { 
  Form,
  Badge, 
  Table, 
  Card, 
  Layout, 
  Row, 
  Col,
  Input,
  DatePicker,
} from 'antd'

const { Search } = Input
const { Content } = Layout
const { RangePicker } = DatePicker

let typingTimer

export default class Archive extends Component {
  constructor(props) {
    super(props)

    this.actions = new Actions(
      props.user.apiKey,
      props.user.userKey
    )
    this.state = {
      bookings: [],
      searchTerm: '',
      dateRange: [],
    }

  }

  componentDidMount = async () => {
    this.props.changeHeader('hdd', 'BookingHub', [
      { name: 'Archive', url: `/archive` }
    ]);
    this.getArchivedBookings()
  }

  getArchivedBookings = async () => {
    const bookings = await this.actions.getArchivedBookings([], [0,6000], 'dueDate desc')
    this.setState({bookings})
  }

  handleClearSearch = () => {
    this.setState({
      searchTerm: ''
    })
  }
  

  handleSearch = e => {
    e.persist()
    if (e.target.value.length > 0 && (e.which >= 48 || e.which <= 90)) {
      clearTimeout(typingTimer)
      console.log(e.target.value)
      typingTimer = setTimeout(() => {
        this.setState({searchTerm: e.target.value})
      }, 100)
    } else {
      this.handleClearSearch()
    }
  }

  renderBookingsByDateRange = bookings => {
    if(this.state.dateRange.length === 0) return bookings

    const { dateRange } = this.state

    const start = dateRange[0].format('YYYY-MM-DDT00:00:00.000Z'),
          end   = dateRange[1].format('YYYY-MM-DDT23:59:59.999Z')

    // console.log(moment(bookings[0].dueDate).isAfter(start.format()))

    return bookings.filter(booking => (
      moment(moment(booking.dueDate).format('YYYY-MM-DDThh:mm:ssZ')).isAfter(start) &&
      moment(moment(booking.dueDate).format('YYYY-MM-DDThh:mm:ssZ')).isBefore(end)
    ))
  }
  renderBookingsBySearchTerm = bookings => {
    if((bookings || []).length === 0) return []
    let { searchTerm } = this.state

    if(this.state.searchTerm.length > 0) {

      // If the user puts in a open [ or something like that
      // the regex will break untill it's closed: ] so put it
      // in a try catch and return a normal includes search instead.
      try {

        let term = new RegExp(searchTerm, 'gi')

        console.log('term : ', term)

        return bookings.filter(booking => (

          term.test(decodeURIComponent(booking.bookingName) || '') ||
          term.test(booking.bookingDivName || '') ||
          term.test(booking.tmpName || '')

        ))

      } catch (err) {


        return bookings.filter(booking => (

          (decodeURIComponent(booking.bookingName) || '').includes(searchTerm) ||
          (booking.bookingDivName || '').includes(searchTerm) ||
          (booking.tmpName || '').includes(searchTerm)

        ))

      }
    }

    return bookings
  }

  render = () => (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <div style={{width: '100%', display: 'flex'}}>
          <Search
            defaultValue={this.state.searchTerm}
            placeholder="Search all archived bookings (accepts regex)"
            style={{ marginBottom: '24px' }}
            onKeyUp={this.handleSearch}
          ></Search>
        </div>
        <Card>
          <Row >
            <Col
              span={12}
            >
              <Form.Item label="Due Date">
                <RangePicker
                  placeholder={['Start', 'End']}
                  size="small"
                  onChange={moments => {
                    this.setState({dateRange: moments})
                  }}
                ></RangePicker>
              </Form.Item>
            </Col>
            <Col
              span={12}
              style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Badge
                style={{
                  textAlign: 'right',
                  backgroundColor: '#2baae0'
                }}
                overflowCount={9999}
                count={(this.renderBookingsByDateRange(
                  this.renderBookingsBySearchTerm(this.state.bookings)
                ) || []).length}
              ></Badge>
            </Col>
          </Row>
          {
            this.state.bookings &&
            <Table
              size="small"
              rowKey="bookingsKey"
              columns={[
                {
                  title: 'Booking Name',
                  dataIndex: 'bookingName',
                  key: 'bookingsKey',
                  render: (bookingName, booking) => 
                    <Link to={booking.bookingDivName.toLowerCase().split(' ').join('') + '/bookings/booking/' + booking.bookingsKey}>
                      {decodeURIComponent(bookingName)}
                    </Link>
                },
                {
                  title: 'Template',
                  dataIndex: 'tmpName',
                  key: 'tmpKey',
                },
                {
                  title: 'Due Date',
                  dataIndex: 'dueDate',
                  key: 'dueDate',
                  render: dueDate => moment(dueDate).format('ll')
                }
              ]}
              dataSource={this.renderBookingsByDateRange(
                this.renderBookingsBySearchTerm(this.state.bookings)
              )}
              pagination={{
                size: 'small',
                showSizeChanger: true,
                // position: 'both',
              }}
            >
            </Table>
              
          }
        </Card>
        

        
      </Content>

  )
}

