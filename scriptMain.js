'use strict';

/* --------------------- Main Script  ---------------------*/

// application class
class App {
  #map;
  #mapEventCoords;
  #zoomLevel = 13;
  #workout_list = [];

  constructor() {
    this._getPosition();                      // local position
    this._getLocalStorage();                  // getting saved storage

    form.addEventListener('submit', this._formSubmission.bind(this));                // form submission
    inputType.addEventListener('change', this._toggleField);                          // changing field based on type
    containerWorkouts.addEventListener('click', this._moveMarker.bind(this));       // marker on map
    containerWorkouts.addEventListener('click', this._editWorkout.bind(this));      // edit a workout
    containerWorkouts.addEventListener('click', this._removeWorkout.bind(this));    // delete a workout
    btnContainer.addEventListener('click', this._sortByDistance.bind(this));          // sort by distance
    btnContainer.addEventListener('click', this._sortByDuration.bind(this));          // sort by duration
    deleteAll.addEventListener('click', this.reset);                                // delete All
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._renderMap.bind(this), () => {
        alert(`Can't find your location`);
      });
    }
  }

  _renderMap(position) {
    const { latitude } = position.coords;       // or, const latitude = position.coords.latitude;
    const { longitude } = position.coords;      // or, const longitude = position.coords.longitude;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    // #map event listener
    this.#map.on('click', this._renderForm.bind(this));

    // we should add it here because we need the map to be loaded before we add marker on it using localstorage.
    // that's why, we can't put this line of code in the _getLocalStorage() method
    this.#workout_list.forEach(workout => this._renderWorkoutMarker(workout));
  }

  _renderForm(mapEv) {
    this.#mapEventCoords = [mapEv.latlng.lat, mapEv.latlng.lng];
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _check_validation() {
    this.type = inputType.value;
    this.dist = +inputDistance.value;
    this.duration = +inputDuration.value;
    this.stepOrGain = +(this.type === 'running' ? inputCadence.value : inputElevation.value);
    const inputs = [this.dist, this.duration, this.stepOrGain];
    if (inputs.some(inp => !Number.isFinite(inp))) return false;
    return inputs.every(inp => inp > 0);
  };

  _formSubmission(event) {
    event.preventDefault();

    if (!this._check_validation()) {
      new bootstrap.Modal(document.querySelector('.modal')).show();
      return;
    }

    const workout = this.type === 'running' ?
      new Runner(this.#mapEventCoords, this.dist, this.duration, this.stepOrGain) :
      new Cyclist(this.#mapEventCoords, this.dist, this.duration, this.stepOrGain);
    this.#workout_list.push(workout);

    this._renderWorkoutMarker(workout);
    this._updateWorkoutList(workout);
    this._hideForm();
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords).addTo(this.#map)
      .bindPopup(L.popup(
        {
          maxWidth: 350,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        }))
      .setPopupContent(workout.getDescription())
      .openPopup();
  }

  _updateWorkoutList(workout) {
    let htmlContent = `
   <li class='workout workout--${workout.type}' data-id='${workout.id}'>
      <h2 class='workout__title'>${workout.getDescription()}
            <p>
              <button type='button' class='btn btn-dark editBtn'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-pencil-square' viewBox='0 0 16 16'>
              <path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>
              <path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z'/>
            </svg>
              </button>&nbsp;&nbsp;
              <button type='button' class='btn btn-dark deleteBtn'>
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-archive-fill' viewBox='0 0 16 16'>
              <path d='M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z'/>
            </svg>
              </button>
            </p>
      </h2>
      <div class='workout__details'>
        <span class='workout__icon'>${workout.type === 'running' ? `🏃‍♂` : `🚴‍♀`}️</span>
        <span class='workout__value'>${workout.distance}</span>
        <span class='workout__unit'>km</span>
      </div>
      <div class='workout__details'>
        <span class='workout__icon'>⏱</span>
        <span class='workout__value'>${workout.duration}</span>
        <span class='workout__unit'>min</span>
      </div>`;

    if (workout.type === 'running') {
      htmlContent +=
        `<div class='workout__details'>
        <span class='workout__icon'>⚡</span>
        <span class='workout__value'>${workout.getPace()}</span>
        <span class='workout__unit'>min/km</span>
      </div>
      <div class='workout__details'>
        <span class='workout__icon'>🦶️</span>
        <span class='workout__value'>${workout.cadence}</span>
        <span class='workout__unit'>spm</span>
      </div>
    </li>`;
    } else {
      htmlContent += `
      <div class='workout__details'>
        <span class='workout__icon'>⚡</span>
        <span class='workout__value'>${workout.getSpeed()}</span>
        <span class='workout__unit'>km/h</span>
      </div>
      <div class='workout__details'>
        <span class='workout__icon'>⛰</span>
        <span class='workout__value'>${workout.elevation_gain}</span>
        <span class='workout__unit'>m</span>
      </div>
    </li>`;
    }

    form.insertAdjacentHTML('afterend', htmlContent);
  };

  _workOutFinder(event) {
    const clicked = event.target.closest('.workout');
    if (!clicked) return;
    return this.#workout_list.find(workout => workout.id === clicked.dataset.id);
  }

  _moveMarker(event) {                                  // move the marker based on click
    if (!this.#map) return;

    const clicked_Workout = this._workOutFinder(event);
    if (!clicked_Workout) return;

    this.#map.setView(clicked_Workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    });
  }

  _detectEditFormType(type) {                   // detecting edit form type
    if (type === 'running') {
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
    } else {
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputElevation.closest('.form__row').classList.remove('form__row--hidden');
    }
  }

  _renderEditForm(workout) {                    // rendering edit form
    this.#mapEventCoords = workout.coords;      // as we have to render updated marker again. so, specifying coords again
    form.classList.remove('hidden');
    this._detectEditFormType(workout.type);

    inputType.value = workout.type;
    inputDistance.value = workout.distance;
    inputDuration.value = workout.duration;
    workout.type === 'running' ? inputCadence.value = workout.cadence : inputElevation.value = workout.elevation_gain;
  }

  _editWorkout(event) {
    const editBtn = event.target.closest('.editBtn');
    if (!editBtn) return;

    const clicked_Workout = this._workOutFinder(event);
    if (!clicked_Workout) return;

    event.target.closest('.workout').remove();
    this.#workout_list = this.#workout_list.filter(workout => workout.id !== clicked_Workout.id);
    this._renderEditForm(clicked_Workout);
  }

  _removeWorkout(event) {
    const closeBtn = event.target.closest('.deleteBtn');
    if (!closeBtn) return;

    const clicked_Workout = this._workOutFinder(event);
    if (!clicked_Workout) return;

    this.#workout_list = this.#workout_list.filter(workout => workout.id !== clicked_Workout.id);
    this._setLocalStorage();
    location.reload();
  }

  _sortByDistance(event) {
    const sortDist = event.target.closest('.sortByDist');
    if (!sortDist) return;

    this.#workout_list = this.#workout_list.slice().sort((a, b) => a.distance - b.distance);
    document.querySelectorAll('.workout').forEach(e => e.remove());
    this.#workout_list.forEach(workout => this._updateWorkoutList(workout));
  }

  _sortByDuration(event) {
    const sortDuration = event.target.closest('.sortByDuration');
    if (!sortDuration) return;

    this.#workout_list = this.#workout_list.slice().sort((a, b) => a.duration - b.duration);
    document.querySelectorAll('.workout').forEach(e => e.remove());
    this.#workout_list.forEach(workout => this._updateWorkoutList(workout));
  }

  _showButtons() {
    if (this.#workout_list.length !== 0) {
      deleteAll.classList.remove('btn__hidden');
      sortByDist.classList.remove('btn__hidden');
      sortByDuration.classList.remove('btn__hidden');
    }
  }

  _setLocalStorage() {
    this._showButtons();
    localStorage.setItem('workouts', JSON.stringify(this.#workout_list));
  }

  // drawback: we will not find our original prototype chain. we will find the recovered objects as like a normal 'Object'
  //           which simply not a runner or cyclist or workout object. that's why we will loss all methods, all kinds of
  //           private variables that were declared in the original object. So I have added a solution to this problem here
  _getLocalStorage() {
    const allWorkouts = JSON.parse(localStorage.getItem('workouts'));
    if (!allWorkouts) return;

    this.#workout_list = allWorkouts;
    this._showButtons();

    this.#workout_list.forEach(workout => {
      workout.type === 'running' ?
        Object.setPrototypeOf(workout, Runner.prototype) :
        Object.setPrototypeOf(workout, Cyclist.prototype);

      this._updateWorkoutList(workout);
    });
  }

  reset() {
    if (deleteAll.classList.contains('btn__hidden')) return;
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
// app.reset();                        // all reset and cleaning local storage