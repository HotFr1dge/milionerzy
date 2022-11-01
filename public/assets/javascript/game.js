const overlay = document.getElementById('overlay');
const gameRules = document.getElementById('game-rules');

// import sounds
import { start, letsPlay } from './sounds.js';

// import functions
import { loadQuestion, checkAnswer, getHelp, nextQuestion } from './functions.js';

// setup socket connection
import '/socket.io/socket.io.min.js';
// eslint-disable-next-line no-undef
export const socket = io();

socket.on('connect', () => {
	console.log('Połączono z serwerem!');
});

socket.on('disconnect', () => {
	if (!socket.connected) {
		console.log('Rozłączono z serwerem!');
		alert('Rozłączono z serwerem!');
	}
});

// wait for interraction
overlay.addEventListener('click', () => {
	const logo = document.getElementById('sLogo');
	const textLogo = document.getElementById('text-logo');

	start.play();

	overlay.classList.add('hide');

	// load intro animations
	setTimeout(() => {
		logo.classList.remove('hide');
		textLogo.classList.remove('hide');
		logo.classList.add('scale-up-center');
		textLogo.classList.add('tracking-in-contract-bck');
	}, 150);
});

// starting game
gameRules.addEventListener('click', () => {
	const letsPlayOverlay = document.getElementById('lets-play');

	start.pause();
	letsPlay.play();

	gameRules.classList.add('hide');

	setTimeout(() => {
		letsPlayOverlay.classList.add('hide');
		loadQuestion();
	}, 3000);
});

const a = document.getElementById('odpa');
const b = document.getElementById('odpb');
const c = document.getElementById('odpc');
const d = document.getElementById('odpd');
const v = document.getElementById('voting');
const h = document.getElementById('half');
const p = document.getElementById('phone');
const next = document.getElementById('next-question');


a.addEventListener('click', () => { checkAnswer(a); });
b.addEventListener('click', () => { checkAnswer(b); });
c.addEventListener('click', () => { checkAnswer(c); });
d.addEventListener('click', () => { checkAnswer(d); });

v.addEventListener('click', () => { getHelp('public'); });
h.addEventListener('click', () => { getHelp('half'); });
p.addEventListener('click', () => { getHelp('phone'); });
next.addEventListener('click', () => { nextQuestion(); });