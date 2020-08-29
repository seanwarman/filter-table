import React, { PureComponent as Component, Fragment } from 'react';
import Actions from '../../../actions/campaign-hub/Actions.js'
import { Input, Layout, Col, Row, Card } from 'antd';
import EasyAdd from '../../../components/EasyEdit/EasyAdd.js'
import EasyUpdateTable from '../../../components/EasyEdit/EasyUpdateTable.js'
import filterBySearchTerm from '../../../libs/filterBySearchTerm.js'
import {
  sortByAlpha
} from '../Campaign.Handlers.js'
import {
  adderColumns,
  updaterColumns
} from './Packages.TableColumns.js'

const { Content } = Layout;
const { Search } = Input

export default class Packages extends Component {

  actions = new Actions(this.props.apiKey)

  state = {
    searchTerm: '',
    loaded: false,
    packages: [],
    campaignDivisions: [],
  }

  async componentDidMount() {
    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Packages', url: '/campaign-hub/packages' }
    ]);

    this.setState({
      packages: await this.actions.getPackages(),
      campaignDivisions: await this.actions.getCampaignDivisions(),
      loaded: true
    })

  }

  loadPackages = async () => {

    this.setState({
      packages: await this.actions.getPackages()
    })

  }

  create = async packages => {
    await this.actions.createManyPackages(packages)
    this.loadPackages()
  }

  delete = async packageKey => {
    this.setState({
      packages: this.state.packages.filter(pack => pack.packageKey !== packageKey)
    })
    await this.actions.deletePackage(packageKey)
    this.loadPackages()
  }

  update = async ({
    packageKey,
    ...pack
  }) => {

    await this.actions.updatePackage(packageKey, pack)
    this.loadPackages()
  }

  render() {

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}
    >

      <Search 
        onChange={e => this.setState({ searchTerm: e.target.value })}
        placeholder="Search"
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={16}>
        <Col xs={24}>
          <Card bordered={false} style={{ 'width': '100%' }}>

            {
              this.state.loaded &&
              <Fragment>
                  <EasyAdd
                    columns={adderColumns(this.props.user.apiKey, this.props.history, this.state.campaignDivisions)}
                    create={this.create}
                    showHeader={false}
                  >
                  </EasyAdd>

                  <EasyUpdateTable
                    primaryKey="packageKey"
                    update={this.update}
                    delete={this.delete}
                    columns={updaterColumns(this.props.user.apiKey, this.props.history, this.state.campaignDivisions)}
                    dataSource={filterBySearchTerm(this.state.searchTerm, this.state.packages).sort((a,b) => sortByAlpha(a,b,'packageName'))}
                    pagination={{
                      pageSize: 100
                    }}
                  >
                  </EasyUpdateTable>
              </Fragment>
            }

            </Card>
          </Col>
        </Row>


      </Content>


    );
  }
}

