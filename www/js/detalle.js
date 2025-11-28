import { api } from './api.js';

// --- REFERENCIAS AL DOM ---
const form = document.getElementById('siteForm');
const categorySelect = document.getElementById('categorySelect');
const btnGenerate = document.getElementById('btnGenerate');
const passwordInput = document.getElementById('password');

// --- 1. AL CARGAR LA PÁGINA: Rellenar el desplegable de categorías ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Pedimos las categorías al servidor
        const categories = await api.getCategories();
        
        // Limpiamos el select y ponemos la opción por defecto
        categorySelect.innerHTML = '<option value="">Select a category...</option>';
        
        // Creamos una opción <option> por cada categoría
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id; // El valor que se enviará es el ID (número)
            option.textContent = cat.name; // Lo que ve el usuario es el Nombre
            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando categorías:", error);
        alert("Error: No se pueden cargar las categorías. Asegúrate de que npm start (puerto 3000) funciona.");
    }
});

// --- 2. FUNCIONALIDAD EXTRA: GENERAR CONTRASEÑA SEGURA 🎲 ---
// Cumple con el requisito del PDF: "8 caracteres, no sólo alfanuméricos..."
if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        const passwordLength = 12; // Ponemos 12 para que sea más segura
        let password = "";

        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars.charAt(randomIndex);
        }

        // Escribimos la contraseña en el input
        passwordInput.value = password;

        // Efecto visual: parpadeo verde para saber que ha funcionado
        passwordInput.style.transition = "background-color 0.3s";
        passwordInput.style.backgroundColor = "#d4edda";
        setTimeout(() => passwordInput.style.backgroundColor = "", 500);
    });
}

// --- 3. AL ENVIAR EL FORMULARIO (SAVE) ---
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue sola

        // Validamos que haya categoría seleccionada
        const categoryId = categorySelect.value;
        if (!categoryId) {
            alert("⚠️ Please select a category");
            return;
        }

        // Recogemos los datos de los inputs
        const urlValue = document.getElementById('url').value;
        
        const siteData = {
            name: urlValue, // Usamos la URL como nombre del sitio (ya que el diseño no tiene campo 'Nombre' separado)
            url: urlValue,
            user: document.getElementById('user').value,
            password: passwordInput.value,
            description: document.getElementById('description').value || ""
        };

        try {
            // Llamamos a la API para guardar
            console.log("Enviando datos...", siteData);
            await api.addSite(categoryId, siteData);

            // Si todo va bien, volvemos a la página principal
            alert("✅ Site saved successfully!");
            window.location.href = 'index.html';

        } catch (error) {
            console.error(error);
            alert("❌ Error saving site: " + error.message);
        }
    });
}

// --- VALIDACIÓN VISUAL (Punto Extra) ---
function activarValidaciones() {
    // Buscamos todos los inputs obligatorios
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        // Cuando sales de la casilla (blur)
        input.addEventListener('blur', () => {
            if (!input.checkValidity()) {
                input.style.borderColor = "#e74c3c"; // Rojo
                input.style.backgroundColor = "#fff5f5";
            } else {
                input.style.borderColor = "#2ecc71"; // Verde
                input.style.backgroundColor = "#ffffff";
            }
        });

        // Cuando escribes para corregirlo
        input.addEventListener('input', () => {
            input.style.borderColor = ""; // Quitar color
            input.style.backgroundColor = "";
        });
    });
}

// IMPORTANTE: Ejecutar esto al cargar
activarValidaciones();