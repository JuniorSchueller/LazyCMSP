require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Only replies with the correct letter, if the right answer letter is A only reply \"A\", if B \"B\", C \"C\". if Correto, \"V\", if Errado \"F\", if Correto and Errado is on a list, reply in separate lines, eg:\nV\nV\nF\nF",
});

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function generateAnswer(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}

app.use(express.json());
app.use(cors({
  origin: 'https://cmsp.ip.tv'
}));

app.post('/getAnswer', async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await generateAnswer(message);

    res.json({ 'response': reply });
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    res.status(500).json({ error: 'Erro ao gerar resposta' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
