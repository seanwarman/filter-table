import React, { Component } from 'react';
import PageWrapper from '../../../components/Layout/PageWrapper';
import { Table, message } from 'antd';
import search from '../../../libs/filterBySearchTerm';

class Users extends Component {
  state = {
    users: null,
    loaded: false,
    searchTerm: '',
  }

  componentDidMount() {
    this.props.changeHeader('appstore', 'Console', [
      { name: 'Users', url: '/console/users' },
    ]);
    this.loadDataAndSetState();
  }

  async loadDataAndSetState() {
    let stateCopy = { ...this.state };

    stateCopy.users = await this.getUsers(this.props.user.apiKey);
    stateCopy.loaded = true;
    this.setState(stateCopy);
  }

  async getUsers(apiKey) {
    return this.props.api.listAdmin({
      name: 'Biggly.users',
      columns: [
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'emailAddress'},
        {name: 'userKey'},
      ]
    });
  }

  handleSelectUser = (record) => {
    if(!record.userKey) {
      message.error('This User record is corrupted!');
      return;
    }
    this.props.history.push('/console/users/' + record.userKey)
  }
  
  onSearch = value => {
    this.setState({searchTerm: value});
  }

  render() {
    return (
      <PageWrapper
        loading={!this.state.loaded}
        onSearch={this.onSearch}
      >
        <Table size="small" 
          rowKey="userKey"
          columns={[
            {
              title: 'First Name',
              dataIndex: 'firstName',
              key: 'firstName',
            },
            {
              title: 'Last Name',
              dataIndex: 'lastName',
              key: 'lastName',
            },
            {
              title: 'Email',
              dataIndex: 'emailAddress',
              key: 'emailAddress',
            },
          ]}
          dataSource={search(this.state.searchTerm, this.state.users)}
          onRow={(record) => ({onClick: () => this.handleSelectUser(record)})}
        />
      </PageWrapper>
    );
  }
}

export default Users;
