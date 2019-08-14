///////////////////////////////////////////////////////
//	require & define local variables
const _ = require('lodash/core');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const JSON = require('JSON');
const JSONStream = require('JSONStream');
const Tail = require('nodejs-tail');
const g_pool = require("generic-pool");
const fs = require('fs');

const redis = require('redis');
const sql = require('mssql');
const mysql = require('mysql');
const es = require('elasticsearch');

const app = express();
const cors = require('cors');

const util_date = require('./util_date');

const REPO = require('./repos');
const JOB = require('./jobs');
var REPOdata = JSON.parse(JSON.stringify(REPO));
var JOBdata = JSON.parse(JSON.stringify(JOB));
const TOOL = require('./tool');
const logger  =require('./logger');

const grok = require('node-grok').loadDefaultSync();

var g_bWaitingSaveData = false;
var g_cron_jobs = {};
var g_save_data = {};
var g_watchingLogDate = '';
var g_watchingLogFile = "./logs/log-";
var g_tail = null;
var g_tailValue = '[' + new Date().yyyymmddtime() + '] RESTART \n';
//	require & define global variables
///////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
//	utility functions


//	isEmpty
//	: check the value is empty or not
var isEmpty = function(value){ if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){ return true }else{ return false } };

//	waitFor 
//	: wait for milliseconds in an async function
const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

//	asyncForEach - deprecated
//	: forEach for async
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}

//	getKeyByValue
//	: find key by value
function getKeyByValue(object, value) {
	var arr = Object.keys(object);
	for(var i=0;i<arr.length;i++){
		if(object[arr[i]] === value)
			return arr[i];
	}
	return -1;
}

//	clearSpecialCharacter
//	: clear special characters from body of request
function clearSpecialCharacter(_string){
    _string = _string.replace(/\s+/,"");
    _string = _string.replace(/\s+$/g,"");
    _string = _string.replace(/\n/g,"");
    _string = _string.replace(/\r/g,"");

    return _string;
}

//	write
//	: write a json data in a file
async function write(fn, data){
	return new Promise((resolve, reject) => {
		fs.writeFile(fn, JSON.stringify(data, null, 2), function(err) {
		    if(err) {
		    	console.trace();
				logger.error(error + ", TRACE : " + console.trace());
				resolve();
		    }else{
		    	console.log("Write ", fn);
		    	resolve();
		    }
		}); 
	});
}

//	getSubValue
//	: ??
function getSubValue (object, keyArray){
	console.log( "getSubValue", object, keyArray);
	var objTemp = object;
	keyArray.forEach(function(ele){
		objTemp = getSubValues(objTemp, ele);
	});
	
	return objTemp;
}

//	getSubValues
//	: find a value from sub object by given key
function getSubValues(object, key){
	if(typeof object == "object"){
		return object[key];
	}
	return null;
}
//	utility
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
//	initialize 
const CollorManager = schedule.scheduleJob( "*/5 * * * * *", async function(){
	logger.info("STATUS/" + new Date().yyyymmddtimedash() + "/OK");
});
setInterval(keepAliveForREPO, 60*1000);

app.set('views',path.join(__dirname,'tool'));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname,'css')));
app.set('view engine','ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(10531, ()=>{	//	no meaning port number!!
	init();
	logger.info(" START Colloco on port 19899!");
});
app.use(function(req,res,next){
	next();
});
async function init(){
	console.log("read save data ... ");
	await readSaveData();
	await waitFor(2000);
	console.log("makeDBConnection ... ");
	await startDataSync();
}
//	initialize 
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
//	management
function keepAliveForREPO(){
	for(let key of Object.keys(REPO)){
		if(Array.isArray(REPO[key]) == true){
			for(let ele of REPO[key]){
				if(ele.type == "mssql"){
					//  Connection health check is built-in so once the dead connection is discovered, it is immediately replaced with a new one.
				}else if(ele.type == "mysql"){
					if(ele.pool !==undefined){
						const pool = ele.pool.acquire();
					  	pool.then( function(conn){
					  		conn.ping();
					  		waitFor(1);
					  		ele.pool.release(conn);
					  	});
					}
				}
			}
		}
	}
}

//	readSaveData
//	: read the save file for infomations of jobs when collo starts or restarts
async function readSaveData(){
	return new Promise((resolve, reject) => {
		fs.readFile('./savedata.json', 'utf-8', function(error, data) {
			if(error){
				console.trace();
				logger.error(error + ", TRACE : " + console.trace());
				resolve();
			}
			else{
				try{
					g_save_data = JSON.parse(data);
				}catch(e){
					logger.error( e  + ", TRACE : " + console.trace());
					g_save_data = {};
				}
			    resolve();
			}
		});
	});
}

//	writeSaveData
//	: write the save file for infomations of jobs when it modifies 
async function writeSaveData(){
	return new Promise((resolve, reject) => {
		fs.writeFile("./savedata.json", JSON.stringify(g_save_data), function(err) {
		    if(err) {
		    	console.trace();
				logger.error(error + ", TRACE : " + console.trace());
				resolve();
		    }else{
		    	resolve();
		    }
		});
	});
}

//	setSaveData
//	: set infomations of jobs
async function setSaveData(jobkey, datakey, value){
	g_bWaitingSaveData = true;
	g_save_data[jobkey][datakey].value = value;
	await writeSaveData();
	g_bWaitingSaveData = false;
}

//	write logs for monitoring
var interval = setInterval(function(){
	if(g_watchingLogDate != new Date().yyyymmdddash()){
		if(g_tail != null){
			g_tail.close();
		}

		var fn = g_watchingLogFile + new Date().yyyymmdddash() + ".log";
		g_tail = new Tail(fn);

		g_tail.on('line',(line) => {
			if(g_tailValue.length > 10240){
				g_tailValue = '';
			}
			g_tailValue += line+'\n';
		});
		g_tail.on('close',() => {
			logger.warn("Watching file [" + fn + "] was closed!");
			g_watchingLogDate = '';
		});
		g_tail.watch();
		g_watchingLogDate = new Date().yyyymmdddash();
		console.log( "WATCHING FILE = ", fn);
	}
},5000);

process.once('SIGUSR2', shutdown);	//	You can't receive this signal on Windows
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', function(err) {
    logger.log('error', 'Fatal uncaught exception crashed cluster', err, function(err, level, msg, meta) {
        console.log(" Finish!!");
    });
});

async function shutdown(){
	clearInterval(interval);
	if(g_tail != null){
		g_tail.close();
	}

	CollorManager.cancel();
	for(var k in g_cron_jobs){
		console.log("JOB CLOSE : ", k );
		g_cron_jobs[k].cancel();
		delete g_cron_jobs[k];
	}

	while(g_bWaitingSaveData == true){
		await waitFor(10);
	}
	await writeSaveData();

	for(let key of Object.keys(REPO)){
		if(Array.isArray(REPO[key]) == true){
			for(let ele of REPO[key]){
				if(ele.type == "mssql"){
					if(ele.pool !==undefined){
						ele.pool.close();
						console.log(ele.name," pool is closed!");
					}
				}else if(ele.type == "redis"){
					if(ele.redis_cli !==undefined){
						ele.redis_cli.quit();
						console.log(ele.name," is closed!");
					}
				}else if(ele.type == "mysql"){
					if(ele.pool !==undefined){
						ele.pool.destroy();
						console.log(ele.name," pool is closed!");
					}
				}else if(ele.type == "elasticsearch"){
					if(ele.es !==undefined){
						//ele.es.destroy();	//	There is no close type function. It's needed.
						console.log(ele.name," pool is closed!");
					}
				}else if(ele.type == "s3"){
					if(ele.aws !==undefined){
				//		AWS.config.loadFromPath('./aws_config.json');
						console.log(ele.name," pool is closed!");
					}
				}
			}
		}else{
			if(REPO[key].type == "mssql"){
				if(REPO[key].pool !== undefined){
					REPO[key].pool.close();
					console.log(REPO[key].name," pool is closed!");
				}
			}else if(REPO[key].type == "redis"){
				if(REPO[key].redis_cli !==undefined){
					REPO[key].redis_cli.quit();
					console.log(REPO[key].name," is closed!");
				}
			}else if(REPO[key].type == "mysql"){
				if(REPO[key].pool !== undefined){
					REPO[key].pool.destroy();
					console.log(REPO[key].name," pool is closed!");
				}
			}else if(REPO[key].type == "elasticsearch"){
				if(REPO[key].es !==undefined){
					//REPO[key].es.destroy();	//	There is no close type function. It's needed.
					console.log(REPO[key].name," pool is closed!");
				}
			}else if(REPO[key].type == "s3"){
				if(REPO[key].aws !==undefined){
			//		AWS.config.loadFromPath('./aws_config.json');
					console.log(REPO[key].name," pool is closed!");
				}
			}
		}
	}

    server.close(() => {
        logger.info("Closed out remaining connections");
        process.exit(0);
    });

    setTimeout(() => {
        logger.info("Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 5000);
}
//	management
//////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////
//	routes for management

//	send repo & jobs 
app.route('/').get(function(req,res,next){
	TOOL.goPage(req, res, REPO, JOB);
});

//	send logs 
app.route('/logs').get(function(req,res,next){
	var ret = _.clone(g_tailValue);
	if(ret ==''){
		var fn = g_watchingLogFile + new Date().yyyymmdddash() + ".log";
		var flushing = fs.openSync(fn, 'r');
		fs.close(flushing);
		res.send('');
	}else{
		g_tailValue = '';
		res.send(ret);
	}
});

//	receive new repo info and modify repo file AND apply.
app.post('/add_repo', function(req, res){
	var bSave = false;

	if(req.body.name !== undefined){
		if(REPOdata[req.body.name] === undefined){
			if(req.body.config !== undefined)
				req.body.config = JSON.parse(req.body.config);
			REPOdata[req.body.name] = req.body;
			bSave = true;
		}
	}
	if(bSave == true){
		write("./repos.json", REPOdata);
	}

	res.redirect('/?reload=repo');
});

//	receive new job info and modify job file AND apply.
app.post('/add_job', function(req, res){
	var bSave = false;

	console.log( " NEW JOB >> ", req.body);
	{
		for( var key in req.body){
			console.log( key, req.body[key] );
			JOBdata[key] = JSON.parse( clearSpecialCharacter(req.body[key]) );
			bSave = true;
		}
	}
	if(bSave == true){
		write("./jobs.json", JOBdata);
	}

	res.redirect('/?reload=repo');
});

//	delete repo info and modify repo file AND apply.
app.post('/delete_repo', function(req, res){
	var bSave = false;

	if(req.body.name !== undefined){
		var name = req.body.name;

		if(REPOdata[name] !== undefined){
			delete REPOdata[name];
			bSave = true;
		}
	}
	if(bSave == true){
		write("./repos.json", REPOdata);
	}

	res.redirect('/?reload=repo');
});

//	delete job info and modify job file AND apply.
app.post('/delete_job', function(req, res){

	var bSave = false;
	if(req.body.name !== undefined){
		var name = req.body.name;

		if(JOBdata[name] !== undefined){
			delete JOBdata[name];
			bSave = true;
		}
	}
	if(bSave == true){
		write("./jobs.json", JOBdata);
	}

	res.redirect('/?reload=repo');
});

//	save modified repo, job and apply
app.post('/save_repojob', function(req,res){

	console.log( req.body.repo );
	console.log( req.body.job );

	var repoData = {};
	var jobData = {};
	//	apply
	if(req.body.repo !== undefined){
		var data = JSON.parse(req.body.repo);
		var bSaveRepo = false;
		for(var key in data){
			if(REPOdata[key] !== undefined){
				REPOdata[key] = data[key];
				bSaveRepo = true;
			}
		}
	}

	if(req.body.job !== undefined){
		var dataJ = JSON.parse(req.body.job);
		var bSaveJob = false;
		for(var key in dataJ){
			if(JOBdata[key] !== undefined){
				JOBdata[key] = JSON.parse(dataJ[key]);
				bSaveJob = true;
			}
		}
	}

	if(bSaveRepo == true){
		write("./repos.json", REPOdata);
	}

	if(bSaveJob == true){
		write("./jobs.json", JOBdata);	
	}

	//	render page
	res.redirect('/?reload=repo');
});

//	routes
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//	Repositories Connection 
async function MSSQLConnection(element, config){
	return new Promise((resolve, reject) => {
		element["pool"] = new sql.ConnectionPool(config);
		element["pool"].connect().then(function(ret){
			resolve(ret);
		}).catch(function(err){
			//console.log("connection error => ", err);
			logger.error("connection error => "+ err + ", TRACE : " + console.trace());
			reject(err);
		});
	});
}

async function MYSQLConnection(element, config){
	return new Promise((resolve, reject) => {
		element["pool"] = g_pool.createPool({
			name : config.name,
			create: function(){
				var msql = mysql.createConnection(config);
				msql.connect();
				return msql;
			},
			destroy: function(client){
				client.disconnect();
			},
			min: 1,
			max: 5,
			idleTimeoutMillis : 30000,
			log:true
		});
		resolve('ok');
	});
}

async function FileStat(element, config){
	return new Promise((resolve, reject) => {
		element["file"] = {};
		element["file"]["path"] = element.config.path;
		resolve('ok'); 
	});
}

async function AWSSet(element, config){
	return new Promise((resolve, reject) => {
		element["aws"] = require('aws-sdk');
		element["aws"].config = element.config;
		element["s3"] = new element["aws"].S3({apiVersion: '2006-03-01'});

		resolve('ok');
	});
}
//	Repositories Connection
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//	Do jobs!

//	startDataSync
//	: run jobs!!
async function startDataSync(){
	console.log("REPO", Object.keys(REPO).length );
	for(let key of Object.keys(REPO)){
		if(Array.isArray(REPO[key]) == true){
			for(let ele of REPO[key]){
				if(ele.type == "mssql"){
					await MSSQLConnection(ele, ele.config).then(function(ret){}).catch(function(err){});
				}else if(ele.type == "mysql"){
					await MYSQLConnection(ele, ele.config).then(function(ret){}).catch(function(err){});
				}else if(ele.type == "redis"){
					try{
						ele["redis_cli"] = redis.createClient( ele.port, ele.ip );
						ele["redis_cli"].on('error', function(err){
							logger.error( err  + ", TRACE : " + console.trace());
						});
					}catch(e){
						logger.error(e + ", TRACE : " + console.trace());
					}
				}else if(ele.type == "elasticsearch"){
					ele["es"] = new es.Client(ele.config);
				}else if(ele.type == "file"){
					await FileStat(ele, ele.config).then(function(ret){}).catch(function(err){});
				}else if(ele.type == "s3"){
					await AWSSet(ele, ele.config).then(function(ret){}).catch(function(err){});
				}
			}
		}else{
			console.log("DB =>", REPO[key].type);
			if(REPO[key].type == "mssql"){
				await MSSQLConnection(REPO[key], REPO[key].config).then(function(ret){}).catch(function(err){});
			}else if(REPO[key].type == "mysql"){
				await MYSQLConnection(REPO[key], REPO[key].config).then(function(ret){}).catch(function(err){});
			}else if(REPO[key].type == "redis"){
				try{
					REPO[key]["redis_cli"] = redis.createClient( REPO[key].port, REPO[key].ip );
					REPO[key]["redis_cli"].on('error', function(err){
						logger.error( err  + ", TRACE : " + console.trace());
					});
				}catch(e){
					logger.error(e + ", TRACE : " + console.trace());
				}
			}else if(REPO[key].type == "elasticsearch"){
				REPO[key]["es"] = new es.Client(REPO[key].config);
			}else if(REPO[key].type == "file"){
				await FileStat(REPO[key], REPO[key].config).then(function(ret){}).catch(function(err){});
			}else if(REPO[key].type == "s3"){
				await AWSSet(REPO[key], REPO[key].config).then(function(ret){}).catch(function(err){});
			}
		}
	}

	for(let key of Object.keys(JOB)){
		JOB[key].bProc = 0;
		var newJob = schedule.scheduleJob( JOB[key].schedule, async function(){
			if(JOB[key].bProc == 0){
				await procJobs(key);

				if(JOB[key].limit_count !== undefined){
					--JOB[key].limit_count;
					if(JOB[key].limit_count <=0){
						g_cron_jobs[key].cancel();
						delete g_cron_jobs[key];
						console.log("close g_cron_jobs = ", key);
					}
				}
			}
		});
		g_cron_jobs[key] = newJob;
	}
}

//	procJobs
//	: process jobs
async function procJobs( key){
	JOB[key].bProc = 1;
	var ret = [];
	if(Array.isArray(REPO[JOB[key].from]) == true){
		for(let ele of REPO[JOB[key].from]){
			if(ele === undefined){
				console.log("Repogitory [" + JOB[key].from + "] isn't exist!");
				logger.error("Repogitory [" + JOB[key].from + "] isn't exist!");
				continue;
			}

			await readData(ele, JOB[key]).then(function(res){
				if(Array.isArray(res) == true){
					for(let eleRes of res){
						ret.push(eleRes);
					}
				}else{
					ret.push( res );
				}
			}).catch(function(err){
				console.trace();
				logger.error( "error "+ key + ">> "+ err );
				ret = {};
			});
		}
	}else{
		if(REPO[JOB[key].from] === undefined){
			console.log("Repogitory [" + JOB[key].from + "] isn't exist!");
			logger.error("Repogitory [" + JOB[key].from + "] isn't exist!");
			ret = {};
		}else{
			await readData(REPO[JOB[key].from], JOB[key]).then(function(res){
				ret = res ;
			}).catch(function(err){
				console.trace();
				logger.error(  "error "+ key + ">> "+ err  );
				ret = {};
			});
		}
	}

	if(ret.length > 0){
		if(Array.isArray(REPO[JOB[key].to]) == true){
			for(let ele of REPO[JOB[key].to]){
				await writeData(ele, JOB[key], ret).then(function(res){
					logger.info("JOB [ " + key + "] is done!");
				}).catch(function(err){
					console.trace();
					logger.error(  "error "+ key + ">> "+ err  );
				});
			}
		}else{
			await writeData(REPO[JOB[key].to], JOB[key], ret).then(function(res){
				logger.info("JOB [ " + key + "] is done!");
			}).catch(function(err){
				console.trace();
				logger.error(  "error "+ key + ">> "+ err  );
			});
		}
		console.log(key, " Update -", ret.length, " !!");
	}else{
		logger.info("JOB [ " + key + "] is waiting a new data !");
		console.log(key, " Waiting new one..");
		await waitFor( 10000 );
	}

	JOB[key].bProc = 0;
	console.log( key, " job end!!");
}

//	readData
//	: run "get_query" of jobs
function readData(db, job){
	return new Promise((resolve, reject) => {
		//	make a query
		var query = job.get_query;
		if( (query.match(/\?/g) || []).length > 0){
			if(job.get_query_param !== undefined){
				var listParam = job.get_query_param.split(',');
				for(var i=0;i<listParam.length;i++)	{
					var param = parseParam(db, job, listParam[i] );
					query = query.replace('?', param);
				}
			}
		}

		//	DO query
		if(db.type == 'mssql'){
			var request = new sql.Request(db.pool);
			if(!request){
				reject('failed to request on mssql!');
			}else{
				request.query(query, (err, result) => {	//	request get_query in _jobs.js 
					if(err){
						console.log( "mssql error ",err, query);
						reject(err);
					}else{
						var ret = [];
						if(result.recordset !== undefined){	//	check recordset in result
							result.recordset.forEach((ele)=>{
								if(job.filter !== undefined && job.filter.add_keyvalue !== undefined){	//	add new key/value or modify if it has filter
									job.filter.add_keyvalue.forEach((data) => {
										var key = Object.keys(data)[0];
										var value = parseParam(db, job, data[key]);
										ele[key] = value;
									});
								}
								var jobName = getKeyByValue(JOB, job);
								if(g_save_data[jobName] !== undefined){
									for(let sdkey of Object.keys( g_save_data[jobName] )){
										if(ele[sdkey]!== undefined){
											setSaveData(jobName, sdkey, ele[sdkey]);
											break;
										}else{
											console.log( "there is no set save data = " , jobName, sdkey, ele[sdkey]);
										}
									}
								}
								ret.push(ele);
							});
							resolve(ret);
						}
					}
				});
			}
		}else if(db.type == 'mysql'){
			var pool = db.pool.acquire();
			pool.then(function(conn){
				conn.query(query, function(err, result){
					if(err){
						console.log( "mssql error ",err, query);
						db.pool.release(conn);
						reject(err);
					}else{
						var ret = [];
						if(Array.isArray(result) == true){
							result.forEach(function(ele){
								ret.push( JSON.parse(JSON.stringify(ele)) );
							});
						}else{
							ret.push( JSON.parse(JSON.stringify(result)) );
						}

						ret.forEach(function(ele){
							if(job.filter !== undefined && job.filter.add_keyvalue !== undefined){	//	add new key/value or modify if it has filter
								job.filter.add_keyvalue.forEach((data) => {
									var key = Object.keys(data)[0];
									var value = parseParam(db, job, data[key]);
									ele[key] = value;
								});
							}
							var jobName = getKeyByValue(JOB, job);
							if(g_save_data[jobName] !== undefined){
								for(let sdkey of Object.keys( g_save_data[jobName] )){
									if(ele[sdkey]!== undefined){
										setSaveData(jobName, sdkey, ele[sdkey]);
										break;
									}else{
										console.log( "there is no set save data = " , jobName, sdkey, ele[sdkey]);
									}
								}
							}

						});
						db.pool.release(conn);
						resolve( ret );
					}
				});
			});
		}else if(db.type == 'redis'){
			var listQueryCmd= query.split(' ');
			var cmd = listQueryCmd[0].trim();
			listQueryCmd.splice(0,1);

			db.redis_cli[cmd]( listQueryCmd, function(errors, results){
				if(errors)
					reject(errors);
				resolve(results);
			});
		}else if(db.type == 'elasticsearch'){
			if(db.es !== undefined){
				db.es.search(JSON.parse(query)).then((res) => {
					if(res.hits === undefined){
						reject("EMPTY");
					}else{
						resolve(res.hits.hits);
					}
				}).catch((err) => {
					reject(err);
				});
			}
		}else if(db.type == "file" || db.type == "s3"){
			if( (db.type == "file" && db.file === undefined) || db.type == "s3" && (db.s3 === undefined || db.s3param ===undefined)){
				reject("Incorrect file name!");
			}

			{
				var sp = query.indexOf("{");
				var lp = query.lastIndexOf("}");
				if(sp == -1 || lp ==-1){	//	분석할 grok pattern 없거나 오류가 있음.
					reject("Incorrect pattern");
				}
				var cmd = query.slice(0, sp).trim();
				var pattern = query.slice(sp+1, lp-1).trim();
				var readPattern = grok.createPattern(pattern);

				var sValue = {};
				var jobName = getKeyByValue(JOB, job);
				var offsetKey = "read_offset";

				if(db.type == "file"){
					sValue["key"] = parseName(db.file.path);
					sValue["offset"] = 0;
				}else{
					sValue["key"] = parseName(db.s3param.Key);
					sValue["offset"] = 0;
				}

				if(g_save_data[jobName] !== undefined){
					if(g_save_data[jobName][offsetKey] === undefined){
						g_save_data[jobName][offsetKey] = {};
						setSaveData(jobName, offsetKey, sValue);
					}else{
						sValue["offset"] = g_save_data[jobName][offsetKey].value.offset;
						if(g_save_data[jobName][offsetKey].value.key != sValue["key"]){
							sValue["offset"] = 0;
						}
					}
				}else{
					g_save_data[jobName] = {};
					g_save_data[jobName][offsetKey] = {};
					setSaveData(jobName, offsetKey, sValue);
				}

				var rs = {};
				if(db.type == "file"){
					rs = fs.createReadStream(sValue["key"], { flags: 'r', encoding: 'utf-8', start : sValue["offset"]});
				}else{
					db.s3param.Range = 'bytes=' + sValue["offset"].toString() + '-' + Number(sValue["offset"] + 1024000).toString();
					var param = _.clone(db.s3param);
					
					param["ResponseCacheControl"] = "no-cache";
					param["Key"] = sValue["key"];

					rs = db.s3.getObject(param).createReadStream();
				}

				var data = '';
				rs.on('readable', function(){
					var d = rs.read();
					if(db.type == "s3")
						d = d.toString('utf-8');

					if( d !== null){
						var e = d.lastIndexOf('\n')+1;
						if(e < 1)
							e = d.length;
						var lines = d.slice(0,e).split('\n');
						var count = 0;
						var data = [];
						lines.forEach(function(ele){
							if(cmd == "grok"){
								readPattern.parse( ele , function(err, obj){
									if(err == null){
										if(obj !== null){
											data.push(obj);
										}
									}else{
										console.log('Incorrect pattern');
									}
								});
							}else if(cmd == "json"){
								data.push(ele);
							}
						});
						sValue["offset"] += e;
						setSaveData(jobName, offsetKey, sValue);
						if(db.type == "file"){
							rs.close(function(){
								resolve(data);
							});
						}else {
							rs.destroy();
							resolve(data);
						}
					}else{
						if(db.type == "file"){
							rs.close(function(){
								resolve('');
							});
						}else {
							rs.destroy();
							resolve('');
						}
					}
				});
				rs.on('error', function(err){
					if(db.type == "s3" && err.statusCode == 416){
						reject('S3 EOF, error >>' + err);
					}else{
						reject('Failed to read a file in the JOB ' + jobName + ", error >>" + err);
					}
				});
			}
		}else
			resolve({});
	});
}

//	writeData
//	: run "set_query" of jobs
function writeData(db, job, values){
	return new Promise((resolve, reject) => {
		//	DO query
		if(db.type == 'mssql'){
			var request = new sql.Request(db.pool);
			if(!request){
				reject('failed to request on mssql!');
			}

			if(Array.isArray(values) == true){
				values.forEach((q) => {
					let query = _.clone(job.set_query);
					if( (query.match(/\?/g) || []).length > 0){
						if(job.set_query_param !== undefined){
							var listParam = job.set_query_param.split(',');
							for(var i=0;i<listParam.length;i++)	{
								var param = parseParam( db, job, listParam[i], q );
								query = query.replace('?', param);
							}
						}
					}

					{
						//	insert
						request.query(query, (err, result) => {
							if(err){
								console.log( "err >> " + err );
							    logger.warn('{"err":"'+ err + '"}');
							}else if (result.length == 0){
								console.log( "err >> " + err );
							    logger.warn('{"err":"null"}');
							}
						});
					}
				});
			}else{
				var noParams = '';
				pts.params.forEach(function(p){
					var name = p.substring(1,p.length);
					if(values[name] === undefined)
						noParams = name;
					else{
						cpQuery = cpQuery.replace( p, values[name]);
					}
				});
				//	insert
				if(noParams !== ''){
					logger.warn("write mysql bad parameter ="+noParams);
					logger.warn("[cpQuery , values]");
					logger.warn(cpQuery);
					logger.warn(values);
				}else{
					//	insert
					{
						request.query(query, (err, result) => {
							if(err){
								console.log( "err >> " + err );
							    logger.warn('{"err":"'+ err + '"}');
								values.push(q);
							}else if (rows.length == 0){
							    logger.warn('{"err":"null"}');
							}
						});
					}
				}
			}
		}else if(db.type == 'mysql'){
			if(Array.isArray(values) == true){
				values.forEach((q) => {
					let query = _.clone(job.set_query);
					if( (query.match(/\?/g) || []).length > 0){
						if(job.set_query_param !== undefined){
							var listParam = job.set_query_param.split(',');
							for(var i=0;i<listParam.length;i++)	{
								var param = parseParam( db, job, listParam[i], q );
								query = query.replace('?', param);
							}
						}
					}

					{
						//	insert
						var pool = db.pool.acquire();
						pool.then(function(conn){
							conn.query(query, function(err, rows){
								db.pool.release(conn);
								if(err){
									console.log( "err >> " + err );
								    logger.warn('{"err":"'+ err + '"}');
								}else if (rows.length == 0){
									console.log( "err >> " + err );
								    logger.warn('{"err":"null"}');
								}
							});
						}).catch(function(err){
							console.log("mysql pooling failed >> " + err);
							logger.warn('{"err":"' + err + '"}');
							values.push(q);
						});					
					}
				});
			}else{
				var noParams = '';
				pts.params.forEach(function(p){
					var name = p.substring(1,p.length);
					if(values[name] === undefined)
						noParams = name;
					else{
						cpQuery = cpQuery.replace( p, values[name]);
					}
				});
				//	insert
				if(noParams !== ''){
					logger.warn("write mysql bad parameter ="+noParams);
					logger.warn("[cpQuery , values]");
					logger.warn(cpQuery);
					logger.warn(values);
				}else{
					//	insert
					var pool = db.pool.acquire();
					pool.then(function(conn){
						conn.query(cpQuery, function(err, rows){
							db.pool.release(conn);
							if(err){
								console.log( "err >> " + err );
							    logger.warn('{"err":"'+ err + '"}');
							}else if (rows.length == 0){
							    logger.warn('{"err":"null"}');
							}
						});
					}).catch(function(err){
						console.log("mysql pooling failed >> " + err);
						logger.warn('{"err":"' + err + '"}');
						values.push(q);
					});					
				}
			}
			resolve('OK');
		}else if(db.type == 'redis'){
			let query = _.clone(job.set_query);
			var listQueryCmd = query.split(' ');
			var cmd = listQueryCmd[0].trim();
			var key = listQueryCmd[1].trim();
			listQueryCmd.splice(0,1);

			if(db.redis_cli !==undefined){
				if(Array.isArray(values) == true){

					var multi = db.redis_cli.multi();
					values.forEach(function(ele){
						multi[cmd](key, JSON.stringify(ele));
					});
					multi.exec(function(errors, results){
						console.log( errors, results);
						resolve('OK');
					});
				}else{
					db.redis_cli[cmd]( key, JSON.stringify(values), function(errors, results){
						console.log( errors, results );
						resolve('OK');
					});
				}
			}else{
				console.log(" there is no redis cli!!");
			}
		}else if(db.type == 'elasticsearch'){

			let query = _.clone(job.set_query);
			if(db.es !==undefined){
				if(Array.isArray(values) == true){
					values.forEach(function(ele){
						if( (query.match(/\?/g) || []).length > 0){
							if(job.set_query_param !== undefined){
								var listParam = job.set_query_param.split(',');
								for(var i=0;i<listParam.length;i++)	{
									var param = parseParam( db, job, listParam[i] ,ele);
									query = query.replace('?', param);
								}
							}
						}
						db.es.index(JSON.parse(query)).then((res) => {
							resolve(res);
						}).catch((err) => {
							reject(err);
						});
					});
				}else{
					if( (query.match(/\?/g) || []).length > 0){
						if(job.set_query_param !== undefined){
							var listParam = job.set_query_param.split(',');
							for(var i=0;i<listParam.length;i++)	{
								var param = parseParam( db, job, listParam[i], values);
								query = query.replace('?', param);
							}
						}
					}
/*	With the create call you MUST provide an id.
	If you are not sure if an ID will be present in your data, 
	then you can use the client.index() function instead. 
	using that function, ES will auto-generate an ID if none is provided.
*/					
					db.es.index(JSON.parse(query)).then((res) => {
						resolve(res);
					}).catch((err) => {
						reject(err);
					});
				}
			}
		}else if(db.type == "console"){
			values.forEach(function(ele){
				let query = _.clone(job.set_query);
				if( (query.match(/\?/g) || []).length > 0){
					if(job.set_query_param !== undefined){
						var listParam = job.set_query_param.split(',');
						for(var i=0;i<listParam.length;i++)	{
							if(typeof ele === 'string')
								ele = JSON.parse(ele);
							var param = parseParam( db, job, listParam[i], ele );
							query = query.replace('?', param);
						}
					}
				}	
				console.log( query );
			});
			resolve({});
		}else if(db.type == "file"){
			console.log(" WRITE in " + db.file);
			if(db.file !== undefined){
				values.forEach(function(ele){
					{
						let query = _.clone(job.set_query);
						if( (query.match(/\?/g) || []).length > 0){
							if(job.set_query_param !== undefined){
								var listParam = job.set_query_param.split(',');
								for(var i=0;i<listParam.length;i++)	{
									console.log("ele = ["+ele+"]");
									if(typeof ele === 'string')
										ele = JSON.parse(ele);
									var param = parseParam( db, job, listParam[i], ele );
									query = query.replace('?', param);
								}
							}
						}

						//	insert
						var fn = parseName(db.file.path);
						console.log("WRITE FN = ", fn);
						var ws = fs.createWriteStream(fn, { flags: 'a', encoding: 'utf-8'});
						ws.write(query + "\n");
						ws.end(function(){
							resolve({});
						});
					}
				});
			}else
				resolve({});
		}else
			resolve({});
	});
}
//	Do jobs!
//////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//	parameters

//	getInputParam
//	: parse input parameters
function getInputParam(value){
	var param = value.match(/@\w+/)[0];
	var datatype = value.match(/as \w+/)[0];
	var options  = value.match("\\((.*?)\\)");
	if(options !== null){
		options = options[1].split('/');
	}
	var ret = { "param" : param.trim(), "type": datatype.replace('as ', '').trim(), "options" : options };
	return ret;
}

//	parseName
//	: replace special keywords about time with datetime value.
function parseName(_name){
	var name = _name;
	if(_name.indexOf("@__today_ymdnumber") != -1 ){
		name = _name.replace("@__today_ymdnumber", new Date().yyyymmddINT());
	}else if(_name.indexOf("@__today") != -1 ){
		name = _name.replace("@__today", new Date().yyyymmdddash());
	}else if(_name.indexOf("@__yesterday_ymdnumber") != -1 ){
		name = _name.replace("@__yesterday_ymdnumber", util_date.getNextDay(new Date(),-1).yyyymmddINT());
	}else if(_name.indexOf("@__yesterday") != -1 ){
		name = _name.replace("@__yesterday", util_date.getNextDay(new Date(),-1).yyyymmdddash());
	}

	return name;
}

//	getDatetimeFormat
//	: get various datetime format by give datetime format type
function getDatetimeFormat(_type, _date){
	if(_type == 'int')
		ret = new Date().yyyymmddINT();
	else if(_type == 'datetime_mmddyyyy')
		ret = '"' + new Date().mmddyyyytimedash() + '"';
	else if(_type == 'datetime_yyyymmdd')
		ret = '"' + new Date().yyyymmddtimedash() + '"';
	else
		ret = '"' + new Date().yyyymmdddash() + '"';
}

//	parseParam
//	: replace special keywords with real values
function parseParam(db, job, param, value){
	var chk = getInputParam(param);
	var ret = null;
	if(chk.param == '@__today')
		ret = getDatetimeFormat( chk.type, new Date() );
	else if(chk.param == '@__yesterday')
		ret = getDatetimeFormat( chk.type, util_date.getNextDay(new Date(),-1) );
	else if(chk.param == '@__tomorrow')
		ret = getDatetimeFormat( chk.type, util_date.getNextDay(new Date(),1) );
	else if((chk.param.match(/@__daysago/g) || []).length > 0)
		ret = getDatetimeFormat( chk.type, util_date.getNextDay(new Date(),-param.split('@')[0]) );
	else if((chk.param.match(/@__weeksago/g) || []).length > 0)
		ret = getDatetimeFormat( chk.type, util_date.getNextDay(new Date(),-(param.split('@')[0]*7)) );
	else if((chk.param.match(/@__monthsago/g) || []).length > 0)
		ret = getDatetimeFormat( chk.type, util_date.getLastdayOfLastMonth(new Date(),-(param.split('@')[0])) );
	else if(chk.param == '@__dbname')
		ret = db.name;
	else if(chk.param.indexOf('@__lastNumber_') >= 0 || chk.param.indexOf('@__lastInstanceNumberByDay_') >= 0) {
		var jobName = getKeyByValue(JOB, job);
		var key = '';
		if(chk.param.indexOf('@__lastNumber_') >= 0){
			key = "ln_" + chk.param.slice(chk.param.indexOf('@__lastNumber_') + '@__lastNumber_'.length, chk.param.length);
		}else if(chk.param.indexOf('@__lastInstanceNumberByDay_') >= 0){
			key = "ln_" + chk.param.slice(chk.param.indexOf('@__lastInstanceNumberByDay_') + '@__lastInstanceNumberByDay_'.length, chk.param.length);
		}

		if(g_save_data[jobName] === undefined){
			g_save_data[jobName] = {};
		}
		
		if(save_data[jobName][db.name] === undefined){
			save_data[jobName][db.name] = {};
		}
		if(save_data[jobName][db.name][key] === undefined){
			save_data[jobName][db.name][key] = {'value' : 0};
		}
		ret = save_data[jobName][db.name][key].value;
	}else{	//	change from pre_defined_data to a really data you read
		var name = chk.param.substring(1,chk.param.length);
		name = name.split('.');
		{
			value = getSubValue(value, name);
			if(typeof value == "object")
				value = JSON.stringify(value);
		}
		
		if(value === undefined || value === null){
			console.log("IN parseParam", name, chk.param, chk.param.length);
			ret = name;
		}
		else{
			var quotes = "\"";
			if(db.type == 'mssql' ||  db.type == 'mysql')
				quotes = "\'";

			if(chk.type=='string')
				ret = quotes + value[name] + quotes;
			else if(chk.type=='datetime_mmddyyyy')
				ret = quotes + new Date(value[name]).mmddyyyytime() + quotes;
			else if(chk.type=='datetime_yyyymmdd')
				ret = quotes + new Date(value[name]).yyyymmddtime() + quotes;
			else if(chk.type == 'binary'){
				ret = quotes + Buffer(value[name]).toString('hex') + quotes;
			else if(chk.type == 'binary_read'){
				var dat = Buffer.from(value[name], 'hex');
//				var origin = zlib.inflateSync(dat);	//	uncompress ... 
//				var serial = origin.readUInt16LE(4);
			}else 
				ret = value[name];
		}
	}
	return ret;
}
//	parameters
/////////////////////////////////////////////////////////////////////