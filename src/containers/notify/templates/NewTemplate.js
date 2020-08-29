import React, { Component } from "react";
import "../../../App.css";
import {Layout, Row, Col, Card, Form, Input, Button} from "antd";
import {Controlled as CodeMirror} from 'react-codemirror2'

import 'codemirror/lib/codemirror.css';
require('codemirror/theme/neat.css');

const { Content } = Layout;

export default class NewTemplate extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            templateName: "",
            templateCode: "",
            templateBg: "#F1F1F1",
            contentBg: "#FFFFFF",
            pars: [],

        };

        this.inputChange = this.inputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.handleHtmlChange = this.handleHtmlChange.bind(this);

    }

    async componentDidMount() {

        try {

            // this.props.changeHeader("New template");
            this.props.changeHeader('mail','BookingHub',[{name: 'New Templates', url: '/bookinghub/newtemplate'}]);


        } catch (e) {
            alert(e);
        }
    }

    handleHtmlChange(value) {

        this.setState({templateCode: value});

        var pars = [];

        for (var i = 0; i < value.length; i++) {


            if (value[i] === '[') {

                var e = value.indexOf(']', i);

                if (e > i) {

                    pars.push(value.substring(i+1, e));
                }

            }

        }

        this.setState({pars});


    }

    validateForm() {
        return this.state.templateName.length > 0;
    }


     handleSubmit = async event => {

        event.preventDefault();

        const template = {
            templateName: this.state.templateName,
            templateCode: this.state.templateCode,
            templateBg: this.state.templateBg,
            contentBg: this.state.contentBg
        };

        console.log(template);

        await this.createTemplate(template);

       this.componentDidMount()



    }

    createTemplate(template) {
        return this.props.api.createAdmin({
            name: 'bms_notify.templates',
        }, template, 'templateKey');
    }

    inputChange = e => {

        this.setState({
            [e.target.id.toString()]: e.target.value
        });

    }


    render() {

        var { pars } = this.state;

        return (

            <Content style={{
                margin: '94px 16px 24px', padding: 24, minHeight: 280,
            }}
            >

                <Row gutter={16}>
                    <Col span={6}>
                        <Card title="Template information" bordered={false} style={{'width': '100%'}}>

                            <Form  labelCol={{span: 9}} wrapperCol={{span: 15}}>
                                <Form.Item label={"Name"}>
                                    <Input required id="templateName" type={"text"} onChange={this.inputChange} value={this.state.templateName}/>
                                </Form.Item>
                                <Form.Item label={"Body Bg"}>
                                    <Input required id="templateBg" type={"text"} onChange={this.inputChange} value={this.state.templateBg}/>
                                </Form.Item>
                                <Form.Item label={"Content Bg"}>
                                    <Input required id="contentBg" type={"text"} onChange={this.inputChange} value={this.state.contentBg}/>
                                </Form.Item>
                                <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={"primary"}>Save</Button>

                            </Form>
                        </Card>

                        <Card title="Object" bordered={false} style={{'width': '100%', marginTop: '15px'}}>



                                <div>
                                    &#123;<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;BRN: <i>[BMS Relational Node]</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;fromEmail: <i>this.state.fromEmail</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;fromName: <i>this.state.fromName</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;toEmail: <i>this.state.toEmail</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;toName: <i>this.state.toName</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;emailTitle: <i>this.state.emailTitle</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;emailSubject: <i>this.emailSubject</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;sendOn: <i>this.sendOn</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;templateKey: <i>this.templateKey</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;parameters: JSON.stringify(&#123;

                                    { pars.length > 0 ? pars.map((par, i) => {

                                        return (
                                            <div key={i}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{par} : <i>[your {par} text]</i>,</div>
                                        )
                                    }) : null}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;)<br/>
                                    &#125;
                                </div>




                        </Card>
                    </Col>

                    <Col span={18}>
                        <CodeMirror
                            value= {this.state.templateCode}
                            options={{
                                mode: 'html',
                                theme: 'neat',
                                lineNumbers: true,
                                autoCursor: true,
                            }}
                            onBeforeChange={(editor, data,value) => {
                                this.handleHtmlChange(value);
                            }}
                        />

                        <Card title="Preview" bordered={false} style={{'width': '100%', marginTop: 15}}>

                            <div className={"templateHolder"} style={{backgroundColor: this.state.templateBg}}>

                                <div className={"templateBody"} style={{backgroundColor: this.state.contentBg}}>

                                    <div dangerouslySetInnerHTML={{__html: this.state.templateCode}} />

                                </div>
                            </div>
                        </Card>
                    </Col>


                </Row>


            </Content>

        );
    }
}
