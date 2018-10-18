import Nav from './Nav';

const Header = () => (
  <div>
    <div className="bar">
      <a>Sic Fits</a>
      <Nav />
    </div>

    <div className="sub-bar">
      <p>Search</p>
    </div>
    <div>Cart</div>
  </div>
)

export default Header
