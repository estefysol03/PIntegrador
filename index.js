const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// traigo los archivos estaticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para preguntas dinamicas
app.get('/api/questions', async (req, res) => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();

    const questions = [];
    while (questions.length < 10) {
      const random = Math.floor(Math.random() * countries.length);
      const country = countries[random];
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

    res.json(questions.slice(0, 10)); //el Json le manda 10 preguntas al navegador.
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener preguntas");
  }
});

//genera 4 opciones multiples para una pregunta con su correcta
function getRandomOptions(countries, correct) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const random = countries[Math.floor(Math.random() * countries.length)].name.common;
    options.add(random);
  }
  return [...options].sort(() => Math.random() - 0.5);
}
// Genero opciones falsas y una verdadera.
function generateFakeNumbers(correct) {
  const correctNum = parseInt(correct);
  const numbers = new Set([correctNum]);
  while (numbers.size < 4) {
    let fake = Math.floor(Math.random() * 10) + 1;
    numbers.add(fake);
  }
  return [...numbers].sort(() => Math.random() - 0.5).map(String);
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
