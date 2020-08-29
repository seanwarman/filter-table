import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Icon,
  Button,
  Checkbox,
  Input,
  Popover,
  message,
  Tooltip,
} from 'antd';
import moment from 'moment';
import Uploader from '../Uploader';
import { sanitiseString } from '../../libs/jsonFormSanitiser';
import { s3Upload } from '../../libs/awsLib';
import './BookingTabs.css';

let key = 0;

class BookingTabs extends Component {

  state = {
    comment: '',
    comments: [],
    pendingComment: false,
    queryComment: '',
    queryOptionVisable: false,
    uploads: [],
    uploading: false, 
    uploadReady: false,
    upload: null,
    notify: false,
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀

  async componentDidMount() {
    const comments = await this.props.getComments();
    this.setState({comments});
  }

  // █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  onQueriedComment = e => {
    let stateCopy = { ...this.state };
    stateCopy.queryComment = e.target.value;
    this.setState(stateCopy);
  }

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleLoadUploads = async() => {
    let stateCopy = { ...this.state };
    stateCopy.uploads = await this.props.getUploads();
    this.setState(stateCopy);
  }

  handleOptionVisibleChange = queryOptionVisable => {
    // if (this.props.booking.currentStatus === 'Complete') return;
    this.setState({ queryOptionVisable });
  };

  handleQueryMode = async queried => {
    if(!this.state.queryComment) {
      message.error('You must enter a comment to move to Query Mode');
      return;
    }
    
    const bookingBody = {
      flagged: queried ? 'queried' : 'NULL' 
    };
    
    let result = await this.props.updateBooking(
      bookingBody,
      queried
    );

    await this.componentDidMount();

    if(!result) return;

    await this.props.createComment(
      {
        createdUserKey: this.props.user.userKey,
        bookingsKey: this.props.booking.bookingsKey,
        flagged: 'queried',
        comment: sanitiseString(this.state.queryComment),
      },
      this.state.notify ?
      {
        description: 'New query comment: ' + sanitiseString(this.state.queryComment),
        bookingUrl: this.props.bookingUrl ? this.props.bookingUrl : undefined,
      }
      :
      undefined
    );

    this.componentDidMount();
  }

  handleComment = e => {
    let stateCopy = { ...this.state };
    stateCopy.comment = e.target.value;
    this.setState(stateCopy);
  };

  handleSubmitComment = async (e, notify) => {
    if (this.state.comment < 1) return;
    if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {

      let stateCopy = {...this.state};

      const commentRecord = {
        comment: sanitiseString(this.state.comment),
        createdUserKey: this.props.user.userKey,
        bookingsKey: this.props.booking.bookingsKey,
        flagged: this.props.booking.queried === 'queried' ? 'queried' : undefined
      }

      stateCopy.comment = '';
      stateCopy.pendingComment = false;

      stateCopy.comments.push({
        ...commentRecord,
        firstName: this.props.user.firstName,
        lastName: this.props.user.lastName,
        created: null,
      });

      this.setState(stateCopy);
      await this.props.createComment(
        commentRecord, 
        this.state.notify ?
        {
          description: 'New comment: ' + sanitiseString(this.state.comment),
          bookingUrl: this.props.bookingUrl ? this.props.bookingUrl : undefined,
        }
        :
        undefined
      );
      this.componentDidMount();
    }
  };

  handleSaveUrl = async uploaderState => {
    const upload = {
      urlName: sanitiseString(uploaderState.url),
      uploadedUserKey: this.props.user.userKey,
      bookingsKey: this.props.booking.bookingsKey,
      fileName: sanitiseString(uploaderState.url),
      customerKey: this.props.booking.customerKey,
    };

    let result = await this.props.createUpload(upload, this.props.booking.bookingDivKey);

    if(!result) {
      message.error('There was an error saving you\'re url.');
    } else {
      message.success('Url saved!');
    }

    return result;
  };

  handleSaveUpload = async uploaderState => {
    let s3UrlName;
    let s3Url = 'https://s3-eu-west-1.amazonaws.com/bms-console-services/public/';

    try {
      s3UrlName = await s3Upload(uploaderState.file);
    } catch (err) {
      console.log('There was an error uploading to the s3: ', err);
    }

    const upload = {
      urlName: sanitiseString(s3Url + s3UrlName),
      uploadedUserKey: this.props.user.userKey,
      bookingsKey: this.props.booking.bookingsKey,
      fileName: sanitiseString(uploaderState.fileName),
      customerKey: this.props.booking.customerKey,
    };

    let result = await this.props.createUpload(upload, this.props.booking.bookingDivKey);

    if(!result) {
      message.error('There was an error saving you\'re url.');
    } else {
      message.success('Url saved!');
    }

    return result;
  };

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderQueriedButton = () => {
    const {user, booking} = this.props;
    const {currentStatus} = this.props.booking;
    if(currentStatus === 'Complete') return;
    return (
      booking.flagged !== 'queried' && 
      user.userKey === booking.assignedUserKey ?
      <Popover
        placement="bottomRight"
        style={{
          position: 'absolute',
          right: 10,
          top: 7,
        }}
        content={
          <div>
            Enter your query for this booking:
            <Input 
              onKeyUp={e => {
                if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
                  this.handleQueryMode(true)
                }
              }}
              onChange={this.onQueriedComment}
              value={this.state.queryComment} />
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 0 }}
                loading={this.state.pendingComment}
                disabled={!this.state.queryComment}
                type="primary"
                onClick={() => this.handleQueryMode(true)}
              >Enter Query Mode</Button>
            </div>
          </div>
        }
        overlayStyle={{ width: '500px' }}
        trigger="click"
        visible={this.state.queryOptionVisable}
        onVisibleChange={this.handleOptionVisibleChange}
      >
        <Button 
          style={{
            marginLeft: 20
          }}
          type="primary"
        >
          Query
        </Button>
      </Popover>
      :
      booking.flagged === 'queried' && user.userKey === booking.createdUserKey &&
      <Popover
        placement="bottomRight"
        style={{
          position: 'absolute',
          right: 10,
          top: 7,
        }}
        content={
          <div>
            Add a response to this query:
            <Input 
              onKeyUp={e => {
                if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
                  this.handleQueryMode(false)
                }
              }}
              onChange={this.onQueriedComment}
              value={this.state.queryComment} />
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 0 }}
                loading={this.state.pendingComment}
                disabled={!this.state.queryComment}
                type="primary"
                onClick={() => this.handleQueryMode(false)}
              >Restore to {this.props.booking.currentStatus}</Button>
            </div>
          </div>
        }
        overlayStyle={{ width: '500px' }}
        trigger="click"
        visible={this.state.queryOptionVisable}
        onVisibleChange={this.handleOptionVisibleChange}
      >
        <Button 
          style={{
            marginLeft: 20
          }}
          type="primary"
        >
          Exit Query Mode
        </Button>
      </Popover>
    )
  }

  renderCommentsHistory = () => {
    let comments = [...this.state.comments];
    const queriedIndicatorStyles = {
      position: 'absolute',
      borderRadius: '5px',
      backgroundColor: '#0dc48a',
      right: 0,
      top: 3,
      color: 'white',
      padding: '0 7px',
      fontSize: 10
    }
    return (
      comments.length > 0 &&
      comments.reverse().map(record => (
        <div key={key++} style={{ position: 'relative' }} >
          {
            record.flagged === 'queried' &&
            <div style={queriedIndicatorStyles}
            >Query</div>
          }
          <span style={{ fontSize: '1rem' }}>
            <Icon type="user" />{' '}
            <b>
              {record.firstName} {record.lastName}
            </b>
          </span>
          <p style={{ padding: 7, marginBottom: 5 }}>{unescape(record.comment)}</p>
          <div style={{ fontSize: 10, textAlign: 'right' }}>
              {
                record.created ?
                moment(record.created).format('lll')
                :
                <Icon type="loading" />
              }
          </div>
          <hr />
        </div>
      ))
    );
  };

  renderComments = () => {
    const { comment, pendingComment } = this.state;

    return (
      <div>
        <div
          style={{
            marginBottom: 15,
            display: 'flex'
          }}
        >
          <b
            style={{
              width: 140
            }}
          >Add Comment</b>
          <div
            style={{
              textAlign: 'right',
              width: '100%',
            }}
          >
            <Tooltip
              title="Notify all associated users."
            >
              <span
                onClick={() => this.setState({notify: !this.state.notify})}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={this.state.notify}
                  style={{
                    pointerEvents: 'none'
                  }}
                  onChange={e => e.preventDefault()}
                  id="bms--comment-checkbox"
                  label="Notify"
                  type="checkbox"
                >

                 Notify by email
                 </Checkbox>
              </span>
            </Tooltip>
            {
              this.props.queryMode === undefined || 
              (this.props.queryMode && this.renderQueriedButton())
            }
          </div>
        </div>
        <Input
          value={comment}
          onKeyUp={e => this.handleSubmitComment(e, this.state.notify)}
          onChange={this.handleComment}
          label="Comment"
        />
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            type="primary"
            disabled={!comment}
            loading={pendingComment}
            onClick={e => this.handleSubmitComment(e, this.state.notify)}
            style={{ marginRight: 0 }}
          >
            Save
          </Button>
        </div>
        {this.renderCommentsHistory()}
      </div>
    );
  };

  render() {
    return (
      <Row gutter={16}>
        <Col span={24}>
          <Card 
            bordered={this.props.bordered === undefined ? true : this.props.bordered}
            style={
              this.props.scrollable === undefined ? 
              { overflowY: 'scroll' } 
              : 
              this.props.scrollable ?
              { overflowY: 'scroll' } 
              :
              {}
            }>
            <Tabs
              defaultActiveKey="1"
              onChange={activeKey => {
                if (activeKey === '2') this.handleLoadUploads()
              }}
            >
              <Tabs.TabPane
                style={{ marginTop: '1rem' }}
                tab="Comments"
                key="1"
              >
                {this.renderComments()}
              </Tabs.TabPane>
              <Tabs.TabPane
                style={{ marginTop: '1rem' }}
                tab="Docs"
                key="2"
              >
                <Uploader
                  uploads={() => {
                    return this.props.getUploads()
                  }}
                  saveUrl={this.handleSaveUrl}
                  saveUpload={this.handleSaveUpload}
                />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default BookingTabs;
