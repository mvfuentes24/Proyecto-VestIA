import { fetchProducts } from './products.js';

let currentPage = 1;
const perPage = 12; 

document.addEventListener('DOMContentLoaded', async () => {
  await loadPage(currentPage);
});

async function loadPage(page) {
  const skip = (page - 1) * perPage;
  const data = await fetchProducts({ limit: perPage, skip });
  renderProducts(data.products);
  renderPagination(data.total, page);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.thumbnail}" class="card-img-top" alt="${p.title}">
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
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
    li.querySelector('button').addEventListener('click', () => loadPage(i));
    pagination.appendChild(li);
  }
}
