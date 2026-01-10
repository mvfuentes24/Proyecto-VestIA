import { DUMMYJSON_BASE } from './config.js';

const CART_STORAGE_KEY = 'vestia_cart_v1';

let cartItems = [];

function loadCartFromStorage() {
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

function saveCartToStorage(items) {
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []));
	} catch {
		// ignore storage errors
	}
}

function getCount() {
	return cartItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
}

function formatCurrency(value) {
	const n = Number(value) || 0;
	return n.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

function updateBadge() {
	const el = document.getElementById('cartCount');
	if (el) el.textContent = String(getCount());
}

function renderCartSection() {
	const container = document.getElementById('carrito');
	if (!container) return; // optional: only if exists in DOM

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
				<div>Cant.: ${it.qty} · Subtotal: ${formatCurrency(it.price * it.qty)}</div>
			</div>
			<div>
				<button class="btn btn-sm btn-outline-danger" data-remove-id="${it.id}">Eliminar</button>
			</div>
		</div>
	`).join('');

	const total = cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

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

	container.querySelectorAll('[data-remove-id]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = Number(btn.getAttribute('data-remove-id'));
			removeFromCart(id);
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

export async function initCart() {
	const healthy = await apiAvailable();
	// Fallback: si la API no está disponible, mostrar carrito vacío (sin borrar localStorage)
	cartItems = healthy ? loadCartFromStorage() : [];
	updateBadge();
	renderCartSection();
}

export function getCartItems() {
	return [...cartItems];
}

export function addToCart(product) {
	if (!product || !product.id) return;
	const idx = cartItems.findIndex(it => it.id === product.id);
	if (idx >= 0) {
		cartItems[idx].qty = (Number(cartItems[idx].qty) || 0) + 1;
	} else {
		cartItems.push({
			id: product.id,
			title: product.title,
			price: Number(product.price) || 0,
			thumbnail: product.thumbnail,
			color: product.color || null,
			size: product.size || null,
			qty: 1,
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

export function clearCart() {
	cartItems = [];
	saveCartToStorage(cartItems);
	updateBadge();
	renderCartSection();
}


