import { api } from './api.js';

// Elementos del DOM
const categoryList = document.getElementById('categoryList');
const siteTableBody = document.getElementById('siteTableBody');
const btnAddCategory = document.getElementById('btnAddCategory');
const searchInput = document.getElementById('searchInput');

let currentCategoryId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

// Cargar y mostrar categorías
async function loadCategories() {
    try {
        const categories = await api.getCategories();
        renderCategories(categories);
    } catch (error) {
        console.error("Error cargando categorías:", error);
        categoryList.innerHTML = '<li style="color:red">Error de conexión</li>';
    }
}

// Renderizar categorías en la lista
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

// Eliminar categoría con confirmación
async function deleteCategoryFunc(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Borrarás la categoría y todos sus sitios. ¡No hay vuelta atrás!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Rojo
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, ¡borrarlo!'
    });

    if (result.isConfirmed) {
        try {
            await api.deleteCategory(id);
            loadCategories();
            siteTableBody.innerHTML = '<tr><td colspan="5">Categoría eliminada</td></tr>';
            currentCategoryId = null;
            
            Swal.fire(
                '¡Borrado!',
                'La categoría ha sido eliminada.',
                'success'
            );
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
}


// Cargar y mostrar sitios de una categoría
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

// Renderizar tabla de sitios
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

// Eliminar sitio con confirmación
async function deleteSiteFunc(siteId) {
    const result = await Swal.fire({
        title: '¿Eliminar sitio?',
        text: "No podrás recuperar esta contraseña.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', 
        cancelButtonColor: '#3085d6', 
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await api.deleteSite(siteId);

            if (currentCategoryId) {
                loadSites(currentCategoryId);
            } else {
                siteTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #2ecc71;">Sitio borrado correctamente ✨</td></tr>';
            }

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: 'success',
                title: 'Sitio eliminado'
            });

        } catch (error) {
            Swal.fire('Error', 'No se pudo borrar: ' + error.message, 'error');
        }
    }
}

// Añadir nueva categoría
if (btnAddCategory) {
    btnAddCategory.addEventListener('click', async () => {
        
        const { value: formValues } = await Swal.fire({
            title: 'Nueva Categoría',
            html: `
                <input id="swal-input-name" class="swal2-input" placeholder="Nombre de la categoría">
                <select id="swal-input-icon" class="swal2-input">
                    <option value="📁">📁 Sin icono (Carpeta)</option>
                    <option value="🏠">🏠 Casa</option>
                    <option value="💼">💼 Trabajo</option>
                    <option value="🛒">🛒 Compras</option>
                    <option value="🎮">🎮 Ocio</option>
                    <option value="🎓">🎓 Estudios</option>
                    <option value="✈️">✈️ Viajes</option>
                    <option value="🔒">🔒 Seguridad</option>
                    <option value="🌐">🌐 Web</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true, 
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#2ecc71', 
            cancelButtonColor: '#d33',
            
            preConfirm: () => {
                const name = document.getElementById('swal-input-name').value;
                const icon = document.getElementById('swal-input-icon').value;
                
                if (!name) {
                    Swal.showValidationMessage('¡El nombre es obligatorio!');
                    return false; // Evita que se cierre si no hay nombre
                }
                
                return `${icon} ${name}`;
            }
        });

        if (formValues) {
            try {
                await api.addCategory(formValues);
                loadCategories(); 
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'La categoría se ha creado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
            }
        }
    });
}


// Búsqueda en categorías y sitios
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