const get = require('../../util/get')();
const endpoint = 'https://api.openweathermap.org/data/2.5/weather';

module.exports = class OpenWeatherMap {
  constructor (options) {
    this.endpoint = endpoint + `?appid=${options.key}`;
  }

  get (coordinates) {
    return get(this.endpoint + `&lat=${coordinates.lat}&lon=${coordinates.lon}`);
  }
};
