const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'bar-time-trivia-v2',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

