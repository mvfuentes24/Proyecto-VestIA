import { DUMMYJSON_BASE } from './config.js';


export async function fetchProducts({ limit = 12, skip = 0, q = '' } = {}) {
  const endpoint = q
    ? `${DUMMYJSON_BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`
    : `${DUMMYJSON_BASE}/products?limit=${limit}&skip=${skip}`;


  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();
    return data; 
  } catch (err) {
    console.error(err);
    return { products: [], total: 0, skip, limit };
  }
}
