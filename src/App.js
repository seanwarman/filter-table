import React, { Component } from 'react';
import { connect } from 'react-redux'
import { getDivisions } from './App.actions'
import { withRouter, Link, NavLink } from 'react-router-dom';
import Routes from './Routes';
import './App.css';
import { Layout, Menu, Icon, Row, Col } from 'antd'; 
import 'antd/dist/antd.css';

import { withAuthenticator } from 'aws-amplify-react';
import config from './libs/BigglyConfig';
import { endpoints } from './libs/BigglyAPIEndpoints'; 
import { Breadcrumb } from 'antd';
import AppliedRoute from './components/AppliedRoute';
import NewPartner from './containers/partners/NewPartner';
import PropTypes from 'prop-types'
import UserAvatarAndMenu from './components/Layout/User/UserAvatarAndMenu';
import color from './libs/bigglyStatusColorPicker';

// import HeaderTitle from './components/HeaderTitle'

import Amplify, { Auth } from 'aws-amplify';
import api from './libs/apiMethods';

const stage = 'localdev'

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  },
  API: {
    endpoints: endpoints
  }
});

const SubMenu = Menu.SubMenu;
const { Header, Sider } = Layout;

class App extends Component {

  state = {
    mobileOpen: false,
    collapsed: false,
    headerTitle: 'BMS',
    openKeys: null,

    isAuthenticated: false,
    // isAdmin: false,
    user: {},
    authState: 'loading',
    cogUserSet: false,
    partner: null,
    divisions: null,

    customer: null,
    api: null,
  };

  static propTypes = {
    location: PropTypes.object.isRequired
  }

  rootSubmenuKeys = [
    'console',
    'notify',
    'siteping',
    'adstop',
    'bookinghub',
    'rankspot',
    'traki',
    'campaignhub',
  ];

  async componentDidMount() {

    // This is seperate to most of the code in this component,
    // it's setting divisions to the redux store.
    this.props.getDivisions()
    // Everything else below has nothing to do with redux...

    await this.loadDataAndSetState();   
    this.convertPathnameToMenuOption(); 
    this.setState({openKeys : []});
  }

  loadDataAndSetState = async () => {
    let stateCopy = { ...this.state };

    var cognitoUser = await Auth.currentAuthenticatedUser();
    var cognitoUserName = await cognitoUser.attributes.sub;
    var cognitoEmail = await cognitoUser.attributes.email;
    let user;

    try {
      user = await this.getUser(api(config.bigglyApiKey), cognitoUserName, cognitoEmail);
    } catch (e) {
      alert(e);
      console.log(
        'There was an error looking up a user for this cognito email: ',
        cognitoEmail
      );
    }

    // if (user.accessLevel === 'Admin') stateCopy.isAdmin = true;
    stateCopy.user = user;
    stateCopy.cogUserSet = true;

    // Check if there's a partner account
    if (user.partnerKey) {
      stateCopy.partner = await this.getPartner(api(config.bigglyApiKey), user.partnerKey)
    } else {
      // no partner on state will auto render the NewPartner component.
      console.log('No partner attached');
    }

    stateCopy.divisions = await this.getDivisions(api(user.apiKey));

    this.setState(stateCopy);
  }

  convertPathnameToMenuOption = () => {
    let pathname = this.props.location.pathname;
    return [pathname.replace(/^\/(\w+)\/.+/gi, '$1')];
  }

  getDivisions = async(api) => {
    const divisions = await api.listPublic({
      name: 't96wz179m4ly7hn9.bookingDivisions',
      columns: [
        {name: 'bookingDivName'},
        {name: 'bookingDivKey'},
        {name: 'icon'},
        {name: 'accessLevels'}
      ]
    })
    return divisions;
  }

  getPartner = async(api, partnerKey) => {
    let result = await api.getPublic({
      name: 'cjb2wo183pvguzel.partners',
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
      ],
      where: [
        `partnerKey = "${partnerKey}"`
      ]
    })
    return result;
  }

  getUser = async(api, cognitoUserName, cognitoEmail) => {
    const userQuery = {
      name: 'cjb2wo183pvguzel.users',
      columns: [
        {name: 'accessLevel'},
        {name: 'cognitoIdentityId'},
        {name: 'cognitoUserName'},
        {name: 'companyName'},
        {name: 'created'},
        {name: 'emailAddress'},
        {name: 'firstName'},
        {name: 'jsonState'},
        {name: 'lastName'},
        {name: 'partnerKey'},
        {name: 'telephone'},
        {name: 'updated'},
        {name: 'userKey'},
        {name: 'partnerKeys'},
        {
          name: 'cjb2wo183pvguzel.partners',
          columns: [
            {name: 'apiKey'},
            {name: 'partnerName'}
          ],
          where: ['partners.partnerKey = users.partnerKey']
        },
        {
          name: 'cjb2wo183pvguzel.api_keys',
          columns: [
            {name: 'access', as: 'accessLevel'}
          ],
          where: ['api_keys.partnerKey = users.partnerKey']
        },
      ],
      where: [
        `userKey = "be1a9270-a949-11e9-9e98-6fefd095aa2c"`
      ]
    };

    // Add true to the second arg so that the api sends back the
    // error object
    const user = await api.getPublic(userQuery, true)

    // If there was an error it'll have a name: 'Error' on it and so
    // don't return anything, this will need to be properly handled 
    // in future.
    if(user.name === 'Error') {
      return null
    }

    // If there is a user return it and continue...
    if(user) {

      return user

    // If BMS doesn't have a user record for this cognito account
    // create one and continue...
    } else {

      await api.createPublic({
        name: 'cjb2wo183pvguzel.users'
      }, {
        emailAddress: cognitoEmail,
        cognitoUserName
      }, 'userKey', true, true);

      const newUser = await api.getPublic(userQuery)

      return newUser;

    }

  }

  handleUpdateUser = async(apiKey, userKey, body) => {
    await this.updateUser(api(apiKey), userKey, body);
    await this.loadDataAndSetState();
  }

  updateUser = async (api, userKey, body) => {
    const result = await api.updatePublic({
      name: 'cjb2wo183pvguzel.users',
      where: [`userKey = "${userKey}"`]
    }, {
      ...body
    })
    return result;
  } 

  onOpenChange = openKeys => {
    const latestOpenKey = openKeys.find(
      key => this.state.openKeys.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : []
      });
    }
  };

  changeHeader = (icon, divisionName, array) => {
    this.setState({
      headerTitle: <div 
        className="bms-content-header-parent">
        <Icon style={{
          marginRight: 13,
          fontSize: 30 
        }} type={icon} />
        <h3 className='bms-text-light' 
        style={{ lineHeight: '1em', marginBottom: 20, marginTop: 20, paddingRight: '15px' }}>
          {array && array[array.length - 1].name}
          <Breadcrumb style={{ display: 'block', fontWeight: '300', marginTop: '5px' }}>
            <Breadcrumb.Item>{divisionName}</Breadcrumb.Item>
            {array && array.map((item, index) => (
              <Breadcrumb.Item key={index} className='breadcrumbChild'><Link to={item.url}>{item.name}</Link></Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </h3>
      </div>
    });
  }

  selectCustomer = (option) => {
    this.setState({ customer: option });
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  };

  showDrawer = () => {
    this.setState({
      visible: true
    });
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };

  onChange = e => {
    this.setState({
      placement: e.target.value
    });
  };

  signOut() {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleChangePartner = async partnerKey => {
    await this.updateUser(api(this.state.user.apiKey), this.state.user.userKey, {partnerKey});
    await this.loadDataAndSetState();
    this.props.history.push('/');
    return;
  }

  renderBookingDivision = (div,i, nested) => (
    <Menu.Item 
      key={'bookinghub'+ i}
    >
      <NavLink 
        style={{
          transform: nested ? 'unset' : 'translateX(-14px)'
        }}
        activeClassName='active-link'
        to={'/'+ div.bookingDivName.toLowerCase().split(' ').join('') +'/bookings'}
      >
        <Icon type={div.icon} />
        <span>{div.bookingDivName}</span>
      </NavLink>
    </Menu.Item>
  )

  SiderPanelAdmin() {
    const { location } = this.props;

    return (
      <Menu
        theme="light"
        mode="inline"
        // onClick={() => {
        openKeys={this.state.openKeys}
        onOpenChange={this.onOpenChange}
        defaultSelectedKeys={['/']}
        selectedKeys={[location.pathname]}
      >

      <SubMenu
        key="console"
        title={
          <span>
            <Icon type="appstore" />
            <span>Console</span>
          </span>
        }
      >
        <Menu.Item key="console_1" id="services" ref="services">
          <NavLink activeClassName='active-link' to={'/console/services'}>
            <span>Services</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="console_2" id="customers" ref="customers">
          <NavLink activeClassName='active-link' to={'/console/customers'}>
            <span>Customers</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="console_3" id="partners" ref="partners">
          <NavLink activeClassName='active-link' to={'/console/partners'}>
            <span>Partners</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="console_4" id="users" ref="users">
          <NavLink activeClassName='active-link' to={'/console/users'}>
            <span>Users</span>
          </NavLink>
        </Menu.Item>

      </SubMenu>


      <SubMenu
        key="notify"
        title={
          <span>
            <Icon type="mail" />
            <span>Notify</span>
          </span>
        }
      >
        <Menu.Item key="notify_1" id="emails" ref="emails">
          <NavLink activeClassName='active-link' to={'/notify/emails'}>
            <span>Emails</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="notify_2" id="templates" ref="templates">
          <NavLink activeClassName='active-link' to={'/notify/templates'}>
            <span>Templates</span>
          </NavLink>
        </Menu.Item>
      </SubMenu>


            {/*
              <SubMenu
                key="siteping"
                title={
                  <span>
                    <Icon type="alert" />
                    <span>SitePing</span>
                  </span>
                }
              >
                <Menu.Item key="siteping_1" id="1" ref="1">
                  <NavLink activeClassName='active-link' to={'/siteping/sites'}>
                    <span>Sites</span>
                  </NavLink>
                </Menu.Item>
              </SubMenu>
                */}

            {/*
              <SubMenu
                key="adstop"
                title={
                  <span>
                    <Icon type="thunderbolt" />
                    <span>AdStop</span>
                  </span>
                }
              >
                <Menu.Item key="adstop_1" id="1" ref="1">
                  <NavLink activeClassName='active-link' to={'/'}>
                    <span>Menu 1</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="adstop_2" id="2" ref="2">
                  <NavLink activeClassName='active-link' to={'/'}>
                    <span>Menu 2</span>
                  </NavLink>
                </Menu.Item>
              </SubMenu>
                */}

      <SubMenu
        key="bookinghub"
        title={
          <span>
            <Icon type="hdd" />
            <span>BookingHub</span>
          </span>
        }
      >
        <Menu.Item key="bookinghub_2" id="bookinghub_2" ref="bookinghub_2">
          <NavLink activeClassName='active-link' to={'/bookings-filter/bookings'}>
            <span>Bookings Filter</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="bookinghub_1" id="bookinghub_1" ref="bookinghub_1">
          <NavLink activeClassName='active-link' to={'/bookinghub/divisions'}>
            <span>Divisions</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="bookinghub_0" id="bookinghub_0" ref="bookinghub_0">
          <NavLink activeClassName='active-link' to={'/archive'}>
            <span>Archive</span>
          </NavLink>
        </Menu.Item>
        {
          this.state.divisions &&
          this.state.divisions
          .filter(div => (div.accessLevels || []).includes('Admin'))
          .map((div,i) => (
            this.renderBookingDivision(div, i, true)
          ))
        }

    </SubMenu>


            {/*
              <SubMenu
                key="rankspot"
                title={
                  <span>
                    <Icon type="rocket" />
                    <span>RankSpot</span>
                  </span>
                }
              >
                <Menu.Item key="rankspot_1" id="1" ref="1">
                  <NavLink activeClassName='active-link' to={'/rankspot/overview'}>
                    <span>Overview</span>
                  </NavLink>
                </Menu.Item>
              </SubMenu>
                */}


          {/*
            <SubMenu
              key="traki"
              title={
                <span>
                  <Icon type="sound" />
                  <span>Traki</span>
                </span>
              }
            >
              <Menu.Item key="traki_0" id="0" ref="0">
                <NavLink activeClassName='active-link' to={'/traki/websites'}>
                  <span>Websites</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="traki_1" id="1" ref="1">
                <NavLink activeClassName='active-link' to={'/traki/analytics'}>
                  <span>Analytics</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="traki_2" id="2" ref="2">
                <NavLink activeClassName='active-link' to={'/traki/calls'}>
                  <span>Calls</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="traki_3" id="3" ref="3">
                <NavLink activeClassName='active-link' to={'/traki/emails'}>
                  <span>Emails</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="traki_4" id="4" ref="4">
                <NavLink activeClassName='active-link' to={'/traki/forms'}>
                  <span>Forms</span>
                </NavLink>
              </Menu.Item>
            </SubMenu>
              */}

    <SubMenu
      key="reports"
      title={
        <span>
          <Icon type="line-chart"/>
          <span>Reports</span>
        </span>
      }
    >
      <Menu.Item key="reports_0" id="0" ref="0">
        <NavLink activeClassName="active-link" to="/reports/UnitTracker">
          <span>Unit Tracker</span>
        </NavLink>
      </Menu.Item>
      <Menu.Item key="reports_1" id="1" ref="1">
        <NavLink activeClassName="active-link" to="/reports/content-capacity-planner">
          <span>Planner</span>
        </NavLink>
      </Menu.Item>
      {/*
        <Menu.Item key="reports_2" id="2" ref="2">
          <NavLink activeClassName="active-link" to="/reports/benchmarks">
            <span>Benchmarks</span>
          </NavLink>
        </Menu.Item>
          */}
    </SubMenu>


    <SubMenu
      key="campaignhub"
      title={
        <span>
          <Icon type="sound" />
          <span>CampaignHub</span>
        </span>
      }
    >
      <Menu.Item key="campaigns_5" id="5" ref="5">
        <NavLink activeClassName='active-link' to={'/campaign-hub/divisions'}>
          <span>Divisions</span>
        </NavLink>
      </Menu.Item>
      <Menu.Item key="campaigns_4" id="4" ref="4">
        <NavLink activeClassName='active-link' to={'/campaign-hub/booking-templates'}>
          <span>Booking Templates</span>
        </NavLink>
      </Menu.Item>
      <Menu.Item key="campaigns_2" id="2" ref="2">
        <NavLink activeClassName='active-link' to={'/campaign-hub/products'}>
          <span>Products</span>
        </NavLink>
      </Menu.Item>
      <Menu.Item key="campaigns_3" id="3" ref="3">
        <NavLink activeClassName='active-link' to={'/campaign-hub/packages'}>
          <span>Packages</span>
        </NavLink>
      </Menu.Item>
      <Menu.Item key="campaigns_0" id="0" ref="0">
        <NavLink activeClassName='active-link' to={'/campaign-hub/campaigns'}>
          <span>Campaigns</span>
        </NavLink>
      </Menu.Item>
  </SubMenu>

  <Menu.Item key="5" onClick={this.signOut}>
    <Icon type="logout" />
    <span>Log out</span>
  </Menu.Item>
</Menu>
    );
  }

  SiderPanelProviderAdmin() {
    const { location } = this.props;

    // const soloNavLinkStyles = {
    //   transform: 'translateX(-16px)'
    // }

    return (

      <Menu
        theme="light"
        mode="inline"
        openKeys={this.state.openKeys}
        onOpenChange={this.onOpenChange}
        defaultSelectedKeys={['/']}
        selectedKeys={[location.pathname]}
      >
        <SubMenu
          key="console"
          title={
            <span>
              <Icon type="appstore" />
              <span>Console</span>
            </span>
          }
        >
          <Menu.Item key="console_1" id="services" ref="services">
            <NavLink activeClassName='active-link' to={'/console/services'}>
              <span>Services</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="console_2" id="customers" ref="customers">
            <NavLink activeClassName='active-link' to={'/console/customers'}>
              <span>Customers</span>
            </NavLink>
          </Menu.Item>
        </SubMenu>

        <Menu.Item key="bookinghub_2" id="bookinghub_2" ref="bookinghub_2">
          <NavLink activeClassName='active-link' to={'/bookings-filter/bookings'}>
            <span>Bookings Filter</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="bookinghub_0" id="bookinghub_0" ref="bookinghub_0">
          <NavLink activeClassName='active-link' to={'/archive'}>
            <span>Archive</span>
          </NavLink>
        </Menu.Item>
          {
            this.state.divisions &&
            this.state.divisions
            .filter(div => 
              (div.accessLevels || []).includes('Provider Admin')
            ).map((div,i) => (
              this.renderBookingDivision(div, i, false)
            ))
          }

          <SubMenu
            key="reports"
            title={
              <span>
                <Icon type="line-chart"/>
                <span>Reports</span>
              </span>
            }
          >
            <Menu.Item key="reports_0" id="0" ref="0">
              <NavLink activeClassName='active-link' to={'/reports/UnitTracker'}>
                <span>Unit Tracker</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="reports_1" id="1" ref="1">
              <NavLink activeClassName='active-link' to={'/reports/content-capacity-planner'}>
                <span>Planner</span>
              </NavLink>
            </Menu.Item>
            {/*
              <Menu.Item key="reports_2" id="2" ref="2">
                <NavLink activeClassName="active-link" to="/reports/benchmarks">
                  <span>Benchmarks</span>
                </NavLink>
              </Menu.Item>
                */}
          </SubMenu>

          <SubMenu
            key="campaignhub"
            title={
              <span>
                <Icon type="sound" />
                <span>CampaignHub</span>
              </span>
            }
          >
            <Menu.Item key="campaigns_5" id="5" ref="5">
              <NavLink activeClassName='active-link' to={'/campaign-hub/divisions'}>
                <span>Divisions</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="campaigns_4" id="4" ref="4">
              <NavLink activeClassName='active-link' to={'/campaign-hub/booking-templates'}>
                <span>Booking Templates</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="campaigns_2" id="2" ref="2">
              <NavLink activeClassName='active-link' to={'/campaign-hub/products'}>
                <span>Products</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="campaigns_3" id="3" ref="3">
              <NavLink activeClassName='active-link' to={'/campaign-hub/packages'}>
                <span>Packages</span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="campaigns_0" id="0" ref="0">
              <NavLink activeClassName='active-link' to={'/campaign-hub/campaigns'}>
                <span>Campaigns</span>
              </NavLink>
            </Menu.Item>
        </SubMenu>
        <Menu.Item key="5" onClick={this.signOut}>
          <Icon type="logout" />
          <span>Log out</span>
        </Menu.Item>
      </Menu>
    );
  }

  SiderPanelProvider() {
    const { location } = this.props;

    // const soloNavLinkStyles = {
    //   transform: 'translateX(-16px)'
    // }

    return (

    <Menu
      theme="light"
      mode="inline"
      // onClick={() => {
      //   this.setState({ collapsed : true })
      // }}
      // defaultSelectedKeys={['console_2']}
      openKeys={this.state.openKeys}
      onOpenChange={this.onOpenChange}
      defaultSelectedKeys={['/']}
      selectedKeys={[location.pathname]}
    >
      <SubMenu
        key="console"
        title={
          <span>
            <Icon type="appstore" />
            <span>Console</span>
          </span>
        }
      >
        <Menu.Item key="console_1" id="services" ref="services">
          <NavLink activeClassName='active-link' to={'/console/services'}>
            <span>Services</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="console_2" id="customers" ref="customers">
          <NavLink activeClassName='active-link' to={'/console/customers'}>
            <span>Customers</span>
          </NavLink>
        </Menu.Item>
      </SubMenu>

        <Menu.Item key="bookinghub_0" id="bookinghub_0" ref="bookinghub_0">
          <NavLink activeClassName='active-link' to={'/archive'}>
            <span>Archive</span>
          </NavLink>
        </Menu.Item>
        {
          this.state.divisions &&
          this.state.divisions
          .filter(div => 
            (div.accessLevels || []).includes('Provider')
          ).map((div,i) => (
            this.renderBookingDivision(div, i, false)
          ))
        }

        <SubMenu
          key="reports"
          title={
            <span>
              <Icon type="line-chart"/>
              <span>Reports</span>
            </span>
          }
        >
          <Menu.Item key="reports_0" id="0" ref="0">
            <NavLink activeClassName='active-link' to={'/reports/UnitTracker'}>
              <span>Unit Tracker</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="reports_1" id="1" ref="1">
            <NavLink activeClassName='active-link' to={'/reports/content-capacity-planner'}>
              <span>Planner</span>
            </NavLink>
          </Menu.Item>
          {/*
            <Menu.Item key="reports_2" id="2" ref="2">
              <NavLink activeClassName="active-link" to="/reports/benchmarks">
                <span>Benchmarks</span>
              </NavLink>
            </Menu.Item>
              */}
        </SubMenu>
        <Menu.Item key="5" onClick={this.signOut}>
          <Icon type="logout" />
          <span>Log out</span>
        </Menu.Item>
      </Menu>
    );
  }

  SiderPanelSupplier() {
    const { location } = this.props;

    // const soloNavLinkStyles = {
    //   transform: 'translateX(-16px)'
    // }

    return (
      <Menu
        theme="light"
        mode="inline"
        openKeys={this.state.openKeys}
        onOpenChange={this.onOpenChange}
        defaultSelectedKeys={['/']}
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key="bookinghub_0" id="bookinghub_0" ref="bookinghub_0">
          <NavLink activeClassName='active-link' to={'/archive'}>
            <span>Archive</span>
          </NavLink>
        </Menu.Item>
        {
          this.state.divisions &&
          this.state.divisions
          .filter(div => 
            (div.accessLevels || []).includes('Supplier') ||
            (div.accessLevels || []).includes('Supplier Admin')
          )
          .map((div,i) => (
            this.renderBookingDivision(div, i, false)
          ))
        }

        <SubMenu
          key="reports"
          title={
            <span>
              <Icon type="line-chart"/>
              <span>Reports</span>
            </span>
          }
        >
          <Menu.Item key="reports_0" id="0" ref="0">
            <NavLink activeClassName='active-link' to={'/reports/UnitTracker'}>
              <span>Unit Tracker</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="reports_1" id="1" ref="1">
            <NavLink activeClassName='active-link' to={'/reports/content-capacity-planner'}>
              <span>Planner</span>
            </NavLink>
          </Menu.Item>
          {/*
            <Menu.Item key="reports_2" id="2" ref="2">
              <NavLink activeClassName="active-link" to="/reports/benchmarks">
                <span>Benchmarks</span>
              </NavLink>
            </Menu.Item>
              */}
        </SubMenu>

      <Menu.Item key="5" onClick={this.signOut}>
        <Icon type="logout" />
        <span>Log out</span>
      </Menu.Item>
    </Menu>
    );
  }

  HeaderPanel() {
    return (
      <Header
        style={{
          background: color('status', 'colorLabel', 'blue').color,
          color: '#ffffff',
          padding: 0,
          height: 'inherit',
          position: 'fixed', 
          zIndex: 11, 
          left: this.state.collapsed ? 80 : 200,
          right: '0',

        }}
      >
        
      <Row type="flex" align="middle">
        <Col span={24}>
          <div style={{
            display: "flex",
            alignContent: "center",
            paddingLeft: "15px"
          }}> 
            { this.state.collapsed ?
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>              
              <Icon
                onClick={() => this.toggleCollapse()}
                style={{ fontSize: 20 }}
                type="caret-right" />
            </div>
            :
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>
              <Icon
                onClick={() => this.toggleCollapseLeave()}
                style={{ fontSize: 20 }}
                type="caret-left" />
            </div>
            }

            <div className={'bms_pageHeader'}>{this.state.headerTitle}</div>

          </div>
        </Col>
      </Row>
    </Header>
    );
  }

  toggleCollapse = () => {

    this.setState({
      collapsed: !this.state.collapsed,
      openKeys : []
    })

  }

  toggleCollapseLeave = () => {
    // remove active class from submenu as this appears when sider is closed
    document.querySelector( '.ant-menu-submenu' );

    this.setState({
      collapsed: true,
      openKeys : []
    });

  }

  render() {

    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      changeHeader: this.changeHeader,
      userId: this.state.userId,
      user: this.state.user,
      cogUserName: this.state.user.cognitoUserName,
      customer: this.state.customer,
      handleUpdateUser: this.handleUpdateUser,
      bookingDivisions: this.state.divisions,
      api: api(this.state.user.apiKey),
      mountApp: this.componentDidMount.bind(this),
      stage,
    };

    return (
      <div>
        <Layout style={{ minHeight: '100vh', paddingLeft: '0px', paddingRight: '0px' }}>
          <Sider
            theme="light"
            collapsed={this.state.collapsed}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'inherit',
                maxHeight: '94px',
                margin: '0',
                left: '0',
                right: '0',
                width: '100%',
                maxWidth: this.state.collapsed ? 80 : 200,
                background: 'white',
                position: 'fixed',
                zIndex: 20
              }}
              className="bms_logo logo">
              <h1 style={{ color: color('template', 'colorLabel', 'blue').color, fontWeight: 'bold', marginBottom: '0' }}>
                {this.state.collapsed ? 'B' : 'BMS'}
              </h1>
            </div>
            <div 
              className="bms_sidebar_scrollable"
              style={{
                maxWidth: this.state.collapsed ? 80 : 200,
              }}
            >

              {
                this.SiderPanelAdmin()
              }

            </div>
            {/*
            <UserAvatarAndMenu
              width={this.state.collapsed ? 80 : 200}
              collapse={this.state.collapsed}
              user={this.state.user}
              update={this.handleChangePartner}
            />
                */}
          </Sider>

          <Layout>
            {this.HeaderPanel()}
            <div id="app-wrapper" className="App auth container-fluid">
              <Routes hfunc={this.changeHeader} childProps={childProps} />
            </div>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default connect(
  null,
  {
    getDivisions
  }
)(withRouter(App))
