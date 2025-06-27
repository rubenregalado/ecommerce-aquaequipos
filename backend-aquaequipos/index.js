require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configuración robusta de CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://ecommerce-aquaequipos.vercel.app'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// ✅ Manejo explícito de preflight OPTIONS
app.options('*', cors());

// Middleware
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

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de AquaEquipos funcionando 🛠️');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
