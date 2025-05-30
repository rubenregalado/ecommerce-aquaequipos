const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const userAttempts = {};

router.post('/', async (req, res) => {
  const { message, userId } = req.body;
  if (!message) return res.status(400).json({ response: 'Mensaje vacío' });
  if (!userId) return res.status(400).json({ response: 'Falta identificador de usuario' });

  const saludos = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'hey'];
  if (saludos.includes(message.toLowerCase().trim())) {
    return res.json({ response: '¡Hola! ¿En qué puedo ayudarte con tus sistemas hidráulicos?' });
  }

  if (!userAttempts[userId]) userAttempts[userId] = 0;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // o 'gpt-3.5-turbo' si no tienes acceso a GPT-4
      messages: [
        {
          role: 'system',
          content: `Eres un asistente técnico experto en bombas y sistemas hidráulicos. Responde de forma clara y breve.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
    });

    const respuesta = completion.choices[0].message.content;

    const noAnswerPhrases = ['no estoy seguro', 'no puedo responder', 'no sé', '¿quieres hablar con un asesor?'];
    const noAnswer = noAnswerPhrases.some(phrase => respuesta.toLowerCase().includes(phrase));

    if (noAnswer) {
      userAttempts[userId]++;
    } else {
      userAttempts[userId] = 0;
    }

    if (userAttempts[userId] >= 8) {
      return res.json({
        response: 'Parece que tienes muchas dudas. ¿Quieres que te conecte con un asesor para ayudarte mejor?'
      });
    }

    res.json({ response: respuesta });

  } catch (error) {
    console.error('Error OpenAI:', error);
    res.status(500).json({ response: 'Error en el servidor de IA.' });
  }
});

module.exports = router;
