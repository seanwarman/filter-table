import { Popover, Form, InputNumber, Button, Card, Col, Icon, Input, Layout, message, Row, Table, Tabs, Badge, Divider } from 'antd';
import React, { Component } from 'react';
import Highlighter from 'react-highlight-words';
import BiggDrawer from '../../components/BiggDrawer';
import BigglyGetMenu from '../../components/BigglyGetMenu';

const { Content } = Layout;
let id = 0;

class Sites extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    searchText: '',
    form: {
      pingLabel: '',
      siteName: null,
      customerSiteKey: null,
      partnerKey: null,
      customerKey: null,
      nextPing: null,
      pingFrequency: 1800000,
      selectedSiteArray: null,
      selectedSite: null,
      active: null,
      siteUrl: null,
      statusCode: null
    },
    formHasChanged: false,
    deleteOptionVisible: false,
    message: '',
    showDrawer: false,
    addSitePing: true,
    sites: null,
    partners: [],
    openingDrawClearSitePingMenu: true,
    runningQueue: false,
    selectedRows: [],
    selectedRowKeys: [],
    addingSiteRecord: false
  };

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {

    this.props.changeHeader('alert', 'SitePing', [
      { name: 'Sites', url: '/siteping/sites' }
    ]);
    
    let stateCopy = { ...this.state };
    this.loadDataAndSetState(stateCopy);
  }

  componentDidUpdate() {
    // This is a bit of a hack. Ant Design has no way of clearing the
    // Cascader menu without clicking the little 'x' but it will clear
    // if you re-render it.
    if (!this.state.openingDrawClearSitePingMenu) {
      this.setState({ openingDrawClearSitePingMenu: true });
    }
  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  ping = async url => {
    const result = await this.props.api.createPublic({
      name: 'bms_siteping.pings',
    }, {
      url
    }, 'pingKey');
    return result;
  };

  postPing = async site => {
    let result = await this.props.api.createPublic({
      name: 'bms_siteping.site_ping',
    }, site, 'sitepingKey')

    return result;
  };

  updatePing = async site => {
    let result = await this.props.api.updatePublic({
      name: 'bms_siteping.site_ping',
      where: [
        `sitepingKey = "${site.sitepingKey}"`
      ]
    }, site)

    return result;
  };

  deletePing = async () => {
    let stateCopy = { ...this.state };
    let site = stateCopy.form;
    await this.props.api.deletePublic({
      name: 'bms_siteping.site_ping',
      where: [
        `sitepingKey = "${site.sitepingKey}"`
      ]
    })
    stateCopy.deleteOptionVisible = false;
    stateCopy.showDrawer = false;
    this.loadDataAndSetState(stateCopy);
    message.warn('Ping deleted.');
  };

  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  loadDataAndSetState = async stateCopy => {

    if(!stateCopy) stateCopy = { ...this.state };
    stateCopy.sites = await this.props.api.listPublic({
      name: 'bms_siteping.site_ping',
      columns: [
        {name: 'sitepingKey'},
        {name: 'partnerKey'},
        {name: 'Biggly.partners', columns: [
          {name: 'partnerName'}
        ], where: [
          'partners.partnerKey = site_ping.partnerKey'
        ]},
        {name: 'customerKey'},
        {name: 'Biggly.customers', columns: [
          {name: 'customerName'}
        ], where: [
          'customers.customerKey = site_ping.customerKey'
        ]},
        {name: 'customerSiteKey'},
        {name: 'Biggly.customerSites', columns: [
          {name: 'siteName'}
        ], where: [
          'customerSites.customerSiteKey = site_ping.customerSiteKey'
        ]},
        {name: 'pingFrequency'},
        {name: 'pingLabel'},
        {name: 'active'},
        {name: 'siteUrl'},
        {name: 'statusCode'},
        {name: 'status'},
      ]
    })
    console.log('stateCopy.sites :', stateCopy.sites);
    stateCopy.runningQueue = false;

    stateCopy.addingSiteRecord = false;

    this.setState(stateCopy);
  };

  convertMsToDateFromNow = pingFreq => {
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + pingFreq);
    return date.toUTCString();
  };

  menuSelectionFunction = (option, selectedOptions) => {
    console.log('option: ', option, selectedOptions);
    let stateCopy = { ...this.state };

    stateCopy.formHasChanged = true;

    stateCopy.form.selectedSite = option.label;
    stateCopy.form.selectedSiteArray = selectedOptions;
    stateCopy.form.siteName = option.value;
    stateCopy.form.customerKey = option.customerKey;
    stateCopy.form.customerSiteKey = option.customerSiteKey;
    stateCopy.form.partnerKey = selectedOptions[0].partnerKey;
    stateCopy.form.siteUrl = option.siteUrl;

    this.setState(stateCopy);
  }

  inputChangeFunc = siteObject => {
    let stateCopy = { ...this.state };
    Object.keys(siteObject).forEach(key => {
      stateCopy.form[key] = siteObject[key];
    });
    stateCopy.formHasChanged = true;
    this.setState(stateCopy);
  };

  convertMsToDateFromNow = pingFreq => {
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() + pingFreq);
    return date;
  };

  startQueue = async statusChange => {
    let stateCopy = { ...this.state };
    stateCopy.runningQueue = true;
    this.setState(stateCopy);

    let count = 0;

    if(statusChange === 'play') {
      for await (let site of stateCopy.selectedRows) {
        let result;
        try {
          result = await this.ping(site.siteUrl);
        } catch (err) {
          throw err;
        }
        // If the otherResponse is 'RequestError' it means the site url is bad
        if(result.otherResponse !== 'RequestError') {
          count++;
          site.active = 'active';
          site.nextPing = this.convertMsToDateFromNow(site.pingFrequency);
          site.statusCode = result.statusCode;

          const updateResult = await this.props.api.updatePublic({
            name: 'bms_siteping.site_ping',
            where: [
              `sitepingKey = "${site.sitepingKey}"`
            ]
          }, {
            active: site.active,
            nextPing: site.nextPing,
            statusCode: site.statusCode
          })
          if(!updateResult) count--;
        }
      }
    } else if(statusChange === 'pause') {
      for await (let site of stateCopy.selectedRows) {
        count++;
        site.active = 'inactive';
        const result = await this.props.api.updatePublic({
          name: 'bms_siteping.site_ping',
          where: [
            `sitepingKey = "${site.sitepingKey}"`
          ]
        }, { active: site.active })
        if(!result) count--;
      }
    }
    if(count > 0) {
      message.success(`A total of ${count} sites have been updated`);
    } else {
      message.error('The selected sites cannot be changed to Live.  If you think this is an error try checking the url of the site in Console.', 8);
    }
    stateCopy.selectedRows = null;
    stateCopy.selectedRowKeys = null;
    this.loadDataAndSetState(stateCopy);
  };

  getStatusAndSubmit = async (stateCopy) => {

    this.setState({ addingSiteRecord: true });

    if(!stateCopy) stateCopy = { ...this.state };
    let result;
    try {
      result = await this.ping(stateCopy.form.siteUrl);
    } catch (err) {
      console.log('There was an error calling the ping method ', err);
    }
    console.log('ping result: ', result);
    stateCopy.form.statusCode = result.statusCode;
    if (result.statusCode !== 200) {
      message.error('This site doesn\'t yet exist. Once it\'s up you\'ll be able to take make ping record Live', 2);
      stateCopy.form.active = 'inactive';
    } else if(!stateCopy.runningQueue) {
      stateCopy.form.active = 'active';
    }
    this.handleFormSubmit(stateCopy);

    // this.setState({ form: stateCopy.form });

  };

  handleFormSubmit = async stateCopy => {
    if (!stateCopy) {
      stateCopy = { ...this.state };
    }

    if (!this.handleIsValid(stateCopy.form)) {
      console.log('invalid!');
      this.setState({ message: '* Please complete the form to save a Ping.' });
      return;
    }

    console.log('valid!');

    // Only update the db if the form has been edited...
    if (stateCopy.formHasChanged) {
      let site = {
        pingLabel: stateCopy.form.pingLabel,
        customerKey: stateCopy.form.customerKey,
        customerSiteKey: stateCopy.form.customerSiteKey,
        partnerKey: stateCopy.form.partnerKey,
        nextPing: this.convertMsToDateFromNow(stateCopy.form.pingFrequency),
        pingFrequency: stateCopy.form.pingFrequency,
        active: stateCopy.form.active,
        siteUrl: stateCopy.form.siteUrl,
        statusCode: stateCopy.form.statusCode
      };
      if (stateCopy.form.sitepingKey) {
        site.sitepingKey = stateCopy.form.sitepingKey;
      }

      let result;
      if (stateCopy.addSitePing) {
        result = await this.postPing(site);
      } else if (!stateCopy.addSitePing) {
        result = await this.updatePing(site);
      }

      if ((result || {}).affectedRows > 0) {
        site.sitepingKey = result.sitepingKey;

        // In case the queue running function is going
        // we don't wan't the message to come up over and
        // over...
        if (!this.state.runningQueue) {
          message.success('Your SitePing list has been updated.');
        }
      }
    }
    stateCopy.showDrawer = false;
    this.loadDataAndSetState(stateCopy);
  };

  // Note that the form is only reset when the user 'opens' the drawer
  // not when the drawer is closed.
  resetFormObject = () => {
    let stateCopy = { ...this.state };

    stateCopy.form = {
      pingLabel: null,
      nextPing: this.convertMsToDateFromNow(1800000),
      pingFrequency: 1800000,
      customerSiteKey: null,
      partnerKey: null,
      customerKey: null,
      selectedSiteArray: null,
      active: 'inactive',
      siteUrl: null,
      statusCode: null
    };
    stateCopy.formHasChanged = false;
    stateCopy.addSitePing = true;
    stateCopy.message = '';
    stateCopy.showDrawer = true;
    stateCopy.openingDrawClearSitePingMenu = false;
    this.setState(stateCopy);
  };

  convertMillis = millis => {
    let minutes = Math.floor(Number(millis) / 60000);
    return minutes;
  };

  handleIsValid = form => {
    let valid = true;
    Object.keys(form).forEach(key => {
      if (
        typeof form[key] === 'object' &&
        form[key] === null &&
        key !== 'statusCode'
      ) {
        valid = false;
        console.log('object type is invalid ', form[key]);
        return;
      }
      if (typeof form[key] === 'string' && form[key].length < 1) {
        valid = false;
        console.log('string type is invalid ', form[key]);
        return;
      }
      if (typeof form[key] === 'number' && form[key] < 1) {
        valid = false;
        console.log('number type is invalid ', form[key]);
        return;
      }
    });

    return valid;

  };
  
    // Note that the form is only reset when the user 'opens' the drawer
    // not when the drawer is closed.
    resetFormObject = () => {
      let stateCopy = { ...this.state };
  
      stateCopy.form = {
        pingLabel: null,
        nextPing: this.convertMsToDateFromNow(1800000),
        pingFrequency: 1800000,
        customerSiteKey: null,
        partnerKey: null,
        customerKey: null,
        selectedSiteArray: null,
        active: 'inactive',
        siteUrl: null,
        statusCode: null
      };
      stateCopy.formHasChanged = false;
      stateCopy.addSitePing = true;
      stateCopy.message = '';
      stateCopy.showDrawer = true;
      stateCopy.openingDrawClearSitePingMenu = false;
      this.setState(stateCopy);
    };
  
    convertMillis = millis => {
      let minutes = Math.floor(Number(millis) / 60000);
      return minutes;
    };
  
    handleIsValid = form => {
      let valid = true;
      Object.keys(form).forEach(key => {
        if (
          typeof form[key] === 'object' &&
          form[key] === null &&
          key !== 'statusCode'
        ) {
          valid = false;
          console.log('object type is invalid ', form[key]);
          return;
        }
        if (typeof form[key] === 'string' && form[key].length < 1) {
          valid = false;
          console.log('string type is invalid ', form[key]);
          return;
        }
        if (typeof form[key] === 'number' && form[key] < 1) {
          valid = false;
          console.log('number type is invalid ', form[key]);
          return;
        }
      });
      return valid;
    };
  
    handleCloseDrawer = () => {
      this.setState({ showDrawer: false });
    };
  
    editSite = record => {
      return {
        onClick: () => {
          let stateCopy = { ...this.state };
          stateCopy = {
            form: {
              sitepingKey: record.sitepingKey,
              pingLabel: record.pingLabel,
              nextPing: record.nextPing,
              pingFrequency: record.pingFrequency,
              created: record.created,
              customerKey: record.customerKey,
              customerSiteKey: record.customerSiteKey,
              partnerKey: record.partnerKey,
              siteUrl: record.siteUrl,
              statusCode: record.statusCode
            },
            formHasChanged: false,
            showDrawer: true,
            message: '',
            addSitePing: false
          };
          this.setState(stateCopy);
        }
      };
    };
  
    // █▀▀ █▀▀ █▀▀█ █▀▀█ █▀▀ █░░█   █▀▀ █░░█ █▀▀▄ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄ █▀▀
    // ▀▀█ █▀▀ █▄▄█ █▄▄▀ █░░ █▀▀█   █▀▀ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█ ▀▀█
    // ▀▀▀ ▀▀▀ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀   ▀░░ ░▀▀▀ ▀░░▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀
  
    searchHandle = (selectedKeys, confirm) => {
      confirm();
      this.setState({ searchText: selectedKeys[0] });
    };
  
    searchHandleReset = clearFilters => {
      clearFilters();
      this.setState({ searchText: '' });
    };
  
    searchGetColumnProps = dataIndex => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={ node => {
              this.searchInput = node;
            }}
            placeholder={'Search ' + dataIndex}
            value={selectedKeys[0]}
            onChange={e =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => this.searchHandle(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => this.searchHandle(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.searchHandleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: filtered => (
        <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => this.searchInput.select());
        }
      },
      render: text => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : 'unknown'}
        />
      )
    });

  handleCloseDrawer = () => {
    this.setState({ showDrawer: false });
  };

  // █▀▀ █▀▀ █▀▀█ █▀▀█ █▀▀ █░░█   █▀▀ █░░█ █▀▀▄ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄ █▀▀
  // ▀▀█ █▀▀ █▄▄█ █▄▄▀ █░░ █▀▀█   █▀▀ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀   ▀░░ ░▀▀▀ ▀░░▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀

  searchHandle = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  searchHandleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  searchGetColumnProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={'Search ' + dataIndex}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.searchHandle(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.searchHandle(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.searchHandleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text && text.toString()}
      />
    )
  });

  searchHandleVisibleChange = deleteOptionVisible => {
    this.setState({ deleteOptionVisible });
  };

  prependHttp = string => {
    const http = /^http:\/\//;
    const https = /^https:\/\//;
    if (string.search(http) === 0 || string.search(https) === 0) {
      return string;
    } else {
      return 'http://' + string;
    }
  };

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderStatus = statusCode => {
    if (!statusCode) return <Badge status="warning" text="Paused" />;
    return statusCode === 200 ? (
      <Badge status="success" text="Ok" />
    ) : (
      <Badge status="error" text="Not Found" />
    );
  };

  renderSites = active => {
    if (!this.state.sites) return;
    let stateCopy = { ...this.state };
    return stateCopy.sites.filter(item => {
      return item.active === active;
    });
  };

  ///////////////////////////////////
  // Click Row to go to stats view //
  ///////////////////////////////////

  sitepingData = sitepingKey => {
    // console.log(sitepingKey);
    this.props.history.push(`/siteping/stats/${sitepingKey}`);
  };

  // Replaces Edit Site function
  viewStats = record => {
      // console.log(record);
      this.sitepingData(record.sitepingKey)
  };

  /////////////////////////////////////////
  // END - Click Row to go to stats view //
  /////////////////////////////////////////

  editSite = record => {
    let stateCopy = { ...this.state };
    stateCopy = {
      form: {
        sitepingKey: record.sitepingKey,
        pingLabel: record.pingLabel,
        nextPing: record.nextPing,
        pingFrequency: record.pingFrequency,
        created: record.created,
        customerKey: record.customerKey,
        customerSiteKey: record.customerSiteKey,
        partnerKey: record.partnerKey,
        siteUrl: record.siteUrl,
        statusCode: record.statusCode
      },
      formHasChanged: false,
      showDrawer: true,
      message: '',
      addSitePing: false
    };
    this.setState(stateCopy);
  };

  render() {
    const columns = [
      {
        title: 'Site Name',
        dataIndex: 'siteName',
        key: 'siteName',
        sorter: (a, b) => {
          if (a.siteName < b.siteName) {
            return -1;
          }
          if (a.siteName > b.siteName) {
            return 1;
          }
          return 0;
        },
        ...this.searchGetColumnProps('siteName')
      },
      {
        title: 'Customer',
        dataIndex: 'customerName',
        key: 'customerName',
        sorter: (a, b) => {
          if (a.customerName < b.customerName) {
            return -1;
          }
          if (a.customerName > b.customerName) {
            return 1;
          }
          return 0;
        },
        ...this.searchGetColumnProps('customerName')
      },
      {
        title: 'Partner',
        dataIndex: 'partnerName',
        key: 'partnerName',
        sorter: (a, b) => {
          if (a.partnerName < b.partnerName) {
            return -1;
          }
          if (a.partnerName > b.partnerName) {
            return 1;
          }
          return 0;
        },
        ...this.searchGetColumnProps('partnerName')
      }, 
      {
        title: 'Ping Label',
        dataIndex: 'pingLabel',
        key: 'pingLabel',
        sorter: (a, b) => {
          if (a.pingLabel < b.pingLabel) {
            return -1;
          }
          if (a.pingLabel > b.pingLabel) {
            return 1;
          }
          return 0;
        },
        ...this.searchGetColumnProps('pingLabel')
      },
      {
        title: 'Ping Frequency',
        dataIndex: 'pingFrequency',
        key: 'pingFrequency',
        sorter: (a, b) => {
          if (a.pingFrequency < b.pingFrequency) {
            return -1;
          }
          if (a.pingFrequency > b.pingFrequency) {
            return 1;
          }
          return 0;
        },

        render: millis => this.convertMillis(millis) + ' mins'
      },
      {
        title: 'URL',
        dataIndex: 'siteUrl',
        key: 'siteUrl',
        sorter: (a, b) => {
          if (a.siteUrl < b.siteUrl) {
            return -1;
          }
          if (a.siteUrl > b.siteUrl) {
            return 1;
          }
          return 0;
        },
        ...this.searchGetColumnProps('siteUrl')
      },
      {
        title: 'Status',
        dataIndex: 'statusCode',
        key: 'statusCode',
        sorter: (a, b) => {
          if (a.statusCode < b.statusCode) {
            return -1;
          }
          if (a.statusCode > b.statusCode) {
            return 1;
          }
          return 0;
        },
        render: this.renderStatus
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record, i) => (
          <span>
            <Button
              type="primary"
              icon="setting"
              onClick={() => {
                this.editSite( record );
              }}
            />
            <Divider type="vertical" />
            <Button
              type="primary"
              icon="eye"
              onClick={() => this.viewStats(record)}
            ></Button>
          </span>
          
        )
      }
    ];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        if (!this.state.runningQueue)
          this.setState({ selectedRowKeys, selectedRows });
      }
    };
    const api = this.props.api;
    return (
      <div>
      <Content
      style={{
        margin: '94px 16px 24px',
        padding: 24,
        minHeight: 280
      }}
    >
      <Row gutter={16}>
        <Col xs={24}>
          <Card bordered={false} style={{ width: '100%' }}>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Icon
                  style={{
                    margin: '15px 0',
                    fontSize: '1.6em'
                  }}
                  type={'plus-circle'}
                  onClick={() => this.resetFormObject()}
                />
              </Col>
            </Row>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Live" key="1">
                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Icon
                      style={{
                        margin: '15px 0',
                        fontSize: '1.6em'
                      }}
                      type={'pause-circle'}
                      onClick={() => this.startQueue('pause')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    {// The Active Table
                    this.state.runningQueue ? (
                      <Row style={{ textAlign: 'center' }}>
                        <Icon
                          type="sync"
                          spin
                          style={{ fontSize: '2rem' }}
                        />
                      </Row>
                    ) : (
                      <Table size="small" 
                        rowKey={() => id++}
                        // onRow={this.viewStats}
                        columns={columns}
                        dataSource={this.renderSites('active')}
                        rowSelection={rowSelection}
                      />
                    )}
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Paused" key="2">
                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Icon
                      style={{
                        margin: '15px 0',
                        fontSize: '1.6em'
                      }}
                      type={'play-circle'}
                      onClick={() => this.startQueue('play')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    {// The Pending Table
                      this.state.runningQueue ? 
                      <Row style={{ textAlign: 'center' }}>
                        <Icon
                          type="sync"
                          spin
                          style={{ fontSize: '2rem' }}
                        />
                      </Row>
                      : 
                      <Table size="small" 
                        rowKey={() => id++}
                        columns={columns}
                        dataSource={this.renderSites('inactive')}
                        rowSelection={rowSelection}
                      />
                    }
                  </Col>
                </Row>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </Content>
  
          <BiggDrawer
            header={
              this.state.addSitePing ? 'Add a SitePing' : 'Update a SitePing'
            }
            showDrawer={this.state.showDrawer}
            close={this.handleCloseDrawer}
            invalidMessage={this.state.message}
            content={
              <Form 
                onKeyUp={(e) => {
                  if (e.keyCode === 13 || e.which === 13) {
                    this.handleFormSubmit();
                  } else if (e.keyCode === 27 || e.which === 27) {
                    this.handleCloseDrawer();
                  }
                }}
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                {
                  this.state.addSitePing && this.state.openingDrawClearSitePingMenu &&
                  <Form.Item label="Choose Site">
                    <BigglyGetMenu
                      apiKey={this.props.user.apiKey}
                      menuSelectionFunction={this.menuSelectionFunction}
                      menuOptions={[
                        {
                          typeDisplay: 'Partners',
                          optionKey: 'partnerName',
                          isLeaf: false,
                          async get(apiKey) {
                            const result = await api.listPublic({
                              name: 'Biggly.partners',
                              columns: [
                                {name: 'partnerName'},
                                {name: 'partnerKey'},
                              ]
                            })
                            return result;
                          }
                        },
                        {
                          typeDisplay: 'Customers',
                          optionKey: 'customerName',
                          isLeaf: false,
                          getKeys: ['partnerKey'],
                          async get(apiKey, partnerKey) {
                            let result = await api.listPublic({
                              name: 'Biggly.customers',
                              columns: [
                                {name: 'customerName'},
                                {name: 'customerKey'},
                                {name: 'partnerKey'},
                              ],
                              where: [
                                `partnerKey = "${partnerKey}"`
                              ]
                            })
                            return result;
                          }
                        },
                        {
                          typeDisplay: 'Sites',
                          optionKey: 'siteName',
                          isLeaf: true,
                          getKeys: ['customerKey'],
                          async get(apiKey, customerKey) {
                            return api.listPublic({
                              name: 'Biggly.customerSites',
                              columns: [
                                {name: 'customerSiteKey'},
                                {name: 'customerKey'},
                                {name: 'siteName'},
                                {name: 'siteUrl'},
                              ],
                              where: [
                                `customerKey = "${customerKey}"`
                              ]
                            })
                          }
                        }
                      ]}
                    />
                  </Form.Item>
                }
                <Form.Item label="Ping Label">
                <Input
                  value={this.state.form.pingLabel}
                  onChange={e => this.inputChangeFunc({ pingLabel: e.target.value })}
                />
                </Form.Item>
                <Form.Item label="Ping Frequency">
                <InputNumber
                  value={this.state.form.pingFrequency}
                  formatter={value => this.convertMillis(value) + ' mins'}
                  parser={value => this.convertMinutes(value)}
                  onChange={value => this.inputChangeFunc({ pingFrequency: value })}
                  step={60000}
                  min={60000}
                  max={3600000}
                />
                </Form.Item>
              </Form>
            }
            buttons={
              this.state.addSitePing ?
              <div>
                <Button onClick={this.handleCloseDrawer} type="secondary">Cancel</Button>
                <Button disabled={ this.state.addingSiteRecord } onClick={() => this.getStatusAndSubmit()} type="primary">Add a SitePing</Button>
              </div>
              :
              <div>
                <Button onClick={this.handleCloseDrawer} type="secondary">Cancel</Button>
                <Popover
                  content={<div onClick={this.deletePing} style={{ color: '#ef5454', cursor: 'pointer' }}>Yes Delete</div>}
                  title="Are you sure?"
                  trigger="click"
                  visible={this.state.deleteOptionVisible}
                  onVisibleChange={this.searchHandleVisibleChange}
                >
                  <Button type={"danger"}>Delete SitePing</Button>
                </Popover>
                <Button onClick={() => this.handleFormSubmit()} type="primary" disabled={!this.state.formHasChanged}>Update SitePing</Button>
              </div>
            }
          />
        </div>
      );
    }
  }

export default Sites;
