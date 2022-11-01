import { socket } from './game.js';
import { playLow, wrongAnswer, correctAnswer, playMid, playHigh, play75k, play500k, play1m, final_answer, phonefriend } from './sounds.js';

let currentID, help, nextStep;
let availableHelp = ['half', 'phone', 'public'];
let step = 1;
let currentAudio = playLow;

function putQuestionDataIntoHTML(pytanie, odpa, odpb, odpc, odpd, zalacznik) {
	if (!pytanie || !odpa || !odpb || !odpc || !odpd) return console.error('Nie podano wystarczającej liczby danych!');

	const q = document.getElementById('question');
	const a = document.getElementById('odpa');
	const b = document.getElementById('odpb');
	const c = document.getElementById('odpc');
	const d = document.getElementById('odpd');
	const o = document.getElementById('zalacznik');

	q.innerText = pytanie;
	a.innerText = odpa;
	b.innerText = odpb;
	c.innerText = odpc;
	d.innerText = odpd;

	if (zalacznik) {
		o.attributes.src.textContent = zalacznik;
		o.classList.remove('hide');
	}
}

export function loadQuestion() {
	socket.emit('question');
	socket.once('question', (res) => {
		if (res.error) return console.error(`Błąd serwera! (${res.message})`);
		putQuestionDataIntoHTML(res.tresc, res.odpowiedz_a, res.odpowiedz_b, res.odpowiedz_c, res.odpowiedz_d, res.zalacznik);
		currentID = res.id_pytania;
		help = true;
		nextStep = false;
		play(currentAudio);
		console.log('Pytanie zostało pobrane z bazy danych!');
	});
}

export function checkAnswer(answerObjectHTML) {
	if (currentID == null) return;
	help = false;
	const checkedAnswer = answerObjectHTML.id.replace('odp', '');
	socket.emit('answer', { checkedAnswer: checkedAnswer, questionId: currentID });
	socket.once('answer', (res) => {
		currentID = null;
		if (res.correct == true) {
			// next question
			stop(currentAudio);
			if (step == 12) {
				play(final_answer);
				setTimeout(() => {
					answerObjectHTML.classList.add('green');
					stop(final_answer);
					play(correctAnswer);
				}, 5000);
				return setTimeout(() => {
					document.getElementById('lets-play').classList.remove('hide');
					document.getElementById('lets-play-text').innerHTML = 'GRATULACJE! 👑<br> WYGRAŁEŚ: 1 000 000 💵';
				}, 7000);
			}
			correctAnswer.play();
			answerObjectHTML.classList.add('green');
			nextStep = true;
			document.getElementById('next-question').classList.remove('hide');
		}
		else {
			answerObjectHTML.classList.add('red');
			document.getElementById(`odp${res.good_answer.toLowerCase()}`).classList.add('green');
			stop(currentAudio);
			play(wrongAnswer);
			gameOver();
		}
	});
}

export function nextQuestion() {
	if (nextStep != true) return alert('Nie możesz przejść do następnego pytania.');
	document.getElementById('next-question').classList.add('hide');
	step++;
	loadNextStep();
	loadQuestion();
}

function loadNextStep() {
	stop(correctAnswer);
	// remove green light
	if (document.getElementsByClassName('green').length > 0) {
		Array.prototype.slice.call(document.getElementsByClassName('green')).forEach(x => {
			x.classList.remove('green');
		});
	}

	if (!availableHelp.includes('half')) {
		Array.prototype.slice.call(document.getElementsByClassName('answear hide')).forEach(x => {
			x.classList.remove('hide');
		});
	}

	if (!document.getElementById('zalacznik').classList.contains('hide')) {
	// removing image
		document.getElementById('zalacznik').attributes.src.textContent = '';
		document.getElementById('zalacznik').classList.add('hide');
	}

	const audios = ['', playLow, playLow, playMid, playMid, playMid, playMid, playMid, play75k, playHigh, playHigh, play500k, play1m];
	currentAudio = audios[step];

	document.getElementById('steps').children[document.getElementById('steps').childElementCount - step + 1].classList.remove('check');
	document.getElementById('steps').children[document.getElementById('steps').childElementCount - step].classList.add('check');
}

export function getHelp(type) {
	if (help == false || !type) return;

	if (type == 'phone') {
		if (!availableHelp.includes('phone')) return;
		document.getElementById('lets-play').classList.remove('hide');
		document.getElementById('lets-play-text').innerHTML = '<button id="expert">NIE MAM PRZYJACIELA 😥 (PRZYJACIEL ROBOT)</button> <button id="friend">CHWYTAM ZA TELEFON I DZWONIĘ ☎️</button>';

		// expert
		document.getElementById('expert').onclick = () => {
			socket.emit('phone', { id_pytania: currentID });
			socket.once('phone', (res) => {
				if (res.error) return console.error(`Błąd serwera! (${res.message})`);
				document.getElementById('lets-play-text').innerHTML = res.message.toString();
				document.getElementById('lets-play').onclick = () => {
					confirm('Na pewno chcesz zamknąć podpowiedź?') == true ? document.getElementById('lets-play').classList.add('hide') : '';
					document.getElementById('lets-play').onclick = null;
				};
			});
		};

		// friend
		document.getElementById('friend').onclick = () => {
			stop(currentAudio);
			document.getElementById('lets-play-text').innerHTML = 'ZA CHWILĘ OTRZYMASZ MOŻLIWOŚĆ POPROSZENIA PRZYJACIELA O POMOC. <br> MASZ NA TO 30 SEKUND. <br> ZARAZ ROZPOCZNIE SIĘ ODLICZANIE.';
			phonefriend.play();
			setTimeout(() => {
				let sec = 30;
				const interval = setInterval(() => {
					if (sec >= 0) {
						document.getElementById('lets-play').ondblclick = () => {
							document.getElementById('lets-play').classList.add('hide');
							clearInterval(interval); stop(phonefriend);
							document.getElementById('lets-play').ondblclick = null;
						};
						document.getElementById('lets-play-text').innerHTML = sec;
						if (!document.getElementById('lets-play').classList.contains('phone-friend')) document.getElementById('lets-play').classList.add('phone-friend');
						sec--;
					}
					else {
						document.getElementById('lets-play-text').innerHTML = 'KONIEC CZASU';
						setTimeout(() => {
							document.getElementById('lets-play').classList.add('hide');
							stop(phonefriend);
							document.getElementById('lets-play').classList.remove('phone-friend');
						}, 1500);
						clearInterval(interval);
					}
				}, 1000);
			}, 11000);
		};

		availableHelp = availableHelp.filter(x => x != 'phone');
		document.getElementById('phone').classList.add('disabled');
	}
	else if (type == 'half') {
		if (!availableHelp.includes('half')) return;
		socket.emit('half', { id_pytania: currentID });
		socket.once('half', (res) => {
			if (res.error) return console.error(`Błąd serwera! (${res.message})`);
			for (let i = 0; i < res.toDiscard.length; i++) {
				document.getElementById(`odp${res.toDiscard[i].toLowerCase()}`).classList.add('hide');
			}
			availableHelp = availableHelp.filter(x => x != 'half');
			document.getElementById('half').classList.add('disabled');
			console.log('Odrzucono dwie niepoprawne odpowiedzi.');
		});
	}
	else if (type == 'public') {
		if (!availableHelp.includes('public')) return;

		loadQuestion();

		document.getElementById('voting').classList.add('disabled');
		availableHelp = availableHelp.filter(x => x != 'public');
	}
	else {
		console.error('Podano nieprawidłowy typ koła ratunkowego!');
	}
}

function gameOver() {
	setTimeout(() => {
		document.getElementById('lets-play').classList.remove('hide');
		document.getElementById('lets-play-text').innerHTML = 'KONIEC GRY 😔<br><button onclick="window.location.reload();">ZAGRAJ PONOWNIE</button>';
	}, 3000);
}

function clockRefresh(s) {
	const timer = document.getElementById('timer');
	timer.innerHTML = s;
}

// eslint-disable-next-line no-unused-vars
function clockStart(sec, koniec_czasu) {
	const interval = setInterval(() => {
		if (sec >= 0) {
			clockRefresh(sec < 10 ? '0' + sec : sec);
			sec--;
		}
		else {
			clearInterval(interval);
			koniec_czasu();
		}
	}, 1000);
}

function play(audio) {
	audio.play();
}

function stop(audio) {
	audio.pause();
	audio.currentTime = 0;
}