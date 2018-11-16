import { mount } from 'enzyme'
import Router from 'next/router'
import { MockedProvider } from 'react-apollo/test-utils'
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem'

// mock global fetch API
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: 'https://www.cloud.com/fakeImage.jpg',
    eager: [{ secure_url: 'https://www.cloud.com/largerFakeImage.jpg' }]
  })
})

const mockItem = {
  title: 'New Item',
  description: 'This is a fake item',
  image: 'fakeImage.jpg',
  largerImage: 'largerFakeImage.jpg',
  price: 50000,
}

describe('<CreateItem />', () => {
  it('should render and match snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    )

    expect(wrapper.find('Form')).toMatchSnapshot()
  });

  it('should upload a file when choosing a picture', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    )

    wrapper
      .find('input[type="file"]')
      .simulate('change', { target: { files: [mockItem.image] } })
    
    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()

    expect(global.fetch).toHaveBeenCalled()
    expect(wrapper.find('CreateItem').instance().state.image).toContain(mockItem.image)
    expect(wrapper.find('CreateItem').instance().state.largerImage).toContain(mockItem.largerImage)
  });

  it('should add a new item when submit', async () => {
    const mocks = [{
      request: { query: CREATE_ITEM_MUTATION, variables: {
        title: mockItem.title,
        description: mockItem.description,
        image: '',
        largerImage: '',
        price: mockItem.price
      } },
      result: {
        data: {
          createItem: {
            __typename: 'Item',
            id: '123',
            ... mockItem
          }
        }
      }
    }]

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    )

    wrapper
      .find('#title')
      .simulate('change', { target: { name: 'title', type: 'text', value: mockItem.title } })
    wrapper
      .find('#price')
      .simulate('change', { target: { name: 'price', type: 'number', value: mockItem.price } })
    wrapper
      .find('#description')
      .simulate('change', { target: { name: 'description', value: mockItem.description } })

    await new Promise(resolve => setTimeout(resolve))
    wrapper.update()

    //Mock the router method
    Router.router = { push: jest.fn() }

    wrapper.find('form').simulate('submit')
    await new Promise(resolve => setTimeout(resolve, 50))
    wrapper.update()
    
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/item',
      query: { id: '123' }
    })

    global.fetch.mockReset()
  });
});