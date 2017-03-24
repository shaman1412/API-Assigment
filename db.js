var mongojs = require('mongojs');
var database = 'toDolist';
var collections = ['list'];
var connect = mongojs(database,collections);
module.exports = {connect: connect};
