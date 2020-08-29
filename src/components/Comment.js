import React, { Component } from 'react';
import { Tooltip, Input, Button } from 'antd';
import { sanitiseString } from '../libs/jsonFormSanitiser';

export default class Comment extends Component {
  state = {
    comment: null,
    pendingComment: false,
    notify: false,
  }

  componentDidMount() {
    this.setState({
      pendingComment: false,
      comment: null
    });
  }

  handleSubmitComment = async (e, notify) => {
    if (this.state.comment < 1) return;
    if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
      this.setState({pendingComment: true});

      await this.props.create(sanitiseString(this.state.comment), notify);

      // let stateCopy = {...this.state};

      // const commentRecord = {
      //   comment: sanitiseString(this.state.comment),
      //   createdUserKey: this.props.user.userKey,
      //   bookingsKey: this.props.booking.bookingsKey,
      //   flagged: this.props.booking.queried === 'queried' ? 'queried' : undefined
      // }

      // stateCopy.comment = '';
      // stateCopy.pendingComment = false;

      // stateCopy.comments.push({
      //   ...commentRecord,
      //   firstName: this.props.user.firstName,
      //   lastName: this.props.user.lastName,
      //   created: null,
      // });

      // this.setState(stateCopy);
      // await this.props.createComment(
      //   commentRecord, 
      //   this.state.notify ?
      //   {
      //     description: 'New comment: ' + sanitiseString(this.state.comment),
      //     bookingUrl: this.props.bookingUrl ? this.props.bookingUrl : undefined,
      //   }
      //   :
      //   undefined
      // );
      this.componentDidMount();
    }
  }

  handleComment = e => {
    let stateCopy = { ...this.state };
    stateCopy.comment = e.target.value;
    this.setState(stateCopy);
  }

  render() {
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
          {
            this.props.notify !== false &&
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
                  onClick={() => this.setState({ notify: !this.state.notify })}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <input
                    checked={this.state.notify}
                    style={{
                      pointerEvents: 'none'
                    }}
                    onChange={e => e.preventDefault()}
                    id="bms--comment-checkbox"
                    label="Notify"
                    type="checkbox"
                  /> Notify by email
                </span>
              </Tooltip>
            </div>
          }
        </div>
        <Input
          value={this.state.comment}
          onKeyUp={e => this.handleSubmitComment(e, this.state.notify)}
          onChange={this.handleComment}
          label="Comment"
        />
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            type="primary"
            disabled={!this.state.comment}
            loading={this.state.pendingComment}
            onClick={e => this.handleSubmitComment(e, this.state.notify)}
            style={{ marginRight: 0 }}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
}
