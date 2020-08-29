import React, { Component } from 'react';
import { Button, Layout, Form, Card, Input, DatePicker, Row } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
const { Content } = Layout;
let id = 0;
export default class BigglyBookingForm extends Component {

    // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
    // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
    // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

    validateForm = (jsonForm) => {
        let result = jsonForm.findIndex( key => (
            (key.value === undefined || key.value === null || key.value.length === 0)
        ));
        if(result === -1) return false;
        return true;
    }

    momentValue = (value) => {
        if(!value) return null;
        return new moment(value);
    }

    inputValue = (value) => {
        return value;
    }

    // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
    // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
    // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

    renderField = (field) => {
        id++;
        let fieldType;
        switch (field.type) {
            case 'input':
                fieldType = <Input 
                                onChange={e => this.props.changeField(field, e.target.value)} 
                                value={this.inputValue(field.value)} 
                                label={field.label} 
                                className={'bms-input'}>
                            </Input>
                break;
            case 'textarea':
                fieldType = <TextArea 
                                onChange={e => this.props.changeField(field, e.target.value)}
                                value={this.inputValue(field.value)}
                                label={field.label}
                                className={'bms-textarea'}>
                            </TextArea>;
                break;
            case 'date':
                let date = null;
                fieldType = <DatePicker 
                                onChange={moment => {
                                    if(moment) date = moment.toDate();
                                    this.props.changeField(field, date);
                                }}
                                value={this.momentValue(field.value)}
                                label={field.label}
                                className={'bms-date'}>
                            </DatePicker>;
                break;
            case 'number':
                fieldType = <Input
                                onChange={e => this.props.changeField(field, e.target.value)}
                                value={this.inputValue(field.value)}
                                type="number" 
                                label={field.label} 
                                style={{
                                    width: '60px'
                                }}>
                            </Input>;
                break;
        }
        return (
            <Form.Item key={id} label={field.label}>
                {fieldType}
            </Form.Item>
        );
    };

    render() {
        const { jsonForm, submitForm, title } = this.props;
        return (
            <Content style={{
                margin: '24px 16px', padding: 24, minHeight: 280,
            }}
            >
                <Card>
                    <h1>{title && title}</h1>
                    {jsonForm && jsonForm.map( field => (
                        this.renderField(field)
                    ))}
                    <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            onClick={e => submitForm(e)}
                            disabled={this.validateForm(jsonForm)}
                            htmlType="button" 
                            type="primary" 
                        >Save</Button>
                    </Row>
                </Card>
            </Content>
        );
    }
}
