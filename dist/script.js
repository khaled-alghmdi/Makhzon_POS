"use strict";
/* ===== script.ts ===== */
// Product data
const products = [
    { id: 1, name: "Nivea Body Lotion", price: 23, barcode: "111111", category: "all", image: "images/Nivea.png" },
    { id: 2, name: "Apple 1kg", price: 12, barcode: "222222", category: "dry", image: "images/apple.jpg" },
    { id: 3, name: "Quaker Oats 1kg", price: 34, barcode: "333333", category: "pulses", image: "images/oat.jpg" },
    { id: 4, name: "Corn Flakes", price: 28, barcode: "444444", category: "all", image: "images/corn flakes.jpg" },
    { id: 5, name: "Cold Pressed Oil", price: 32, barcode: "555555", category: "oils", image: "images/oil.png" },
    { id: 6, name: "Choco Fudge Mix", price: 30, barcode: "666666", category: "all", image: "images/choco.jpg" },
];
/* DOM refs */
const productGrid = document.getElementById("product-grid");
const cartItemsEl = document.getElementById("cart-items");
const itemCountEl = document.getElementById("item-count");
const qtyCountEl = document.getElementById("qty-count");
const totalPriceEl = document.getElementById("total-price");
const searchInput = document.getElementById("search");
const categoryNav = document.getElementById("categoryNav");
const modalOverlay = document.getElementById("modalOverlay");
const addProductBtn = document.getElementById("addProductBtn");
const cancelModalBtn = document.getElementById("cancelModal");
const addProductForm = document.getElementById("addProductForm");
const productImageInp = document.getElementById("productImage");
const paymentOverlay = document.getElementById("paymentOverlay");
const paymentOptions = document.getElementById("paymentOptions");
const payCardBtn = document.getElementById("payCard");
const payCashBtn = document.getElementById("payCash");
const paymentProcessing = document.getElementById("paymentProcessing");
const cashForm = document.getElementById("cashForm");
const cashReceivedInp = document.getElementById("cashReceived");
const calcChangeBtn = document.getElementById("calcChange");
const paymentResult = document.getElementById("paymentResult");
const paymentMessage = document.getElementById("paymentMessage");
const donePaymentBtn = document.getElementById("donePayment");
const checkoutBtn = document.getElementById("checkoutBtn");
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
        card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>${p.price.toFixed(2)} ﷼</p>
      <button data-id="${p.id}" class="add-btn">Add</button>
      <button data-id="${p.id}" class="edit-btn">Edit Price</button>`;
        productGrid.appendChild(card);
    });
}
function refreshProducts() {
    renderProducts(filteredProducts);
}
/* Cart */
function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if (item)
        item.qty += 1;
    else
        cart.push(Object.assign(Object.assign({}, products.find(p => p.id === id)), { qty: 1 }));
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
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
    itemCountEl.textContent = `Total Items: ${cart.length}`;
    qtyCountEl.textContent = `Total Quantity: ${totalQty}`;
    totalPriceEl.textContent = `${totalPrice.toFixed(2)} ﷼`;
}
/* Filters & search */
categoryNav.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.classList.contains("category"))
        return;
    Array.from(categoryNav.children).forEach(b => b.classList.remove("active"));
    target.classList.add("active");
    const cat = target.dataset.cat;
    filteredProducts = cat === "all" ? [...products] : products.filter(p => p.category === cat);
    refreshProducts();
});
searchInput.addEventListener("input", (e) => {
    const target = e.target;
    const term = target.value.toLowerCase();
    filteredProducts = products.filter(p => p.name.toLowerCase().includes(term));
    refreshProducts();
});
/* Add / Edit buttons */
productGrid.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id ? Number(target.dataset.id) : null;
    if (!id)
        return;
    if (target.classList.contains("add-btn")) {
        addToCart(id);
    }
    else if (target.classList.contains("edit-btn")) {
        const product = products.find(p => p.id === id);
        if (!product)
            return;
        const newPrice = parseFloat(prompt(`Enter new price for ${product.name}:`, product.price.toString()) || "");
        if (!Number.isNaN(newPrice) && newPrice >= 0) {
            product.price = newPrice;
            refreshProducts();
            renderCart();
        }
    }
});
/* Add-product modal */
function openAddModal() {
    modalOverlay.classList.remove("hidden");
    document.getElementById("productName").focus();
}
function closeAddModal() {
    modalOverlay.classList.add("hidden");
    addProductForm.reset();
}
addProductBtn.addEventListener("click", openAddModal);
cancelModalBtn.addEventListener("click", closeAddModal);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay)
        closeAddModal();
});
addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const barcode = document.getElementById("productBarcode").value.trim();
    const category = document.getElementById("productCategory").value;
    let imageURL = "https://via.placeholder.com/150?text=No+Image";
    if (productImageInp.files && productImageInp.files[0]) {
        imageURL = URL.createObjectURL(productImageInp.files[0]);
    }
    products.push({ id: Date.now(), name, price, barcode, category, image: imageURL });
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
function openPaymentModal() {
    if (cart.length) {
        paymentOverlay.classList.remove("hidden");
        resetPaymentModal();
    }
}
function closePaymentModal() {
    paymentOverlay.classList.add("hidden");
}
checkoutBtn.addEventListener("click", openPaymentModal);
paymentOverlay.addEventListener("click", (e) => {
    if (e.target === paymentOverlay)
        closePaymentModal();
});
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
    if (isNaN(received) || received < total) {
        alert("Insufficient cash received!");
        return;
    }
    paymentMessage.textContent = `Change to return: ${(received - total).toFixed(2)} ﷼`;
    cashForm.classList.add("hidden");
    paymentResult.classList.remove("hidden");
});
donePaymentBtn.addEventListener("click", () => {
    cart = [];
    renderCart();
    closePaymentModal();
});
/* Init */
refreshProducts();
renderCart();
