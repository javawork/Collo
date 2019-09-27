# SETTING

You'd better read some npm projects before setting your repositories. Because Collo uses other npm project for connecting to databases. 

Here are links for databases using in Collo.

[LINK for MSSQL](https://www.npmjs.com/package/mssql)

[LINK for MySQL](https://www.npmjs.com/package/mysql)

[LINK for REDIS](https://www.npmjs.com/package/redis)

[LINK for Elasticsearch](https://www.npmjs.com/package/elasticsearch)

[LINK for AWS S3](https://www.npmjs.com/package/aws-sdk)


## Keywords for Collo

Keywords will be used in a name of repository or a parameter in query.


### Keywords that can be used in a name of repository

|keyword|type|desc|caution|
|---|---|---|---|
|@__today|datetime| This keyword will be replaced by today's date to a datetime value like this format [yyyy-mm-dd]|-|
|@__today_number|int| This keyword will be replaced by today's date to a numerical value like this format [yyyymmdd]|-|
|@__yesterday|datetime| This keyword will be replaced by yesterday's date to a datetime value like this format [yyyy-mm-dd]|-|
|@__yesterday_number|int| This keyword will be replaced by yesterday's date to a numerical value like this format [yyyymmdd]|-|


### Keywords that can be used in parameters of a query

When using parameter, you must declare the data type together. ((ex) @__today as int / @__today as datetime) 


#### Date-related keywords

|keyword|type|desc|caution|
|---|---|---|---|
|@__today|int| This keyword will be replaced by today's date to a numerical value like this format [yyyymmdd]|-|
|@__today|datetime_mmddyyyy| This keyword will be replaced by today's date to a datetime value like this format [mm-dd-yyyy hh:MM:ss]|-|
|@__today|datetime_yyyymmdd| This keyword will be replaced by today's date to a datetime value like this format [yyyy-mm-dd  hh:MM:ss]|-|
|@__today|date| This keyword will be replaced by today's date to a date value like this format [yyyy-mm-dd]|-|

In addition, other date-related keywords have the same function. There are __@__yesterday__, __@__tomorrow__, __@__daysago__, __@__weeksago__ and  __@__monthsago__. 

For example, You can used like this "15@__daysago as date" when you want to get the date value 15 days ago.


#### Sequence-related keywords

|keyword|type|desc|caution|
|---|---|---|---|
|@__lastNumber_xxx|int| "xxx" means a name of value in reading query. If you want to read your data sequentially((ex) Kind of a sequence column on Oracle or a auto_increment column on MySQL), you could use this keyword. Collo always save the last value of xxx in savedata.json file.||
|@__lastInstanceNumberByDay_xxx|int|This keyword is almost same with @__lastNumber_xxx. But this value will be initialized by 0 on every 0 AM. It'll be useful to read all or some under having conditions when you do repetitive tasks every day.||


#### Etc

|keyword|type|desc|caution|
|---|---|---|---|
|@__dbname|string| This keyword will be replaced by the name of repository.||


## Repository setting example

Refer other samples in "/repo-jobs-samples" folder.

Let's see a MSSQL Sample.

<pre><code>
<b>"repo_name"</b> : {
  <b>"name"</b> : "sample_db_1",            // @__dbname will be replaced by this value.
  <b>"type"</b> : "mssql",
  <b>"config"</b> : {                       //  This part depends on the type of reposigory. Refer [LINK for MSSQL](https://www.npmjs.com/package/mssql) for detail.
    "user": "your accout for mssql",
    "password": "your password for mssql",
    "server": "ip address",
    "port": port_number,
    "database" : "Database name",
    "pool" : {                              //  you can set a infomation for pooling 
      "min": 1,
      "max": 2,
      "idleTimeoutMillis": 30000
    }
  }
}
</code></pre>


### Job setting example

<pre><code>
<b>"jos_name"</b> : {
  <b>"schedule"</b> : "* * * * * *",                              // kind of cron
  <b>"from"</b> : "repo_name you want to read",
  <b>"get_query"</b> : "SELECT TOP 10 index, name, address FROM usertable WITH(NOLOCK) WHERE index>? and login_date = ? ORDER BY index",
  <b>"get_query_param"</b> : "@__lastNumber_index, @__yesterday as datetime_mmddyyyy", // You need to set the number of "?" in <b>"get_query"</b> : 
    <b>"filter"</b> : {
      <b>"add_keyvalue"</b> : [{"world": "@__dbname as string"}]  //  Insert a value of @__dbname under the name "world" in the result of get_query
    },
  <b>"to"</b> : 'repo_name you want to write',                    // Let's assume you're going to write it on another MSSQL.
  <b>"set_query"</b> : 'INSERT INTO usertable_backup (today, dbname, index, name, address) values (?, ?, ?, ?, ?)',
  <b>"set_query_param"</b> : '@__today as datetime_yyyymmdd, @world as string, @index as int, @name as string, @address as string'
}
</code></pre>