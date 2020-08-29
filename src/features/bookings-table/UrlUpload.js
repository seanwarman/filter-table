import React from 'react'
import { connect } from 'react-redux'
import {
  Typography,
  Form,
  Input,
  Icon,
  Button
} from 'antd'
import color from '../../libs/bigglyStatusColorPicker'

const { Title } = Typography

const urlUpload = {
  width: '100%',
  backgroundColor: color('template', 'colorLabel', 'blue').color,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

function UrlUpload({
  onChangeUrl,
  url,
  saveUrl,
}) {
  return (
    <div style={urlUpload}>
      <div>
        <Title style={{ color: '#ffffff', marginBottom: '0' }} level={4}>Provide Download URL</Title>
        <Form style={{ display: 'flex', alignItems: 'center', width: '100%', margin: 'auto', justifyContent: 'center' }}>
          <Input 
            style={{ width: '100%', maxWidth: '50%' }} 
            prefix={<Icon type='global' />} type='text'
            onChange={onChangeUrl}
            value={url}
          />
          <Button disabled={!url} type='primary' onClick={saveUrl}>Submit</Button>
        </Form>
      </div>
    </div>

  )
}

export default connect(
  ({ bookingsTable }) => ({
    url: bookingsTable.url
  })
)(UrlUpload)
