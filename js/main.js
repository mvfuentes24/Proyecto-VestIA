import { fetchProducts } from './products.js';
import { initFilters, getFilters, applyFilters, completeProducts } from './filters.js';
import { addToCart, initCart } from './cart.js';
// IMPORTAMOS las funciones de memoria
import { guardarBusqueda, guardarPreferencias, getPreferencias, getUltimaBusqueda, applyPreferencesToFilters } from './profile.js';

let currentPage = 1;
const perPage = 12;
let currentCategory = '';
let loadedProducts = [];
let currentQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  // inicializar carrito (persistencia y fallback si API no está disponible)
  await initCart();

  // 2. Restaurar Preferencias Visuales (Selects del HTML)
  applyPreferencesToFilters(); 
  
  // 3. Restaurar Estado Interno (Variables JS)
  const prefs = getPreferencias();
  const lastSearch = getUltimaBusqueda();

  // Si había una categoría guardada, la seteamos
  if (prefs.categoria) {
    currentCategory = prefs.categoria;
  }
  // Si había una búsqueda guardada, la seteamos en la variable y en el input
  if (lastSearch) {
    currentQuery = lastSearch;
    const searchInput = document.getElementById('navSearchInput');
    if (searchInput) searchInput.value = lastSearch;
  }

  // 4. Inicializar listeners de filtros
  initFilters(handleFiltersChange);
  const searchForm = document.getElementById('navSearchForm');
  const searchInput = document.getElementById('navSearchInput');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      currentQuery = (searchInput.value || '').trim();
      
      // GUARDA LA BÚSQUEDA PARA LA IA
      guardarBusqueda(currentQuery);
      
      currentPage = 1;
      showLoadingGrid();
      await loadData();
      renderWithFilters();
    });
  }

  showLoadingGrid();
  await loadData();
  renderWithFilters();
});

let renderTimer = null;
async function handleFiltersChange(selectedCategory = '', opts = {}) {
  const filtersOnly = !!opts.filtersOnly;
  currentPage = 1;

  // OBTENER Y GUARDAR FILTROS ACTUALES PARA LA IA
  const currentFilters = getFilters();
  guardarPreferencias({
    categoria: selectedCategory || currentFilters.category,
    color: currentFilters.color,
    talla: currentFilters.size,
    ocasion: currentFilters.occasion
  });

  if (!filtersOnly && selectedCategory !== currentCategory) {
    currentCategory = selectedCategory;
    showLoadingGrid();
    await loadData();
    renderWithFilters();
    return;
  }

  showLoadingGrid();
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderWithFilters();
  }, 150);
}

// ... (El resto de funciones loadData, renderWithFilters, etc. se mantienen igual)
async function loadData() {
  const data = await fetchProducts({ limit: 300, skip: 0, category: currentCategory, q: currentQuery });
  loadedProducts = completeProducts(data.products);
}

function renderWithFilters() {
  const filters = getFilters();
  const filtered = applyFilters(loadedProducts, filters);
  const total = filtered.length;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  renderProducts(pageItems);
  renderPagination(total, currentPage);
}
//muestra el grid de carga
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
    grid.innerHTML = `<p class="text-muted">No hay productos disponibles con estos filtros.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const sizeLine = p.size ? `<p class="small text-muted mb-1">Talla: ${p.size}</p>` : '';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.thumbnail}" class="card-img-top" alt="${p.title}">
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
          <p class="text-muted">Marca: VestIA</p>
          ${sizeLine}
          <p class="card-text">${p.description}</p>
          <p class="fw-bold">$${p.price}</p>
          <button class="btn btn-secondary btn-sm">Agregar al carrito</button>
        </div>
      </div>
    `;
    //botón para agregar al carrito
    const btn = card.querySelector('button');
    btn && btn.addEventListener('click', () => addToCart(p));
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