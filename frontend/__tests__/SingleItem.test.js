import { mount } from 'enzyme'
import { MockedProvider } from 'react-apollo/test-utils'
import SingleItem, { SINGLE_ITEM_QUERY } from '../components/SingleItem'
import 'jest-styled-components'

const mocks = [
  {
    request: { query: SINGLE_ITEM_QUERY, variables: { id: 'id123' } },
    result: {
      data: {
        item: {
          __typename: 'Item',
          id: 'id123',
          title: 'Fake Item',
          description: 'This is a fake item',
          largerImage: 'item.jpg',
        }
      }
    }
  }
]

describe('<Item />', () => {
  it ('renders and shows loading while fetching data', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="id123" />
      </MockedProvider>
    )
    expect(wrapper.text()).toContain('Loading...')
  })

  it('renders and match snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="id123" />
      </MockedProvider>
    )
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('SingleItem')).toMatchSnapshot()
  })

  it('renders an error when there is no item', async () => {
    const emptyItemMocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: 'id123' } },
        result: {
          errors: [{ message: 'No item found' }]
        }
      }
    ]

    const wrapper = mount(
      <MockedProvider mocks={emptyItemMocks}>
        <SingleItem id="id123" />
      </MockedProvider>
    )
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()
    expect(wrapper.find('[data-test="graphql-error"]').text()).toContain('No item found')
    expect(wrapper.find('[data-test="graphql-error"]')).toMatchSnapshot()
  })
});