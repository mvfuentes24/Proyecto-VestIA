const CLAVE_PREFERENCIAS = 'vestia_user_preferencias';

export function guardarPreferencias(preferencias) {
  if (!preferencias || typeof preferencias !== 'object') {
    console.error('Preferencias inválidas:', preferencias);
    return;
  }
  try {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
    console.log('Preferencias guardadas:', preferencias);
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
  }
}

export function getUserPreferences() {
  try {
    const stored = localStorage.getItem(CLAVE_PREFERENCIAS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error al recuperar preferencias:', error);
    return null;
  }
}

export function applyPreferencesToFilters() {
  const preferencias = getUserPreferences();
  if (preferencias) {
    // Aplicar las preferencias a los filtros del DOM
    const categoriaSelect = document.querySelector('.filter-box select:nth-child(2)');
    const colorSelect = document.querySelector('.filter-box select:nth-child(4)');
    const tallaSelect = document.querySelector('.filter-box select:nth-child(6)');

    if (categoriaSelect && preferencias.categoria) categoriaSelect.value = preferencias.categoria;
    if (colorSelect && preferencias.color) colorSelect.value = preferencias.color;
    if (tallaSelect && preferencias.talla) tallaSelect.value = preferencias.talla;
  }
}

export function setupFilterListeners() {
  const categoriaSelect = document.querySelector('.filter-box select:nth-child(2)');
  const colorSelect = document.querySelector('.filter-box select:nth-child(4)');
  const tallaSelect = document.querySelector('.filter-box select:nth-child(6)');

  if (categoriaSelect && colorSelect && tallaSelect) {
    const savePreferences = () => {
      const preferencias = {
        categoria: categoriaSelect.value,
        color: colorSelect.value,
        talla: tallaSelect.value,
      };
      guardarPreferencias(preferencias);
    };

    categoriaSelect.addEventListener('change', savePreferences);
    colorSelect.addEventListener('change', savePreferences);
    tallaSelect.addEventListener('change', savePreferences);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyPreferencesToFilters();
  setupFilterListeners();
});