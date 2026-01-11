//contastes para los filtros
const COLOR = ['black', 'white', 'beige', 'blue', 'red', 'green'];
const SIZE = ['XS', 'S', 'M', 'L', 'XL'];
const OCCASION = ['casual', 'formal', 'deportivo', 'fiesta'];
const SCATEGORIES = ['tops', 'mens-shirts', 'womens-dresses', 'mens-shoes', 'womens-shoes'];

const CASUAL_WORDS = ['casual', 'daily', 'everyday', 'relaxed', 'weekend', 'basic', 't-shirt','fashionable','style'];
const SPORT_WORDS = ['sport', 'sports', 'sneaker', 'running', 'gym', 'athletic', 'jog', 'runner', 'deportivo', 'trail', 'tenis'];
const FORMAL_WORDS = ['formal', 'office', 'business', 'blazer', 'oxford', 'derby', 'heel', 'heels', 'elegant', 'classic', 'special'];
const PARTY_WORDS = ['party', 'cocktail', 'evening', 'fiesta', 'night', 'club', 'sparkle', 'shiny', 'sequin'];

//para asignar valores(color,talla) a productos
function pickFromCategories(option, numeroReferencia) {
	return option[numeroReferencia % option.length];
}
//buscara la ocasion con las keywords o categoria
function pickOccasion(product, numeroReferencia) {
	const category = (product.category || '').toLowerCase();
	const text = `${product.title || ''} ${product.description || ''}`.toLowerCase();

	// filtra segun las keywords
	if (hasKeyWord(text, SPORT_WORDS)) return 'deportivo';
	if (hasKeyWord(text, PARTY_WORDS)) return 'fiesta';
	if (hasKeyWord(text, FORMAL_WORDS)) return 'formal';
	if (hasKeyWord(text, CASUAL_WORDS)) return 'casual';

	// filtra por categoria 
	if (category.includes('dresses')) return 'fiesta';
	if (category.includes('shoes') || category.includes('sneaker')) return 'deportivo';
	if (category.includes('watches') || category.includes('jewellery')) return 'formal';
	if (category.includes('bags') || category.includes('sunglasses')) return 'casual';
	if (category.includes('tops') || category.includes('shirts')) return 'casual';

    //por defecto 
	return pickFromCategories(OCCASION, numeroReferencia);
}

function hasKeyWord(text, words) {
	return words.some(w => text.includes(w));
}

// complementa los productos con atributos adicionales (si hace falta)
export function decorateProducts(products) {
	return (products || []).map(p => ({
		...p,
		color: p.color || pickFromCategories(COLOR, p.id + 1),
		size: SCATEGORIES.includes((p.category || '').toLowerCase())
		  ? (p.size || pickFromCategories(SIZE, p.id + 2))
		  : null,
		occasion: p.occasion || pickOccasion(p, p.id + 3),
	}));
}

export function applyFilters(products, filters) {
	const { category, color, size, priceMin, priceMax, occasion } = filters;
	return (products || []).filter(p => {
		if (category && p.category !== category) return false;
		if (color && p.color !== color) return false;
		if (size && p.size !== size) return false;
		if (occasion && p.occasion !== occasion) return false;
		if (priceMin != null && p.price < priceMin) return false;
		if (priceMax != null && p.price > priceMax) return false;
		return true;
	});
}

//escuchar cambios en los filtros
export function initFilters(onChange) {
	const categorySelect = document.getElementById('categorySelect');
	const colorSelect = document.getElementById('colorSelect');
	const sizeSelect = document.getElementById('sizeSelect');
	// sliders de precio y etiquetas
	const priceMin = document.getElementById('priceRangeMin');
	const priceMax = document.getElementById('priceRangeMax');
	const priceMinLabel = document.getElementById('priceRangeMinLabel');
	const priceMaxLabel = document.getElementById('priceRangeMaxLabel');
	const occasionSelect = document.getElementById('occasionSelect');

	categorySelect && categorySelect.addEventListener('change', () => onChange(categorySelect?.value || ''));
	[colorSelect, sizeSelect, occasionSelect].forEach(el => el && el.addEventListener('change', () => onChange(categorySelect?.value || '', { filtersOnly: true })));

	function updatePriceLabels() {
		if (priceMinLabel) priceMinLabel.textContent = `$${priceMin?.value ?? ''}`;
		if (priceMaxLabel) priceMaxLabel.textContent = `$${priceMax?.value ?? ''}`;
	}

	[priceMin, priceMax].forEach(el => el && el.addEventListener('input', () => {
		const minVal = parseFloat(priceMin?.value ?? '0');
		const maxVal = parseFloat(priceMax?.value ?? '0');
		if (Number.isFinite(minVal) && Number.isFinite(maxVal)) {
			if (minVal > maxVal) {
				if (el === priceMin) {
					priceMax.value = String(minVal);
				} else {
					priceMin.value = String(maxVal);
				}
			}
		}
		updatePriceLabels();
		onChange(categorySelect?.value || '', { filtersOnly: true });
	}));

	updatePriceLabels();
}

export function getFilters() {
	const category = document.getElementById('categorySelect')?.value || '';
	const color = document.getElementById('colorSelect')?.value || '';
	const size = document.getElementById('sizeSelect')?.value || '';
	const occasion = document.getElementById('occasionSelect')?.value || '';
	const priceMinValue = parseFloat(document.getElementById('priceRangeMin')?.value);
	const priceMaxValue = parseFloat(document.getElementById('priceRangeMax')?.value);

	// asegurar orden correcto en el slide de precio
	let minOut = Number.isFinite(priceMinValue) ? priceMinValue : null;
	let maxOut = Number.isFinite(priceMaxValue) ? priceMaxValue : null;
	if (minOut != null && maxOut != null) {
		const min = Math.min(minOut, maxOut);
		const max = Math.max(minOut, maxOut);
		minOut = min; maxOut = max;
	}

	return {
		category,
		color,
		size,
		occasion,
		priceMin: minOut,
		priceMax: maxOut,
	};
}
