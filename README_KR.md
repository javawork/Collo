# Collocō

## Collo 는 Collocō의 약어입니다.


Collo는 간단한 세팅을 통해 여러 포멧과 저장소로 흩여져 있는 당신의 데이터들을 원하는 저장소로 손쉽게 모을 수 있습니다.

You can get data you want if there is a way to search on a repository. And you can modify and save the data. For example, you can use SQL if your repository is MySQL.


The repositories you can import :
 - MSSQL, MySQL, Elasticsearch, Redis, File System, AWS S3

The repositories you can export : 
- MSSQL, MySQL, Elasticsearch, Redis, File System

# Usage

You can run this after setting your repositories and jobs.
Do setting your repositories in “repos.js” and set your jobs in "jobs.js".
Please read the following for the detail.

## Setting repositories - [ repos.js ]

<pre><code>
 <b>“Repo name”</b>: {
   <b>name</b> : “name to use in description”,
   <b>type</b> : “write of your repository type. Input ‘mssql’ if your repo is MSSQL ”,
   <b>config</b> :  { 
    …   // Detail information depends on your repo. 
   }
 }
</code></pre>

## Setting jobs - [ jobs.js ]

<pre><code>
 <b>“name”</b> : {
   <b>schedule</b> : “* * * * * *”, // it’s like a “cron” setting
   <b>from</b> : “Set the ‘repo name’ in ‘repos.js’ to read ”,
   <b>get_query</b> :  “input your query or command to read”,
   <b>get_query_param</b> : “set parameters if you need for ‘get_query’.”,
   <b>to</b> : “Set the ‘repo name’ in ‘repos.js’ to write”,
   <b>set_query</b> : “input your query or command to write”,
   <b>set_query_param</b> : “set parameters if you need for ‘set_query’.”
}
</code></pre>

For more infomation for setting repositories and jobs, please refer to [this link](SETTING.md) 

## Run - [ collo.js ]
You need “Node.js” to run “collo”. Run as belows.
>  node collo.js

Collo has a management tool. You can set your repositories, jobs by the management tool easily.
You can check some warnings and errors in “logs” folder. Of course you can see the logs on the management tool in realtime. 
You have to open the http port to connect to the management tool on your firewall. Check this link for detail informations.


# Contributing
We encourage contributions of all kinds. If you would like to contribute in some way, please review our guidelines for contributing.


# License
MIT License
