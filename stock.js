/* ===== stock.js ===== */

// DOM references for stock management - we'll initialize these when the page loads
let stockTableBody;
let historyTableBody;
let stockSearch;
let stockFilter;
let applyFilterBtn;
let stockUpdateModal;
let updateStockForm;
let updateProductId;
let updateProductName;
let currentStockValue;
let stockQuantityInput;
let stockQuantity;
let quantityActionLabel;
let addStockBtn;
let removeStockBtn;
let setStockBtn;
let cancelStockUpdate;

// New DOM references for products status and notifications
let stockNotifications;
let productsStatusTableBody;
let productsStatusSearch;
let statusFilter;

// Navigation buttons
const posPageBtn = document.getElementById('posPageBtn');
const stockManagementBtn = document.getElementById('stockManagementBtn');

// Function to initialize all DOM references
function initializeStockDOMReferences() {
  console.log('Initializing stock DOM references');
  
  // Table elements
  stockTableBody = document.getElementById('stockTableBody');
  historyTableBody = document.getElementById('historyTableBody');
  
  // New elements for products status and notifications
  stockNotifications = document.getElementById('stockNotifications');
  productsStatusTableBody = document.getElementById('productsStatusTableBody');
  productsStatusSearch = document.getElementById('productsStatusSearch');
  statusFilter = document.getElementById('statusFilter');
  
  // Search and filter elements
  stockSearch = document.getElementById('stockSearch');
  stockFilter = document.getElementById('stockFilter');
  applyFilterBtn = document.getElementById('applyFilterBtn');
  
  // Modal elements
  stockUpdateModal = document.getElementById('stockUpdateModal');
  updateStockForm = document.getElementById('updateStockForm');
  updateProductId = document.getElementById('updateProductId');
  updateProductName = document.getElementById('updateProductName');
  currentStockValue = document.getElementById('currentStockValue');
  stockQuantityInput = document.getElementById('stockQuantityInput');
  stockQuantity = document.getElementById('stockQuantity');
  quantityActionLabel = document.getElementById('quantityActionLabel');
  addStockBtn = document.getElementById('addStockBtn');
  removeStockBtn = document.getElementById('removeStockBtn');
  setStockBtn = document.getElementById('setStockBtn');
  cancelStockUpdate = document.getElementById('cancelStockUpdate');
  
  console.log('Stock DOM elements initialized:', {
    stockTableBody,
    historyTableBody,
    stockFilter,
    stockSearch
  });
}

// Stock statistics elements
const totalProductsElement = document.createElement('div');
const totalStockElement = document.createElement('div');
const lowStockProductsElement = document.createElement('div');
const outOfStockProductsElement = document.createElement('div');

// Current action for stock update
let currentStockAction = '';

// Event listeners for navigation
posPageBtn.addEventListener('click', () => showPage('pos'));
stockManagementBtn.addEventListener('click', () => {
  showPage('stock');
  // Initialize stock page when switching to it
  initializeStockPage();
});

// Function to initialize the stock page
function initializeStockPage() {
  console.log('Initializing stock page');
  // Initialize DOM references first
  initializeStockDOMReferences();
  
  // Check if products array exists and is accessible
  if (typeof products === 'undefined') {
    console.error('Products array is not defined! Attempting to access the global products array...');
    // Try to access the products array from the global scope
    window.products = window.products || [
      { id: 1, name: "Test Product", price: 10, stock: 5, lowStockThreshold: 3 }
    ];
  }
  
  console.log('Products array check:', products);
  
  // Force a small delay to ensure DOM is ready
  setTimeout(() => {
    // Then update the UI components
    updateStockStatistics();
    renderStockTable('all', '');
    renderStockHistory();
    addExportButton();
    
    // Render new components
    renderStockNotifications();
    renderProductsStatusTable();
    addProductsStatusEventListeners();
    
    // Log the products to verify data is available
    console.log('Products for stock table:', products);
  }, 100);
}

// Calculate and display stock statistics
function updateStockStatistics() {
  console.log('Updating stock statistics');
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  console.log('Stats calculated:', { totalProducts, totalStock, lowStockProducts, outOfStockProducts });
  
  // Create statistics dashboard
  let statsContainer = document.querySelector('.stock-stats');
  const stockHeader = document.querySelector('.stock-header');
  
  console.log('Stock header element:', stockHeader);
  
  // If stock header is not found, try to find the stock container and insert at the beginning
  if (!stockHeader) {
    console.log('Stock header not found, trying alternative placement');
    const stockContainer = document.querySelector('.stock-container');
    if (stockContainer) {
      if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'stock-stats';
        stockContainer.insertBefore(statsContainer, stockContainer.firstChild);
      }
    } else {
      console.error('Could not find stock container either!');
      return; // Exit if we can't find a place to add the stats
    }
  } else if (!statsContainer) {
    // Normal flow if stock header exists but stats container doesn't
    statsContainer = document.createElement('div');
    statsContainer.className = 'stock-stats';
    stockHeader.after(statsContainer);
  }
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon total-products-icon">📦</div>
      <div class="stat-content">
        <div class="stat-value">${totalProducts}</div>
        <div class="stat-label" data-translate="totalProducts">Total Products</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon total-stock-icon">🔢</div>
      <div class="stat-content">
        <div class="stat-value">${totalStock}</div>
        <div class="stat-label" data-translate="totalStock">Total Stock</div>
      </div>
    </div>
    <div class="stat-card ${lowStockProducts > 0 ? 'warning' : ''}">
      <div class="stat-icon low-stock-icon">⚠️</div>
      <div class="stat-content">
        <div class="stat-value">${lowStockProducts}</div>
        <div class="stat-label" data-translate="lowStockProducts">Low Stock Products</div>
      </div>
    </div>
    <div class="stat-card ${outOfStockProducts > 0 ? 'danger' : ''}">
      <div class="stat-icon out-of-stock-icon">❗</div>
      <div class="stat-content">
        <div class="stat-value">${outOfStockProducts}</div>
        <div class="stat-label" data-translate="outOfStockProducts">Out of Stock Products</div>
      </div>
    </div>
  `;
  
  // Apply translations
  applyTranslations();
}

// Render stock table with enhanced features
function renderStockTable(filterValue = 'all', searchTerm = '') {
  console.log('Rendering stock table with filter:', filterValue, 'and search term:', searchTerm);
  console.log('Stock table body element:', stockTableBody);
  
  if (!stockTableBody) {
    console.error('Stock table body element not found!');
    return;
  }
  
  stockTableBody.innerHTML = '';
  
  // Verify products array exists and has items
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.error('Products array is empty or invalid:', products);
    stockTableBody.innerHTML = `<tr><td colspan="6" class="no-products-message" data-translate="noProductsFound">No products found</td></tr>`;
    return;
  }
  
  console.log('Total products before filtering:', products.length);
  let filteredStockProducts = [...products];
  
  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredStockProducts = filteredStockProducts.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.barcode && p.barcode.includes(term)) ||
      p.id.toString().includes(term)
    );
  }
  
  // Apply status filter
  if (filterValue !== 'all') {
    filteredStockProducts = filteredStockProducts.filter(p => getStockStatus(p) === filterValue);
  }
  
  console.log('Filtered products count:', filteredStockProducts.length);
  
  // Update statistics
  updateStockStatistics();
  
  console.log('Sorting products by stock status...');
  // Sort by stock status (out of stock first, then low stock, then in stock)
  filteredStockProducts.sort((a, b) => {
    const statusA = getStockStatus(a);
    const statusB = getStockStatus(b);
    
    if (statusA === 'outOfStock' && statusB !== 'outOfStock') return -1;
    if (statusA !== 'outOfStock' && statusB === 'outOfStock') return 1;
    if (statusA === 'lowStock' && statusB !== 'lowStock' && statusB !== 'outOfStock') return -1;
    if (statusA !== 'lowStock' && statusA !== 'outOfStock' && statusB === 'lowStock') return 1;
    return 0;
  });
  
  // Update statistics
  updateStockStatistics();
  
  console.log('Rendering ' + filteredStockProducts.length + ' products in stock table');
  
  // Show message if no products match the filter
  if (filteredStockProducts.length === 0) {
    stockTableBody.innerHTML = `<tr><td colspan="6" class="no-products-message" data-translate="noProductsFound">No products found</td></tr>`;
    return;
  }
  
  // Render each row
  filteredStockProducts.forEach(product => {
    const row = document.createElement('tr');
    const stockStatus = getStockStatus(product);
    row.className = stockStatus;
    
    row.innerHTML = `
      <td>${product.id}</td>
      <td><img src="${product.image || 'https://via.placeholder.com/150?text=No+Image'}" alt="${product.name}" class="stock-product-image"></td>
      <td>${product.name}</td>
      <td>
        <span class="stock-value ${stockStatus}">${product.stock}</span>
      </td>
      <td>${product.lowStockThreshold}</td>
      <td>
        <button class="quick-add-btn" data-id="${product.id}">+1</button>
        <button class="update-stock-btn" data-id="${product.id}">${getText ? getText('updateStock') : 'Update Stock'}</button>
      </td>
    `;
    
    stockTableBody.appendChild(row);
  });
  
  console.log('Adding event listeners to stock buttons');
  
  // Add event listeners to the buttons
  const quickAddButtons = stockTableBody.querySelectorAll('.quick-add-btn');
  quickAddButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = parseInt(this.dataset.id);
      const product = products.find(p => p.id === productId);
      if (product) {
        product.stock += 1;
        
        // Add to stock history
        stockHistory.push({
          productId,
          date: new Date().toISOString().split('T')[0],
          action: "Quick add",
          quantity: 1,
          user: "Admin",
          notes: "Quick add +1"
        });
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
        
        // Show notification
        if (typeof showNotification === 'function') {
          showNotification(getText ? getText('stockUpdated') : 'Stock updated');
        } else {
          alert(getText ? getText('stockUpdated') : 'Stock updated');
        }
        
        // Refresh the table
        renderStockTable(stockFilter ? stockFilter.value : 'all', stockSearch ? stockSearch.value : '');
        renderStockHistory();
      }
    });
  });
  
  const updateStockButtons = stockTableBody.querySelectorAll('.update-stock-btn');
  updateStockButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = parseInt(this.dataset.id);
      if (typeof openStockUpdateModal === 'function') {
        openStockUpdateModal(productId);
      } else {
        console.error('openStockUpdateModal function not found');
      }
    });
  });
}

// Render stock history table
function renderStockHistory() {
  console.log('Rendering stock history');
  
  if (!historyTableBody) {
    console.error('History table body element not found!');
    return;
  }
  
  historyTableBody.innerHTML = '';
  
  // Check if stock history exists
  if (!stockHistory || !Array.isArray(stockHistory) || stockHistory.length === 0) {
    console.log('No stock history found');
    historyTableBody.innerHTML = `<tr><td colspan="6" class="no-history-message">No stock history available</td></tr>`;
    return;
  }
  
  console.log('Total history entries:', stockHistory.length);
  
  // Sort by date (newest first)
  const sortedHistory = [...stockHistory].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Render each history entry
  sortedHistory.forEach(entry => {
    const product = products.find(p => p.id === entry.productId);
    if (!product) {
      console.log('Product not found for history entry:', entry);
      return; // Skip if product not found
    }
    
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
  
  console.log('Stock history rendered successfully');
}

// Open stock update modal
function openStockUpdateModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  updateProductId.value = product.id;
  updateProductName.textContent = product.name;
  currentStockValue.textContent = product.stock;
  
  // Reset form state
  resetStockUpdateForm();
  
  // Show modal
  stockUpdateModal.classList.remove('hidden');
}

// Close stock update modal
function closeStockUpdateModal() {
  stockUpdateModal.classList.add('hidden');
  resetStockUpdateForm();
}

// Reset stock update form
function resetStockUpdateForm() {
  stockQuantityInput.classList.add('hidden');
  stockQuantity.value = '';
  currentStockAction = '';
  
  // Reset action buttons
  [addStockBtn, removeStockBtn, setStockBtn].forEach(btn => {
    btn.classList.remove('active');
  });
}

// Set active stock action
function setStockAction(action, btn) {
  currentStockAction = action;
  
  // Update UI
  [addStockBtn, removeStockBtn, setStockBtn].forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  
  // Show quantity input
  stockQuantityInput.classList.remove('hidden');
  stockQuantity.focus();
  
  // Update label based on action
  switch(action) {
    case 'add':
      quantityActionLabel.textContent = getText('addStock');
      break;
    case 'remove':
      quantityActionLabel.textContent = getText('removeStock');
      break;
    case 'set':
      quantityActionLabel.textContent = getText('setStockLevel');
      break;
  }
}

// Event listeners for stock modal
addStockBtn.addEventListener('click', () => setStockAction('add', addStockBtn));
removeStockBtn.addEventListener('click', () => setStockAction('remove', removeStockBtn));
setStockBtn.addEventListener('click', () => setStockAction('set', setStockBtn));
cancelStockUpdate.addEventListener('click', closeStockUpdateModal);

// Handle stock update form submission
updateStockForm.addEventListener('submit', e => {
  e.preventDefault();
  
  if (!currentStockAction) {
    alert(getText('enterQuantity'));
    return;
  }
  
  const productId = Number(updateProductId.value);
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const quantity = Number(stockQuantity.value);
  if (isNaN(quantity) || quantity < 0) {
    alert(getText('enterQuantity'));
    return;
  }
  
  let newStock = product.stock;
  let action = '';
  let notes = '';
  
  switch(currentStockAction) {
    case 'add':
      newStock = product.stock + quantity;
      action = 'Stock added';
      notes = `Added ${quantity} units`;
      break;
    case 'remove':
      newStock = Math.max(0, product.stock - quantity);
      action = 'Stock removed';
      notes = `Removed ${Math.min(quantity, product.stock)} units`;
      break;
    case 'set':
      newStock = quantity;
      action = 'Stock level set';
      notes = `Set stock level to ${quantity}`;
      break;
  }
  
  // Update stock
  updateStockLevel(productId, newStock, action, notes);
  
  // Show success message
  alert(getText('stockUpdated'));
  
  // Close modal
  closeStockUpdateModal();
  
  // Refresh tables
  renderStockTable(stockFilter.value, stockSearch.value);
  renderStockHistory();
});

// Event listeners for search and filter
applyFilterBtn.addEventListener('click', () => {
  renderStockTable(stockFilter.value, stockSearch.value);
});

stockSearch.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    renderStockTable(stockFilter.value, stockSearch.value);
  }
});

// Handle click outside modal to close
stockUpdateModal.addEventListener('click', e => {
  if (e.target === stockUpdateModal) {
    closeStockUpdateModal();
  }
});

// Initialize stock page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded in stock.js');
  
  // Debug: Check if elements exist
  console.log('Stock page element exists:', !!document.getElementById('stock-page'));
  console.log('Stock page hidden?', document.getElementById('stock-page')?.classList.contains('hidden'));
  console.log('Stock table body exists:', !!document.getElementById('stockTableBody'));
  
  // Set up event listeners for stock management
  const stockManagementBtn = document.getElementById('stockManagementBtn');
  if (stockManagementBtn) {
    console.log('Adding click listener to stock management button');
    stockManagementBtn.addEventListener('click', function() {
      console.log('Stock management button clicked');
      // First show the page
      document.getElementById('pos-page').classList.add('hidden');
      document.getElementById('stock-page').classList.remove('hidden');
      document.getElementById('posPageBtn').classList.remove('active');
      stockManagementBtn.classList.add('active');
      
      // Debug: Check page state after toggling
      console.log('After toggle - Stock page hidden?', document.getElementById('stock-page').classList.contains('hidden'));
      
      // Then initialize it
      setTimeout(() => {
        console.log('Delayed initialization starting...');
        initializeStockPage();
      }, 100);
    });
  }
  
  // Initialize stock page if it's the current page
  if (document.getElementById('stock-page') && 
      !document.getElementById('stock-page').classList.contains('hidden')) {
    console.log('Stock page is currently visible, initializing...');
    initializeStockPage();
  }
  
  // Add a global function to make it accessible from the console for debugging
  window.debugInitStockPage = function() {
    console.log('Manual initialization of stock page');
    initializeStockPage();
  };
  
  // Add a debug button to the page for manual initialization
  setTimeout(() => {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug: Initialize Stock Page';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '10px';
    debugButton.style.background = '#ff5722';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.onclick = function() {
      initializeStockPage();
    };
    document.body.appendChild(debugButton);
  }, 1000);
});

// Show notification message
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'stock-notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Export to CSV functionality
function exportStockToCSV() {
  let csvContent = 'ID,Product Name,Current Stock,Low Stock Threshold\n';
  
  products.forEach(product => {
    csvContent += `${product.id},"${product.name}",${product.stock},${product.lowStockThreshold}\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add export button to the UI
function addExportButton() {
  const stockActions = document.querySelector('.stock-actions');
  
  if (stockActions && !document.getElementById('exportStockBtn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportStockBtn';
    exportBtn.className = 'export-btn';
    exportBtn.innerHTML = `📊 <span data-translate="exportStock">Export Stock</span>`;
    
    exportBtn.addEventListener('click', exportStockToCSV);
    
    stockActions.appendChild(exportBtn);
    applyTranslations();
  }
}

// Render stock notifications
function renderStockNotifications() {
  console.log('Rendering stock notifications');
  
  if (!stockNotifications) {
    console.log('Stock notifications container not found');
    return;
  }
  
  const notifications = [];
  
  // Check for out of stock products
  const outOfStockProducts = products.filter(p => p.stock === 0);
  if (outOfStockProducts.length > 0) {
    notifications.push({
      type: 'critical',
      icon: '🚨',
      title: `${outOfStockProducts.length} Product${outOfStockProducts.length > 1 ? 's' : ''} Out of Stock`,
      message: `${outOfStockProducts.map(p => p.name).join(', ')} ${outOfStockProducts.length > 1 ? 'are' : 'is'} currently out of stock and need immediate restocking.`
    });
  }
  
  // Check for low stock products
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  if (lowStockProducts.length > 0) {
    notifications.push({
      type: 'warning',
      icon: '⚠️',
      title: `${lowStockProducts.length} Product${lowStockProducts.length > 1 ? 's' : ''} Running Low`,
      message: `${lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ')} ${lowStockProducts.length > 1 ? 'are' : 'is'} running low on stock.`
    });
  }
  
  // Check for products with good stock levels
  const wellStockedProducts = products.filter(p => p.stock > p.lowStockThreshold);
  if (wellStockedProducts.length > 0 && notifications.length === 0) {
    notifications.push({
      type: 'info',
      icon: '✅',
      title: 'All Products Well Stocked',
      message: `All ${wellStockedProducts.length} products have adequate stock levels.`
    });
  }
  
  // Render notifications
  stockNotifications.innerHTML = '';
  
  if (notifications.length === 0) {
    stockNotifications.innerHTML = '<p class="no-notifications">No notifications at this time.</p>';
    return;
  }
  
  notifications.forEach(notification => {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification ${notification.type}`;
    
    notificationEl.innerHTML = `
      <div class="notification-icon">${notification.icon}</div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
      </div>
    `;
    
    stockNotifications.appendChild(notificationEl);
  });
}

// Render products status table
function renderProductsStatusTable(searchTerm = '', statusFilter = 'all') {
  console.log('Rendering products status table');
  
  if (!productsStatusTableBody) {
    console.log('Products status table body not found');
    return;
  }
  
  // Filter products based on search and status
  let filteredProducts = [...products];
  
  // Apply search filter
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply status filter
  if (statusFilter !== 'all') {
    filteredProducts = filteredProducts.filter(product => {
      const status = getProductStatus(product);
      return status === statusFilter;
    });
  }
  
  // Clear existing content
  productsStatusTableBody.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="9" class="no-products">No products match the current filters.</td>';
    productsStatusTableBody.appendChild(row);
    return;
  }
  
  // Render each product
  filteredProducts.forEach(product => {
    const row = document.createElement('tr');
    const status = getProductStatus(product);
    const statusClass = status.replace(/([A-Z])/g, '-$1').toLowerCase();
    const lastUpdated = getLastUpdatedDate(product.id);
    
    row.innerHTML = `
      <td>${product.id}</td>
      <td><img src="${product.image || 'https://via.placeholder.com/40x40?text=No+Image'}" alt="${product.name}" class="product-image"></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price.toFixed(2)} ﷼</td>
      <td>${product.stock}</td>
      <td><span class="status-badge ${statusClass}">${getStatusText(status)}</span></td>
      <td>${lastUpdated}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" onclick="viewProductDetails(${product.id})">View</button>
          <button class="action-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
          ${status === 'outOfStock' || status === 'lowStock' ? 
            `<button class="action-btn restock-btn" onclick="quickRestock(${product.id})">Restock</button>` : ''}
        </div>
      </td>
    `;
    
    productsStatusTableBody.appendChild(row);
  });
}

// Helper function to get product status
function getProductStatus(product) {
  if (product.stock === 0) return 'outOfStock';
  if (product.stock <= product.lowStockThreshold) return 'lowStock';
  return 'inStock';
}

// Helper function to get status text
function getStatusText(status) {
  switch(status) {
    case 'inStock': return 'In Stock';
    case 'lowStock': return 'Low Stock';
    case 'outOfStock': return 'Out of Stock';
    default: return 'Unknown';
  }
}

// Helper function to get last updated date
function getLastUpdatedDate(productId) {
  const lastEntry = stockHistory
    .filter(entry => entry.productId === productId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  return lastEntry ? lastEntry.date : 'N/A';
}

// Product action functions
function viewProductDetails(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  alert(`Product Details:\n\nName: ${product.name}\nPrice: ${product.price.toFixed(2)} ﷼\nCategory: ${product.category}\nStock: ${product.stock}\nLow Stock Threshold: ${product.lowStockThreshold}\nBarcode: ${product.barcode || 'N/A'}`);
}

function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const newPrice = parseFloat(prompt(`Enter new price for ${product.name}:`, product.price));
  if (!isNaN(newPrice) && newPrice >= 0) {
    product.price = newPrice;
    localStorage.setItem('products', JSON.stringify(products));
    renderProductsStatusTable(productsStatusSearch?.value || '', statusFilter?.value || 'all');
    showNotification(`Price updated for ${product.name}`);
  }
}

function quickRestock(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const quantity = parseInt(prompt(`Enter quantity to add to ${product.name} (Current: ${product.stock}):`, '10'));
  if (!isNaN(quantity) && quantity > 0) {
    product.stock += quantity;
    
    // Add to stock history
    stockHistory.push({
      productId,
      date: new Date().toISOString().split('T')[0],
      action: 'Quick restock',
      quantity: quantity,
      user: 'Admin',
      notes: `Quick restock of ${quantity} units`
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
    
    // Refresh all displays
    renderStockNotifications();
    renderProductsStatusTable(productsStatusSearch?.value || '', statusFilter?.value || 'all');
    renderStockTable('all', '');
    updateStockStatistics();
    
    showNotification(`Added ${quantity} units to ${product.name}`);
  }
}

// Add event listeners for the new elements
function addProductsStatusEventListeners() {
  // Search functionality
  if (productsStatusSearch) {
    productsStatusSearch.addEventListener('input', (e) => {
      renderProductsStatusTable(e.target.value, statusFilter?.value || 'all');
    });
  }
  
  // Status filter functionality
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      renderProductsStatusTable(productsStatusSearch?.value || '', e.target.value);
    });
  }
}

// Initialize stock page when loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  
  // Initialize DOM references
  initializeStockDOMReferences();
  
  // Check if we're on the stock page and initialize if needed
  if (currentPage === 'stock') {
    console.log('Current page is stock, initializing...');
    initializeStockPage();
  }
  
  // Add event listener for language changes to update tables
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentPage === 'stock') {
        console.log('Language changed, updating stock tables');
        renderStockTable(stockFilter ? stockFilter.value : 'all', stockSearch ? stockSearch.value : '');
        renderStockHistory();
      }
    });
  });
  
  // Add export button
  addExportButton();
  
  // Add real-time search functionality if element exists
  if (stockSearch) {
    stockSearch.addEventListener('input', () => {
      renderStockTable(stockFilter.value, stockSearch.value);
    });
  }
  
  // Add filter change event if element exists
  if (stockFilter) {
    stockFilter.addEventListener('change', () => {
      renderStockTable(stockFilter.value, stockSearch.value);
    });
  }
});
