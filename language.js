/* ===== language.js ===== */
// Current language
let currentLang = 'en';

// DOM references for language buttons
const langButtons = document.querySelectorAll('.lang-btn');
const htmlElement = document.documentElement;

// Function to update all translatable elements
function updateLanguage(lang) {
  // Update HTML lang and dir attributes
  htmlElement.setAttribute('lang', lang);
  htmlElement.setAttribute('dir', lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr');
  
  // Update all elements with data-translate attribute
  const translatableElements = document.querySelectorAll('[data-translate]');
  translatableElements.forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  
  // Update language buttons active state
  langButtons.forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Store selected language in localStorage
  localStorage.setItem('makhzonLanguage', lang);
  
  // Update current language
  currentLang = lang;
}

// Event listeners for language buttons
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    updateLanguage(lang);
  });
});

// Function to get text in current language
function getText(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

// Update product rendering to use translations
const originalRenderProducts = window.renderProducts;
if (originalRenderProducts) {
  window.renderProducts = function(list) {
    productGrid.innerHTML = "";
    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      const imgSrc = p.image || "https://via.placeholder.com/150?text=No+Image";
      card.innerHTML = `
        <img src="${imgSrc}" alt="${p.name}" />
        <h4>${p.name}</h4>
        <p>${p.price.toFixed(2)} ﷼</p>
        <button data-id="${p.id}" class="add-btn">${getText('addBtn')}</button>
        <button data-id="${p.id}" class="edit-btn">${getText('editBtn')}</button>`;
      productGrid.appendChild(card);
    });
  };
}

// Override the prompt for price editing to use translations
const originalEditPrice = window.editPrice;
if (window.editPrice) {
  window.editPrice = function(product) {
    return parseFloat(prompt(`${getText('enterNewPrice')} ${product.name}:`, product.price));
  };
}

// Update the cart rendering function to use translations
const originalRenderCart = window.renderCart;
if (originalRenderCart) {
  window.renderCart = function() {
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
    itemCountEl.textContent  = `${getText('totalItems')}: ${cart.length}`;
    qtyCountEl.textContent   = `${getText('totalQuantity')}: ${totalQty}`;
    totalPriceEl.textContent = `${totalPrice.toFixed(2)} ﷼`;
  };
}

// Override the alert for insufficient cash
const originalAlert = window.alert;
window.alert = function(message) {
  if (message === "Insufficient cash received!") {
    originalAlert(getText('insufficientCash'));
  } else {
    originalAlert(message);
  }
};

// Update payment message for change return
const originalCalcChange = document.getElementById('calcChange').onclick;
document.getElementById('calcChange').onclick = function() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const received = parseFloat(cashReceivedInp.value);
  if (isNaN(received) || received < total) { 
    alert(getText('insufficientCash')); 
    return; 
  }
  paymentMessage.textContent = `${getText('changeToReturn')}: ${(received - total).toFixed(2)} ﷼`;
  cashForm.classList.add("hidden");
  paymentResult.classList.remove("hidden");
};

// Update payment approved message
const originalPayCardBtn = document.getElementById('payCard').onclick;
document.getElementById('payCard').onclick = function() {
  paymentOptions.classList.add("hidden");
  paymentProcessing.classList.remove("hidden");
  setTimeout(() => {
    paymentProcessing.classList.add("hidden");
    paymentMessage.textContent = getText('paymentApproved');
    paymentResult.classList.remove("hidden");
  }, 2500);
};

// Load saved language preference from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('makhzonLanguage') || 'en';
  updateLanguage(savedLang);
  
  // Re-render products and cart with the correct language
  if (window.refreshProducts) {
    window.refreshProducts();
  }
  if (window.renderCart) {
    window.renderCart();
  }
});
