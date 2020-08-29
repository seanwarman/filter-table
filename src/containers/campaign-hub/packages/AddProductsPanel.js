import React from 'react'
// import Actions from '../../../actions/campaign-hub/Actions'
import {
  Button,
  Row,
  Col,
  Card,
  Input,
  Table,
  Icon,
} from 'antd'

const addProductsColumns = [ 
  {
    title: 'Product Name',
    dataIndex: 'productName',
    sorter: (a, b) => {
      const prodNameA = a.productName.toLowerCase()
      const prodNameB = b.productName.toLowerCase()
      if(prodNameA > prodNameB) {
        return 1
      }
      if(prodNameA < prodNameB) {
        return -1
      }
      return 0
    },
    // sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Booking Division',
    dataIndex: 'bookingDivName'
  },
  {
    title: 'Cost Price',
    dataIndex: 'costPrice'
  },
  {
    title: 'Retail Price',
    dataIndex: 'retailPrice'
  },
  {
    title: 'Booking Quantity',
    dataIndex: 'quantity'
  },
]

class AddProductsPanel extends React.PureComponent {

  state = {
    searchTerm: '',
    selectedProducts: []
  }

  removeProduct = index => {
    let selectedProducts = JSON.parse(JSON.stringify(this.state.selectedProducts))
    selectedProducts.splice(index, 1)
    this.setState({selectedProducts})
  }

  productChange = (productKey) => {
    let selectedProducts = JSON.parse(JSON.stringify(this.state.selectedProducts))
    selectedProducts.push(productKey)
    this.setState({selectedProducts})
  }

  handleSearch = (records, searchTerm) => {
    if(searchTerm.length === 0) return records
    return records.filter(record => {
      return JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase())
    })
  }

  onSearch = e => {
    this.setState({searchTerm: e.target.value})
  }


  render() {
    return (
      <Card>

        <Row>
          <Col span={12}
            style={{
              height: 360
            }}
          >

            <Input.Search 
              placeholder="Search for a Product"
              style={{marginBottom: 16}}
              value={this.state.searchTerm} 
              onChange={this.onSearch} 
            />

            <Table
              style={{
                zoom: .7,
                height: 360
              }}
              scroll={{ y: 380 }}
              pagination={false}
              dataSource={this.handleSearch(this.props.products, this.state.searchTerm)}
              columns={addProductsColumns}
              rowKey="productKey"
              size="small"
              onRow={(product) => {
                return {
                  onClick: () => this.productChange(product.productKey)
                }
              }}
            />

          </Col>

          <Col span={12}>


            <Row 
              style={{ 
                height: 360,
                padding: 52
              }}
            >
              {
                this.state.selectedProducts.map( (productKey, index) => ( 
                <Col
                  key={index}
                  style={{ 
                    fontWeight: 600,
                    marginBottom: 6
                  }}
                >
                  {
                    this.props.products.find( product => (
                      product.productKey === productKey
                    )).productName
                  }
                  <span style={{ position: 'absolute', right: 0 }}>
                    <Icon onClick={() => this.removeProduct(index)} style={{ fontSize: 20, cursor: 'pointer' }} type="minus-circle" />
                  </span>
                </Col>
                ))
              }
            </Row>

            <Row
              style={{
                position: 'absolute',
                left: 0,
                bottom: -6,
                width: '100%',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
              }}
            >
              <Col span={8} style={{textAlign: 'left'}}>
              </Col>
              <Col span={16}>
                <Button onClick={() => this.props.onAdd(this.state.selectedProducts)} type={"primary"}>Add</Button>
              </Col>
            </Row>

      </Col>
    </Row>
  </Card>
    )

  }
}

export default AddProductsPanel
