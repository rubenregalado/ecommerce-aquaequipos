require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configuración de CORS para Vercel y localhost
const allowedOrigins = [
  'https://ecommerce-aquaequipos.vercel.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Origen bloqueado por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight para POST desde fetch()

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
