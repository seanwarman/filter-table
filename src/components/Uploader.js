import React from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  message,
} from 'antd';
import Icon from 'antd/lib/icon';
import config from '../libs/BigglyConfig';
import moment from 'moment';
import color from '../libs/bigglyStatusColorPicker';
import {sanitiseString} from '../libs/jsonFormSanitiser';

const {Title} = Typography;

let key = 0;

export default class Uploader extends React.Component {
  
  state = {
    uploads: [], 
    uploading: false, 
    uploadReady: false, 
    upload: null,
    fileName: '',
    urlName: '',
    url: '',
    bucket: config.s3.BUCKET,
    file: null
  }

  // █▀▀ ▀▀█▀▀ █░░█ █░░ █▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ █░░ █▀▀ ▀▀█
  // ▀▀▀ ░░▀░░ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀

  styles = () => (
    {
      wrapper: {position: 'relative'},
      innerWrapper: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        flexFlow: 'row'
      },
      choiceIconUploads: { 
        position: 'absolute',
        left: 'auto',
        right: 'auto',
        margin: 'auto',
        top: '0',
        bottom: '0',
        lineHeight: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      swapIcon: {
        fontSize: '15px',
        color: color('template', 'colorLabel', 'blue').color,
        padding: '10px',
        background: '#ffffff',
        borderRadius: '50%'
      },
      fileUpload: {
        paddingTop: '50px',
        paddingBottom: '50px',
        textAlign: 'center',
        width: '100%',
        border: `1px solid ${color('template', 'colorLabel', 'blue').color}`,
        overflow: 'hidden'
      },
      urlUpload: {
        width: '100%',
        backgroundColor: color('template', 'colorLabel', 'blue').color,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      uploadLoadingWrapper: {
        display: 'flex',
        // alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 'auto',
        right: 'auto',
        width: '100%',
        backgroundColor: 'rgb(255, 255, 255, 0.7)',
        zIndex: '1'
      },
      uploadLoadingInnerWrapper: { 
        color: color('template', 'colorLabel', 'blue').color,
        position: 'relative',
        top: 0
      },
      uploadIcon: { 
        position: 'relative',
        top: this.iconPosition(),
        fontSize: '3rem'
      }
    }
  )

  iconPosition = () => (
    this.state.file ?
    91
    :
    52
  )

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {
    this.loadDataAndSetState();
  }
  
  async loadDataAndSetState() {
    const uploads = await this.getUploads();
    this.setState({
      uploads: uploads ? uploads : [],
      uploading: false,
      upload: null,
      uploadReady: false,
      fileName: '',
      urlName: '',
      url: '',
    });
  }

  // █▀▀█ █▀▀█ ░▀░
  // █▄▄█ █░░█ ▀█▀
  // ▀░░▀ █▀▀▀ ▀▀▀

  getUploads = async () => {
    try {
      return await this.props.uploads();
    } catch (error) {
      console.log('List uploads endpoint error :', error);
      return null;
    }
  }

  saveUrl = async () => {
    this.setState({uploading: true});
    await this.props.saveUrl(this.state);
    this.loadDataAndSetState();
  }

  saveUpload = async () => {
    this.setState({uploading: true});
    await this.props.saveUpload(this.state);
    this.loadDataAndSetState();
  };
  
  // █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  onChangeUrl = e => {
    e.preventDefault();
    this.setState({url: e.target.value});
  }

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀  

  handleChooseFile = e => {
    if (e.target.files.length < 1) return;

    let stateCopy = { ...this.state };
    stateCopy.uploadReady = true;

    if (e.target.files[0].size > 50000000) {
      message.error(
        'The file was too large. Please select a file which is 5MB or less.'
      );
      this.loadDataAndSetState();
      return;
    }

    stateCopy.file = e.target.files[0];
    stateCopy.fileName = sanitiseString(e.target.files[0].name);


    this.setState(stateCopy);
  };

  handleCancelUpload = e => {
    let stateCopy = { ...this.state };
    stateCopy.uploadReady = false;
    stateCopy.fileName = null;
    stateCopy.urlName = null;

    // Return Null for the value of the upload - KR
    e.target.value = null;

    message.success('Selected item removed.');
    this.setState(stateCopy);
  };

  clickHiddenUploadForm = () => {
    document.getElementById('hiddenUploadForm').click();
  };

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderFileUpload = () => (
    <div style={this.styles().fileUpload}>
      {
        !this.state.uploadReady ?
        <Button type="dashed" onClick={this.clickHiddenUploadForm}>
          <Icon type="upload" /> Choose a File
        </Button>
        :
        <div style={{ position: 'relative' }}>
          <p
            style={{
              paddingRight: 20,
              paddingLeft: 20
            }}
          >{unescape(this.state.fileName)}</p>
          <Button
            type="primary"
            icon="upload"
            disabled={this.state.uploading}
            onClick={this.saveUpload}
          >
            Upload File
          </Button>
          <Divider type="vertical" />
          <Button onClick={this.handleCancelUpload} type="warning">
            Cancel Upload
          </Button>
        </div>
      }

      {/* Grab file list data from this input */}
      <Form id="hiddenInputParent" name="hiddenInputParent">
        <Input
          style={{ display: 'none' }}
          id="hiddenUploadForm"
          className="bmsDataUploadInput"
          name="userfile"
          onClick={e => (e.target.value = null)}
          onChange={this.handleChooseFile}
          type="file"
          value={null}
        />
      </Form>
    </div>
  )

  renderUrlUpload = () => (
    <div style={this.styles().urlUpload}>
      <div>
        <Title style={{ color: '#ffffff', marginBottom: '0' }} level={4}>Provide Download URL</Title>
        <Form style={{ display: 'flex', alignItems: 'center', width: '100%', margin: 'auto', justifyContent: 'center' }}>
          <Input 
            style={{ width: '100%', maxWidth: '50%' }} 
            prefix={<Icon type='global' />} type='text'
            onChange={this.onChangeUrl}
            value={this.state.url}
          />
          <Button disabled={!this.state.url} type='primary' onClick={this.saveUrl}>Submit</Button>
        </Form>
      </div>
    </div>
  )

  renderUploadsList = () => (
    <div>
      {
        this.state.uploads.length > 0 && (
          <div style={{ paddingLeft: '5px' }}>
            <Divider />
            {
              this.state.uploads
              .reverse()
              .map(item => (
                <Row key={key++} style={{ margin: '10px 0' }}>
                  <Col
                    span={12}
                    style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Icon type="file" style={{ marginRight: '6px' }} />
                    <a
                      href={unescape(item.urlName)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {unescape(item.fileName)}
                    </a>
                  </Col>
                  <Col
                    span={12}
                    style={{
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <strong>{item.uploadedUserName}</strong> <div style={{ margin: '0 6px' }}>|</div> {moment(item.created).format('LLL')}
                  </Col>
                  <hr style={{ marginTop: '25px', marginBottom: 0 }} />
                </Row>
              ))
            }
          </div>
        )
      }
    </div>
  )

  render() {
    const styles = this.styles;
    return (
      <div style={styles().wrapper}>

        <div style={styles().innerWrapper}>
          <div style={styles().choiceIconUploads} className="bms--choice-icon-uploads">
            <Icon style={styles().swapIcon} type='swap' />
          </div>
          {this.renderFileUpload()}
          {this.renderUrlUpload()}
        </div>
        {
          this.state.uploading &&
          <div style={styles().uploadLoadingWrapper}>
            <div style={styles().uploadLoadingInnerWrapper}>
              <Icon type="loading" style={styles().uploadIcon} />
            </div>
          </div>
        }
        {this.renderUploadsList()}
      </div>
    )
  }
}
