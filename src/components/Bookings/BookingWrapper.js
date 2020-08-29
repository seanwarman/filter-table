import React from 'react';
import moment from 'moment';
import { 
  Drawer, 
  Button, 
  Col,
  Row,
  Icon,
  Timeline,
  Empty,
  Tag,
} from 'antd';
import colors from '../../mixins/BigglyColors';
import './BookingWrapper.css';

export default class BookingWrapper extends React.Component {
  state = {
    bookingAudit: [],
    drawerVisible: false,
  };

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  loadAudit = async() => {
    let stateCopy = { ...this.state };

    stateCopy.bookingAudit = await this.props.api.listPublic({
      name: 'bms_booking.bookingAudit',
      columns: [
        {name: 'description'},
        {name: 'createdUserKey'},
        {name: 'created'},
        {name: 'bookingAuditKey'},
        {name: 'status'},
        {name: 'bookingsKey'},
        {name: 'updated'},
      ],
      where: [
        `bookingsKey = "${this.props.bookingsKey}"`
      ]
    });

    stateCopy.drawerVisible = true;
    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAuditTrailDrawer = () => (
    <div style={{ textAlign: 'right' }}>
      {
        <div style={{ height: 0 }}>
          <Drawer
            width={620}
            placement="right"
            closable={false}
            bodyStyle={{height: '100%'}}
            onClose={() => this.setState({ drawerVisible: false })}
            visible={this.state.drawerVisible}
          >
            <h2>Audit Trail</h2>
              {
                this.state.bookingAudit.length > 0 ?
                <Timeline mode="alternate">
                  {this.state.bookingAudit.map(audit => this.renderAudits(audit))}
                </Timeline>
                :
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              }
          </Drawer>
        </div>
      }
    </div>
  );

  renderAudits = audit => {
    // Match the audit.status with the colors Mixin
    // to render the right styles...
    let iconStyles = colors.status.find(item =>
      item.value === audit.status ? item : item.value === 'Default' && item
    );
    return (
      <Timeline.Item
        key={audit.bookingAuditKey}
        dot={
          <Icon
            type={iconStyles.icon}
            style={{ color: iconStyles.color, fontSize: '1.1rem' }}
          />
        }
      >
        {audit.description}
        <br />
        <Tag style={{ marginRight: 0, cursor: 'auto' }} color="blue">
          {moment(audit.created).format('LLL')}
        </Tag>
      </Timeline.Item>
    );
  };

  render() {
    return (
      <Row gutter={16}>

        {this.renderAuditTrailDrawer()}
        <Button
          onClick={() => this.loadAudit()}
          style={{
            position: 'fixed',
            right: -40,
            top: 145,
            zIndex: 1,
            transform: 'rotate(-90deg)',
          }}
        >Audit Trail</Button>

        <Col span={24}>{this.props.topPanel()}</Col>
        <Col span={12}>{this.props.leftPanel()}</Col>
        <Col span={12}>{this.props.rightPanel()}</Col>
      </Row>
    )
  }
} 
