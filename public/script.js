let questions = [];
let current = 0;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let startTime = Date.now();
let times = [];

async function fetchQuestions() {
  const res = await fetch('/api/questions');
  questions = await res.json();
  showQuestion();
}

//muestro en pantalla una pregunta del juego con sus 4 opciones
function showQuestion() {
  const q = questions[current];
  document.getElementById('question').textContent = q.question;
  const opts = q.options.map(opt =>
    `<button class="option" onclick="checkAnswer('${opt}')">${opt}</button>`
  ).join('');
  document.getElementById('options').innerHTML = opts;
  document.getElementById('feedback').textContent = '';
  document.getElementById('nextBtn').classList.add('hidden');
}

//Evaluo si la respuesta fue correcta o incorrecta
function checkAnswer(selected) {
  const q = questions[current];
  const timeTaken = (Date.now() - startTime) / 1000;
  times.push(timeTaken);
  startTime = Date.now();

  if (selected === q.answer) {
    score += q.points;
    correctCount++;
    document.getElementById('feedback').innerHTML = `<span class="correct">¡Correcto!</span>`;
  } else {
    incorrectCount++;
    document.getElementById('feedback').innerHTML = `<span class="incorrect">Incorrecto. La respuesta correcta era: ${q.answer}</span>`;
  }

  document.querySelectorAll('.option').forEach(btn => btn.disabled = true);
  document.getElementById('nextBtn').classList.remove('hidden');
}
// paso a la siguiente pregunta o muestro los resultados finales si ya no quedan mas.
function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}
// muestro la pantalla de resultados finales cuando el usuario termina de responder todas las preguntas del juego.
function showResults() {
  document.getElementById('quiz').classList.add('hidden');
  const total = times.reduce((a, b) => a + b, 0).toFixed(2);
  const avg = (total / questions.length).toFixed(2);
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').innerHTML = `
    <h2>Resultados Finales</h2>
    <p>Correctas: ${correctCount}</p>
    <p>Incorrectas: ${incorrectCount}</p>
    <p>Puntaje: ${score}</p>
    <p>Tiempo total: ${total} s</p>
    <p>Promedio por pregunta: ${avg} s</p>
  `;
}

fetchQuestions();
