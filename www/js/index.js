import { api } from './api.js';

// --- REFERENCIAS AL DOM ---
const categoryList = document.getElementById('categoryList');
const siteTableBody = document.getElementById('siteTableBody');
const btnAddCategory = document.getElementById('btnAddCategory');
const searchInput = document.getElementById('searchInput');

// Guardamos la categoría actual para saber a dónde volver si borramos el buscador
let currentCategoryId = null;

// --- 1. AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

// ==========================================
// LÓGICA DE CATEGORÍAS
// ==========================================

async function loadCategories() {
    try {
        const categories = await api.getCategories();
        renderCategories(categories);
    } catch (error) {
        console.error("Error cargando categorías:", error);
        categoryList.innerHTML = '<li style="color:red">Error de conexión</li>';
    }
}

function renderCategories(categories) {
    categoryList.innerHTML = ''; 

    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-item'; 
        
        // Texto + Botón Borrar
        const spanName = document.createElement('span');
        spanName.textContent = cat.name;
        
        const btnDeleteCat = document.createElement('button');
        btnDeleteCat.textContent = '🗑️';
        btnDeleteCat.className = 'btn btn-danger btn-sm';
        btnDeleteCat.style.marginLeft = 'auto';
        btnDeleteCat.style.padding = '2px 6px';
        
        btnDeleteCat.onclick = (e) => {
            e.stopPropagation(); 
            deleteCategoryFunc(cat.id);
        };

        // Evento Click Categoría
        li.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            
            // Guardamos cual es la activa y cargamos sus sitios
            currentCategoryId = cat.id;
            // Limpiamos el buscador para evitar confusiones
            searchInput.value = ""; 
            // Restauramos la visualización de todas las categorías (por si el buscador las ocultó)
            document.querySelectorAll('.category-item').forEach(el => el.style.display = 'flex');
            
            loadSites(cat.id);
        });

        li.appendChild(spanName);
        li.appendChild(btnDeleteCat);
        categoryList.appendChild(li);
    });
}

async function deleteCategoryFunc(id) {
    if (!confirm("¿Eliminar categoría y todos sus sitios?")) return;
    try {
        await api.deleteCategory(id);
        loadCategories();
        siteTableBody.innerHTML = '<tr><td colspan="4">Categoría eliminada</td></tr>';
        currentCategoryId = null;
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// ==========================================
// LÓGICA DE SITIOS (SITES)
// ==========================================

// Esta función carga los sitios de una categoría concreta
async function loadSites(categoryId) {
    siteTableBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const response = await api.getSites(categoryId);
        const sites = Array.isArray(response) ? response : (response.sites || []);
        renderSiteTable(sites); // Usamos la función común para pintar
    } catch (error) {
        console.error(error);
        siteTableBody.innerHTML = '<tr><td colspan="4" style="color:red">Error cargando sitios</td></tr>';
    }
}

// --- NUEVA FUNCIÓN MAESTRA PARA PINTAR LA TABLA ---
// La sacamos fuera para poder usarla también en el buscador
function renderSiteTable(sites) {
    siteTableBody.innerHTML = ''; 

    if (sites.length === 0) {
        siteTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No hay sitios para mostrar</td></tr>';
        return;
    }

    sites.forEach(site => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${site.name}</td>
            <td>${site.user}</td>
            <td>${site.createdAt ? new Date(site.createdAt).toLocaleDateString() : '-'}</td>
        `;

        const tdActions = document.createElement('td');
        
        // Botones
        const btnShow = document.createElement('button');
        btnShow.textContent = '👁️';
        btnShow.className = 'btn btn-sm';
        btnShow.style.marginRight = '5px';
        btnShow.onclick = () => alert(`Contraseña: ${site.password}`);

        const btnDelete = document.createElement('button');
        btnDelete.textContent = '🗑️';
        btnDelete.className = 'btn btn-danger btn-sm';
        btnDelete.style.marginRight = '5px';
        // Al borrar, recargamos la categoría donde estábamos
        btnDelete.onclick = () => deleteSiteFunc(site.id);

        const link = document.createElement('a');
        link.href = site.url;
        link.target = '_blank';
        link.textContent = '🔗';
        link.className = 'btn btn-secondary btn-sm';

        tdActions.appendChild(btnShow);
        tdActions.appendChild(btnDelete);
        tdActions.appendChild(link);
        tr.appendChild(tdActions);
        siteTableBody.appendChild(tr);
    });
}

async function deleteSiteFunc(siteId) {
    if (!confirm("¿Borrar este sitio?")) return;
    try {
        await api.deleteSite(siteId);
        // Si estamos en una categoría, recargamos. Si no, limpiamos.
        if (currentCategoryId) {
            loadSites(currentCategoryId);
        } else {
            // Si estábamos buscando globalmente y borramos, recargamos la búsqueda
            // (Para simplificar, limpiamos tabla)
            siteTableBody.innerHTML = '<tr><td colspan="4">Sitio borrado. Vuelve a buscar o selecciona categoría.</td></tr>';
        }
    } catch (error) {
        alert("Error al borrar: " + error.message);
    }
}

// ==========================================
// LÓGICA DE AÑADIR
// ==========================================
if (btnAddCategory) {
    btnAddCategory.addEventListener('click', async () => {
        const catName = prompt("Nombre categoría:");
        if (catName) {
            await api.addCategory(catName);
            loadCategories();
        }
    });
}

// ==========================================
// BUSCADOR GLOBAL 🌍 (Aquí está la solución)
// ==========================================

if (searchInput) {
    searchInput.addEventListener('keyup', async (e) => {
        const term = e.target.value.toLowerCase();

        // 1. Filtrar visualmente las categorías (Izquierda)
        const categories = document.querySelectorAll('.category-item');
        categories.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });

        // 2. BUSCAR SITIOS GLOBALMENTE (Derecha)
        if (term.length > 0) {
            // Si hay texto, ignoramos la categoría actual y buscamos en TODO
            try {
                // Pedimos TODOS los sitios al servidor
                const allResponse = await api.getAllSites();
                const allSites = Array.isArray(allResponse) ? allResponse : (allResponse.sites || []);
                
                // Filtramos en memoria los que coincidan por nombre o usuario
                const matchingSites = allSites.filter(site => 
                    site.name.toLowerCase().includes(term) || 
                    site.user.toLowerCase().includes(term)
                );

                // Pintamos los resultados
                renderSiteTable(matchingSites);
                
                // (Opcional) Quitamos la selección visual de la categoría izquierda para no confundir
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                
            } catch (error) {
                console.error("Error en búsqueda global:", error);
            }
        } else {
            // Si borras el texto del buscador, volvemos a la normalidad
            if (currentCategoryId) {
                // Si tenías una categoría abierta, recargamos sus sitios
                loadSites(currentCategoryId);
                // Volvemos a marcarla en azul
                // (Esto requeriría buscar el ID en el DOM, pero con recargar los datos basta por ahora)
            } else {
                siteTableBody.innerHTML = '<tr><td colspan="4">Selecciona una categoría...</td></tr>';
            }
        }
    });
}