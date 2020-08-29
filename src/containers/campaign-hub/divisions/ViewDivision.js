import React, {Component} from 'react';
import {Skeleton, message, Layout, Row, Col, Card, Form, Input, Button, Drawer} from 'antd';
import Icon from 'antd/lib/icon';
import SimpleCreationTable from '../../../components/Tables/SimpleCreationTable';

const {Content} = Layout;

export default class ViewDivision extends Component {

  state = {
    // Using...
    loadSubmit: false,
    showDrawer: false,
    isLoading: true,
    record: {},
    form: {}
  };

  async componentDidMount() {
    this.props.changeHeader('sound','CampaignHub',[
      {name: 'Divisions', url: '/campaign-hub/divisions'},
      {name: 'Division', url: this.props.location.pathname},
    ])
    this.loadDataAndSetState();
  }

  async loadDataAndSetState() {
    const record = await this.getRecord();
    if(!record) {
      message.error('This division doesn\'t appear to exist anymore.');
      setTimeout(() => {
        this.props.history.push('/campaign-hub/divisions');
      }, 1000);
      return
    }

    this.setState({isLoading: false, record, showDrawer: false, loadSubmit: false})
  }

  getRecord = async() => {
    return await this.props.api.getPublic({
      name: 'bms_campaigns.campaignDivisions',
      columns: [
        {name: 'campaignDivKey'},
        {name: 'campaignDivName'},
      ],
      where: [
        `campaignDivKey = "${this.props.match.params.campaignDivKey}"`
      ]
    });
  }

  updateRecord = async(form) => {
    return await this.props.api.updatePublic({
      name: 'bms_campaigns.campaignDivisions',
      where: [`campaignDivKey = "${this.props.match.params.campaignDivKey}"`]
    }, form)
  }

  validateForm() {
    return true;
  }

  inputChange = (key, value) => {
    const {form} = this.state;
    form[key] = value
    this.setState({
      form
    });
  }

  setFormFields = record => {
    return {
      campaignDivName: record.campaignDivName
    }
  }

  openDrawer = () => {
    const { record } = this.state;
    const form = this.setFormFields(record);
    const showDrawer = true;
    this.setState({form, showDrawer});
  };

  sanitiseForm = form => {
    for(let key in form) {
      form[key] = JSON.stringify(form[key]).slice(1,-1);
    }
    return form;
  }

  handleSubmit = async() => {
    this.setState({loadSubmit: true});
    const form = this.sanitiseForm(this.state.form);
    const result = await this.updateRecord(form);
    if(result.affectedRows !== 1) message.error('There was a problem updating this division.');
    this.loadDataAndSetState();
  }

  renderEditDrawer() {
    const { form } = this.state;
    return (
      <Drawer
        title="Edit division"
        width={620}
        onClose={() => this.setState({showDrawer: !this.state.showDrawer})}
        visible={this.state.showDrawer}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {
            Object.keys(form).map((key,i) => (
              <Form.Item label={key}>
                <Input required id={key + i} type={'text'} onChange={e => this.inputChange(key, e.target.value)}
                  value={form[key]} />
              </Form.Item>
            ))
          }
        </Form>

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >

          <Row>
            <Col span={8} style={{ textAlign: 'left' }}>
            </Col>
            <Col span={16}>
              <Button disabled={!this.validateForm()} loading={this.state.loadSubmit} onClick={this.handleSubmit} type={'primary'}>Update</Button>
            </Col>
          </Row>
        </div>
      </Drawer>
    );
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderRecord() {

    const { campaignDivName, campaignDivKey } = this.state.record;
    
    return (
      <div>
        <Row gutter={16}>
          <Col xs={24}>
            <Skeleton loading={this.state.isLoading} active={true} title={{ width: 150 }} paragraph={{ rows: 1 }}>
              <h5>{campaignDivName}</h5>
              {campaignDivKey}
            </Skeleton>
          </Col>
        </Row>

        <Icon onClick={this.openDrawer} type={"edit"} style={{ color: 'grey', fontSize: '1.6em', position: 'absolute', top: '10px', right: '15px' }} />

        {this.renderEditDrawer()}
      </div>

    );
  }

  createDivTabAndRedirect = async form => {
    const {campaignDivKey} = this.props.match.params;
    const result = await this.props.api.createPublic({
      name: 'bms_campaigns.divTabs'
    },{
      ...form, 
      campaignDivKey
    }, 'divTabsKey', true, true);

    if(result.affectedRows === 0) {
      console.log('There was a problem creating this tab: ', result);
      return;
    }
    this.props.history.push(`/campaign-hub/divisions/${campaignDivKey}/tab/${result.key}`);
  }

  render() {
    const {campaignDivKey} = this.props.match.params;
    const formFields = [
      {
        required: true,
        type: 'text',
        prettyName: 'Name',
        dataIndex: 'divTabsName'
      }
    ];
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Row style={{marginBottom: 16}}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              {this.renderRecord()}
            </Card>
          </Col>
        </Row>
        <SimpleCreationTable
          rowKey="divTabsKey"
          deleteRow={key => (
            this.props.api.deletePublic({
              name: 'bms_campaigns.divTabs',
              where: [`divTabsKey = "${key}"`]
            })
          )}
          drawerTitle="Create a new Tab for this Division"
          formFields={formFields}
          submitForm={async form => {
            await this.createDivTabAndRedirect(form)
          }}
          tableRecords={() => {
            return this.props.api.listPublic({
              name: 'bms_campaigns.divTabs',
              columns: [
                {name: 'campaignDivKey'},
                {name: 'divTabsKey'},
                {name: 'divTabsName'},
              ],
              where: [`campaignDivKey = "${campaignDivKey}"`]
            })
          }}
          columns={[
            {
              title: 'Tabs',
              dataIndex: 'divTabsName',
              key: 'divTabsName',
              sorter: (a, b) => a.divTabsName.length - b.divTabsName.length,
              sortDirections: ['descend', 'ascend'],
              render: (name, record) =>
                <Button
                  type="link"
                  onClick={() => {
                    console.log('clicked!')
                    this.props.history.push(`/campaign-hub/divisions/${this.props.match.params.campaignDivKey}/tab/${record.divTabsKey}`);
                  }}
                >{name}</Button>
            }
          ]}
          drawerButtons={(form, validator, loadComponent) => (
            <Button 
              onClick={async() => {
                await this.createDivTabAndRedirect(form)
              }}
              type="primary"
              disabled={!validator()}
            >Create new tab...</Button>
          )}
        />
      </Content>
    );
  }
}
