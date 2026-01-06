const CLAVE_PREFERENCIAS = "vestia_user_preferencias";

export function guardarPreferencias(preferencias) {
  if (!preferencias || typeof preferencias !== "object") return;
  localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
}

export function getUserPreferences() {
  const stored = localStorage.getItem(CLAVE_PREFERENCIAS);
  return stored ? JSON.parse(stored) : {};
}

export function applyPreferencesToFilters() {
  const preferencias = getUserPreferences();
  if (!preferencias) return;

  const categoriaSelect = document.getElementById("categorySelect");
  const colorSelect = document.getElementById("colorSelect");
  const tallaSelect = document.getElementById("sizeSelect");

  if (categoriaSelect && preferencias.categoria) categoriaSelect.value = preferencias.categoria;
  if (colorSelect && preferencias.color) colorSelect.value = preferencias.color;
  if (tallaSelect && preferencias.talla) tallaSelect.value = preferencias.talla;
}

export function setupFilterListeners() {
  const categoriaSelect = document.getElementById("categorySelect");
  const colorSelect = document.getElementById("colorSelect");
  const tallaSelect = document.getElementById("sizeSelect");

  if (categoriaSelect && colorSelect && tallaSelect) {
    const savePreferences = () => {
      guardarPreferencias({
        categoria: categoriaSelect.value,
        color: colorSelect.value,
        talla: tallaSelect.value,
      });
    };

    categoriaSelect.addEventListener("change", savePreferences);
    colorSelect.addEventListener("change", savePreferences);
    tallaSelect.addEventListener("change", savePreferences);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyPreferencesToFilters();
  setupFilterListeners();
});
