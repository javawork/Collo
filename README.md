# Collocō

## Collo is short for Collocō. 

Collo collects data from multiple sources into single repository with simple setting.

It was only for integrating into Elasticsearch and MySQL with various formats of data written in files and database while building DW and statistics system. And it has been improved to import from various repositories and convert them to various formats.

You can save subset of data if you have a way to search them. And adding data is possible as well. For example, you query data from MySQL using SQL statement then save them into Elasticsearch or even files.

The repositories you can import 

* MSSQL
* MySQL
* Elasticsearch
* Redis
* AWS S3
* File
* REST API

The repositories you can export

* MSSQL
* MySQL
* Elasticsearch
* Redis
* File System
* Console

Collo handles all of data with JSON format. So you can add or modify your data easily. See details as follow samples and [document](SETTING.md).

Also Collo provides a management tool that is a web page by port number 10531/tcp. See details as "Managment Tool" section.


## Usage

- Migration all or special data you want between another RDBMS
- Export all or special data you want in a file from RDBMS 
- Export all data in RDBMS from Redis, AWS S3 or files
- Writing post data by HTTP in a repository you want


## Run the first example

Please install [NodeJS](https://nodejs.org) and [npm](https://www.npmjs.com/get-npm) before running your first example.

The first example is a sample to read __/samples/line_formated_sample.log__ file (This file is kind of web log file.). And Next, it will write in a file (__/samples/today_file_yyyy-mm-dd.log__) and print in console.

Run as belows.
>  node collo.js

This is the result.

![test_result](/images/first-test-result.PNG)


## Folders and files 

<pre><code>
.
├── css                     # Css files for tool
├── docs                    # Documentation files
├── images                  # Image files
├── repo-jobs-samples       # samples for repo and job
├── src                     # Source files
├── tool                    # Tools and utilities
├── samples                 # Repo, Job and DB schema sample files for testing
└── README.md

./src
├── collo.js                # Main source file
├── jobs.json               # Jobs what you want to do
├── repos.json              # Repositories what you want to read/write
.
.
</code></pre>

The almost important functions are in __collo.js__ except some reusable funtions. 


## Structure of Repositories and jobs

This repo and job is for the first example.

### Structure for Collo's repository 

Let see "/src/repos.json" file.

<pre><code>
{
  "grok_file_repo": [{                              >> (1)
    "type": "file",
    "name": "grok_sample_file",
    "config": {
      "path": "../samples/line_formated_sample.log" 
    }
  }],
  "daily_file_sample": [{
    "type": "file",
    "name": "file_for_today",
    "config": {
      "path": "../samples/today_file_@__today.txt"  >> (2) 
    }
  }],
  "console" : [{                                    >> (3) 
    "type" : "console",
    "name" : "console for debug"
  }]
}
</code></pre>

(1) A Collo's repository has a name you made and one or multiple configurations for repositories. If you set multiple configurations in a Collo's repository, Collo do the job repeatably. You need to configure for each repository. Please refer to [this link](SETTING.md)

(2) "@__today" is a keyword for Collo. The keywords will help you easily with a variety of situations when building your data.

(3) You can print what you want on __console__. This "console" repository will be added automatically even you don't set it. Please Don't use the "console" for other use.

### Structure for Collo's job

Let see "/src/jobs.json" file.

<pre><code>
{
    "grok2file_console_sample" : {
        "schedule" : "*/2 * * * * *",
        "from" : "grok_file_repo",
        "get_query" : "grok { %{IP:ip} }",
        "to": ["daily_file_sample", "console"],
        "set_query": ["{'date': ? , 'ip' : ?}", "{\"ip\":?}"],
        "set_query_param": ["@__yesterday as datetime_mmddyyyy, @ip as string", "@ip as string"]
    }
}
</code></pre>

__schedule__ : It's kind of __cron__. This sample will run once every two seconds.

__from__ : A repository What you want to import. Use the name you set it on "repos.json".

__get_query__ : Write a query to get data from __from__.

(option)__get_query_param__ : Add some parameters for your __get_query__ if it need.

(option)__filter__ : Add some values in result data to get from __get_query__.

__to__ : A repository What you want to export. Use the name you set it on "repos.json".

__set_query__ :  Write a query to insert or uupdate data to __to__. 

(option)__set_query_param__ : Add some parameters for your __set_query__ if it need.

Please see details to [this link](SETTING.md)

### There is some more examples.

There is some more examples in /repo-jobs-samples. Move repos-xxx.json and jobs-xxx.json to /src/repos.json and /src/jobs.json. And next, run collo. And you can test other examples.

If you want to test on MSSQL or MySQL, make DB and tables with /samples/collo-mssql-sample-db.sql or collo-mysql-sample-db.sql before you test it.


### Cautions

Collo creates /src/savedata.json for recording of the job processing. If you want to initialize or handle it, you can delete or modify the file.



## Management Tool

This tool makes you easy to handle your jobs. It doesn't need to modify repos.json and jobs.json files on console. And it doesn't need to restart Collo after modify these files. Just modify them on management tool and push the "apply" button. It's done. 

Collo has "Dashboard" and "Setting".


### Dashboard

There is a empty text control. Collo shows you logs what is going on. And you can clear all text when you push the "Clear" button at the bottom. 

![tool-dashboard](/images/tool-dashboard.png)


### Setting 

You can modify, add or delete repositories or jobs. And these are applied on real-time.

![tool-repo](/images/tool-repo.PNG)

Each one repository and job has three buttons.

![tool-button](/images/tool-button.PNG)

Before you do something, All buttons are disable like the upper image. But these are enable when somethings are changed.

![tool-button](/images/tool-apply.PNG)

__Cancel__ : It initializes everything that's changed.

__Apply__ : It saves what's modified in just memory. And it'll send Collo them. And Next, Collo is going to restart all jobs right away. Be careful! If you modify a repository that is in use, a job using the repository could be in trouble.

__Delete__ : It'll be applied right away if you confirm to delete. If the reposirory is in use, "Delete" button will be unvisible.


## License infomation

__Collo__ is distributed under the terms and conditions of the MIT license.
