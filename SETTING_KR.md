# SETTING

저장소 세팅을 위해 아래 npm projects를 참고하세요. Collo는 여러 저장소에 대한 연결을 위해 다른 npm project를 사용합니다.

아래는 Collo가 여러 저장소 연결을 위해 사용중인 다른 npm 프로젝트의 링크입니다.

[LINK for MSSQL](https://www.npmjs.com/package/mssql)

[LINK for MySQL](https://www.npmjs.com/package/mysql)

[LINK for REDIS](https://www.npmjs.com/package/redis)

[LINK for Elasticsearch](https://www.npmjs.com/package/elasticsearch)

[LINK for AWS S3](https://www.npmjs.com/package/aws-sdk)


## 예약 키워드

키워드들은 저장소의 이름 혹은 쿼리문의 파라미터를 위해 사용됩니다.


### 저장소 이름에 사용되는 키워드들

|keyword|type|desc|caution|
|---|---|---|---|
|@__today|datetime| [yyyy-mm-dd] 포멧 형태로 오늘 날짜값으로 대체됩니다.|-|
|@__today_number|int| [yyyymmdd] 포멧의 정수형 형태로 오늘 날짜값으로 대체됩니다.|-|
|@__yesterday|datetime| [yyyy-mm-dd] 포멧 형태로 어제 날짜값으로 대체됩니다.|-|
|@__yesterday_number|int| [yyyymmdd] 포멧의 정수형 형태로 어제 날짜값으로 대체됩니다.|-|


### 쿼리의 파라미터로 사용되는 키워드들

파라미터를 사용할 때 항상 자료형을 정의해줘야 합니다. ((ex) @__today as int / @__today as datetime) 


#### 날짜 관련 키워드들

|keyword|type|desc|caution|
|---|---|---|---|
|@__today|int| [yyyy-mm-dd] 포멧의 정수형 형태로 오늘 날짜값으로 대체됩니다.|-|
|@__today|datetime_mmddyyyy| [mm-dd-yyyy hh:MM:ss]포멧 형태로 오늘 날짜값으로 대체됩니다.|-|
|@__today|datetime_yyyymmdd| [yyyy-mm-dd hh:MM:ss]포멧 형태로 오늘 날짜값으로 대체됩니다.|-|
|@__today|date| [yyyy-mm-dd]포멧 형태로 오늘 날짜값으로 대체됩니다.|-|

더해서, 다른 날짜 관련 키워드들도 위와 같은 형태로 사용됩니다. __@__yesterday__, __@__tomorrow__, __@__daysago__, __@__weeksago__ and  __@__monthsago__ 와 같은 키워드들이 존재합니다.

예를 들면, "15@__daysago as date"를 사용하면 15일 일자의 값을 얻을 수 있습니다.


#### 순차 증가값 관련 키워드들
|keyword|type|desc|caution|
|---|---|---|---|
|@__lastNumber_xxx|int| "xxx"는 읽기 쿼리에서 사용한 어떤 컬럼의 이름을 의미합니다. 만약 순차적으로 증가하는 어떤 데이타를 읽기를 원할 때,( 예를 들자면, Oracle의 sequence 컬럼 혹은 MySQL의 auto_increment 컬럼과 같은 ..), 이 키워드를 사용할 수 있습니다.. Collo는 항상 마지막으로 읽은 이 컬럼의 값을 "savedata.json"파일에 저장합니다.|-|
|@__lastInstanceNumberByDay_xxx|int| 이 키워드는 @__lastNumber_xxx와 거의 유사합니다. 하지만 이값은 매일 0시에 0으로 초기화 됩니다. 매일 반복적으로 전체 데이터 혹은 특정 조건의 값을 읽을 때 유용합니다. ||


#### 기타

|keyword|type|desc|caution|
|---|---|---|---|
|@__dbname|string| 이 키워드는 저장소의 이름으로 대체됩니다.||


## 저장소 설정 예

"/repo-jobs-samples" 폴더에 있는 다른 예제들을 참고하세요.

MSSQL을 예로 들어 보겠습니다.

<pre><code>
<b>"repo_name"</b> : {
  <b>"name"</b> : "sample_db_1",            // @__dbname 키워드는 이 값으로 대체됩니다.
  <b>"type"</b> : "mssql",
  <b>"config"</b> : {                       // 이 부분은 저장소의 종류에 따라 달라집니다. 보다 상세한 부분은 [LINK for MSSQL](https://www.npmjs.com/package/mssql)를 참고하세요.
    "user": "your accout for mssql",
    "password": "your password for mssql",
    "server": "ip address",
    "port": port_number,
    "database" : "Database name",
    "pool" : {                              //  pooling 설정입니다.
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
  <b>"schedule"</b> : "* * * * * *",                              // cron과 같은 포멧으로
  <b>"from"</b> : "repo_name you want to read",
  <b>"get_query"</b> : "SELECT TOP 10 index, name, address FROM usertable WITH(NOLOCK) WHERE index>? and login_date = ? ORDER BY index",
  <b>"get_query_param"</b> : "@__lastNumber_index, @__yesterday as datetime_mmddyyyy", // <b>"get_query"</b>의 "?" 개수만큼의 파라미터를 설정하세요.
    <b>"filter"</b> : {
      <b>"add_keyvalue"</b> : [{"world": "@__dbname as string"}]  //  get_query의 결과에 @__dbname값을 world라는 이름으로 삽입합니다.
    },
  <b>"to"</b> : 'repo_name you want to write',                    // 다른 MSSQL에 읽어온 데이타를 입력한다고 가정해 봅시다.
  <b>"set_query"</b> : 'INSERT INTO usertable_backup (today, dbname, index, name, address) values (?, ?, ?, ?, ?)',
  <b>"set_query_param"</b> : '@__today as datetime_yyyymmdd, @world as string, @index as int, @name as string, @address as string'
}
</code></pre>



## 샘플 변경해보기

콘솔에 출력되는 내용을 지정된 저장소로 저장하도록 샘플을 변경해 보겠습니다.


### 읽어온 내용을 File에 쓰기

위의 저장소 샘플 파일에서 "writing_file" 부분을 다시 보겠습니다.
<pre><code>
   .
   .
  "writing_sample": {
    "type": "file",
    "name": "writing_sample",
    "config": {
      "path": "./samples/target_file_@__today" // @__today는 해당 날짜로 변환되는 collo에서 사용하는 예약어입니다.
    }
  },
  .
  .
</code></pre>

"type"은 저장소의 종류를 지정할 수 있는데, "file"은 로컬 파일에 저장하는 것을 의미합니다. 그리고 "config"의 "path"를 보면 "samples"이라는 폴더 아래 "target_file_@__today" 라고 표기된 것을 볼 수 있습니다. 현재 "samples" 폴더 안에는 해당 파일이 생성되지 않았지만, 데이터가 저장될 파일명을 이렇게 지정할 수 있습니다. 각종 파라미터 등에 "@__"가 붙어 있다면 collo에서 사용하는 예약된 키워드입니다. "@__today"는 추후 실행된 당일 날짜가 대치되어 기록됩니다. 만약 이 샘플을 실행한 날이 2019년 5월 30일이라면 새롭게 생성될 파일명은 "target_file_20190530"으로 표기될 것입니다.

이제 작업을 수정해 보겠습니다.

"jobs.json" 파일에 열어 아래와 같이 수정해 보겠습니다.
<pre><code>
{
  "test_job": {
    "schedule": "*/10 * * * * *",
    "from": "json_sample",
    "get_query": "json {}",
    "to" : "writing_sample",
    "set_query": "{'date': ? , 'ip' : ? , 'theday' : ?}",
    "set_query_param": "@__yesterday as string, @ip as string, @today as int",
    "bProc": 1
  }
}
</code></pre>

"from"은 데이터를 읽어올 저장소이며, "to"는 읽어온 데이터를 저장할 저장소입니다. 기존에 "console"로 기입되어 있던 것을 "writing_sample"로 수정했습니다.

다시 실행해 보겠습니다. 실행전에 "savedata.json" 파일을 꼭 삭제하세요. 그렇게 하지 않는다면, "json_sample" 저장소에 새로운 내용이 없으므로 아무것도 기록되지 않을 것입니다.

<pre><code> > node collo.js </code></pre>

이제 "samples" 폴더에 가면 새로운 파일이 생성되어 기록된 것을 확인하실 수 있습니다. 


### 읽어온 내용을 MySql에 쓰기

이제 읽어온 데이터를 MySql에 저장해 보겠습니다. 

MySql을 위한 새로운 저장소를 등록해 보겠습니다. 먼저 repos.json파일을 열어 아래의 내용을 추가해 보겠습니다. 

<pre><code> 
.
.,
  myMySql : {
    name : 'testMySql',
    type : 'mysql',
    config : {
        host :'127.0.0.1',
        port : 3306,
        user : 'db_account',
        password : 'db_pw',
        database:'Collo_Test',
    }
  },
</code></pre>

"config"안의 내용을 테스트 할 수 있는 자신의 mysql에 알맞게 설정해 주시기 바랍니다. 그리고 해당 DB에 "Collo_Test"라는 DB를 만들고, 아래의 스크립트를 실행해 주세요. 

<pre><code> 
CREATE TABLE `tbCollo` (
  `date` DATE NOT NULL,
  `ip` CHAR(32) NOT NULL COLLATE 'utf8_unicode_ci',
  `theday` INT(11) NOT NULL
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
;
</code></pre>

저장소가 준비되면 작업 설정을 아래와 같이 수정합니다. 

<pre><code> 
{
  "test_job": {
    "schedule": "*/10 * * * * *",
    "from": "json_sample",
    "get_query": "json {}",
    "to" : "myMySql",
    "set_query" : "insert into tbCollo (date, ip, theday) values (?, ?, ?)",
    "set_query_param" : "@__yesterday as datetime, @ip as string, @today as int"
  },
}
</code></pre>

"to"의 설정이 "myMySql"로 수정되었으며, "set_query"는 sql의 insert 문으로 수정된 것을 볼 수 있습니다. 

이제 savedata.json을 지우고 collo를 재실행하면 DB에 데이터들이 삽입된 것을 확인할 수 있습니다.

