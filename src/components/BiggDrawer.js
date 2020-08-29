import React, { Component } from 'react';
import { Drawer, Row, Col } from 'antd';

class BiggDrawer extends Component {
    render() {
        const { showDrawer, content, header, close, invalidMessage, buttons } = this.props;
        return (
            <div>
                <Drawer
                    title={header}
                    width={620}
                    onClose={close}
                    visible={showDrawer}
                >
                    { content }
                    <div style={{ color: '#ef5454', display: 'flex', justifyContent: 'flex-end' }}>{invalidMessage}</div>
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
                            <Col span={24}>
                                { buttons }
                            </Col>
                        </Row>
                    </div>
                </Drawer>
            </div>
        );
    }
}

export default BiggDrawer;