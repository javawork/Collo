# SETTING

You'd better read some npm projects before setting your repositories. Becuase Collo uses other npm project to connect to databases. 
Here are links for databases using Collo.

[LINK for MSSQL](https://www.npmjs.com/package/mssql)

[LINK for MySQL](https://www.npmjs.com/package/mysql)

[LINK for REDIS](https://www.npmjs.com/package/redis)

[LINK for Elasticsearch](https://www.npmjs.com/package/elasticsearch)

[LINK for AWS S3](https://www.npmjs.com/package/aws-sdk)


Collor offers several parameter options for queries. For example, if you want to insert a data of 'DATETIME' type in your query, you can use like this '@__today as datetime_mmddyyyy'. Refer this link ( [PARAMETER MANUAL](PARAMETER.md) ) for the detail.

## MSSQL

Refer this sample to set your repository and job for MSSQL. You can see this sample in repos.json and jobs.json files.

### Setting a repository

<pre><code>
<b>repo_name</b> : {
  <b>name</b> : '...',
  <b>type</b> : 'mssql',
  <b>config</b> : {                       //  refer [LINK for MSSQL] for detail.
    user: 'your accout for mssql',
    password: 'your password for mssql',
    server: 'ip address',                 // You can use 'localhost\\instance' to connect to named instance
    port: port_number,
    database : 'Database name',
    pool : {                              //  you can set a infomation for pooling 
      min: 1,
      max: 2,
      idleTimeoutMillis: 30000
    }
  }
}
</code></pre>

### Setting a job

<pre><code>
<b>jos_name</b> : {
  <b>schedule</b> : '* * * * * *',              // kind of cron
  <b>from</b> : 'repo_name you want to read',   // you have to write the defined repository name 
  <b>get_query</b> : 'SELECT TOP 10 index, name, address FROM usertable WITH(NOLOCK) WHERE login_date = ? ORDER BY index',
  <b>get_query_param</b> : '@__yesterday as datetime_mmddyyyy'
  <b>to</b> : 'repo_name you want to write',    // Let's assume you're going to write it on another MSSQL.
  <b>set_query</b> : 'INSERT INTO usertable_backup (today, index, name, address) values (?, ?, ?, ?)',
  <b>set_query_param</b> : '@__today as datetime_yyyymmdd, @index as int, @name as string, @address as string'
}
</code></pre>

## Caution
Don't use blank in repo and job name.


