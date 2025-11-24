class API {
    constructor() {
        // La dirección de tu servidor backend
        this.baseUrl = 'http://localhost:3000';
        // Cabeceras necesarias para enviar datos
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    // --- FUNCIÓN MAESTRA (Aquí está la magia anti-errores) ---
    async fetchData(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: this.headers
        };

        // Si hay datos para enviar (POST/PUT), los convertimos a JSON
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            // Si el servidor da error (ej: 404, 500), lanzamos el error
            if (!response.ok) {
                throw new Error(`Error API: ${response.status} ${response.statusText}`);
            }

            // --- SOLUCIÓN AL PROBLEMA "OK" ---
            // 1. Leemos la respuesta como texto primero
            const text = await response.text();

            // 2. Si la respuesta está vacía, devolvemos null
            if (!text) return null;

            // 3. Intentamos convertir a JSON. 
            // Si falla (porque el servidor envió solo "OK"), devolvemos el texto.
            try {
                return JSON.parse(text);
            } catch (jsonError) {
                // Si llegamos aquí, es que era texto plano (como "OK")
                return text; 
            }

        } catch (error) {
            console.error("Fallo en la petición:", error);
            throw error; // Re-lanzamos el error para que lo capture el index.js
        }
    }

    // ==========================================
    // MÉTODOS DE CATEGORÍAS
    // ==========================================

    // Obtener todas las categorías
    getCategories() {
        return this.fetchData('/categories');
    }

    // Añadir una nueva categoría
    addCategory(name) {
        return this.fetchData('/categories', 'POST', { name });
    }

    // Eliminar una categoría
    deleteCategory(id) {
        return this.fetchData(`/categories/${id}`, 'DELETE');
    }

    // ==========================================
    // MÉTODOS DE SITIOS (SITES)
    // ==========================================

    // Obtener sitios de una categoría específica
    getSites(categoryId) {
        return this.fetchData(`/categories/${categoryId}`);
    }

    // --- NUEVO: Obtener TODOS los sitios (para el buscador global) ---
    getAllSites() {
        return this.fetchData('/sites');
    }

    // Añadir un sitio a una categoría
    addSite(categoryId, siteData) {
        return this.fetchData(`/categories/${categoryId}`, 'POST', siteData);
    }

    // Eliminar un sitio (¡OJO: Es /sites/ en plural!)
    deleteSite(id) {
        return this.fetchData(`/sites/${id}`, 'DELETE');
    }
}

// Exportamos la instancia lista para usar
export const api = new API();