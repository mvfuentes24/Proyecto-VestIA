import { DUMMYJSON_BASE } from './config.js';
const clothingCategory = [
  'tops',
  'mens-shirts',
  'womens-dresses',
  'mens-shoes',
  'womens-shoes',
  'mens-watches',
  'womens-watches',
  'womens-bags',      
  'womens-jewellery', 
  'sunglasses'
];


export async function fetchProducts({ limit = 12, skip = 0, q = '', category = '', talla = '' } = {}) {
  try {
    if (!q && !category) {
      return await fetchClothingOnly({ limit, skip });
    }

    let endpoint;
    if (q) {
      endpoint = `${DUMMYJSON_BASE}/products/search?q=${encodeURIComponent(q)}&limit=100&skip=0`;
    } else if (category) {
      if (!isClothingCategory(category)) return { products: [], total: 0, skip, limit };
      endpoint = `${DUMMYJSON_BASE}/products/category/${category}?limit=${limit}&skip=${skip}`;
    }

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();

    let products = data.products || [];

    if (q) {
      const filtered = products.filter(p => isClothingCategory(p.category));
      products = filtered.slice(skip, skip + limit);
    }

    if (talla) {
      products = products.filter(p => p.size?.toUpperCase() === talla);
    }

    return { products, total: products.length, skip, limit };
  } catch (err) {
    console.error(err);
    return { products: [], total: 0, skip, limit };
  } 
}

//muestra todos los productos
async function fetchClothingOnly({ limit, skip }) {
  const requests = clothingCategory.map(cat =>
    fetch(`${DUMMYJSON_BASE}/products/category/${cat}?limit=100`)
  );

  const responses = await Promise.allSettled(requests);

  const jsons = await Promise.all(
    responses.map(async res => {
      if (res.status === 'fulfilled' && res.value.ok) {
        return res.value.json();
      }
      return { products: [] };
    })
  );

  //juntar todos los proudctos y ordena por id
  const clothing = jsons.flatMap(j => j.products || []).sort((producto1, producto2) => producto1.id - producto2.id);
  const products = clothing.slice(skip, skip + limit);

  return { products, total: clothing.length, skip, limit };
}

function isClothingCategory(cat) {
  return clothingCategory.includes(cat);
}
