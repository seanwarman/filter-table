import React, { Component } from 'react';
import BookingForm from '../../../components/BookingForm';
import { message, Icon } from 'antd';

const createdUserKey = 'cafc9f20-deae-11e9-be90-7deb20e96c9e'

export default class TemplateForm extends Component {

  state = {
    unload: false,
  }

  reload = () => {
    this.setState({unload: true});
    setTimeout(() => {
      this.setState({unload: false});
    }, 500);
  }

  flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return this.flattenArr(flat).concat(toFlatten instanceof Array ? this.flattenArr(toFlatten) : toFlatten);
    }, []);
  }

  handleValidation = state => {
    return [
      { value: state.formFields.bookingName },
      // This last option makes the button disable after clicking save
      { value: state.buttonDisabled }
    ];
  }

  handleForm = async (bookingFormState, initialStatus) => {
    console.log('Update me! ', bookingFormState, initialStatus);
    const { jsonForm, formFields, template, templateSelection } = bookingFormState;
    const bookingDivKey = templateSelection[0].bookingDivKey
    const bookingName = formFields.bookingName;
    const flagged = formFields.flagged;
    let result = await this.createTemplate({
      bookingName,
      flagged,
      bookingDivKey,
      createdUserKey,
      jsonForm: JSON.stringify(jsonForm), 
      colorLabel: template.colorLabel,
      tmpKey: template.tmpKey,
    });
    if((result || {}).affectedRows === 1) {
      message.success('Template saved!');
      this.reload();
    }
  }

  createTemplate = async bookingTemplate => {
    const result = await this.props.api.createPublic({
      name: 'bms_campaigns.bookingTemplates',
    }, bookingTemplate, 'bookingTmpKey');
    return result;
  }
  
  render() {
    return (
      this.state.unload ?
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon 
          style={{
            fontSize: 90,
            color: '#2ba9e0',
          }}
          type="loading" 
        />
      </div>
      :
      <BookingForm 
        {...this.props}
        update={this.handleForm}
        removeRequiredTags={true}
        validation={this.handleValidation}
        saveStatusButtons={['Draft']}
        removeFields={['customerKey', 'quantity', 'dueDate', 'flags']}
        changeHeaderProps={['sound', 'CampaignHub', [
          { name: 'Booking Templates', url: '/campaign-hub/booking-templates' },
          { name: 'Template Form', url: '/campaign-hub/booking-templates/form' }
        ]]}
      />
    )
  }
}
