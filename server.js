/* eslint-disable no-inline-comments */
require('dotenv').config();

// http server
const { createServer } = require('http');

// express
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;
const hostname = process.env.DOMAIN.endsWith('.local') ? process.env.DOMAIN : process.env.DOMAIN + '.local' || 'milionerzy.local';

// use express on web server
const httpServer = createServer(app);

// load database file
const db = require('better-sqlite3')('./server/database/pytania.db', { readonly: true });

// setup websocket server
const { Server } = require('socket.io');
const io = new Server(httpServer);

io.on('connection', (socket) => {
	console.log(`Klient połączony! (${socket.handshake.address.split(':').reverse()[0]})`);

	// response question data when client emmit 'question' event
	socket.on('question', () => {

		const questionsCount = db.prepare('SELECT COUNT(*) FROM pytania').get(); // get number of questions from db
		const randomQuestionId = Math.floor(Math.random() * (questionsCount['COUNT(*)'] - 1) + 1);

		const question = db.prepare('SELECT * FROM pytania WHERE id_pytania = ?').get(randomQuestionId);
		const answers = db.prepare('SELECT odpowiedz_a, odpowiedz_b, odpowiedz_c, odpowiedz_d FROM odpowiedzi WHERE id_pytania = ?').get(randomQuestionId);

		if (!question || !answers) return socket.emit('question', { error: true, message: 'Nie znaleziono pytania w bazie!' });

		socket.emit('question', Object.assign(question, answers));
	});

	socket.on('answer', (req) => {
		if (!req.questionId || !req.checkedAnswer) return socket.emit('answer', { error: true, message: 'Nie przesłano wszystkich wymaganych danych.' });

		const questionsCount = db.prepare('SELECT COUNT(*) FROM pytania').get(); // get number of questions from db
		if (req.questionId > questionsCount || req.checkedAnswer.length > 1 || new RegExp('[^ABCD]').test(req.checkedAnswer.toUpperCase())) return socket.emit('answer', { error: true, message: 'Przesłane dane są nieprawidłowe!' });

		const rightAnswer = db.prepare('SELECT prawidlowa FROM odpowiedzi WHERE id_pytania = ?').get(req.questionId);

		if (req.checkedAnswer.toUpperCase() == rightAnswer.prawidlowa.toUpperCase()) {
			return socket.emit('answer', { correct: true });
		}
		else {
			return socket.emit('answer', { correct: false, good_answer: rightAnswer.prawidlowa });
		}
	});

	socket.on('half', (req) => {
		if (!req.id_pytania) return socket.emit('answer', { error: true, message: 'Nie przesłano wszystkich wymaganych danych.' });

		const rightAnswer = db.prepare('SELECT prawidlowa FROM odpowiedzi WHERE id_pytania = ?').get(req.id_pytania);

		// discard good answaer and one random
		let answerArray = ['A', 'B', 'C', 'D'].filter(x => x != rightAnswer.prawidlowa);
		const randomItem = answerArray[Math.floor(Math.random() * 3)];
		answerArray = answerArray.filter(x => x != randomItem);

		socket.emit('half', { toDiscard: answerArray });
	});

	socket.on('phone', (req) => {
		if (!req.id_pytania) return socket.emit('answer', { error: true, message: 'Nie przesłano wszystkich wymaganych danych.' });

		const rightAnswer = db.prepare('SELECT prawidlowa FROM odpowiedzi WHERE id_pytania = ?').get(req.id_pytania);

		let answerArray = ['A', 'B', 'C', 'D'].filter(x => x != rightAnswer.prawidlowa);

		const procent = Math.floor(Math.random() * 100);
		let index;
		// prawdopodobieństwo
		// 10% - brak odpowiedzi
		// 20% - 50/50
		if (procent <= 10) {
			index = 0;
		}
		else if (procent <= 30) {
			index = 6;
		}
		else {
			index = Math.floor(Math.random() * 5) + 1;
		}

		const randomItem = answerArray[Math.floor(Math.random() * 3)];
		answerArray = answerArray.filter(x => x != randomItem);

		const friendAnswers = ['Niestety nie znam odpowiedzi na to pytanie.', `Myślę że prawidłowa odpowiedz to ${rightAnswer.prawidlowa}.`, `Obstawiałbym ${['A', 'B', 'C', 'D'].filter(x => !answerArray.includes(x)).join(' lub ')}.`, `To na pewno odpowiedź ${rightAnswer.prawidlowa}`, `Na pewno odrzuciłbym odpowiedzi ${answerArray.join(' i ')}`, `Odpowiedz ${rightAnswer.prawidlowa}. Na 100%`, `Strzelam, że to odpowiedź ${['A', 'B', 'C', 'D'].filter(x => !answerArray.includes(x))[0]}. Ale nie jestem pewny.`];

		socket.emit('phone', { message: friendAnswers[index] });
	});

});

// share files from a public directory
app.use(express.static('public'));

// using bodyparser for parse json form post requests
app.use(bodyParser.json());

// json format
app.set('json spaces', 4);

// API endpoints
app.get('/api/question/:number', (req, res) => {

	const number = parseInt(req.params.number);
	if (!number) return res.json({ error: true, message: 'Podany parametr nie jest liczbą!' });

	const question = db.prepare('SELECT * FROM pytania WHERE id_pytania = ?').get(number);
	if (!question) return res.json({ error: true, message: 'Nie znaleziono pytania o podanym numerze w bazie!' });

	res.json(question);
});

app.get('/api/answers/:number', (req, res) => {

	const number = parseInt(req.params.number);
	if (!number) return res.json({ error: true, message: 'Podany parametr nie jest liczbą!' });

	const answers = db.prepare('SELECT id_pytania, odpowiedz_a, odpowiedz_b, odpowiedz_c, odpowiedz_d FROM odpowiedzi WHERE id_pytania = ?').get(number);
	if (!answers) return res.json({ error: true, message: 'Nie znaleziono pytania o podanym numerze w bazie!' });

	res.json(answers);
});

app.get('/api/randomQuestion', (req, res) => {
	const questionsCount = db.prepare('SELECT COUNT(*) FROM pytania').get();
	const randomQuestionId = Math.floor(Math.random() * (questionsCount['COUNT(*)'] - 1) + 1);

	const question = db.prepare('SELECT * FROM pytania WHERE id_pytania = ?').get(randomQuestionId);
	if (!question) return res.json({ error: true, message: 'Nie znaleziono pytania w bazie!' });

	res.json(question);
});

// @accept: JSON with 'checked' und 'id' values
app.post('/checkAnswer', (req, res) => {
	if (!req.body.checked || !req.body.id) return res.json({ error: true, message: 'Błędne zapytanie.' });

	const number = parseInt(req.body.id);
	if (!number) return res.json({ error: true, message: 'Podany parametr nie jest liczbą!' });

	const answer = db.prepare('SELECT prawidlowa FROM odpowiedzi WHERE id_pytania = ?').get(number);
	if (!answer) return res.json({ error: true, message: 'Nie znaleziono pytania o podanym numerze w bazie!' });

	if (answer.prawidlowa.toUpperCase() == req.body.checked.toUpperCase()) return res.json({ dobra_odpowiedz: true });

	res.json({ dobra_odpowiedz: false });
});

// set up mDNS
const ip = require('ip');
const mdns = require('multicast-dns')(
	{
		multicast: true, // use udp multicasting
		interface: ip.address(), // explicitly specify a network interface. defaults to all
		port: 5353, // set the udp port
		ip: '224.0.0.251', // set the udp ip
		ttl: 255, // set the multicast ttl
		loopback: true, // receive your own packets
		reuseAddr: true, // set the reuseAddr option when creating the socket (requires node >=0.11.13)
	},
);

mdns.on('query', function(query) {
	if (query.questions[0].name != hostname) return;
	mdns.respond({
		answers: [{
			name: hostname,
			type: 'A',
			data: ip.address(),
		}],
	});
});

// http listening
httpServer.listen(port, hostname, () => {
	console.log(`Serwer został uruchomiony! - http://${hostname}:${port}`);
});