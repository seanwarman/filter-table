import React, { Component, Fragment } from 'react';
import {Avatar, Divider, Drawer, Icon} from 'antd';
import color from '../../../libs/bigglyStatusColorPicker';
import './UserAvatarAndMenu.css';
import api from '../../../libs/apiMethods';

export default class UserAvatarAndMenu extends Component {
  state = {
    partnerDrawerOpen: false,
    partners: null
  }
  
  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀

  async componentDidMount() {
    let stateCopy = {...this.state};

    stateCopy.partners = await this.getPartners(api(this.props.user.apiKey));
    this.loadDataAndSetState(stateCopy);
  }

  loadDataAndSetState = stateCopy => {
    if(!stateCopy) stateCopy = {...this.state};

    stateCopy.partnerDrawerOpen = false;
    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀█ ░▀░
  // █▄▄█ █░░█ ▀█▀
  // ▀░░▀ █▀▀▀ ▀▀▀

  getPartners = async (api) => {
    let result = await api.listPublic({
      name: 'Biggly.partners',
      columns: [
        {name: 'apiKey'},
        {name: 'created'},
        {name: 'partnerAd1'},
        {name: 'partnerAd2'},
        {name: 'partnerAd3'},
        {name: 'partnerKey'},
        {name: 'partnerName'},
        {name: 'partnerPostCode'},
        {name: 'partnerTelephone'},
        {name: 'partnerTown'},
        {name: 'updated'},
      ]
    });
    return result;
  }

  // █▀▀ ▀▀█▀▀ █░░█ █░░ █▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ █░░ █▀▀ ▀▀█
  // ▀▀▀ ░░▀░░ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀

  avatarStyles = () => ({
    fontWeight: 'bold',
    fontSize: '1.5em',
    background: color('template', 'colorLabel', 'blue').color,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  })

  wrapperStyles = () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    height: '100%',
    maxHeight: '10%',
    margin: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100%',
    maxWidth: this.props.width + 'px',
    background: '#ffffff',
  })

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleDrawer = () => {
    this.setState({partnerDrawerOpen: !this.state.partnerDrawerOpen})
  }

  handlePartnerSelect = async partnerKey => {
    await this.props.update(partnerKey)
    this.loadDataAndSetState();
  }

  // █░░█ ▀▀█▀▀ ░▀░ █░░ ░▀░ ▀▀█▀▀ ░▀░ █▀▀ █▀▀
  // █░░█ ░░█░░ ▀█▀ █░░ ▀█▀ ░░█░░ ▀█▀ █▀▀ ▀▀█
  // ░▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀
  
  stripUserName = (firstname, lastname) => {
    let fName = firstname.substring(1, 0);
    let sName = lastname.substring(1, 0);
    return fName + sName;
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAvatar = user => (
    <div
      style={this.wrapperStyles()}
      className="bms_logo logo"
      onClick={this.state.partnerDrawerOpen ? null : this.handleDrawer}
    >
      <span
        className={this.state.partnerDrawerOpen ? 'bms_avatar' : 'bms_avatar bms_avatar_hover'}
      >
        {!this.props.collapse ?
          user.accessLevel &&
            <Fragment><h4 style={{ marginBottom: '0', fontWeight: 700 }}>{user.accessLevel}</h4><Divider type='vertical' /></Fragment>
            : null
        }
        <Avatar
          size="large"
          style={this.avatarStyles()}
          shape='circle'>{
            this.stripUserName(user.firstName, user.lastName)
          }
        </Avatar>
      </span>
    </div>
  )

  renderDrawerHeader = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        height: 'inherit',
        maxHeight: '94px',
        margin: '0',
        left: '0',
        right: '0',
        width: '100%',
        maxWidth: '200px',
        background: 'white',
      }}
      className="bms_logo logo">
      <h1 style={{ color: color('template', 'colorLabel', 'blue').color, fontWeight: 'bold', marginBottom: '0' }}>
        BMS
      </h1>
    </div>
  )

  renderDrawer = (user, partners) => {
    return <Drawer
      width={200}
      visible={this.state.partnerDrawerOpen}
      closable
      placement="left"
      onClose={this.handleDrawer}
    >
      {this.renderDrawerHeader()}
      <div style={{paddingTop: 70}}>
        {
          user.partnerKeys.map((userPartnerKey, i) => (
            userPartnerKey === user.partnerKey ?
            <div
              key={i}
              style={{color: 'white'}}
              className="bms_partner bms_partner_selected"
            >
              <Icon style={{marginRight: 10}} type="team" />
              {partners.find(partner => partner.partnerKey === userPartnerKey).partnerName}
            </div>
            :
            <div
              key={i}
              onClick={() => this.handlePartnerSelect(userPartnerKey)}
              className="bms_partner bms_partner_unselected"
            >
              <Icon style={{marginRight: 10}} type="team" />
              {partners.find(partner => partner.partnerKey === userPartnerKey).partnerName}
            </div>
          ))
        }
        {this.renderAvatar(user)}
      </div>
    </Drawer>
  }
  
  renderUserAvatarInformation = user => {
    return (
      this.renderAvatar()
    )
  }

  render() {
    return (
      <div>
        {
          this.state.partners &&
          this.renderDrawer(this.props.user, this.state.partners)
        }
        {this.renderAvatar(this.props.user)}
      </div>

    ) 
  }
}
