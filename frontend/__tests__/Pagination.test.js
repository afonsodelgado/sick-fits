import 'jest-styled-components'
import { mount } from 'enzyme'
import { MockedProvider } from 'react-apollo/test-utils'
import Router from 'next/router'
import Pagination, { PAGINATION_QUERY } from '../components/Pagination'

Router.router = {
  push: () => null,
  prefetch: () => null
}

const mocks = [
  {
    request: { query: PAGINATION_QUERY },
    result: {
      data: {
        itemsConnection: {
          __typename: 'aggregate',
          aggregate: {
            __typename: 'count',
            count: 12
          }
        }
      }
    }
  }
]

describe('<Pagination />', () => {
  it('should render and show a loading state while fetching data', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Pagination page={1}/>
      </MockedProvider>
    )
    expect(wrapper.find('Pagination').text()).toContain('Loading...')
  });

  it('should render a pagination for 12 items', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Pagination page={1}/>
      </MockedProvider>
    )

    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('Pagination').text()).toContain('12 items total')
    expect(wrapper.find('Pagination')).toMatchSnapshot()
  });

  it('should disable prev button and enable next button if on the first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Pagination page={1} />
      </MockedProvider>
    )
    
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('.prev').props()["aria-disabled"]).toBe(true)
    expect(wrapper.find('.next').props()["aria-disabled"]).toBe(false)
  })

  it('should enable prev button and disable next button if on the last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Pagination page={3} />
      </MockedProvider>
    )
    
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('.prev').props()["aria-disabled"]).toBe(false)
    expect(wrapper.find('.next').props()["aria-disabled"]).toBe(true)
  })

  it('should enable both prev and next buttons if on a middle page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Pagination page={2} />
      </MockedProvider>
    )
    
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('.prev').props()["aria-disabled"]).toBe(false)
    expect(wrapper.find('.next').props()["aria-disabled"]).toBe(false)
  })
});