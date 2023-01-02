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

/**
 * Class to generate activity field
 */
class MatchGrid {
  constructor({columns, rows, width, height, timeLimit, color}) {
    this.columns = columns;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.timeLimit = timeLimit;
    this.color = color;
    this.values = MatchGrid.generateCardValues(columns * rows);
  }

  // Method to create cards
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

  // method to create values for cards
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

/**
 * Function to initialize a game
 */
function initializeGame() {
  const gameParameters = {
    columns: document.getElementById('columns').value,
    rows: document.getElementById('rows').value,
    width: document.getElementById('width').value,
    height: document.getElementById('height').value,
    timeLimit: document.getElementById('time-limit').value,
    color: document.getElementById('theme').value,
  };

  settingSection.style.display = 'none';
  gameFieldWrapper.style.display = 'block';

  const gameField = new MatchGrid(gameParameters);
  const cardsContainer = gameField.createCards();
  const uniqueValuesNumber = gameField.values.length / 2;
  let counter = 0;

  // add event to each card
  cardsContainer.childNodes.forEach((card) => {
    card.addEventListener('click', flipCard);
  });

  // put cards container into dom
  cardsWrapper.appendChild(cardsContainer);

  // animation for the cards
  anime({
    targets: '.game-card',
    translateY: -60,
    delay: anime.stagger(100, {from: 'center'}),
    direction: 'reverse',
  });

  // setting timer for the game
  const timer = setTimer();
  cardsContainer.addEventListener('mouseleave', timer.pause);
  cardsContainer.addEventListener('mouseenter', timer.resume);

  // ids and values of selected cards
  const chosenCardsIds = [];
  const chosenCardsValues = [];

  // function to handle card selection
  function flipCard(e) {
    const flippedCard = e.target;
    const id = flippedCard.getAttribute('data-id');
    const value = flippedCard.getAttribute('data-value');
    flippedCard.textContent = value;

    chosenCardsIds.push(id);
    chosenCardsValues.push(value);
    if (chosenCardsIds.length === 2) {
      checkForMatch();
    }
  };

  // timer function
  function setTimer() {
    let time = +gameParameters.timeLimit;
    let paused = true;

    const timerCountDown = setInterval(() => {
      timeIndicator.textContent = `🕓 Timer: ${time} sec`;
      if (!paused) time--;
      if (time < 1) {
        clearInterval(timerCountDown);
        timeIndicator.textContent = '🔴 Time Limit Exceeded';
        replayBtn.style.display = 'block';
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
          card.textContent = '';
          card.removeEventListener('click', flipCard);
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

  // function to check for match
  function checkForMatch() {
    const cards = document.querySelectorAll('.game-card')
    const firstSelected = chosenCardsIds[0];
    const secondSelected = chosenCardsIds[1];

    if (firstSelected === secondSelected) {
      cards[firstSelected].textContent = '';
    } else if (chosenCardsValues[0] === chosenCardsValues[1]) {
      cards[firstSelected].removeEventListener('click', flipCard);
      cards[secondSelected].removeEventListener('click', flipCard);

      setTimeout(() => {
        cards[firstSelected].textContent = '';
        cards[secondSelected].textContent = '';
        cards[firstSelected].style.backgroundColor = '#fefefe';
        cards[secondSelected].style.backgroundColor = '#fefefe';
        counter++;
        if (counter === uniqueValuesNumber) gameWon();
      }, 500);

    } else {
      setTimeout(() => {
        cards[firstSelected].textContent = '';
        cards[secondSelected].textContent = '';
      }, 500);
    }

      chosenCardsIds.splice(0, 2);
      chosenCardsValues.splice(0, 2);
  };

  // function to run if all matches are found
  function gameWon() {
    timer.stop();
    replayBtn.style.display = 'block';
    timeIndicator.textContent = 'You have found all matches! 🥳';
  }
}

/**
 * Function to replay the game
 */
function replayGame() {
  settingSection.style.display = 'block';
  gameFieldWrapper.style.display = 'none';
  cardsWrapper.textContent = '';
  timeIndicator.style.color = 'inherit';
  replayBtn.style.display = 'none';
};
