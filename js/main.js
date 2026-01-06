import { fetchProducts } from './products.js';

let currentPage = 1;
const perPage = 12; // productos por página
let currentCategory = ''; // categoría seleccionada

document.addEventListener('DOMContentLoaded', async () => {
  // cargar primera página al iniciar
  await loadPage(currentPage, currentCategory);

  // conectar el select de categorías
  const categorySelect = document.getElementById('categorySelect');
  categorySelect.addEventListener('change', async () => {
    currentCategory = categorySelect.value; // guardar categoría seleccionada
    currentPage = 1; // reiniciar a la primera página
    await loadPage(currentPage, currentCategory);
  });
});

async function loadPage(page, category = '') {
  const skip = (page - 1) * perPage;
  const data = await fetchProducts({ limit: perPage, skip, category });
  renderProducts(data.products);
  renderPagination(data.total, page, category);
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
          <p class="card-text">${p.description}</p>
          <p class="fw-bold">$${p.price}</p>
          <button class="btn btn-primary btn-sm">Agregar al carrito</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPagination(total, current, category) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(total / perPage);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === current ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.querySelector('button').addEventListener('click', () => loadPage(i, category));
    pagination.appendChild(li);
  }
}
