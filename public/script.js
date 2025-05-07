let questions = [];
let current = 0;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let startTime = Date.now();
let times = [];

async function fetchQuestions() {
  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
    showQuestion();
  } catch (err) {
    document.getElementById('quiz').innerHTML = "<p>Error al cargar preguntas.</p>";
    console.error("Error:", err);
  }
}

function showQuestion() {
  const q = questions[current];
  document.getElementById('question').textContent = q.question;

  const buttons = q.options.map(opt =>
    `<button class="option" onclick="checkAnswer('${opt}')">${opt}</button>`
  ).join('');

  document.getElementById('options').innerHTML = buttons;
  document.getElementById('feedback').textContent = '';
  document.getElementById('nextBtn').classList.add('hidden');
}

function checkAnswer(selected) {
  const q = questions[current];
  const timeTaken = (Date.now() - startTime) / 1000;
  times.push(timeTaken);
  startTime = Date.now();

  const correct = selected === q.answer;
  if (correct) {
    score += q.points;
    correctCount++;
    document.getElementById('feedback').innerHTML = `<span class="correct">¡Correcto!</span>`;
  } else {
    incorrectCount++;
    document.getElementById('feedback').innerHTML = `<span class="incorrect">Incorrecto. La respuesta era: ${q.answer}</span>`;
  }

  document.querySelectorAll('.option').forEach(btn => btn.disabled = true);
  document.getElementById('nextBtn').classList.remove('hidden');
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('results').classList.remove('hidden');

  const total = times.reduce((a, b) => a + b, 0).toFixed(2);
  const avg = (total / questions.length).toFixed(2);

  document.getElementById('results').innerHTML = `
    <h2>Resultados</h2>
    <p>Correctas: ${correctCount}</p>
    <p>Incorrectas: ${incorrectCount}</p>
    <p>Puntaje: ${score}</p>
    <p>Tiempo total: ${total}s</p>
    <p>Promedio por pregunta: ${avg}s</p>
    <button onclick="saveScore()">Guardar puntaje</button>
  `;
   // Mostrar el boton de "Ver Ranking"
   document.getElementById('showRankingBtn').classList.remove('hidden');
   
}

async function saveScore() {
  const name = prompt("Ingresá tu nombre:");
  if (!name) return;

  const totalTime = times.reduce((a, b) => a + b, 0).toFixed(2);

  const data = {
    name,
    score,
    correct: correctCount,
    time: parseFloat(totalTime)
  };

  await fetch('/api/ranking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  showRanking();
}


/*async function showRanking() {
  const res = await fetch('/api/ranking');
  const ranking = await res.json();

  const html = ranking.map((p, i) =>
    `<p><strong>${i + 1}. ${p.name}</strong> - Puntaje: ${p.score}, Correctas: ${p.correct}, Tiempo: ${p.time}s</p>`
  ).join('');

  const rankingDiv = document.getElementById('ranking');
  rankingDiv.classList.remove('hidden'); // primero se muestra
  rankingDiv.innerHTML = `<h2>Ranking Top 20</h2>${html}`; // luego se escribe

}*/

async function showRanking() {
  console.log("Mostrando ranking..."); // ← DEBUG
  const res = await fetch('/api/ranking');
  const ranking = await res.json();

  const html = ranking.map((p, i) =>
    `<p><strong>${i + 1}. ${p.name}</strong> - Puntaje: ${p.score}, Correctas: ${p.correct}, Tiempo: ${p.time}s</p>`
  ).join('');

  document.getElementById('ranking').classList.remove('hidden');
  document.getElementById('ranking').innerHTML = `<h2>Ranking Top 20</h2>${html}`;
}




fetchQuestions();


