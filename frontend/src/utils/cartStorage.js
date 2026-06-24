// Small shared helper around the "cart" localStorage key.
//
// MenuPage and CartPage both read/write localStorage.cart directly. Without
// this, Navbar (which renders independently and stays mounted across page
// navigations) has no way to know the cart changed unless the page reloads.
// `dispatchEvent(new Event("cart-updated"))` lets Navbar listen and update
// its badge immediately, in the same tab, the moment any component changes
// the cart.

export const CART_STORAGE_KEY = "cart";
export const CART_UPDATED_EVENT = "cart-updated";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function setCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  // Notify same-tab listeners (e.g. Navbar's badge) immediately. The native
  // "storage" event only fires for OTHER tabs/windows, not the tab that
  // made the change, so this custom event covers the same-tab case.
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItemCount(cart = getCart()) {
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}
