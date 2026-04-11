import { 
  createApp, computed, createStore, createResource, signal, effect,
  html, defineElement, Router, Route, push, list,
  Show, Switch, Match, Portal, on
} from "../../gui/index.js";

// 1. Reactive Deep Store for Cart Management
const store = createStore({
  cart: []
});

const toastMessage = signal("");
// Auto clean toast after 3s
effect(() => {
  if (toastMessage.value) {
    const timer = setTimeout(() => { toastMessage.value = ""; }, 2500);
    return () => clearTimeout(timer);
  }
});

const cartTotalCount = computed(() => store.cart.reduce((sum, item) => sum + item.quantity, 0));
const cartTotalPrice = computed(() => store.cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));

function addToCart(product) {
  const existing = store.cart.find(i => String(i.id) === String(product.id));
  if (existing) {
    existing.quantity++;
  } else {
    store.cart.push({ ...product, quantity: 1 });
  }
  toastMessage.value = `Access granted: ${product.title} in cart.`;
}

function removeFromCart(id) {
  store.cart = store.cart.filter(i => String(i.id) !== String(id));
}

// 2. Custom Web Component utilizing defineElement (Encapsulates Reactivity inside <shop-card>)
defineElement("shop-card", (props) => {
  return html`
    <div class="product-card">
      <div class="product-image">
        ${() => props.icon}
      </div>
      <div class="product-info">
        <h3>${() => props.title}</h3>
        <p class="price">$${() => props.price}</p>
        <button class="add-btn" on:click=${() => {
          addToCart({ id: props.id, title: props.title, price: props.price, icon: props.icon });
        }}>
          Add to Cart
        </button>
      </div>
    </div>
  `;
}, { 
  attributes: ["id", "title", "price", "icon"], 
  shadow: false 
});

// 3. Fake Async Hardware API showcasing createResource
const fetchProducts = async () => {
  await new Promise(r => setTimeout(r, 800)); // Natural network latency
  return [
    { id: 1, title: "RTX 5090 Ti GPU", price: 1999, icon: "👾" },
    { id: 2, title: "Ryzen 9 9950X", price: 699, icon: "🧠" },
    { id: 3, title: "OLED Monitor 240Hz", price: 899, icon: "💻" },
    { id: 4, title: "Custom Mech Keyboard", price: 299, icon: "⌨️" },
    { id: 5, title: "Quantum Mouse 8k", price: 149, icon: "🖱️" },
    { id: 6, title: "Studio Audio Interface", price: 399, icon: "🎙️" }
  ];
};
const products = createResource(null, fetchProducts);

// Search Query signal
const searchQuery = signal("");

// Derived array matching search
const filteredProducts = computed(() => {
  const all = products.value || [];
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return all;
  return all.filter(p => p.title.toLowerCase().includes(query));
});

// 4. View Components
function Home() {
  return html`
    <div class="hero">
      <h1>Future Tech Shop</h1>
      <p>The ultimate high performance showcase purely powered by gUI Zero-Build constraints.</p>
    </div>
    
    <div class="search-bar">
      <input type="text" placeholder="Search parameters..." on:input=${on(searchQuery)} />
    </div>

    <div class="products-container">
      ${Switch([
        Match({ when: () => products.loading, children: () => html`<div class="loader">Loading hardware modules...</div>` }),
        Match({ when: () => products.error, children: () => html`<div class="error">Failed to hack mainframe...</div>` })
      ], () => html`
        <div class="grid">
          ${list(
            () => filteredProducts.value, 
            "id", 
            (item) => html`<shop-card 
              id=${() => item.value.id} 
              title=${() => item.value.title} 
              price=${() => item.value.price} 
              icon=${() => item.value.icon}>
            </shop-card>`
          )}
        </div>
      `)}
    </div>
  `;
}

function Cart() {
  return html`
    <div class="cart-page">
      <h2>Your Neural Cart</h2>
      ${Show({
        when: () => store.cart.length > 0,
        fallback: () => html`<p class="empty-cart">No hardware detected. <a href="#/">Scan for items</a></p>`,
        children: () => html`
        <ul class="cart-items">
          ${list(
            () => store.cart,
            "id",
            (item) => html`
              <li class="cart-item">
                <span class="ci-icon">${() => item.value.icon}</span>
                <div class="ci-details">
                  <h4>${() => item.value.title}</h4>
                  <p>$${() => item.value.price}</p>
                </div>
                <div class="ci-actions">
                  <button class="qty-btn" on:click=${() => {
                    if (item.value.quantity > 1) {
                       const target = store.cart.find(i => String(i.id) === String(item.value.id));
                       target.quantity--;
                    } else {
                       removeFromCart(item.value.id);
                    }
                  }}>-</button>
                  <span>${() => item.value.quantity}</span>
                  <button class="qty-btn" on:click=${() => {
                    const target = store.cart.find(i => String(i.id) === String(item.value.id));
                    target.quantity++;
                  }}>+</button>
                </div>
              </li>
            `
          )}
        </ul>
        
        <div class="cart-summary">
          <h3>Total: $${() => cartTotalPrice.value}</h3>
          <button class="checkout-btn" on:click=${() => alert("Proceeding to quantum gateway...")}>Checkout Now</button>
        </div>
      `})}
    </div>
  `;
}

function NotFound() {
  return html`<h2 style="text-align: center; margin-top: 5rem;">404 - Coordinates Not Found</h2>`;
}

// 5. Main Root Component tying Router together
function App() {
  return html`
    <nav class="navbar">
      <div class="brand" style="cursor: pointer" on:click=${() => push("/")}>
        <span style="font-size: 1.8rem">📦</span>
        <span>gShop</span>
      </div>
      <div class="nav-links">
        <button class="cart-trigger" on:click=${() => push("/cart")}>
          <span style="font-size: 1.2rem; transform: translateY(1px)">🛒</span>
          <span class="badge" style="display: ${() => cartTotalCount.value > 0 ? "inline-block" : "none"}">
            ${() => cartTotalCount.value}
          </span>
        </button>
      </div>
    </nav>
    <main class="layout">
      <!-- 100% Client side native router powered by gUI -->
      ${Router({ mode: "hash", fallback: NotFound }, [
        Route({ path: "/" }, Home),
        Route({ path: "/cart" }, Cart)
      ])}
    </main>
    
    <!-- Toast Portal demonstrating deep DOM insertion anywhere -->
    ${Portal(document.body, () => html`
      ${Show({
        when: () => !!toastMessage.value,
        children: () => html`
          <div class="toast-portal">
            <div class="toast">${() => toastMessage.value}</div>
          </div>
        `
      })}
    `)}
  `;
}

// Spin the engine up!
createApp("#app", App);


