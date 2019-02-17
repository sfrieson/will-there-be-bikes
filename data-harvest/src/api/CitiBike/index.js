const defaultOptions = {
  get: require('../../util/get')()
};

module.exports = function (overrideOptions) {
  const { get } = Object.assign({}, defaultOptions, overrideOptions);

  return {
    getStationStatus: () => get('https://gbfs.citibikenyc.com/gbfs/en/station_status.json'),
    getStationList: () => get('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
  };
};
