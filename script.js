/* ===== script.js ===== */
const products = [
  { id: 1, name: "Nivea Body Lotion",  price: 23,   barcode: "111111", category: "all", image: "images/Nivea.png", stock: 15, lowStockThreshold: 5 },
  { id: 2, name: "Apple 1kg", price: 12,  barcode: "222222", category: "dry", image: "images/apple.jpg", stock: 20, lowStockThreshold: 8 },
  { id: 3, name: "Quaker Oats 1kg",    price: 34,   barcode: "333333", category: "pulses", image: "images/oat.jpg", stock: 12, lowStockThreshold: 5 },
  { id: 4, name: "Corn Flakes",        price: 28,  barcode: "444444", category: "all", image: "images/corn flakes.jpg", stock: 8, lowStockThreshold: 4 },
  { id: 5, name: "Cold Pressed Oil",   price: 32,  barcode: "555555", category: "oils", image: "images/oil.png", stock: 6, lowStockThreshold: 3 },
  { id: 6, name: "Choco Fudge Mix",    price: 30, barcode: "666666", category: "all", image: "images/choco.jpg", stock: 3, lowStockThreshold: 5 },
];

// Stock history for tracking changes
const stockHistory = [
  { productId: 1, date: "2025-06-25", action: "Initial stock", quantity: 15, user: "Admin", notes: "Initial inventory" },
  { productId: 2, date: "2025-06-25", action: "Initial stock", quantity: 20, user: "Admin", notes: "Initial inventory" },
  { productId: 3, date: "2025-06-25", action: "Initial stock", quantity: 12, user: "Admin", notes: "Initial inventory" },
  { productId: 4, date: "2025-06-25", action: "Initial stock", quantity: 8, user: "Admin", notes: "Initial inventory" },
  { productId: 5, date: "2025-06-25", action: "Initial stock", quantity: 6, user: "Admin", notes: "Initial inventory" },
  { productId: 6, date: "2025-06-25", action: "Initial stock", quantity: 3, user: "Admin", notes: "Initial inventory" },
];

/* DOM refs */
const productGrid  = document.getElementById("product-grid");
const cartItemsEl  = document.getElementById("cart-items");
const itemCountEl  = document.getElementById("item-count");
const qtyCountEl   = document.getElementById("qty-count");
const totalPriceEl = document.getElementById("total-price");
const searchInput  = document.getElementById("search");
const categoryNav  = document.getElementById("categoryNav");

const modalOverlay = document.getElementById("modalOverlay");
const addProductBtn= document.getElementById("addProductBtn");
const cancelModalBtn=document.getElementById("cancelModal");
const addProductForm=document.getElementById("addProductForm");
const productImageInp=document.getElementById("productImage");

const paymentOverlay   = document.getElementById("paymentOverlay");
const paymentOptions   = document.getElementById("paymentOptions");
const payCardBtn       = document.getElementById("payCard");
const payCashBtn       = document.getElementById("payCash");
const paymentProcessing= document.getElementById("paymentProcessing");
const cashForm         = document.getElementById("cashForm");
const cashReceivedInp  = document.getElementById("cashReceived");
const calcChangeBtn    = document.getElementById("calcChange");
const paymentResult    = document.getElementById("paymentResult");
const paymentMessage   = document.getElementById("paymentMessage");
const donePaymentBtn   = document.getElementById("donePayment");
const checkoutBtn      = document.getElementById("checkoutBtn");

/* State */
let cart = [];
let filteredProducts = [...products];

/* Catalogue */
function renderProducts(list) {
  productGrid.innerHTML = "";
  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    const imgSrc = p.image || "https://via.placeholder.com/150?text=No+Image";
    
    // Check stock status
    const isOutOfStock = p.stock <= 0;
    const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
    const stockClass = isOutOfStock ? 'out-of-stock' : (isLowStock ? 'low-stock' : '');
    
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>${p.price.toFixed(2)} ﷼</p>
      <div class="stock-info ${stockClass}">
        <span class="stock-text">Stock: ${p.stock}</span>
        ${isOutOfStock ? '<span class="stock-status">Out of Stock</span>' : ''}
        ${isLowStock && !isOutOfStock ? '<span class="stock-status">Low Stock</span>' : ''}
      </div>
      <button data-id="${p.id}" class="add-btn" ${isOutOfStock ? 'disabled' : ''}>Add</button>
      <button data-id="${p.id}" class="edit-btn">Edit Price</button>`;
    productGrid.appendChild(card);
  });
}
function refreshProducts() { renderProducts(filteredProducts); }

/* Cart */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  
  // Check current quantity in cart
  const cartItem = cart.find(i => i.id === id);
  const currentCartQty = cartItem ? cartItem.qty : 0;
  
  // Check if we have enough stock for one more item
  if (product.stock <= currentCartQty) {
    alert(getText('outOfStock') + ` (Available: ${product.stock - currentCartQty})`);
    return;
  }
  
  // Add to cart (don't reduce stock yet - only reduce when payment is completed)
  if (cartItem) {
    cartItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  
  renderCart();
}
function renderCart() {
  cartItemsEl.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty}`;
    li.appendChild(Object.assign(document.createElement("span"), {
      textContent: `${(item.price * item.qty).toFixed(2)} ﷼`
    }));
    cartItemsEl.appendChild(li);
  });
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  itemCountEl.textContent  = `Total Items: ${cart.length}`;
  qtyCountEl.textContent   = `Total Quantity: ${totalQty}`;
  totalPriceEl.textContent = `${totalPrice.toFixed(2)} ﷼`;
}

/* Filters & search */
categoryNav.addEventListener("click", e => {
  if (!e.target.classList.contains("category")) return;
  [...categoryNav.children].forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");
  const cat = e.target.dataset.cat;
  filteredProducts = cat === "all" ? [...products] : products.filter(p => p.category === cat);
  refreshProducts();
});
searchInput.addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  filteredProducts = products.filter(p => p.name.toLowerCase().includes(term));
  refreshProducts();
});

/* Add / Edit buttons */
productGrid.addEventListener("click", e => {
  const id = e.target.dataset.id ? Number(e.target.dataset.id) : null;
  if (!id) return;
  if (e.target.classList.contains("add-btn")) {
    // Check if button is disabled (out of stock)
    if (e.target.disabled) {
      return;
    }
    addToCart(id);
  } else if (e.target.classList.contains("edit-btn")) {
    const product = products.find(p => p.id === id);
    // This function is overridden in language.js
    const newPrice = parseFloat(prompt(`Enter new price for ${product.name}:`, product.price));
    if (!Number.isNaN(newPrice) && newPrice >= 0) {
      product.price = newPrice;
      refreshProducts();
      renderCart();
    }
  }
});

/* Add-product modal */
function openAddModal() { modalOverlay.classList.remove("hidden"); document.getElementById("productName").focus(); }
function closeAddModal() { modalOverlay.classList.add("hidden"); addProductForm.reset(); }
addProductBtn.addEventListener("click", openAddModal);
cancelModalBtn.addEventListener("click", closeAddModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeAddModal(); });

addProductForm.addEventListener("submit", e => {
  e.preventDefault();
  const name     = document.getElementById("productName").value.trim();
  const price    = parseFloat(document.getElementById("productPrice").value);
  const barcode  = document.getElementById("productBarcode").value.trim();
  const category = document.getElementById("productCategory").value;
  let imageURL   = "https://via.placeholder.com/150?text=No+Image";
  if (productImageInp.files[0]) imageURL = URL.createObjectURL(productImageInp.files[0]);
  
  // Default stock values
  const stock = 0;
  const lowStockThreshold = 5;
  
  const newProductId = Date.now();
  
  // Add new product
  products.push({ 
    id: newProductId, 
    name, 
    price, 
    barcode, 
    category, 
    image: imageURL,
    stock,
    lowStockThreshold
  });
  
  // Add to stock history
  stockHistory.push({
    productId: newProductId,
    date: new Date().toISOString().split('T')[0],
    action: "New product",
    quantity: 0,
    user: "Admin",
    notes: "New product added"
  });
  
  filteredProducts = [...products];
  refreshProducts();
  closeAddModal();
});

/* Checkout / payment */
function resetPaymentModal() {
  paymentOptions.classList.remove("hidden");
  paymentProcessing.classList.add("hidden");
  cashForm.classList.add("hidden");
  paymentResult.classList.add("hidden");
  cashReceivedInp.value = "";
}
function openPaymentModal() { if (cart.length) { paymentOverlay.classList.remove("hidden"); resetPaymentModal(); } }
function closePaymentModal() { paymentOverlay.classList.add("hidden"); }

checkoutBtn.addEventListener("click", openPaymentModal);
paymentOverlay.addEventListener("click", e => { if (e.target === paymentOverlay) closePaymentModal(); });

payCardBtn.addEventListener("click", () => {
  paymentOptions.classList.add("hidden");
  paymentProcessing.classList.remove("hidden");
  setTimeout(() => {
    paymentProcessing.classList.add("hidden");
    paymentMessage.textContent = "Payment approved! Printing receipt...";
    paymentResult.classList.remove("hidden");
  }, 2500);
});

payCashBtn.addEventListener("click", () => {
  paymentOptions.classList.add("hidden");
  cashForm.classList.remove("hidden");
});
calcChangeBtn.addEventListener("click", () => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const received = parseFloat(cashReceivedInp.value);
  if (isNaN(received) || received < total) { alert("Insufficient cash received!"); return; } // Alert is overridden in language.js
  paymentMessage.textContent = `Change to return: ${(received - total).toFixed(2)} ﷼`;
  cashForm.classList.add("hidden");
  paymentResult.classList.remove("hidden");
});
donePaymentBtn.addEventListener("click", () => { 
  // Update stock levels and record stock changes for items in cart
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      // Reduce stock level
      product.stock = Math.max(0, product.stock - item.qty);
      
      // Record stock change in history
      stockHistory.push({
        productId: item.id,
        date: new Date().toISOString().split('T')[0],
        action: "Sale",
        quantity: -item.qty,
        user: "Cashier",
        notes: `Sale of ${item.qty} units - Stock reduced from ${product.stock + item.qty} to ${product.stock}`
      });
    }
  });
  
  // Save updated products and stock history to localStorage
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
  
  // Clear cart and close modal
  cart = []; 
  renderCart(); 
  closePaymentModal();
  
  // Refresh the products display to show updated stock levels
  refreshProducts();
});

/* Stock Management Functions */
function updateStockLevel(productId, newStock, action, notes) {
  const product = products.find(p => p.id === productId);
  if (!product) return false;
  
  const oldStock = product.stock;
  product.stock = newStock;
  
  // Add to stock history
  stockHistory.push({
    productId,
    date: new Date().toISOString().split('T')[0],
    action,
    quantity: newStock - oldStock,
    user: "Admin",
    notes: notes || `Stock updated from ${oldStock} to ${newStock}`
  });
  
  return true;
}

function getStockStatus(product) {
  if (product.stock <= 0) return 'outOfStock';
  if (product.stock <= product.lowStockThreshold) return 'lowStock';
  return 'inStock';
}

/* Page Navigation */
let currentPage = 'pos'; // 'pos' or 'stock'

function showPage(page) {
  console.log('Showing page:', page);
  currentPage = page;
  
  // Hide all pages
  document.getElementById('pos-page').classList.toggle('hidden', page !== 'pos');
  document.getElementById('stock-page').classList.toggle('hidden', page !== 'stock');
  
  // Update navigation buttons
  document.getElementById('posPageBtn').classList.toggle('active', page === 'pos');
  document.getElementById('stockManagementBtn').classList.toggle('active', page === 'stock');
  
  if (page === 'stock') {
    console.log('Stock page requested, initializing...');
    
    // Direct rendering of stock data
    setTimeout(() => {
      console.log('Direct rendering of stock data');
      
      // Ensure we have sample data
      if (!products || products.length === 0) {
        console.log('Creating sample product data');
        products = [
          { id: 1, name: "Coffee", price: 5.00, category: "drinks", barcode: "123456", image: "https://via.placeholder.com/150?text=Coffee", stock: 20, lowStockThreshold: 5 },
          { id: 2, name: "Tea", price: 3.00, category: "drinks", barcode: "234567", image: "https://via.placeholder.com/150?text=Tea", stock: 15, lowStockThreshold: 5 },
          { id: 3, name: "Sandwich", price: 8.00, category: "food", barcode: "345678", image: "https://via.placeholder.com/150?text=Sandwich", stock: 8, lowStockThreshold: 3 },
          { id: 4, name: "Cake", price: 6.00, category: "food", barcode: "456789", image: "https://via.placeholder.com/150?text=Cake", stock: 12, lowStockThreshold: 4 },
          { id: 5, name: "Chips", price: 2.00, category: "snacks", barcode: "567890", image: "https://via.placeholder.com/150?text=Chips", stock: 25, lowStockThreshold: 8 },
          { id: 6, name: "Chocolate", price: 2.50, category: "snacks", barcode: "678901", image: "https://via.placeholder.com/150?text=Chocolate", stock: 0, lowStockThreshold: 5 }
        ];
        localStorage.setItem('products', JSON.stringify(products));
      }
      
      if (!stockHistory || stockHistory.length === 0) {
        console.log('Creating sample stock history');
        stockHistory = [
          { productId: 1, date: "2025-06-28", action: "Stock added", quantity: 20, user: "Admin", notes: "Initial stock" },
          { productId: 2, date: "2025-06-28", action: "Stock added", quantity: 15, user: "Admin", notes: "Initial stock" },
          { productId: 3, date: "2025-06-28", action: "Stock added", quantity: 10, user: "Admin", notes: "Initial stock" },
          { productId: 3, date: "2025-06-29", action: "Stock removed", quantity: -2, user: "Cashier", notes: "Sale" },
          { productId: 6, date: "2025-06-28", action: "Stock added", quantity: 5, user: "Admin", notes: "Initial stock" },
          { productId: 6, date: "2025-06-29", action: "Stock removed", quantity: -5, user: "Cashier", notes: "Sale" }
        ];
        localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
      }
      
      // Render stock table
      const stockTableBody = document.getElementById('stockTableBody');
      if (stockTableBody) {
        stockTableBody.innerHTML = '';
        
        products.forEach(product => {
          const row = document.createElement('tr');
          const stockStatus = product.stock === 0 ? 'outOfStock' : 
                           (product.stock <= product.lowStockThreshold ? 'lowStock' : '');
          row.className = stockStatus;
          
          row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image || 'https://via.placeholder.com/150?text=No+Image'}" alt="${product.name}" class="stock-product-image"></td>
            <td>${product.name}</td>
            <td><span class="stock-value ${stockStatus}">${product.stock}</span></td>
            <td>${product.lowStockThreshold}</td>
            <td>
              <button class="quick-add-btn" data-id="${product.id}">+1</button>
              <button class="update-stock-btn" data-id="${product.id}">Update Stock</button>
            </td>
          `;
          
          stockTableBody.appendChild(row);
        });
      }
      
      // Render stock history
      const historyTableBody = document.getElementById('historyTableBody');
      if (historyTableBody) {
        historyTableBody.innerHTML = '';
        
        stockHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
          .forEach(entry => {
            const product = products.find(p => p.id === entry.productId);
            if (!product) return;
            
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${entry.date}</td>
              <td>${product.name}</td>
              <td>${entry.action}</td>
              <td>${entry.quantity > 0 ? '+' + entry.quantity : entry.quantity}</td>
              <td>${entry.user}</td>
              <td>${entry.notes}</td>
            `;
            
            historyTableBody.appendChild(row);
          });
      }
      
      // Update statistics
      const statsContainer = document.querySelector('.stock-stats') || document.createElement('div');
      statsContainer.className = 'stock-stats';
      
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;
      
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon total-products-icon">📦</div>
          <div class="stat-content">
            <div class="stat-value">${totalProducts}</div>
            <div class="stat-label">Total Products</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total-stock-icon">🔢</div>
          <div class="stat-content">
            <div class="stat-value">${totalStock}</div>
            <div class="stat-label">Total Stock</div>
          </div>
        </div>
        <div class="stat-card ${lowStockProducts > 0 ? 'warning' : ''}">
          <div class="stat-icon low-stock-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">${lowStockProducts}</div>
            <div class="stat-label">Low Stock</div>
          </div>
        </div>
        <div class="stat-card ${outOfStockProducts > 0 ? 'danger' : ''}">
          <div class="stat-icon out-of-stock-icon">❗</div>
          <div class="stat-content">
            <div class="stat-value">${outOfStockProducts}</div>
            <div class="stat-label">Out of Stock</div>
          </div>
        </div>
      `;
      
      const stockHeader = document.querySelector('.stock-header');
      if (stockHeader && !document.querySelector('.stock-stats')) {
        stockHeader.after(statsContainer);
      }
      
      // Add event listeners to buttons
      document.querySelectorAll('.quick-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.dataset.id);
          const product = products.find(p => p.id === productId);
          if (product) {
            product.stock += 1;
            localStorage.setItem('products', JSON.stringify(products));
            
            // Add to history
            stockHistory.push({
              productId,
              date: new Date().toISOString().split('T')[0],
              action: "Quick add",
              quantity: 1,
              user: "Admin",
              notes: "Quick add +1"
            });
            localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
            
            // Refresh the page
            showPage('stock');
          }
        });
      });
      
      // Call the stock page initialization function if it exists
      if (typeof initializeStockPage === 'function') {
        console.log('Calling initializeStockPage from showPage function');
        initializeStockPage();
      }
    }, 100);
  }
}

/* Init */

// Check if products array is empty and add sample data if needed
if (!products || products.length === 0) {
  console.log('No products found, adding sample data');
  products = [
    { id: 1, name: "Coffee", price: 5.00, category: "drinks", barcode: "123456", image: "https://via.placeholder.com/150?text=Coffee", stock: 20, lowStockThreshold: 5 },
    { id: 2, name: "Tea", price: 3.00, category: "drinks", barcode: "234567", image: "https://via.placeholder.com/150?text=Tea", stock: 15, lowStockThreshold: 5 },
    { id: 3, name: "Sandwich", price: 8.00, category: "food", barcode: "345678", image: "https://via.placeholder.com/150?text=Sandwich", stock: 8, lowStockThreshold: 3 },
    { id: 4, name: "Cake", price: 6.00, category: "food", barcode: "456789", image: "https://via.placeholder.com/150?text=Cake", stock: 12, lowStockThreshold: 4 },
    { id: 5, name: "Chips", price: 2.00, category: "snacks", barcode: "567890", image: "https://via.placeholder.com/150?text=Chips", stock: 25, lowStockThreshold: 8 },
    { id: 6, name: "Chocolate", price: 2.50, category: "snacks", barcode: "678901", image: "https://via.placeholder.com/150?text=Chocolate", stock: 0, lowStockThreshold: 5 }
  ];
  
  // Add some stock history for the sample products
  stockHistory = [
    { productId: 1, date: "2025-06-28", action: "Stock added", quantity: 20, user: "Admin", notes: "Initial stock" },
    { productId: 2, date: "2025-06-28", action: "Stock added", quantity: 15, user: "Admin", notes: "Initial stock" },
    { productId: 3, date: "2025-06-28", action: "Stock added", quantity: 10, user: "Admin", notes: "Initial stock" },
    { productId: 3, date: "2025-06-29", action: "Stock removed", quantity: -2, user: "Cashier", notes: "Sale" },
    { productId: 6, date: "2025-06-28", action: "Stock added", quantity: 5, user: "Admin", notes: "Initial stock" },
    { productId: 6, date: "2025-06-29", action: "Stock removed", quantity: -5, user: "Cashier", notes: "Sale" }
  ];
  
  // Save to localStorage
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
}

refreshProducts();
renderCart();

// Add direct event listener to stock management button to ensure it works
document.getElementById('stockManagementBtn').addEventListener('click', function() {
  showPage('stock');
  // Directly call stock initialization functions
  if (typeof initializeStockPage === 'function') {
    console.log('Directly initializing stock page from script.js');
    initializeStockPage();
  }
});
