import { api } from './api.js';

// Elementos del DOM
const form = document.getElementById('siteForm');
const categorySelect = document.getElementById('categorySelect');
const btnGenerate = document.getElementById('btnGenerate');
const passwordInput = document.getElementById('password');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const categories = await api.getCategories();
        
        categorySelect.innerHTML = '<option value="">Select a category...</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
        
        activarValidaciones();

    } catch (error) {
        console.error("Error cargando categorías:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron cargar las categorías. Revisa npm start.'
        });
    }
});

// contraseña segura
if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        const passwordLength = 12; 
        let password = "";

        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars.charAt(randomIndex);
        }

        passwordInput.value = password;
        
        passwordInput.style.borderColor = "#2ecc71"; 
        passwordInput.style.backgroundColor = "#ffffff";

        const originalBg = passwordInput.style.backgroundColor;
        passwordInput.style.transition = "background-color 0.3s";
        passwordInput.style.backgroundColor = "#d4edda";
        setTimeout(() => passwordInput.style.backgroundColor = originalBg, 500);

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
        Toast.fire({ icon: 'success', title: 'Pass generada' });
    });
}

// guardar sitio
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const categoryId = categorySelect.value;
        if (!categoryId) {
            Swal.fire('Falta información', 'Por favor, selecciona una categoría.', 'warning');
            return;
        }

        const urlValue = document.getElementById('url').value;
        const siteData = {
            name: urlValue, // Usamos la URL como nombre
            url: urlValue,
            user: document.getElementById('user').value,
            password: passwordInput.value,
            description: document.getElementById('description').value || ""
        };

        try {
            await api.addSite(categoryId, siteData);

            // Mensaje de Éxito con SweetAlert
            await Swal.fire({
                title: '¡Guardado!',
                text: 'El sitio se ha añadido correctamente.',
                icon: 'success',
                confirmButtonText: 'Genial',
                confirmButtonColor: '#2ecc71'
            });

            window.location.href = 'index.html';

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar: ' + error.message, 'error');
        }
    });
}

// validaciones visuales
function activarValidaciones() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.checkValidity()) {
                input.style.borderColor = "#e74c3c"; // Rojo
                input.style.backgroundColor = "#fff5f5";
            } else {
                input.style.borderColor = "#2ecc71"; // Verde
                input.style.backgroundColor = "#ffffff";
            }
        });

        input.addEventListener('input', () => {
            input.style.borderColor = ""; 
            input.style.backgroundColor = "";
        });
    });
}