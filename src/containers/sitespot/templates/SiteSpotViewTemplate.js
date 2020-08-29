import React, { Component } from "react";
// import { API, } from "aws-amplify";
import "../../../App.css";
import {Layout, Row, Col, Card, Form, Input, Button} from "antd";
import {Controlled as CodeMirror} from 'react-codemirror2'

import 'codemirror/lib/codemirror.css';
require('codemirror/theme/neat.css');

const { Content } = Layout;

export default class SiteSpotNewTemplate extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            template: [],
            templateName: "",
            templateCode: "",
            templateBg: "#F1F1F1",
            contentBg: "#FFFFFF",
            pars: [],

        };

    }

    async componentDidMount() {

        try {

            // this.props.changeHeader("New template");
            this.props.changeHeader('global','SiteSpot',[{name: 'Templates', url: '/sitespot/templates'},{name: 'View Template', url: '/sitespot/templates'}]);

            const templates = await this.getTemplate();
            const template = templates[0];

            const {templateName, templateCode, templateBg, contentBg } = template;

            this.setState({
                templateName,
                templateCode,
                templateBg,
                contentBg,
                template
            });

            this.splitPars(templateCode);



        } catch (e) {
            alert(e);
        }
    }

    splitPars(value) {

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

    handleHtmlChange(value) {

        this.setState({templateCode: value});

        this.splitPars(value);


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

        await this.updateTemplate(template);

        this.props.history.push('/notify/templates');



    }

    handleDuplicate = async event => {

        event.preventDefault();

        const template = {
            templateName: this.state.templateName + " [COPY]",
            templateCode: this.state.templateCode,
            templateBg: this.state.templateBg,
            contentBg: this.state.contentBg
        };

        console.log(template);

        await this.duplicateTemplate(template);

        this.props.history.push('/notify/templates');



    }

    duplicateTemplate(template) {

      return this.props.api.createPublic({
        name: 'bms_notify.templates'
      }, template, 'templateKey')
    }

    updateTemplate(template) {

      return this.props.api.updatePublic({
        name: 'bms_notify.templates',
        where: [
          `templateKey = "${this.props.match.params.templateKey}"`
        ]
      }, template)
    }
    getTemplate() {

      return this.props.api.getPublic({
        name: 'bms_notify.templates',
        where: [
          `templateKey = "${this.props.match.params.templateKey}"`
        ]
      })
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
                                <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={"primary"}>Update</Button>
                                <Button onClick={this.handleDuplicate} type={"secondary"}>Duplicate</Button>

                            </Form>
                        </Card>

                        <Card title="Object" bordered={false} style={{'width': '100%', marginTop: '15px'}}>

                            {pars.length > 0 ?

                                <div>
                                    &#123;<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;fromEmail: <i>this.state.fromEmail</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;fromName: <i>this.state.fromName</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;toEmail: <i>this.state.toEmail</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;toName: <i>this.state.toName</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;emailTitle: <i>this.state.emailTitle</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;emailSubject: <i>this.emailSubject</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;sendOn: <i>this.sendOn</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;templateKey: <i>this.templateKey</i>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;parameters: &#123;

                                    { pars.map((par, i) => {

                                        return (
                                            <div key={i}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{par} : <i>[your {par} text]</i>,</div>
                                        )
                                    })}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
                                    &#125;
                                </div>
                                : null

                            }



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
