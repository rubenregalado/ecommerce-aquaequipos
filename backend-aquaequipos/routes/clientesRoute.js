const express = require("express");
const router = express.Router();
const WooCommerceApi = require("../utils/woocommerceClient");

router.get("/clientes", async (req, res) => {
    try {
        const response = await WooCommerceApi.get("customers", {
            params: {
                per_page: 100,
                role: 'customer'
            }
        });

        const clientes = response.data.map(cliente => ({
            id: cliente.id,
            email: cliente.email,
            first_name: cliente.first_name,
            last_name: cliente.last_name,
            username: cliente.username,
            // otros campos que necesites
        }));

        // Imprime los clientes en la consola del servidor
        console.log("Lista de clientes recibida de WooCommerce:", clientes);

        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error.response?.data || error.message);
        res.status(500).json({ error: "Error al obtener clientes", detalle: error.response?.data || error.message });
    }
});

module.exports = router;
