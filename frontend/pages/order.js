import PleaseSignin from '../components/PelaseSignin';
import OrderComponent from '../components/Order'

const Order = props => (
  <div>
    <PleaseSignin>
      <OrderComponent id={props.query.id}/>
    </PleaseSignin>
  </div>
)

export default Order
