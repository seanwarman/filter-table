import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
  Icon,
} from 'antd'
import color from '../../libs/bigglyStatusColorPicker'

import {
  fetchUploads,
  handleSaveUpload,
} from './BookingsTable.actions'

import Uploader from '../../components/Uploader'

function Uploads({
  uploads = [],
  handleSaveUrl = () => {},
  handleSaveUpload = () => {},
  selectedRowKeys,
}) {

  useState(() => {

    fetchUploads()

  }, [fetchUploads, selectedRowKeys])

  return (
    <Uploader
      uploads={() => {
        return uploads
      }}
      saveUrl={handleSaveUrl}
      saveUpload={handleSaveUpload}
    />
  )
}

export default connect(
  ({ bookingsTable }) => ({
    uploading: bookingsTable.uploading,
    selectedRowKeys: bookingsTable.selectedRowKeys,
    uploads: bookingsTable.uploads,
  }),
  {
    handleSaveUpload,
    fetchUploads,
  }
)(Uploads)
