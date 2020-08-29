import React from 'react'
import { connect } from 'react-redux'
import {
  Input,
  Button,
} from 'antd'
import {
  createComment,
} from './BookingsTable.actions'
import CommentsHistory from './CommentsHistory'

class Comments extends React.Component {

  state = {
    comment: ''
  }

  onChange = e => {
    this.setState({ comment: e.target.value })
  }

  onKeyUp = e => {
    if(this.props.loadingCreateComment) return
    if(e.keyCode === 13) this.onSave()
  }

  onSave = () => {
    this.props.createComment(this.state.comment)

    this.setState({ comment: '' })
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
          {/*
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
                onClick={() => console.log('Notify someone...?')}
            style={{
              cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={true}
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
          </div>
              */}
        </div>
        <Input
          value={this.state.comment}
          onKeyUp={this.onKeyUp}
          onChange={this.onChange}
          label="Comment"
        />
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            type="primary"
            disabled={this.state.comment.length === 0}
            loading={this.props.loadingCreateComment}
            onClick={this.onSave}
            style={{ marginRight: 0 }}
          >
            Save
          </Button>
        </div>

        <CommentsHistory />
      </div>
    )
  }

}

export default connect(
  ({ bookingsTable }) => ({
    selectedRowKeys: bookingsTable.selectedRowKeys,
    loadingCreateComment: bookingsTable.loadingCreateComment,
  }),
  {
    createComment,
  }
)(Comments)
