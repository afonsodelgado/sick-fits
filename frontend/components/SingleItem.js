import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largerImage
    }
  }
`

class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <p>Error!</p>

          return (
            <div>
              <p>SingleItem comp</p>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default SingleItem;
