# Collocō

## Collo is short for Collocō. 


This project can help you to collect distributed data into a repository easily even if the data is in anywhere with only simple settings.

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

> “Repo name” : {

>   name : “name to use in description”,

>   type : “write of your repository type. Input ‘mssql’ if your repo is MSSQL ”,

>   config :  { 

>    …   // Detail information depends on your repo. Check this link.

>   }

> }

## Setting jobs - [ jobs.js ]

> “name” : {

>   schedule : “* * * * * *”, // it’s like a “cron” setting

> 	 from : “Set the ‘repo name’ in ‘repos.js’ to read ”,

>   get_query :  “input your query or command to read”,

>   get_query_param : “set parameters if you need for ‘get_query’.”,

>   to : “Set the ‘repo name’ in ‘repos.js’ to write”,

>   set_query : “input your query or command to write”,

>   set_query_param : “set parameters if you need for ‘set_query’.”

> }

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
