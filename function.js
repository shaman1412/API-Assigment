
var data  = require('./data');

exports.showAll = function(){
	return JSON.stringify(data.task);
};
exports.findById = function(id){
	for(var i =0;i< task.length; i++){
		if(task[i].id == id)
			return task[i];
	}
};
exports.addtask = function(object){
	task.push(object);
};