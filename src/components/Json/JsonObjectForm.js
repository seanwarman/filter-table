import React, {Component} from 'react';
import '../../App.css';
import {Select, Form, Input, Icon, Button, Row, Col, DatePicker} from 'antd';
import './JsonFormFill.css';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import JsonBuilder from '@seanwarman/json-form-builder';

const validator = JsonBuilder('jsonFormValidator');

class JsonObjectForm extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    saved: true,
    saving: false,
    loading: true,
    record: {},
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  componentDidMount() {
    this.loadDataAndSetState()
  }

  loadDataAndSetState() {
    let record = {};
    if(this.props.record) record = JSON.parse(JSON.stringify(this.props.record));
    this.setState({record, loading: false, saved: true, saving: false});
  }

  onchangeForm = (key, value) => {
    let stateCopy = {...this.state};
    stateCopy.record[key] = value;
    this.setState(stateCopy);
  }

  // █▀▀ ░▀░ █▀▀ █░░ █▀▀▄   ▀▀█▀▀ █░░█ █▀▀█ █▀▀ █▀▀
  // █▀▀ ▀█▀ █▀▀ █░░ █░░█   ░░█░░ █▄▄█ █░░█ █▀▀ ▀▀█
  // ▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀░   ░░▀░░ ▄▄▄█ █▀▀▀ ▀▀▀ ▀▀▀

  string = (key, value, i) => (
    <Form.Item key={i} label={key}>
      <Input
        value={value}
        size="small"
        className="bms-input-preview"
        onChange={e => this.onChangeForm(key, e.target.value)}
      ></Input>
    </Form.Item>
  )

  number = (key, value, i) => (
    <Form.Item key={i} label={key}>
      <Input
        value={value}
        type="number"
        onChange={e => this.onChangeForm(key, e.target.value)}
        className="bms-number-preview"
      ></Input>
    </Form.Item>
  )

  returnByType = (key, value) => {
    let type = typeof value;
    if(!this[type]) {
      console.log('This type is not supported by the JsonObjectForm: ', type);
      return;
    }
    return this[type](key, value);
  }
  
  render() {
    const {record} = this.props;
    return (
      record &&
      Object.keys(record).map(key => this.returnByType(key, record[key]))   
    );
  }
}

export default JsonObjectForm;