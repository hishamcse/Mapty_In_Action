'use strict';

/* --------------------- Helper classes and elements  ---------------------*/

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// classes
class Workout {
  coords;
  date;
  id;

  constructor(coords, address, distance, duration) {
    this.coords = coords;      // [lat,lng]
    this.address = address;
    this.distance = distance;   // km
    this.duration = duration;   //min
    this.date = this._setDate();
    this.id = Date.now().toString();
  }

  _setDescription() {
    const symbol = (this.type === 'running') ? `🏃‍♂` : `🚴‍♀`;
    this.description = `${symbol} ${this.type[0].toUpperCase() + this.type.slice(1)} on ${this.date}`;
  }

  _setDate() {
    return months[new Date().getMonth()] + ' ' + new Date().getDate();
  }

  getDescription() {
    return this.description;
  }

  getAddress() {
    return this.address.locality;
  }

  get id() {
    return this.id;
  }

  get coords() {
    return this.coords;
  }
}

class Runner extends Workout {
  type = 'running';

  constructor(coords, address, distance, duration, cadence) {
    super(coords, address, distance, duration);
    this.cadence = cadence;
    this._setDescription();
    this._calcPace();
  }

  _calcPace() {
    this.pace = (this.duration / this.distance).toFixed(2);
  }

  getPace() {
    return this.pace;
  }
}

class Cyclist extends Workout {
  type = 'cycling';

  constructor(coords, address, distance, duration, elevation_gain) {
    super(coords, address, distance, duration);
    this.elevation_gain = elevation_gain;
    this._setDescription();
    this._calcSpeed();
  }

  _calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(2);
  }

  getSpeed() {
    return this.speed;
  }
}

// Elements
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const btnContainer = document.querySelector('.btn__container');
const sortByDist = document.querySelector('.sortByDist');
const sortByDuration = document.querySelector('.sortByDuration');
const deleteAll = document.querySelector('.deleteAll');

const spinner = document.querySelector('.spinner__loading');
const modal_spinner = document.querySelector('.spinner-modal');
const retrieve = document.querySelector('.retrieve');

const weatherImg = document.querySelector('.weather__img');
const weatherState = document.querySelector('.state');
const temperature = document.querySelector('.temp');
const humidity = document.querySelector('.humidity');
const windSpeed = document.querySelector('.wind__speed');
const airPressure = document.querySelector('.pressure');
const area = document.querySelector('.area');
const country = document.querySelector('.country');