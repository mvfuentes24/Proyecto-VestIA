import { DUMMYJSON_BASE, CART_STORAGE_KEY } from './config.js';


let cartItems = [];

//obtiener carrito desde localstorage
function loadCartFromStorage() {
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.map(it => ({
			...it,
			quantity: Number(it.quantity ?? it.qty ?? 1) || 1,
		}));
	} catch {
		return [];
	}
}

function saveCartToStorage(items) {
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []));
	} catch {
	}
}

//cantidad de items en el carrito
function getCount() {
	return cartItems.reduce((totalUnits, product) => totalUnits + (Number(product.quantity) || 0), 0);
}

function formatCurrency(value) {
	const n = Number(value) || 0;
	return n.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}
//contador de carrito
function updateBadge() {
	const cartCount = document.getElementById('cartCount');
	if (cartCount) cartCount.textContent = String(getCount());
}
//renderizar cards de carrito
function renderCartSection() {
	const container = document.getElementById('carrito');
	if (!container) return; 
    //el carrito esta vacio
	if (!cartItems.length) {
		container.innerHTML = `
			<div class="container my-4">
				<h2 class="section-title">Carrito</h2>
				<div class="cart-panel mx-auto">
					<div class="cart-empty">Tu carrito está vacío.</div>
				</div>
			</div>
		`;
		return;
	}

	const itemsHtml = cartItems.map(it => `
		<div class="cart-item d-flex align-items-center justify-content-between">
			<div class="d-flex align-items-center gap-2">
				<img src="${it.thumbnail}" alt="${it.title}" width="56" height="56" class="rounded" />
				<div>
					<div class="fw-semibold">${it.title}</div>
					<div class="text-muted small">${it.color ? `Color: ${it.color}` : ''} ${it.size ? `· Talla: ${it.size}` : ''}</div>
				</div>
			</div>
			<div class="text-end">
				<div class="small text-muted">Precio: ${formatCurrency(it.price)}</div>
					<div>Subtotal: ${formatCurrency(it.price * it.quantity)}</div>
			</div>
				<div class="cart-qty d-flex">
					<div class="d-flex align-items-center gap-2 mb-2">
						<span class="text-muted small">Cantidad</span>
						<button class="btn btn-sm btn-outline-secondary" data-decrement-id="${it.id}">-</button>
						<input type="number" min="1" class="form-control form-control-sm cart-qty-input" data-qty-id="${it.id}" value="${it.quantity}">
						<button class="btn btn-sm btn-outline-secondary" data-increment-id="${it.id}">+</button>
					</div>
					<button class="btn btn-sm btn-outline-danger" data-remove-id="${it.id}">Eliminar</button>
				</div>
		</div>
	`).join('');

	const total = cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

	container.innerHTML = `
		<div class="container my-4">
			<h2 class="section-title">Carrito</h2>
			<div class="cart-panel mx-auto">
				<div class="cart-items">
					${itemsHtml}
				</div>
				<div class="d-flex justify-content-end pt-3">
					<div class="fw-bold">Total: ${formatCurrency(total)}</div>
				</div>
			</div>
		</div>
	`;
    //listener para eliminar items del carrito    
	container.querySelectorAll('[data-remove-id]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = Number(btn.getAttribute('data-remove-id'));
			removeFromCart(id);
		});
	});

	container.querySelectorAll('[data-increment-id]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = Number(btn.getAttribute('data-increment-id'));
			changeQuantity(id, 1);
		});
	});

	container.querySelectorAll('[data-decrement-id]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = Number(btn.getAttribute('data-decrement-id'));
			changeQuantity(id, -1);
		});
	});

	container.querySelectorAll('[data-qty-id]').forEach(input => {
		input.addEventListener('change', () => {
			const id = Number(input.getAttribute('data-qty-id'));
			const val = Number(input.value);
			setQuantity(id, val);
		});
	});
}

async function apiAvailable(timeoutMs = 3000) {
	try {
		const ctrl = new AbortController();
		const t = setTimeout(() => ctrl.abort(), timeoutMs);
		const res = await fetch(`${DUMMYJSON_BASE}/products?limit=1`, { signal: ctrl.signal });
		clearTimeout(t);
		return !!res && res.ok;
	} catch {
		return false;
	}
}

//inicializar cart para localstorage
export async function initCart() {
	const healthy = await apiAvailable();
	cartItems = healthy ? loadCartFromStorage() : [];
	updateBadge();
	renderCartSection();
}

export function getCartItems() {
	return [...cartItems];
}
//agregar items al carrito
export function addToCart(product) {
	if (!product || !product.id) return;
	const idx = cartItems.findIndex(it => it.id === product.id);
	if (idx >= 0) {
		cartItems[idx].quantity = (Number(cartItems[idx].quantity) || 0) + 1;
	} else {
		cartItems.push({
			id: product.id,
			title: product.title,
			price: Number(product.price) || 0,
			thumbnail: product.thumbnail,
			color: product.color || null,
			size: product.size || null,
			quantity: 1,
		});
	}
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}

export function removeFromCart(id) {
	cartItems = cartItems.filter(it => it.id !== id);
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}

function changeQuantity(id, delta) {
	const idx = cartItems.findIndex(it => it.id === id);
	if (idx < 0) return;
	const current = Number(cartItems[idx].quantity) || 0;
	const next = current + delta;
	if (next <= 0) {
		removeFromCart(id);
		return;
	}
	cartItems[idx].quantity = next;
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}

function setQuantity(id, qty) {
	const idx = cartItems.findIndex(it => it.id === id);
	if (idx < 0) return;
	const next = Number(qty);
	if (!Number.isFinite(next) || next <= 0) {
		removeFromCart(id);
		return;
	}
	cartItems[idx].quantity = next;
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}

export function clearCart() {
	cartItems = [];
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}


