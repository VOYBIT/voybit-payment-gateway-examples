// The server returns checkoutUrl. The page does not hold an API key.
export function Pay({ checkoutUrl }) {
  return <PayButton checkoutUrl={checkoutUrl}>Pay</PayButton>
}
