ReadMe


Link All of Things!
세상 모든 것들을 이어봅시다!
--------------------------------------------------------
L.A.T enables you to move all of your data from A to B easily even if they are in different storages.
It's pretty simple. 
At first, add a query for reading and writing for your storages. 
And customize the results if you need. 
And last, set limit times or your own schedule for the job.

L.A.T는 서로 다른 저장소의 데이타를 손쉽게 이동할 수 있게 해줍니다. 
방법은 아주 간단합니다. 
첫번째로 당신의 저장소들에서 읽고 쓰는 쿼리를 추가합니다. 
그리고 필요하다면 읽거나 쓸 때 데이터를 조정할 수 있어요.
마지막으로 이 작업이 일어날 스케쥴과 반복할 횟수를 지정하면 끝입니다.



Features
--------------------------------------------------------
* It supports MSSQL, MariaDB, Elasticsearch, Redis. (It'll support AWS S3, local file system and other DBs)
* You can erase what you've moved if you want.
* It supports cron type schedule setting.
* It supports a web site that you can control your jobs easily.

* MSSQL, MariaDB, Elasticsearch, Redis를 지원합니다.(AWS S3와 파일 시스템 그리고 다른 DB들도 지원할 예정입니다.)
* 이동이 완료된 데이타는 삭제할 수 있습니다.
* cron 형식의 스케쥴 설정을 지원합니다.
* 작업을 쉽게 관리할 수 있도록 관리용 웹을 지원합니다.



Getting Started
--------------------------------------------------------
* Install NodeJS first on your system.
* This project has a demo that copies sample data from "demo.json" file to "new_demo.json" file on your local system.
* In your directory you downloaded this, run like this "npm start".


* 테스트 하려는 시스템에 NodeJS를 설치하세요.
* 이 프로젝트에 new_demo.json파일의 데이터를 new_demo.json으로 복사하는 데모가 포함되어 있습니다.
* 내려받은 폴더에서 "npm start"로 실행할 수 있습니다.


Usage
--------------------------------------------------------
* First of all, you set repositories, make queries and schedules for reading and writing.
* Setting a repository
----------------------------------------
>> "dblist.js" file has the infomations of your repositories. The format of file is JSON.
>> Every repository's configuration has name and type at least.
>> And the others are depends on the repository's type.
>> For more infomation, please refer to the following link : _________

* Setting queries and schedules
----------------------------------------
>> "jobs.js" file has queries and schedule for your jobs. The format of file is JSON.
>> A job's format is like this sudo code
	"your job name" : {
		schedule : '*/5 * * * * *',	// run every 5 seconds.
		from : 'repo name', // your repo's name you wrote in "dblist.js" for reading by get_query.
		get_query : 'reading query', // write a reading query from "from" repo in. for eaxmple, if your repo type is mysql, you can use the syntax as SQL is.
(option)get_query_param : '15@__daysago as int', // define some real values for parameters in "get_query"
(option)filter : { add_keyvalue : [{'world': '@__dbname as string'}] }, // add values in the result on reading if you need

		to : 'repo name', // your repo's name you wrote in "dblist.js" for writing by set_query.
		set_query : 'writing query',	//	write a writing query to "to" repo in. you can use the syntax as SQL is too.
(option)set_query_param : '@__yesterday as datetime', // define some real values for parameters in "set_query"
(option)end : 3, // this job will stop after 3 runs
	}
>> For more infomation, please refer to the following link : _________

* 가장 먼저 할 일은 저장소를 지정하고, 쿼리와 실행할 일정을 등록하세요.
* 저장소 설정하기
----------------------------------------
>> 


* 쿼리와 일정 지정하기
----------------------------------------
>> 



Limitations
--------------------------------------------------------
* 안되는 것들 - 안되는게 있나??
  현재 있는 버그 등등 ...


References
--------------------------------------------------------
* 참조한 것



License
--------------------------------------------------------
* MIT로 확정




