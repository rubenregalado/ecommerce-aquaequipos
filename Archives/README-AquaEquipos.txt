
# AquaEquipos - Backend API

Este proyecto representa el backend de la aplicación de asesoría técnica para bombas de agua. Está construido en Node.js con Express y devuelve recomendaciones basadas en datos técnicos como altura, caudal y voltaje.

---

## 🛠 Requisitos previos

- macOS (iMac 2019 o superior)
- Node.js (versión LTS recomendada)
- NPM (instalado con Node.js)

---

## ✅ Instalación de Node.js en macOS

1. Visita: https://nodejs.org
2. Descarga el instalador LTS (.pkg)
3. Instala siguiendo el asistente
4. Verifica instalación:

```
node -v
npm -v
```

---

## 🚀 Instrucciones para ejecutar el backend

1. Abre la Terminal
2. Ve a la carpeta del proyecto:

```
cd ~/Desktop/backend-aquaequipos
```

3. Instala las dependencias:

```
npm install
```

4. Inicia el servidor:

```
node index.js
```

(Si usas nodemon para desarrollo, puedes correr: `npx nodemon index.js`)

---

## 🌐 Acceso a la API

Una vez iniciado, el backend estará disponible en:

```
http://localhost:3000/api/asesoria
```

Puedes hacer peticiones POST desde Postman o desde el frontend.

---

## 📦 Estructura del proyecto

- `index.js`: archivo principal del servidor
- `routes/calculoRoute.js`: rutas de la API
- `controllers/calculoController.js`: lógica del sistema
- `data/bombasSimuladas.json`: base de datos simulada de bombas

---

## 🧪 Recomendado para pruebas

Utiliza [Postman](https://www.postman.com/downloads/) para enviar peticiones POST y verificar el funcionamiento del sistema.

---
