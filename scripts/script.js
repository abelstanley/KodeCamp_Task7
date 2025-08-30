// API Configuration
const API_URL = "https://fakestoreapi.com/products";
const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";

// Category configurations with icons and descriptions
const categoryConfig = {
  'electronics': {
    icon: '📱',
    description: 'Latest gadgets, smartphones, laptops and tech accessories',
    gradient: 'electronics-gradient',
    heroClass: 'electronics'
  },
  'jewelery': {
    icon: '💎',
    description: 'Beautiful jewelry, rings, necklaces and precious accessories',
    gradient: 'jewelery-gradient',
    heroClass: 'jewelery'
  },
  "men's clothing": {
    icon: '👔',
    description: 'Stylish clothing, shirts, pants and fashion for men',
    gradient: 'mens-gradient',
    heroClass: 'mens'
  },
  "women's clothing": {
    icon: '👗',
    description: 'Fashion-forward clothing, dresses and accessories for women',
    gradient: 'womens-gradient',
    heroClass: 'womens'
  }
};

// Global application state
let cartData = [];
let allProducts = [];
let filteredProducts = [];
let currentCategory = '';
let currentSort = 'default';
let currentPriceFilter = 'all';

// ========================================
// CART MANAGEMENT FUNCTIONS
// ========================================

// Function to get cart from localStorage (unified)
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Initialize cart from localStorage on page load
function initializeCart() {
  cartData = getCart();
  updateCartCount();
}

// Update cart count in the UI
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Show toast notification - unified version for all pages
function showToast(message) {
  // Check if we're on cart page (has toast element) or other pages
  let toast = document.getElementById('toast');
  
  if (toast) {
    // Cart page toast
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-full');
    setTimeout(() => {
      toast.classList.add('translate-y-full');
    }, 3000);
  } else {
    // Create dynamic toast for other pages
    toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Slide in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
    }, 3000);
  }
}

// Add item to cart - unified version
function addToCart(id, title = null, price = null, image = null) {
  let product;
  
  // If only ID is provided, find product in allProducts
  if (!title && allProducts.length > 0) {
    product = allProducts.find(p => p.id === id);
    if (product) {
      title = product.title;
      price = product.price;
      image = product.image;
    }
  }
  
  // If still no product data, try to get from button attributes
  if (!title) {
    const btn = document.querySelector(`[data-id="${id}"]`);
    if (btn) {
      title = btn.getAttribute('data-title');
      price = parseFloat(btn.getAttribute('data-price'));
      image = btn.getAttribute('data-image');
    }
  }
  
  if (!title) {
    console.error('Product not found');
    return;
  }
  
  const existingItem = cartData.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartData.push({ id, title, price, image, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cartData));
  updateCartCount();
  
  // Show appropriate confirmation
  const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
  showToast(`Added "${shortTitle}" to cart!`);
}

// Update item quantity in cart
function updateQuantity(id, change) {
  const item = cartData.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cartData = cartData.filter(item => item.id !== id);
      showToast('Item removed from cart');
    } else {
      showToast('Quantity updated');
    }
    localStorage.setItem('cart', JSON.stringify(cartData));
    renderCart();
    updateCartCount();
  }
}

// Remove item from cart
function removeItem(id) {
  cartData = cartData.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cartData));
  showToast('Item removed from cart');
  renderCart();
  updateCartCount();
}

// Clear entire cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartData = [];
    localStorage.setItem('cart', JSON.stringify(cartData));
    showToast('Cart cleared');
    renderCart();
    updateCartCount();
  }
}

// Render cart items and totals (for cart page)
function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('empty-cart');
  
  // If cart elements don't exist, we're not on cart page
  if (!container || !emptyState) return;
  
  if (cartData.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    updateCartTotals(0);
    return;
  }
  
  emptyState.classList.add('hidden');
  let total = 0;
  
  container.innerHTML = cartData.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="p-6 hover:bg-slate-50 transition-colors duration-200 animate-fade-in" style="animation-delay: ${index * 0.1}s">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-cover rounded-xl shadow-md">
            <div class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              ${item.quantity}
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-slate-800 truncate">${item.title}</h3>
            <p class="text-slate-600 text-sm mt-1">$${item.price.toFixed(2)} each</p>
            <p class="text-blue-600 font-semibold mt-2">$${itemTotal.toFixed(2)}</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-slate-100 rounded-lg">
              <button onclick="updateQuantity(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors duration-200">
                <i class="fas fa-minus text-xs"></i>
              </button>
              <span class="w-8 h-8 flex items-center justify-center font-semibold text-slate-800">${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-green-600 transition-colors duration-200">
                <i class="fas fa-plus text-xs"></i>
              </button>
            </div>
            
            <button onclick="removeItem(${item.id})" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50">
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  updateCartTotals(total);
}

// Update cart totals (for cart page)
function updateCartTotals(subtotal) {
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + tax;
  
  const subtotalElement = document.getElementById('subtotal');
  const taxElement = document.getElementById('tax');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${finalTotal.toFixed(2)}`;
}

// ========================================
// CHECKOUT PAGE FUNCTIONS
// ========================================

// Load order summary for checkout page
function loadOrderSummary() {
  const cart = getCart();
  const orderItemsEl = document.getElementById('order-items');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  
  // If these elements don't exist, we're not on checkout page
  if (!orderItemsEl || !subtotalEl || !taxEl || !totalEl) return;
  
  let subtotal = 0;
  let itemsHtml = '';

  cart.forEach(item => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const itemTotal = price * qty;
    subtotal += itemTotal;

    itemsHtml += `
      <div class="order-item">
        <div class="item-details">
          <div class="item-name">${item.title}</div>
          <div class="item-qty">Qty: ${qty}</div>
        </div>
        <div class="item-price">$${itemTotal.toFixed(2)}</div>
      </div>
    `;
  });

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;

  orderItemsEl.innerHTML = itemsHtml;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  const shippingEl = document.getElementById('shipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

// ========================================
// PRODUCT DISPLAY FUNCTIONS
// ========================================

// Display featured product (home page)
function displayFeaturedProduct(product) {
  const featuredContainer = document.getElementById("featured-product");
  if (!featuredContainer) return;
  
  featuredContainer.innerHTML = `
    <img src="${product.image}" alt="${product.title}" class="w-full h-64 object-contain mb-6 rounded-2xl">
    <div class="space-y-4">
      <h3 class="text-2xl font-bold text-gray-900 line-clamp-2">${product.title}</h3>
      <p class="text-gray-600 text-sm line-clamp-3">${product.description}</p>
      <div class="flex items-center justify-between">
        <span class="text-3xl font-bold text-purple-600">$${product.price}</span>
        <div class="flex items-center space-x-1">
          <span class="text-yellow-400">★</span>
          <span class="font-medium">${product.rating?.rate || 'N/A'}</span>
          <span class="text-gray-500">(${product.rating?.count || 0})</span>
        </div>
      </div>
      <div class="flex space-x-3">
        <a href="./pages/product.html?id=${product.id}" 
           class="flex-1 bg-purple-600 text-white text-center py-3 px-6 rounded-full hover:bg-purple-700 transition duration-300 font-medium">
          View Details
        </a>
        <button 
          class="bg-gray-100 text-gray-800 py-3 px-6 rounded-full hover:bg-gray-200 transition duration-300 font-medium add-to-cart-btn"
          data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// Display products in grid (home page and general product list)
function displayProducts(products = null) {
  const container = document.getElementById("product-list") || document.getElementById('products-container');
  if (!container) return;
  
  // Use provided products or filteredProducts for category page
  const productsToShow = products || filteredProducts;
  const noResults = document.getElementById('no-results');
  
  // Handle empty state for category page
  if (!products && filteredProducts.length === 0) {
    container.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
    return;
  }
  
  if (noResults) noResults.classList.add('hidden');
  
  container.innerHTML = productsToShow.map((product, index) => `
    <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style="animation-delay: ${index * 0.1}s">
      <div class="relative group">
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 md:h-64 object-contain p-4 group-hover:scale-105 transition duration-300">
        <div class="absolute top-4 right-4">
          <button class="wishlist-btn bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gray-100">
            <svg class="w-5 h-5 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
        ${product.rating?.rate >= 4 ? '<div class="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">Top Rated</div>' : ''}
      </div>
      <div class="p-6">
        <h3 class="font-bold text-lg mb-2 text-gray-900 line-clamp-2 hover:text-purple-600 transition duration-200">
          <a href="${getProductUrl(product.id)}">${product.title}</a>
        </h3>
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-purple-600 price-badge">$${product.price}</span>
          <div class="flex items-center space-x-1">
            <div class="rating-stars text-yellow-400">
              ${generateStars(product.rating?.rate || 0)}
            </div>
            <span class="text-sm text-gray-600">(${product.rating?.count || 0})</span>
          </div>
        </div>
        <div class="flex space-x-2">
          <a href="${getProductUrl(product.id)}" 
             class="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-full hover:bg-purple-700 transition duration-300 font-medium text-sm">
            View Details
          </a>
          <button 
            class="bg-gray-100 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 font-medium text-sm add-to-cart-btn"
            data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}"
            onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get appropriate product URL based on current page
function getProductUrl(productId) {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/pages/')) {
    return `product.html?id=${productId}`;
  } else {
    return `./pages/product.html?id=${productId}`;
  }
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

// Display categories (home page)
function displayCategories(categories, products) {
  const container = document.getElementById("categories-list");
  if (!container) return;
  
  // Count products in each category
  const categoryCounts = {};
  categories.forEach(cat => {
    categoryCounts[cat] = products.filter(product => product.category === cat).length;
  });

  // Get a sample product image for each category
  const categoryImages = {};
  categories.forEach(cat => {
    const categoryProduct = products.find(product => product.category === cat);
    categoryImages[cat] = categoryProduct ? categoryProduct.image : 'https://via.placeholder.com/300x300?text=No+Image';
  });

  container.innerHTML = categories.map(category => {
    const config = categoryConfig[category] || { 
      icon: '🛍️', 
      description: 'Browse our collection',
      gradient: 'electronics-gradient'
    };
    
    return `
      <div class="category-card bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in">
        <div class="relative ${config.gradient} p-8 h-48 flex items-center justify-center">
          <div class="text-center text-white">
            <div class="text-6xl mb-4">${config.icon}</div>
            <div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-3xl"></div>
            <img src="${categoryImages[category]}" alt="${category}" class="absolute inset-4 w-auto h-auto object-contain opacity-20 rounded-2xl">
          </div>
        </div>
        <div class="p-6">
          <h3 class="font-bold text-xl mb-2 text-gray-900 capitalize">${category}</h3>
          <p class="text-gray-600 text-sm mb-4">${config.description}</p>
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500">${categoryCounts[category]} products</span>
            <div class="flex items-center space-x-1">
              <span class="text-yellow-400 text-sm">★★★★★</span>
            </div>
          </div>
          <a href="./pages/category.html?category=${encodeURIComponent(category)}" 
             class="block w-full bg-gray-900 text-white text-center py-3 px-6 rounded-full hover:bg-gray-800 transition duration-300 font-medium transform hover:scale-105">
            Explore ${category}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================
// CATEGORY PAGE SPECIFIC FUNCTIONS
// ========================================

// Get category from URL parameter
function getCategoryFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('category') || 'electronics';
}

// Update category hero section
function updateCategoryHero() {
  const config = categoryConfig[currentCategory] || categoryConfig['electronics'];
  
  const categoryIcon = document.getElementById('category-icon');
  const categoryTitle = document.getElementById('category-title');
  const categoryDescription = document.getElementById('category-description');
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const hero = document.getElementById('category-hero');
  
  if (categoryIcon) categoryIcon.textContent = config.icon;
  if (categoryTitle) categoryTitle.textContent = currentCategory;
  if (categoryDescription) categoryDescription.textContent = config.description;
  if (breadcrumbCategory) breadcrumbCategory.textContent = currentCategory;
  
  if (hero) {
    hero.className = `category-hero ${config.heroClass} py-16 text-white relative overflow-hidden`;
  }
  
  // Update page title
  document.title = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} | StanP Collections`;
}

// Update product count display
function updateProductCount() {
  const productCountElement = document.getElementById('product-count');
  if (productCountElement) {
    productCountElement.textContent = allProducts.length;
  }
}

// Update results count
function updateResultsCount() {
  const resultsCountElement = document.getElementById('results-count');
  if (resultsCountElement) {
    const count = filteredProducts.length;
    const total = allProducts.length;
    resultsCountElement.textContent = `Showing ${count} of ${total} products`;
  }
}

// Load category products
async function loadCategoryProducts() {
  try {
    updateCategoryHero();
    const response = await fetch(API_URL);
    const products = await response.json();

    // Filter by current category
    allProducts = products.filter(p => p.category === currentCategory);
    filteredProducts = [...allProducts];

    updateProductCount();
    displayProducts();
    updateResultsCount();
  } catch (error) {
    console.error('Error loading category products:', error);
    showError();
  }
}

// Show error message
function showError() {
  const container = document.getElementById('products-container');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="text-red-400 mb-4">
          <i class="fas fa-exclamation-triangle text-6xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h3>
        <p class="text-gray-600 mb-6">Something went wrong while loading the products. Please try again.</p>
        <button onclick="loadCategoryProducts()" class="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300">
          Try Again
        </button>
      </div>
    `;
  }
}

// ========================================
// FILTERING AND SORTING FUNCTIONS
// ========================================

// Toggle sort dropdown
function toggleSortDropdown() {
  const dropdown = document.getElementById('sort-dropdown');
  if (dropdown) {
    if (dropdown.classList.contains('hide')) {
      dropdown.classList.remove('hide');
      dropdown.classList.add('show');
    } else {
      hideSortDropdown();
    }
  }
}

// Hide sort dropdown
function hideSortDropdown() {
  const dropdown = document.getElementById('sort-dropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
    dropdown.classList.add('hide');
  }
}

// Handle sorting
function handleSort(sortType) {
  currentSort = sortType;
  const sortTextElement = document.getElementById('sort-text');
  if (sortTextElement) {
    sortTextElement.textContent = event.target.textContent;
  }
  hideSortDropdown();
  
  switch(sortType) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      filteredProducts = [...allProducts];
      applyFilters();
      return;
  }
  
  displayProducts();
}

// Handle price filter
function handlePriceFilter(priceRange) {
  currentPriceFilter = priceRange;
  
  // Update active filter button
  document.querySelectorAll('.price-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  applyFilters();
}

// Apply all filters
function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Price filter
    if (currentPriceFilter !== 'all') {
      const price = product.price;
      switch(currentPriceFilter) {
        case '0-25':
          if (price > 25) return false;
          break;
        case '25-50':
          if (price < 25 || price > 50) return false;
          break;
        case '50-100':
          if (price < 50 || price > 100) return false;
          break;
        case '100+':
          if (price < 100) return false;
          break;
      }
    }
    
    return true;
  });
  
  // Apply current sort
  if (currentSort !== 'default') {
    handleSort(currentSort);
  } else {
    displayProducts();
  }
  
  updateResultsCount();
}

// Handle search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  filteredProducts = allProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm)
  );
  
  // Apply other filters
  applyFilters();
}

// Set view (grid/list) for category page
function setView(viewType) {
  const gridBtn = document.getElementById('grid-view');
  const listBtn = document.getElementById('list-view');
  const container = document.getElementById('products-container');
  
  if (!gridBtn || !listBtn || !container) return;
  
  if (viewType === 'grid') {
    gridBtn.classList.add('bg-purple-600', 'text-white');
    gridBtn.classList.remove('bg-gray-200', 'text-gray-600');
    listBtn.classList.add('bg-gray-200', 'text-gray-600');
    listBtn.classList.remove('bg-purple-600', 'text-white');
    container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
  } else {
    listBtn.classList.add('bg-purple-600', 'text-white');
    listBtn.classList.remove('bg-gray-200', 'text-gray-600');
    gridBtn.classList.add('bg-gray-200', 'text-gray-600');
    gridBtn.classList.remove('bg-purple-600', 'text-white');
    container.className = 'space-y-6';
  }
  
  displayProducts();
}

// Clear all filters
function clearFilters() {
  currentPriceFilter = 'all';
  currentSort = 'default';
  
  const searchInput = document.getElementById('search-input');
  const sortText = document.getElementById('sort-text');
  
  if (searchInput) searchInput.value = '';
  if (sortText) sortText.textContent = 'Default';
  
  // Reset filter buttons
  document.querySelectorAll('.price-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  const allPriceBtn = document.querySelector('[data-price="all"]');
  if (allPriceBtn) allPriceBtn.classList.add('active');
  
  // Reset products
  filteredProducts = [...allProducts];
  displayProducts();
  updateResultsCount();
}

// ========================================
// CHECKOUT FORM HANDLING
// ========================================

// Setup checkout form validation and formatting
function setupCheckoutForm() {
  // Format card number input
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') ?? value;
      e.target.value = formattedValue;
    });
  }

  // Format expiry date input
  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2,4);
      }
      e.target.value = value;
    });
  }

  // CVV input validation
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  // Form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const button = document.querySelector('.place-order-btn');
      const buttonText = button.querySelector('span');
      const buttonIcon = button.querySelector('i');
      let redirected = false; // Flag to track if user clicked the button

      // Show loading state
      button.classList.add('loading');
      buttonIcon.className = 'fas fa-spinner spinner';
      buttonText.textContent = 'Processing Order...';

      // Simulate order processing
      setTimeout(() => {
        // Show order success toast
        const toast = document.getElementById('order-toast');
        if (toast) {
          toast.style.display = 'flex';
        }

        // Clear the cart after successful checkout
        localStorage.setItem('cart', '[]');
        cartData = [];
        updateCartCount();

        // Button click handler
        const goHomeBtn = document.getElementById('go-home-btn');
        if (goHomeBtn) {
          goHomeBtn.onclick = function() {
            redirected = true;
            window.location.href = '../index.html';
          };
        }

        setTimeout(() => {
          if (toast) {
            toast.style.opacity = 0;
            setTimeout(() => { 
              toast.style.display = 'none'; 
              if (!redirected) {
                window.location.href = '../index.html';
              }
            }, 300);
          }
        }, 2000);

        button.classList.remove('loading');
        buttonIcon.className = 'fas fa-lock';
        buttonText.textContent = 'Place Secure Order';
      }, 2000);
    });
  }
}

// ========================================
// PAGE INITIALIZATION
// ========================================

// Main initialization function
function initializePage() {
  // Initialize cart data
  initializeCart();
  
  // Handle home page with product list
  if (document.getElementById("product-list")) {
    fetch(API_URL)
      .then(res => res.json())
      .then(products => {
        // Check if we have a featured product container (home page)
        const featuredContainer = document.getElementById("featured-product");
        if (featuredContainer) {
          const randomIndex = Math.floor(Math.random() * products.length);
          displayFeaturedProduct(products[randomIndex]);
          displayProducts(products.slice(1, 5)); // Show next 4 products in grid
        } else {
          displayProducts(products); // Show all products in grid
        }
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        const productList = document.getElementById("product-list");
        if (productList) {
          productList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Failed to load products. Please try again later.</p>';
        }
      });
  }
  
  // Handle categories list page (home page)
  if (document.getElementById("categories-list")) {
    Promise.all([
      fetch(CATEGORIES_URL).then(res => res.json()),
      fetch(API_URL).then(res => res.json())
    ])
    .then(([categories, products]) => {
      displayCategories(categories, products);
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      const categoriesList = document.getElementById("categories-list");
      if (categoriesList) {
        categoriesList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Failed to load categories. Please try again later.</p>';
      }
    });
  }
  
  // Handle category page
  if (document.getElementById('products-container') && !document.getElementById("product-list")) {
    currentCategory = getCategoryFromURL();
    loadCategoryProducts();
  }
  
  // Handle cart page
  if (document.getElementById('cart-items')) {
    renderCart();
  }
  
  // Handle checkout page
  if (document.getElementById('checkout-form')) {
    loadOrderSummary();
    setupCheckoutForm();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Event delegation for add to cart buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const btn = e.target;
      addToCart(
        parseInt(btn.getAttribute('data-id')),
        btn.getAttribute('data-title'),
        parseFloat(btn.getAttribute('data-price')),
        btn.getAttribute('data-image')
      );
    }
  });

  // Category page specific event listeners
  const sortDropdownBtn = document.getElementById('sort-dropdown-btn');
  if (sortDropdownBtn) {
    sortDropdownBtn.addEventListener('click', toggleSortDropdown);
  }

  // Sort options
  document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', (e) => handleSort(e.target.dataset.sort));
  });

  // Price filters
  document.querySelectorAll('.price-filter').forEach(btn => {
    btn.addEventListener('click', (e) => handlePriceFilter(e.target.dataset.price));
  });

  // Search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // View toggle buttons
  const gridViewBtn = document.getElementById('grid-view');
  const listViewBtn = document.getElementById('list-view');
  if (gridViewBtn) gridViewBtn.addEventListener('click', () => setView('grid'));
  if (listViewBtn) listViewBtn.addEventListener('click', () => setView('list'));

  // Cart page specific event listeners
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartData.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      showToast('Redirecting to checkout...');
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 1000);
    });
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sort-dropdown-btn') && !e.target.closest('#sort-dropdown')) {
      hideSortDropdown();
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show confirmation when adding to cart (alternative method)
function showAddToCartConfirmation(productTitle) {
  showToast(`Added "${productTitle}" to cart!`);
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
  setupEventListeners();
  
  // Category page specific initialization
  if (document.getElementById('products-container') && !document.getElementById("product-list")) {
    currentCategory = getCategoryFromURL();
  }
});