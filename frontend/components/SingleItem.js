import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import styled from 'styled-components'
import Error from './ErrorMessage'
import Head from 'next/head'

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`

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
          if (error) return <Error error={error}/>
          if (!data.item) return <p>No item found!</p>

          return (
            <div>
              <SingleItemStyles>
                <Head>
                  <title>Sick Fits | {data.item.title}</title>
                </Head>
                <img src={data.item.largerImage} alt={data.item.title}/>
                <div className="details">
                  <h2>Viewing {data.item.title}</h2>
                  <p>{data.item.description}</p>
                </div>
              </SingleItemStyles>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default SingleItem;
