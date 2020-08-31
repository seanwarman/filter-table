import React from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Icon,
  Divider,
  Form,
  Input
} from 'antd'
import color from '../../App.utils'

import {
  saveUpload
} from './BookingsTable.actions'

const fileUpload = {
  paddingTop: '50px',
  paddingBottom: '50px',
  textAlign: 'center',
  width: '100%',
  border: `1px solid ${color('template', 'colorLabel', 'blue').color}`,
  overflow: 'hidden'
}

function FileUpload({
  saveUpload,
  handleCancelUpload,
  handleChooseFile,
  clickHiddenUploadForm,

  fileName,
  uploadReady,
  uploading,

}) {
  return (
    <div style={fileUpload}>
      {
        !uploadReady ?
          <Button type="dashed" onClick={clickHiddenUploadForm}>
            <Icon type="upload" /> Choose a File
          </Button>
          :
          <div style={{ position: 'relative' }}>
            <p
              style={{
                paddingRight: 20,
                paddingLeft: 20
              }}
            >{unescape(fileName)}</p>
            <Button
              type="primary"
              icon="upload"
              disabled={uploading}
              onClick={saveUpload}
            >
              Upload File
            </Button>
            <Divider type="vertical" />
            <Button onClick={handleCancelUpload} type="warning">
              Cancel Upload
            </Button>
          </div>
      }

      {/* Grab file list data from input */}
      <Form id="hiddenInputParent" name="hiddenInputParent">
        <Input
          style={{ display: 'none' }}
          id="hiddenUploadForm"
          className="bmsDataUploadInput"
          name="userfile"
          onClick={e => (e.target.value = null)}
          onChange={handleChooseFile}
          type="file"
          value={null}
        />
      </Form>
    </div>

  )
}

export default connect(
  ({ bookingsTable }) => ({
    fileName: bookingsTable.fileName,
    uploadReady: bookingsTable.uploadReady,
    uploading: bookingsTable.uploading,
  }),
  {
    saveUpload
  }
)(FileUpload)
