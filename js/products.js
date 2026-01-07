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


export async function fetchProducts({ limit = 12, skip = 0, q = '', category = '' } = {}) {
  try {
    if (!q && !category) {
      return await fetchClothingOnly({ limit, skip });
    }
//muestra los productos por busqueda o categoria
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

    if (q) {
      const filtered = (data.products || []).filter(p => isClothingCategory(p.category));
      const products = filtered.slice(skip, skip + limit);
      return { products, total: filtered.length, skip, limit };
    }

    if (category) {
      const filtered = (data.products || []).filter(p => p.category === category);
      return { products: filtered, total: filtered.length, skip, limit };
    }

    return { products: data.products, total: data.total, skip, limit };
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
