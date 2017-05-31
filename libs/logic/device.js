'use strict'

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');

var Device = require(libs + 'model/device');

module.exports = {
  getByUserId: function(userId, callback) {
    Device.find().where('userId').equals(userId).exec(callback);
  },
  getByDeviceId: function(deviceId, callback) {
    Device.find().where('deviceId').equals(deviceId).exec(callback);
  },
}
