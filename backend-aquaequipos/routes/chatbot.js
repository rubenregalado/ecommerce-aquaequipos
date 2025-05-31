const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const userAttempts = {};
const OUT_OF_SCOPE_MESSAGE = "Solo puedo ayudarte con dudas técnicas sobre bombas de agua y los temas del formulario";

router.post('/', async (req, res) => {
  const { message, userId } = req.body;
  if (!message) return res.status(400).json({ response: 'Mensaje vacío' });
  if (!userId) return res.status(400).json({ response: 'Falta identificador de usuario' });

  const saludos = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'hey'];
  if (saludos.includes(message.toLowerCase().trim())) {
    return res.json({ response: '¡Hola! ¿En qué puedo ayudarte? Seré tu asistente para este formulario' });
  }

  if (!userAttempts[userId]) userAttempts[userId] = 0;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prompt sin indentación extra para mejor interpretación
    const prompt = `
Eres un asistente técnico especializado en bombas y sistemas hidráulicos. 
Tu única función es ayudar a los usuarios a comprender y completar el siguiente formulario de asesoría técnica para bombas de agua. 
Solo puedes responder preguntas relacionadas con estos temas:

- Aplicación (ejemplo: Cisterna con tanque elevado, Pozo con tanque elevado, Pozo con Sistema Hidroneumático, Cisterna con Sistema Hidroneumático)
- Fase eléctrica (monofásica, trifásica, panel solar)
- Voltaje
- Altura vertical (metros) (la altura que debe subir el agua)
- Longitud de tubería (metros) (la distancia total de tubería utilizada)
- Número de codos o accesorios en la instalación (codos, tees, válvulas, etc.)
- Diámetro de la tubería (en pulgadas)
- Caudal (qué es, cómo se calcula, litros por minuto - LPM, galones por minuto - GPM)
- Cálculo de caudal por dimensiones (altura, ancho, largo, tiempo de llenado de un tanque)
- Pérdida de fricción en tuberías
- Selección de bombas de agua según las necesidades del usuario

No debes recomendar marcas, modelos, ni lugares de compra de bombas o accesorios. No puedes dar consejos fuera de los temas del formulario.

Si la pregunta del usuario no está relacionada con estos temas, responde exactamente con este mensaje:
"${OUT_OF_SCOPE_MESSAGE}. Si necesitas otro tipo de ayuda, por favor contacta a un asesor en nuestro WhatsApp: https://wa.me/50250040468"

Si el usuario insiste con temas fuera del formulario, recuérdale de forma amable:
"Por favor, realiza preguntas solo sobre el formulario técnico. Si necesitas otro tipo de ayuda, contacta a un asesor por WhatsApp."

Cuando respondas sobre los temas permitidos, sé claro, breve y usa un lenguaje sencillo que cualquier persona pueda entender, evitando tecnicismos innecesarios.

Pregunta del usuario: ${message}
`;

    const result = await model.generateContent(prompt);

    const respuesta = result.response.text();

    // Contar intentos si la respuesta es fuera de tema
    if (respuesta.includes(OUT_OF_SCOPE_MESSAGE)) {
      userAttempts[userId]++;
    } else {
      userAttempts[userId] = 0;
    }

    if (userAttempts[userId] >= 2) {
      return res.json({
        response: 'Has excedido el número máximo de preguntas permitidas fuera del tema. Por favor, contacta a un asesor para más ayuda.',
        limitReached: true
      });
    }

    res.json({ response: respuesta, limitReached: false });

  } catch (error) {
    console.error('Error Gemini:', error);
    res.status(500).json({ response: 'Error en el servidor de IA.', limitReached: false });
  }
});

module.exports = router;
