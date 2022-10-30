let overlay = document.getElementById('overlay');
let gameRules = document.getElementById('game-rules');

// import sounds
import { start, letsPlay, playLow } from "./sounds.js";

// import functions
import { loadQuestion, checkAnswer, getHelp, nextQuestion } from './functions.js';

// setup socket connection
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
export const socket = io();

socket.on("connect", () => {
  console.log('Połączono z serwerem!');
});

socket.on("disconnect", () => {
  if (!socket.connected)
    console.log('Rozłączono z serwerem!')
    alert('Rozłączono z serwerem!');
});

// wait for interraction
overlay.addEventListener('click', () => {
  let logo = document.getElementById('sLogo');
  let textLogo = document.getElementById('text-logo');

  start.play();

  overlay.classList.add('hide');

  // load intro animations
  setTimeout(() => {
	  logo.classList.remove('hide')
	  textLogo.classList.remove('hide');
	  logo.classList.add('scale-up-center');
	  textLogo.classList.add('tracking-in-contract-bck');
  }, 150)
});

// starting game
gameRules.addEventListener('click', () => {
  let letsPlayOverlay = document.getElementById('lets-play');
  let letsPlayText = document.getElementById('lets-play-text');

  start.pause();
  letsPlay.play();

  gameRules.classList.add('hide');

  setTimeout(() => {
	  letsPlayOverlay.classList.add('hide');
    loadQuestion();
  }, 3000)
});

const a = document.getElementById('odpa');
const b = document.getElementById('odpb');
const c = document.getElementById('odpc');
const d = document.getElementById('odpd');
const v = document.getElementById('voting');
const h = document.getElementById('half');
const p = document.getElementById('phone');
const next = document.getElementById('next-question');


a.addEventListener('click', () => { checkAnswer(a) });
b.addEventListener('click', () => { checkAnswer(b) });
c.addEventListener('click', () => { checkAnswer(c) });
d.addEventListener('click', () => { checkAnswer(d) });

v.addEventListener('click', () => { getHelp('public') });
h.addEventListener('click', () => { getHelp('half') });
p.addEventListener('click', () => { getHelp('phone') });
next.addEventListener('click', () => {  nextQuestion() });