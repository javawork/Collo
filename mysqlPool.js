const g_pool = require("generic-pool");
const mysql = require('mysql');

var mysqlPool = g_pool.createPool({
	name : "mysql",
	create: function(){
		var msql = mysql.createConnection(mysqlcfg);
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

module.exports = mysqlPool;