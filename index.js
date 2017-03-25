var app  = require('express')();
var task = require('./data');
var bodyParser = require('body-parser');
var mongojs = require('./db');
var redis = require('redis');

var client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
app.set('port', (process.env.PORT || 1412));

var db = mongojs.connect;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


client.on('error', function (err) {
    console.log("Error " + err);
});

var errofunction = function(res){
		res.statusCode = 500;
		console.log("Erorrr");
		return res.send('<h1>'+ res.statusCode + '</h1><h2>INTERNAL SERVER ERROR, Unknown server error has occurred</h2>');
}
var sourcenotfound = function(res){
		res.statusCode = 404;
		console.log("Erorrr");
		return res.send('<h1>'+ res.statusCode + '</h1><h2>Source Not Found</h2>');
}
var success = function(res,docs){
	res.statusCode = 201;
	res.send(docs);
}
var checkwithcache = function(err,res,docs,id){
		if(err){
			errofunction(res);
			}
			else{
				if(docs == null ){
					sourcenotfound(res);
				}
				else
				{	
					console.log('no cache');
					docs = JSON.stringify(docs);
					client.setex(id, 60, docs);
					success(res,docs);
				}
			} 	
}

app.get('/v1/task',function(req,res){
	
	client.get('key_all',function(error, result){
		if(result){
			console.log('cache get');
			success(res,result);
		}		
		else{
		db.list.find(function(err, docs) {
			checkwithcache(err,res,docs,'key_all')
		});
		}
	});
});
app.get('/v1/task/:id',function(req, res){
	var id = req.params.id;
	
	client.get( id, function(error, result) {
		if(result)
		{
			console.log('cache get');
			success(res,result);
		}else{
			db.list.find({id: id}, function(err, docs) {
			checkwithcache(err,res,docs,id)
		});
		}	 
	});
});
app.post('/v1/task/insert',function(req, res){
	var json  = req.body;
	nlist = {
		id : json.para1,
		task_subject: json.para2,
		task_detail: json.para3,
		status: 0
	}
	db.list.insert(nlist, function(err, docs) {
        if(err){
			errofunction(res);
		}
		else{
			if(docs == null){
				sourcenotfound(res);
			}
			else
			{	
				client.del(json.para1);
				client.del('key_all');
				console.log('cache clear');
				success(res,docs);
			}
		} 
    });
});
app.patch('/v1/task/update/:id', function(req, res){
	var id = req.params.id;
	var json  = req.body;
	db.list.update(
  	{ id: id },
 	{ $set: { task_subject : json.para1 , task_detail : json.para2} },  
    { multi: true }
   , function(err, docs) {
		if(err)
		{
		errofunction(res);
		}
		else{
			if(docs == null)
			{
			 res.statusCode = 404;
			 console.log(res.statusCode);
			 res.send('<h1>' + res.statusCode +'</h1><h2> Not Found list ID</h2>');
			}
			else{

				 client.del(id);
				 client.del('key_all');
				 res.statusCode = 201;
				 console.log(res.statusCode);
				 
				res.send('<h1>update ID'+ id + '</h1>');
			}
			
		}
	});
});
app.patch('/v1/task/setstatus/:id', function(req, res){
	var id = req.params.id;
	var json  = req.body;
	var getstatus = parseInt(json.para1);
		db.list.update(
		 { id: id },
		 { $set: { status : getstatus } },
		 { multi: true }
		, function(err, docs) {
		if(err){
			errofunction(res);
		}
		else{
			if(docs == null){
				sourcenotfound(res);
			}
			else
			{	
				client.del(id);
				client.del('key_all');
				res.statusCode = 200;
				res.send('<h1>update id:'+ id + '</h1>');
			}
		} 		
	});
});
app.delete('/v1/task/del/:id',function(req, res){
	var id = req.params.id;
	db.list.remove({id: id}, function(err, docs){
		if(err){
			errofunction(res);
		}
		else{
			if(docs == null){
				sourcenotfound(res);
			}
			else
			{	
				client.del(id);
				client.del('key_all');
				res.statusCode = 200;
				res.send('<h1>Delete id:' + id + '</h1>');
			}
		}
	});
});

	
app.get('/',function(req,res){
	 db.list.count(function(err, result) {
		res.send('<h1>Peeranat jatuponpitak</h1>');
    });
});

app.listen(app.get('port'),function(){
	console.log('Starting server');
});