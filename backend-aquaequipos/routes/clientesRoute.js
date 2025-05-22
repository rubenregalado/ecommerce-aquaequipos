const express = require("express");
const router = express.Router();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  url: "https://aquaequipos.com/tienda",
  consumerKey: "ck_33c6f7d90e13b4e228bec54192541df8509f06de",
  consumerSecret: "cs_7736c2968cc84082c28c6aec7113c2465794fe1d",
  version: "wc/v3"
});

router.get("/", async (req, res) => {
  try {
    const response = await api.get("customers", {
      per_page: 100 // Ajusta según necesidad
    });

    const clientes = response.data.map(cliente => ({
      id: cliente.id,
      email: cliente.email,
      first_name: cliente.first_name,
      last_name: cliente.last_name,
      username: cliente.username,
      // otros campos que necesites
    }));

    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al obtener clientes", detalle: error.response?.data || error.message });
  }
});

module.exports = router;
