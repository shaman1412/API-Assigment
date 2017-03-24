var task = [
	{
		"id":"1",
		"task_subject":"swimming",
		"task_detail":"ดำน้าติดต่อกัน 5 ชั่วโมง",
		"status":0
	},
	{
		"id":"2",
		"task_subject":"กินข้าว",
		"task_detail":"กินไม่ต่ำกว่า 5 จาน",
		"status":0
	},
	{
		"id":"3",
		"task_subject":"นอน",
		"task_detail":"นอนไม่ต่ำกว่า 365 วัน",
		"status":1
	}
];

exports.showAll = function(){
	return task;
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
