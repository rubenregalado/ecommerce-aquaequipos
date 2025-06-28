require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configuración segura de CORS para Vercel
app.use(cors({
  origin: 'https://ecommerce-aquaequipos.vercel.app',
  credentials: true
}));

app.use(express.json());

// Rutas
const calculoRoute = require('./routes/calculoRoute');
const productosRoute = require('./routes/productosRoute');
const cotizacion = require('./routes/cotizacion');
const chatbotRouter = require('./routes/chatbot');

app.use("/api/cotizacion", cotizacion);
app.use("/api/asesoria", calculoRoute);
app.use("/api/productos", productosRoute);
app.use('/api/chatbot', chatbotRouter);

// Ruta base
app.get('/', (req, res) => {
  res.send('API de AquaEquipos funcionando 🛠️');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
