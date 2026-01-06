import { fetchProducts } from './products.js';
import { initFilters, getFilters, applyFilters, decorateProducts } from './filters.js';

let currentPage = 1;
const perPage = 12;
let currentCategory = '';
let cachedProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  initFilters(handleFiltersChange);
  showLoadingGrid();
  await loadData();
  renderWithFilters();
});

let renderTimer = null;
async function handleFiltersChange(selectedCategory = '', opts = {}) {
  const filtersOnly = !!opts.filtersOnly;
  currentPage = 1;

  if (!filtersOnly && selectedCategory !== currentCategory) {
    currentCategory = selectedCategory;
    showLoadingGrid();
    await loadData();
    renderWithFilters();
    return;
  }

  // Sólo filtros en cliente: mostrar cargando breve y debounced render
  showLoadingGrid();
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderWithFilters();
  }, 150);
}

async function loadData() {
  const data = await fetchProducts({ limit: 300, skip: 0, category: currentCategory });
  cachedProducts = decorateProducts(data.products);
}

function renderWithFilters() {
  const filters = getFilters();
  const filtered = applyFilters(cachedProducts, filters);
  const total = filtered.length;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  renderProducts(pageItems);
  renderPagination(total, currentPage);
}

function showLoadingGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="grid-loading w-100">
      <div class="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
      <span>Cargando...</span>
    </div>
  `;
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = `<p class="text-muted">No hay productos disponibles en esta categoría.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.thumbnail}" class="card-img-top" alt="${p.title}">
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
          <p class="text-muted">Marca: VestIA</p>
          <p class="small text-muted mb-1">Talla: ${p.size || 'Única'}</p>
          <p class="card-text">${p.description}</p>
          <p class="fw-bold">$${p.price}</p>
          <button class="btn btn-primary btn-sm">Agregar al carrito</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPagination(total, current) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(total / perPage);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === current ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.querySelector('button').addEventListener('click', () => {
      currentPage = i;
      renderWithFilters();
    });
    pagination.appendChild(li);
  }
}
