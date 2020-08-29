import React, { PureComponent as Component, Fragment } from 'react'
import { Layout, Input, Card } from 'antd'
import filterBySearchTerm from '../../../libs/filterBySearchTerm'
import Actions from '../../../actions/campaign-hub/Actions'
import EasyAdd from '../../../components/EasyEdit/EasyAdd.js'
import EasyUpdateTable from '../../../components/EasyEdit/EasyUpdateTable.js'
import {
  sortByAlpha
} from '../Campaign.Handlers.js'
import {
  columns
} from './Products.TableColumns.js'

const { Content } = Layout
const { Search } = Input

export default class Products extends Component {

  actions = new Actions(this.props.user.apiKey, this.props.user.userKey, this.props.socketLib)

  state = {
    bookingDivisions: [],
    products: [],
    loaded: false,
    searchTerm: ''
  }

  async componentDidMount() {

    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Products', url: '/campaign-hub/products' }
    ])

    this.setState({
      products: await this.actions.getProductsAndBookingTemplates(),
      bookingDivisions: await this.actions.getBookingDivisions(),
      loaded: true,
    })
  }

  reloadProducts = async () => {
    this.setState({
      products: await this.actions.getProductsAndBookingTemplates()
    })
  }

  create = async records => {
    await this.actions.createManyProducts(records)
    this.reloadProducts()
  }

  delete = async productKey => {
    this.setState({
      products: this.state.products.filter(prod => prod.productKey !== productKey)
    })
    await this.actions.deleteProduct(productKey)
    this.reloadProducts()
  }

  update = async ({
    productKey,
    ...product
  }) => {

    await this.actions.updateProduct(productKey, product)
    this.reloadProducts()
  }

  render() {

    return <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}
    >
      <Search 
        onChange={e => this.setState({ searchTerm: e.target.value })}
        placeholder="Search"
        style={{ marginBottom: '24px' }}
      />

      <Card bordered={false} style={{
        width: '100%',
        marginBottom: 16
      }}>

      {
        this.state.loaded &&
        <Fragment>
          <EasyAdd
            columns={columns(this.props.user.apiKey, this.state.bookingDivisions)}
            create={this.create}
            showHeader={false}
          >
          </EasyAdd>

          <EasyUpdateTable
            primaryKey="productKey"
            update={this.update}
            delete={this.delete}
            columns={columns(this.props.user.apiKey, this.state.bookingDivisions)}
            dataSource={filterBySearchTerm(this.state.searchTerm, this.state.products).sort((a,b) => sortByAlpha(a,b,'productName'))}
          >
          </EasyUpdateTable>
        </Fragment>
      }

      </Card>

    </Content>

  }

}
