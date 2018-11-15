import ItemComponent from '../components/Item'
import formatMoney from '../lib/formatMoney'
import { shallow, mount } from 'enzyme'
import toJson from 'enzyme-to-json'

const mockItem = {
  id: '123',
  title: 'New Item',
  price: 5000,
  description: 'This is a fake item',
  image: 'item.jpg',
  largerImage: 'largerItem.jpg'
}

describe('<Item />', () => {
  it('renders and displays properly', () => {
    const wrapper = shallow(<ItemComponent item={mockItem}/>)

    expect(wrapper.find('PriceTag').children().text()).toEqual(formatMoney(mockItem.price))
    //For HTML tags we can search straight for the text instead the text on the children
    expect(wrapper.find('Title a').text()).toEqual(mockItem.title)
    expect(wrapper.find('img').props().src).toEqual(mockItem.image)
    expect(wrapper.find('img').props().alt).toEqual(mockItem.title)


  })

  it('renders and match snapshot', () => {
    const wrapper = shallow(<ItemComponent item={mockItem}/>)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
});