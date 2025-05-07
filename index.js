const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https'); // Usamos https para fetch manual
const app = express();
const PORT = 3000;

const RANKING_FILE = path.join(__dirname, 'ranking.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Función para hacer "fetch" 
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Endpoint para preguntas
app.get('/api/questions', async (req, res) => {
  try {
    const countries = await fetchJson('https://restcountries.com/v3.1/all');
    const questions = [];
    let attempts = 0;

    while (questions.length < 10 && attempts < 100) {
      attempts++;
      const country = countries[Math.floor(Math.random() * countries.length)];
      const type = ["capital", "bandera", "limítrofes"][Math.floor(Math.random() * 3)];

      if (type === "capital" && country.capital?.[0]) {
        const correct = country.name.common;
        const question = `¿Cuál es el país de la ciudad capital '${country.capital[0]}'?`;
        const options = getRandomOptions(countries, correct);
        questions.push({ type, question, options, answer: correct, points: 3 });
      }

      if (type === "bandera" && country.flag) {
        const correct = country.name.common;
        const question = `El país representado por esta bandera ${country.flag} es...`;
        const options = getRandomOptions(countries, correct);
        questions.push({ type, question, options, answer: correct, points: 5 });
      }

      if (type === "limítrofes" && country.borders?.length > 0) {
        const correct = country.borders.length.toString();
        const question = `¿Cuántos países limítrofes tiene ${country.name.common}?`;
        const options = generateFakeNumbers(correct);
        questions.push({ type, question, options, answer: correct, points: 3 });
      }
    }

    if (questions.length < 10) {
      return res.status(500).send("No se pudieron generar suficientes preguntas.");
    }

    res.json(questions.slice(0, 10));
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    res.status(500).send("Error al obtener preguntas");
  }
});

// Generador de opciones de respuesta
function getRandomOptions(countries, correct) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const random = countries[Math.floor(Math.random() * countries.length)].name.common;
    options.add(random);
  }
  return [...options].sort(() => Math.random() - 0.5);
}

// Generador de opciones numericas
function generateFakeNumbers(correct) {
  const correctNum = parseInt(correct);
  const numbers = new Set([correctNum]);
  while (numbers.size < 4) {
    numbers.add(Math.floor(Math.random() * 10) + 1);
  }
  return [...numbers].sort(() => Math.random() - 0.5).map(String);
}

// Ranking
function loadRanking() {
  if (fs.existsSync(RANKING_FILE)) {
    const data = fs.readFileSync(RANKING_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function saveRanking(ranking) {
  fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));
}

app.get('/api/ranking', (req, res) => {
  const ranking = loadRanking();
  ranking.sort((a, b) => b.score - a.score);
  res.json(ranking.slice(0, 20));
});

app.post('/api/ranking', (req, res) => {
  const { name, score, correct, time } = req.body;

  if (!name || score == null || correct == null || time == null) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const ranking = loadRanking();
  ranking.push({ name, score, correct, time });
  saveRanking(ranking);

  res.json({ message: "Puntaje guardado exitosamente" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
}); 