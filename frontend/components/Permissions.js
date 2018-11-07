import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
]

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>

      return (
        <div>
          <Error error={error} />
          <h2>Manage permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {data.users.map(user => <UserPermissions key={user.id} user={user}/>)}
            </tbody>
          </Table>
        </div>
      )
    }}
  </Query>
)

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = event => {
    const checkbox = event.target
    let permissions = [ ... this.state.permissions ]

    if (checkbox.checked) {
      permissions.push(checkbox.value)
    }
    else {
      permissions = permissions.filter(permission => permission !== checkbox.value)
    }
    this.setState({ permissions })
  }

  render() {
    const { user } = this.props
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                type="checkbox"
                checked={this.state.permissions.includes(permission)}
                value={permission}
                onChange={this.handlePermissionChange}
              />
            </label>
          </td>
        ))}

        <td>
          <SickButton>UPDATE</SickButton>
        </td>
      </tr>
    )
  }
}

export default Permissions