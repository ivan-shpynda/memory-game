'use strict';
import anime from './animejs/lib/anime.es.js';

const startBtn = document.querySelector('.start-btn');
const settingSection = document.querySelector('.game-settings');
const gameFieldWrapper = document.querySelector('.game-field-wrapper');
const timeIndicator = document.querySelector('.game-timer');
const cardsWrapper = document.querySelector('.cards-wrapper');
const replayBtn = document.querySelector('.replay-btn');

startBtn.addEventListener('click', initializeGame);
replayBtn.addEventListener('click', replayGame);

function initializeGame() {
  const gameParameters = {
    columns: document.getElementById('columns').value,
    rows: document.getElementById('rows').value,
    width: document.getElementById('width').value,
    height: document.getElementById('height').value,
    timeLimit: document.getElementById('time-limit').value,
    color: document.getElementById('theme').value,
  };

  const game = new MatchGrid(gameParameters);
  game.startGame();
}

function replayGame() {
  settingSection.style.display = 'block';
  gameFieldWrapper.style.display = 'none';
  cardsWrapper.textContent = '';
  timeIndicator.style.color = 'inherit';
  replayBtn.style.display = 'none';
};

class MatchGrid {
  constructor({columns, rows, width, height, timeLimit, color}) {
    this.columns = columns;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.timeLimit = timeLimit;
    this.color = color;
    this.values = MatchGrid.generateCardValues(columns * rows);
    this.chosenCardsIds = [];
    this.chosenCardsValues = [];
    this.uniqueValuesNumber = this.values.length / 2;
    this.counter = 0;
    this.timer = null;
    this.boundFlipCard = this.flipCard.bind(this);
  }

  startGame() {
    settingSection.style.display = 'none';
    gameFieldWrapper.style.display = 'block';
    const cardsContainer = this.createCards();

    cardsContainer.childNodes.forEach((card) => {
      card.addEventListener('click', this.boundFlipCard);
    });

    cardsWrapper.appendChild(cardsContainer);

    anime({
      targets: '.game-card',
      translateY: -60,
      delay: anime.stagger(100, {from: 'center'}),
      direction: 'reverse',
    });

    this.timer = this.setTimer();
    cardsContainer.addEventListener('mouseleave', this.timer.pause.bind(this));
    cardsContainer.addEventListener('mouseenter', this.timer.resume.bind(this));
  }

  createCards() {
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('game-cards');
    cardsContainer.style.width = `${this.width}px`;
    cardsContainer.style.height = `${this.height}px`;

    this.values.forEach((value, i) => {
      const card = document.createElement('div');
      card.setAttribute('data-id', i);
      card.setAttribute('data-value', value);
      card.classList.add('game-card', this.color);
      card.style.width = `${+this.width / +this.columns}px`;
      card.style.height = `${+this.height / + +this.rows}px`; 
      cardsContainer.appendChild(card);
    });

    return cardsContainer;
  }

  flipCard(e) {
    const flippedCard = e.target;
    const id = flippedCard.getAttribute('data-id');
    const value = flippedCard.getAttribute('data-value');
    flippedCard.textContent = value;

    this.chosenCardsIds.push(id);
    this.chosenCardsValues.push(value);
    if (this.chosenCardsIds.length === 2) {
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const cards = document.querySelectorAll('.game-card')
    const firstSelected = this.chosenCardsIds[0];
    const secondSelected = this.chosenCardsIds[1];

    if (firstSelected === secondSelected) {
      cards[firstSelected].textContent = '';
    } else if (this.chosenCardsValues[0] === this.chosenCardsValues[1]) {
      cards[firstSelected].removeEventListener('click', this.boundFlipCard);
      cards[secondSelected].removeEventListener('click', this.boundFlipCard);

      setTimeout(() => {
        cards[firstSelected].textContent = '';
        cards[secondSelected].textContent = '';
        cards[firstSelected].style.backgroundColor = '#fefefe';
        cards[secondSelected].style.backgroundColor = '#fefefe';
        this.counter++;
        if (this.counter === this.uniqueValuesNumber) this.gameWon();
      }, 500);

    } else {
      setTimeout(() => {
        cards[firstSelected].textContent = '';
        cards[secondSelected].textContent = '';
      }, 500);
    }

      this.chosenCardsIds.splice(0, 2);
      this.chosenCardsValues.splice(0, 2);
  }

  setTimer() {
    let time = +this.timeLimit;
    let paused = true;

    const timerCountDown = setInterval(() => {
      timeIndicator.textContent = `🕓 Timer: ${time} sec`;
      if (!paused) time--;
      if (time < 1) {
        clearInterval(timerCountDown);
        timeIndicator.textContent = '🔴 Time Limit Exceeded';
        replayBtn.style.display = 'block';
        const cards = document.querySelectorAll('.game-card');
        console.log(cards);
        cards.forEach(card => {
          card.textContent = '';
          card.removeEventListener('click', this.boundFlipCard);
        })
      }
    }, 1000);

    const resume = () => paused = false;
    const pause = () => paused  = true;
    const stop = () => clearInterval(timerCountDown);
  
    return {
      pause,
      resume,
      stop
    };
  }

  gameWon() {
  this.timer.stop();
  replayBtn.style.display = 'block';
  timeIndicator.textContent = 'You have found all matches! 🥳';
  }

  static generateCardValues(len) {
    const values = [];

    while (values.length < (len / 2)) {
      const value = Math.floor(Math.random() * len) + 1;
      if (values.indexOf(value) === -1) values.push(value);
    }

    values.push(...values);
    values.sort(() => 0.5 - Math.random());

    return values;
  }
}
