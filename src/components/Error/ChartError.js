import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Button, Divider, Icon } from 'antd';

class ChartError extends Component {
  render() {
    const {
      title,
      message,
      buttonLink,
      dividerType,
      headerIcon,
      buttonText,
      hbgc,
      htc,
      buttonType
    } = this.props;

    return (
      <Fragment>
        <Card
          headStyle={{
            backgroundColor: hbgc,
            color: htc,
            marginBottom: '0px'
          }}
          bodyStyle={{ backgroundColor: '#ffffff' }}
          title={headerIcon ? [<Icon type={headerIcon} />, ' ' + title] : title}
        >
          {message}
          <Divider type={dividerType} />
          {/* Using NavLink is better than using href on the button - doesn't do a page refresh and instead uses routes */}
          <NavLink to={buttonLink}> 
            <Button type={buttonType}>
              <Icon type="left" />
              {buttonText}
            </Button>
          </NavLink>
        </Card>
      </Fragment>
    );
  }
}

ChartError.defaultProps = {
  title: 'Default title - please change inside of template',
  message: 'This is a default message about your error',
  hbgc: '#B089D6', // Header background colour
  htc: '#ffffff', // Header text colour
  headerIcon: 'clock-circle',
  buttonLink: '/',
  buttonText: 'Enter some text to replace the default of the prop',
  buttonType: 'primary',
  dividerType: 'horizontal'
};

// Type checking
const p = PropTypes;

ChartError.propTypes = {
  title: p.string.isRequired,
  message: p.string.isRequired,
  hbgc: p.string.isRequired,
  htc: p.string.isRequired,
  headerIcon: p.string.isRequired,
  buttonLink: p.string.isRequired,
  buttonText: p.string.isRequired,
  buttonType: p.string.isRequired,
  dividerType: p.string.isRequired
};

export default ChartError;
