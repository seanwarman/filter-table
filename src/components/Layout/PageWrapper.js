import React, {Component} from 'react';
import {Layout, Input, Col, Row, Card, Empty, Icon} from 'antd';
const { Content } = Layout;
const { Search } = Input;

class PageWrapper extends Component {
  render() {
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}
      >
        {
          this.props.onSearch &&
          <Search
            onChange={e => this.props.onSearch(e.target.value)}
            placeholder="Search"
            style={{ marginBottom: '24px' }}
          />
        }
        {
          this.props.header &&
          <Row gutter={16} style={{marginBottom: 16}}>
            <Col xs={24}>
              <Card bordered={false} style={{'width': '100%'}}>
                {this.props.header}
              </Card>
            </Col>
          </Row>
        }
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{'width': '100%'}}>
              {
                this.props.plus &&
                <div style={{textAlign: 'right', marginBottom: 16}}>
                  <Icon 
                    style={{margin: '15px 0', fontSize: '1.6em'}} 
                    type="plus-circle"
                    onClick={this.props.plus}
                  />
                </div>
              }
              {
                this.props.loading ?
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                this.props.children
              }
            </Card>
          </Col>
        </Row>
      </Content>
    );
  }
}

export default PageWrapper;