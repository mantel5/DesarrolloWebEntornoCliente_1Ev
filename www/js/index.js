import { api } from './api.js';

// --- REFERENCIAS AL DOM ---
const categoryList = document.getElementById('categoryList');
const siteTableBody = document.getElementById('siteTableBody');
const btnAddCategory = document.getElementById('btnAddCategory');
const searchInput = document.getElementById('searchInput');

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

        li.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            
            currentCategoryId = cat.id;
            searchInput.value = ""; 
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
        siteTableBody.innerHTML = '<tr><td colspan="5">Categoría eliminada</td></tr>';
        currentCategoryId = null;
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// ==========================================
// LÓGICA DE SITIOS (SITES)
// ==========================================

async function loadSites(categoryId) {
    siteTableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const response = await api.getSites(categoryId);
        const sites = Array.isArray(response) ? response : (response.sites || []);
        renderSiteTable(sites);
    } catch (error) {
        console.error(error);
        siteTableBody.innerHTML = '<tr><td colspan="5" style="color:red">Error cargando sitios</td></tr>';
    }
}

// FUNCIÓN PARA PINTAR LA TABLA (5 COLUMNAS)
function renderSiteTable(sites) {
    siteTableBody.innerHTML = ''; 

    if (sites.length === 0) {
        siteTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay sitios para mostrar</td></tr>';
        return;
    }

    sites.forEach(site => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${site.name}</td>
            <td>${site.user}</td>
            <td style="letter-spacing: 2px; color: #999;">•••••••</td>
            <td>${site.createdAt ? new Date(site.createdAt).toLocaleDateString() : '-'}</td>
        `;

        const tdActions = document.createElement('td');
        
        const btnShow = document.createElement('button');
        btnShow.textContent = '👁️';
        btnShow.className = 'btn btn-sm';
        btnShow.style.marginRight = '5px';
        btnShow.title = "Ver contraseña";
        btnShow.onclick = () => alert(`Contraseña: ${site.password}`);

        const btnDelete = document.createElement('button');
        btnDelete.textContent = '🗑️';
        btnDelete.className = 'btn btn-danger btn-sm';
        btnDelete.style.marginRight = '5px';
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
        if (currentCategoryId) {
            loadSites(currentCategoryId);
        } else {
            siteTableBody.innerHTML = '<tr><td colspan="5">Sitio borrado.</td></tr>';
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
// BUSCADOR GLOBAL 🌍
// ==========================================

if (searchInput) {
    searchInput.addEventListener('keyup', async (e) => {
        const term = e.target.value.toLowerCase();

        const categories = document.querySelectorAll('.category-item');
        categories.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });

        if (term.length > 0) {
            try {
                const allResponse = await api.getAllSites();
                const allSites = Array.isArray(allResponse) ? allResponse : (allResponse.sites || []);
                
                const matchingSites = allSites.filter(site => 
                    site.name.toLowerCase().includes(term) || 
                    site.user.toLowerCase().includes(term)
                );

                renderSiteTable(matchingSites);
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                
            } catch (error) {
                console.error("Error en búsqueda global:", error);
            }
        } else {
            if (currentCategoryId) {
                loadSites(currentCategoryId);
            } else {
                siteTableBody.innerHTML = '<tr><td colspan="5">Selecciona una categoría...</td></tr>';
            }
        }
    });
}