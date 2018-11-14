import formatMoney from '../lib/formatMoney'

describe('formatMoney function', () => {
  it('should leave values without the cents for whole dolars', () => {
    expect(formatMoney(100)).toEqual('$1')
    expect(formatMoney(1000)).toEqual('$10')
    expect(formatMoney(100)).not.toContain('.')
  });

  it('should render cents for non integer dolar values', () => {
    expect(formatMoney(123)).toContain('.')
    expect(formatMoney(123)).toEqual('$1.23')
  });

  it('should show a comma for thousand values', () => {
    expect(formatMoney(500000)).toEqual('$5,000')
    expect(formatMoney(500000)).toContain(',')
  });

  it('should work for thousand values with cents', () => {
    expect(formatMoney(500012)).toEqual('$5,000.12')
    expect(formatMoney(500012)).toContain(',')
    expect(formatMoney(500012)).toContain('.')
  });
});