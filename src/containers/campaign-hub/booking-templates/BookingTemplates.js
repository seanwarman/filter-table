import React, {Component} from 'react';
import { Input, Table, Layout, Col, Card, Row, Button } from 'antd';
import colorPicker from '../../../libs/bigglyStatusColorPicker';
import { sortByAlpha } from '../Campaign.Handlers.js'
import filterBySearchTerm from '../../../libs/filterBySearchTerm.js'

const { Search } = Input
const {Content} = Layout

export default class BookingTemplates extends Component {
  state = { 
    searchTerm: '',
    bookingTemplates: [],
  }

  async componentDidMount() {
    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Booking Templates', url: '/campaign-hub/booking-templates' }
    ]);
    const bookingTemplates = await this.getBookingTmps();
    this.setState({bookingTemplates});
  }

  getBookingTmps = async () => {
    let result = await this.props.api.listPublic({
      name: 'bms_campaigns.bookingTemplates',
      columns: [
        {name: 'bookingTmpKey'},
        {name: 'tmpKey'},
        {name: 'tmpDivKey'},
        {name: 'jsonForm'},
        {name: 'bookingDivKey'},
        {name: 'bookingName'},
        {
          name: 'bms_booking.divisionTemplates',
          columns: [
            {name: 'tmpName'},
            {name: 'colorLabel'}
          ],
          where: [
            'divisionTemplates.tmpKey = bms_campaigns.bookingTemplates.tmpKey'
          ]
        },
        {
          name: 'bms_booking.bookingDivisions',
          columns: [
            {name: 'bookingDivName'}
          ],
          where: [
            'bms_campaigns.bookingTemplates.bookingDivKey = bookingDivisions.bookingDivKey'
          ]
        },
      ]
    });
    return result;
  }

  handleCreateTemplate = () => {
    this.props.history.push('/campaign-hub/booking-templates/form');
  }
  
  render() {
    const columns = [
      {
        title: 'Name',
        key: 'bookingName',
        dataIndex: 'bookingName',
        sorter: (a,b) => sortByAlpha(a,b,'bookingName')
      },
      {
        title: 'Booking Division',
        key: 'bookingDivName',
        dataIndex: 'bookingDivName',
        sorter: (a,b) => sortByAlpha(a,b,'bookingDivName')
      },
      {
        title: 'Booking Division Template',
        key: 'tmpName',
        dataIndex: 'tmpName',
        className: 'bms--has-tmp-name-tag',
        sorter: (a,b) => sortByAlpha(a,b,'tmpName'),
        render: (text, record) => {
          let bookingColor = record.colorLabel ? (colorPicker('template', 'colorLabel', record.colorLabel) || {}).color : null;
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center', 
              backgroundColor: bookingColor,
              position: 'absolute',
              bottom: '0',
              top: '0',
              left: '0',
              right: '0'
            }}>
              <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
                {decodeURIComponent(record.tmpName)}
              </p>
            </div>
          )
        }
      },
    ]
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>

        <Search 
          onChange={e => this.setState({ searchTerm: e.target.value })}
          placeholder="Search"
          style={{ marginBottom: '24px' }}
        />

        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              <div
                style={{
                  justifyContent: 'flex-end',
                  display: 'flex',
                  width: '100%',
                  marginBottom: 16,
                }}
              >
                <Button
                  type="primary"
                  onClick={this.handleCreateTemplate}
                >Create New Template...</Button>
              </div>
              <Table
                pagination={{
                  pageSize: 100
                }}
                rowKey="bookingTmpKey"
                onRow={(record) => {
                  return {
                    onClick: () => this.props.history.push('/campaign-hub/booking-templates/' + record.bookingTmpKey)
                  }
                }}
                size="small"
                dataSource={
                  filterBySearchTerm(
                    this.state.searchTerm,
                    this.state.bookingTemplates.sort((a,b) => sortByAlpha(a,b,'bookingDivName'))
                  )
                }
                columns={columns}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    );
  }
}
