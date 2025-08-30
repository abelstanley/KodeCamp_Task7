const API_URL = "https://fakestoreapi.com/products";

// Fetch and display products on index.html
if (document.getElementById("product-list")) {
  fetch(API_URL)
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("product-list");
      products.forEach(p => {
        const card = document.createElement("div");
        card.className = "border p-4 rounded shadow";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.title}" class="h-40 mx-auto mb-2">
          <h2 class="font-bold">${p.title}</h2>
          <p>$${p.price}</p>
          <a href="product.html?id=${p.id}" class="bg-blue-500 text-white px-3 py-1 mt-2 inline-block">View</a>
        `;
        container.appendChild(card);
      });
    });
}

// Product page: load product details
if (document.getElementById("product-details")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(p => {
      const container = document.getElementById("product-details");
      container.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="h-64 mx-auto">
        <div>
          <h1 class="text-2xl font-bold mb-2">${p.title}</h1>
          <p class="mb-2">${p.description}</p>
          <p class="text-xl font-bold mb-4">$${p.price}</p>
          <button onclick="addToCart(${p.id}, '${p.title}', ${p.price}, '${p.image}')" class="bg-green-500 text-white px-4 py-2">Add to Cart</button>
        </div>
      `;
    });
}

// Cart functions
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, title, price, image) {
  let cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, title, price, image, qty: 1 });
  }
  saveCart(cart);
  alert("Added to cart");
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.innerText = count);
}

// Load cart page
if (document.getElementById("cart-items")) {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "flex items-center space-x-4 border p-2";
    div.innerHTML = `
      <img src="${item.image}" class="h-16">
      <div class="flex-1">
        <h2>${item.title}</h2>
        <p>$${item.price} x ${item.qty}</p>
      </div>
    `;
    container.appendChild(div);
  });
  document.getElementById("cart-total").innerText = `Total: $${total.toFixed(2)}`;
}

// Load checkout summary
if (document.getElementById("order-summary")) {
  const cart = getCart();
  let summary = "<h2 class='font-bold mb-2'>Order Summary</h2>";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    summary += `<p>${item.title} x ${item.qty} - $${item.price * item.qty}</p>`;
  });
  summary += `<p class='font-bold mt-2'>Total: $${total.toFixed(2)}</p>`;
  document.getElementById("order-summary").innerHTML = summary;
}

// Update cart count on load
updateCartCount();
