class API {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    // Función fetch
    async fetchData(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: this.headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            if (!response.ok) {
                throw new Error(`Error API: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();

            if (!text) return null;

            try {
                return JSON.parse(text);
            } catch (jsonError) {
                return text; 
            }

        } catch (error) {
            console.error("Fallo en la petición:", error);
            throw error; 
        }
    }

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


    // Obtener sitios de una categoría específica
    getSites(categoryId) {
        return this.fetchData(`/categories/${categoryId}`);
    }

    // Obtener TODOS los sitios para el buscador
    getAllSites() {
        return this.fetchData('/sites');
    }

    // Añadir un sitio a una categoría
    addSite(categoryId, siteData) {
        return this.fetchData(`/categories/${categoryId}`, 'POST', siteData);
    }

    // Eliminar un sitio
    deleteSite(id) {
        return this.fetchData(`/sites/${id}`, 'DELETE');
    }
}

export const api = new API();