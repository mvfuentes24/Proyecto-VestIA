
const COLOR_POOL = ['black', 'white', 'beige', 'blue', 'red', 'green'];
const SIZE_POOL = ['XS', 'S', 'M', 'L', 'XL'];
const OCCASION_POOL = ['casual', 'formal', 'deportivo', 'fiesta'];

function pickFromPool(pool, seed) {
	return pool[seed % pool.length];
}

function pickOccasion(category, seed) {
	if (category.includes('shoes') || category.includes('sneakers')) return 'deportivo';
	if (category.includes('watches') || category.includes('jewellery')) return 'formal';
	if (category.includes('bags')) return 'casual';
	return pickFromPool(OCCASION_POOL, seed);
}

export function decorateProducts(products) {
	return (products || []).map(p => ({
		...p,
		color: p.color || pickFromPool(COLOR_POOL, p.id + 1),
		size: p.size || pickFromPool(SIZE_POOL, p.id + 2),
		occasion: p.occasion || pickOccasion(p.category || '', p.id + 3),
	}));
}

export function applyFilters(products, filters) {
	const { color, size, priceMin, priceMax, occasion } = filters;
	return (products || []).filter(p => {
		if (color && p.color !== color) return false;
		if (size && p.size !== size) return false;
		if (occasion && p.occasion !== occasion) return false;
		if (priceMin != null && p.price < priceMin) return false;
		if (priceMax != null && p.price > priceMax) return false;
		return true;
	});
}

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

	// categoría dispara recarga remota; el resto sólo filtra en cliente
	categorySelect && categorySelect.addEventListener('change', () => onChange(categorySelect?.value || ''));
	[colorSelect, sizeSelect, occasionSelect].forEach(el => el && el.addEventListener('change', () => onChange(categorySelect?.value || '', { filtersOnly: true })));

	// actualizar etiquetas y notificar cambios cuando se mueven los sliders
	function updatePriceLabels() {
		if (priceMinLabel) priceMinLabel.textContent = `$${priceMin?.value ?? ''}`;
		if (priceMaxLabel) priceMaxLabel.textContent = `$${priceMax?.value ?? ''}`;
	}

	[priceMin, priceMax].forEach(el => el && el.addEventListener('input', () => {
		// mantener coherencia: si min supera max, ajustamos el otro extremo
		const minVal = parseFloat(priceMin?.value ?? '0');
		const maxVal = parseFloat(priceMax?.value ?? '0');
		if (Number.isFinite(minVal) && Number.isFinite(maxVal)) {
			if (minVal > maxVal) {
				// decidir cuál se movió: si el target es min, subimos max; si es max, bajamos min
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

	// inicializar etiquetas al cargar
	updatePriceLabels();
}

export function getFilters() {
	const category = document.getElementById('categorySelect')?.value || '';
	const color = document.getElementById('colorSelect')?.value || '';
	const size = document.getElementById('sizeSelect')?.value || '';
	const occasion = document.getElementById('occasionSelect')?.value || '';
	const priceMinValue = parseFloat(document.getElementById('priceRangeMin')?.value);
	const priceMaxValue = parseFloat(document.getElementById('priceRangeMax')?.value);

	// asegurar orden correcto
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

