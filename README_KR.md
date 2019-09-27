# Collocō


## Collo 는 Collocō의 약어입니다.

Collo는 간단한 세팅을 통해 다양한 포멧으로 저장되어 여러 저장소로 흩어진 데이터들을 원하는 저장소로 손쉽게 모으기 위해 만들어졌습니다.

초기에는 [L&K](http://www.logickorea.co.kr/)에서 DW와 통계 시스템을 구축할 때, 여러 팀에서 사용하는 DB, File 등에 기록된 다양한 포멧의 데이터를 Elasticsearch와 MySql로 통합하기 위해 Javascript로 제작된 작은 코드로 제작되었습니다. 현재는 보다 다양한 저장소의 데이터를 가져오고, 가져온 데이터를 원하는 형태로 가공하여 저장할 수 있도록 개선되었습니다.

저장소의 데이터를 (SQL과 같은) 검색할 수 있는 방법이 있다면 원하는 데이터만 선별적으로 가져와 저장할 수 있고, 원하는 데이터를 추가 할 수도 있습니다. 예를들어 MySQL에서 데이터를 가져온다면 SQL을 사용하여 검색한 후 이를 가공하여 Elasticsearch 혹은 원하는 file 등에 저장할 수 있습니다.

현재 Collo는 아래의 같은 저장소를 지원합니다.

__읽기 가능한 저장소__

* MSSQL
* MySQL
* Elasticsearch
* Redis
* AWS S3
* File
* REST API

__쓰기 가능한 저장소__

* MSSQL
* MySQL
* Elasticsearch
* Redis
* File System
* Console

읽기 혹은 쓰기 시 grok, SQL, Elasticsearch DSL 등을 그대로 활용할 수 있습니다. 

Collo는 모든 데이터를 JSON 형태로 다루기 때문에 손쉽게 필요한 데이터들을 추가, 수정할 수 있습니다. 이는 첨부된 샘플을 통해 좀 더 상세히 설명하겠습니다.

또한 Collo는 관리 편의를 위해 TCP 10531번 포트를 이용하는 관리툴을 제공하고 있습니다. 하단의 "관리툴" 항목을 참고하세요.


## 활용 예

- 서로 다른 DB 간 전체 혹은 선별적 데이터 마이그레이션 
- DB의 내용을 전체 혹은 선별적으로 별도 파일에 기록
- AWS S3, local file 등의 내용을 DB 혹은 Elasticsearch에 기록
- HTTP로 전달된 JSON 포멧의 정보를 원하는 저장소에 기록


## 첫 샘플 실행하기

실행을 위해 [NodeJS](https://nodejs.org)와 [npm](https://www.npmjs.com/get-npm)을 설치하시기 바랍니다.

첫 번째 테스트에서는 웹 서버의 로그 파일 포맷 샘플인 __/samples/line_formated_sample.log__ 파일을 읽어 지정한 파일에 json 형태로 저장하고 동시에 console 화면에 출력하는 샘플입니다.

테스트를 위한 실행은 아래와 같이 실행하면 됩니다.

<pre><code> > node collo </code></pre>

결과는 아래와 유사하게 나올겁니다.

![test_result](/images/first-test-result.PNG)

실행결과를 console에서 볼 수 있으며, __/samples/today_file_yyyy-mm-dd.log__ 파일에서도 확인할 수 있습니다.


## Collo 의 구성

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

재사용을 위한 일부 코드를 제외하고 핵심 코드는 모두 collo.js에서 확인할 수 있습니다.


## 저장소와 작업 설정

첫 테스트에 사용된 저장소와 작업을 살펴보겠습니다.


### 저장소 

저장소를 설정하는 파일인 "/src/repos.json"의 내용은 아래와 같습니다.

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

(1) Collo의 한 저장소는 "저장소 이름"   : [ {저장소 설정}, {저장소 설정}] 형태로 설정할 수 있습니다. 하나의 저장소 이름 뒤에 여러 저장소를 지정할 경우 작업 시 지정된 작업을 저장소 설정 개수만큼 반복적으로 작업을 시행합니다. 저장소는 종류에 따라 지정된 포멧에 맞춰 세팅해야 합니다. 보다 상세한 정보는 [상세 예제보기](SETTING.md)를 참고하세요.

(2) "@__today" 는 오늘 날짜로 변환할 수 있는 예약어입니다. 이와 같은 Collo 전용 예약어들을 활용하면 데이터 구축 시 손쉽게 다양한 상황에 대처할 수 있습니다.

(3) 테스트를 위해 읽어온 정보를 console 화면에 바로 출력할 수 있습니다. "console"이라는 이름의 저장소를 위와 같이 정의하지 않아도 collo는 자동으로 구축하게 됩니다. console은 다른 용도의 저장소로 사용하지 말아주세요.



### 작업

저장소를 설정하는 파일인 "/src/jobs.json"의 내용은 아래와 같습니다.

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

__schedule__ : cron처럼 작업이 실행될 일정을 설정합니다. 위 예제에서는 2초에 한번씩 작업이 실행됩니다.

__from__ : 데이터를 가져올 저장소를 지정합니다. "repos.json"에 지정했던 "저장소 이름"을 입력합니다.

__get_query__ : __from__ 에서 데이터를 가져오는 조건을 지정합니다. 지정된 저장소의 종류에 맞게 쿼리를 작성해야 합니다.

(option)__get_query_param__ : __get_query__ 의 수행이 필요한 파라미터를 설정할 때 사용합니다.

(option)__filter__ : __get_query__ 의 결과값에 데이터를 추가할 때 사용합니다.

__to__ : 데이터를 전달할 저장소를 지정합니다. console 혹은 "repos.json"에 지정했던 "저장소 이름"을 입력합니다. 전달할 저장소를 다중으로 지정할 수 있습니다. 반드시 [] 로 감싸주세요.

__set_query__ : __to__ 에서 데이터를 삽입하는 쿼리를 지정합니다. 지정된 저장소의 종류에 맞게 쿼리를 작성해야 합니다. 전달할 저장소에 맞개 다중으로 지정할 수 있습니다. 반드시 [] 로 감싸주세요.

(option)__set_query_param__ : __set_query__ 의 수행이 필요한 파라미터를 설정할 때 사용합니다.

보다 상세한 정보는 [상세 예제보기](SETTING.md)를 참고하세요.


### 추가 샘플 확인 방법

./repo-jobs-samples 에는 여러 종류의 저장소를 활용하는 샘플이 포함되어 있습니다. 같은 이름을 가진 jobs-xxx.json 과 repos-xxx.json을 복사하여 ./src 폴더에 복사 후 각가의 이름을 jobs.json, repos.json 으로 수정 후 테스트 할 수 있습니다. 

MSSQL과 MySQL 저장소 테스트를 위해 ./samples의 "collo-mssql-sample-db.sql", "collo-mysql-sample-db.sql"를 각 DB에서 실행하여 테스트용 테이블을 제작 후 테스트 하면 됩니다.


### 주의사항

진행중인 데이터를 기록하기 위해 "./src/savedata.json"이라는 파일을 생성합니다. 만약 초기화가 필요한 경우 해당 파일을 지우거나 수정하여 사용할 수 있습니다.


## 관리툴

Collo가 제공하는 관리툴로 위 설정을 좀 더 쉽게 할 수 있으며, 기존의 작업을 멈추지 않고도 저장소와 작업을 추가 할 수 있습니다. 실행한 시스템에서 http://localhost:10531 로 접속하면 관리툴을 확인할 수 있습니다. 

툴의 상단에 "Dashboard", "Setting" 이렇게 두 개의 메뉴를 제공합니다. 


#### Dashboard

Dashboard에서는 현재 Collo의 상태를 확인할 수 있습니다. 
화면 중앙에는 실시간으로 기록중인 로그를 확인 할 수 있어 현재 어떤 작업들이 진행중인지, 에러가 발생하는지를 쉽게 확인할 수 있습니다.
하단의 Clear 버튼을 누르면 화면의 텍스트를 다 지울 수 있으며, 특정 길이를 넘어가면 자동으로 지워집니다. 

![tool-dashboard](/images/tool-dashboard.png)


#### Setting

Setting에서는 설정된 저장소와 작업을 수정/삭제하거나 새로운 저장소와 작업을 실시간으로 등록할 수 있습니다. 저장소와 작업을 추가/수정하면 Collo는 작업을 재시작하여 변경된 내용을 즉시 적용합니다.

![tool-repo](/images/tool-repo.PNG)

툴에서 저장소와 작업을 수정하고 추가/삭제하는 방법을 알아보겠습니다.

기존의 내용을 수정하기 위해서는 각 저장소 혹은 작업 위에 있는 세 개의 버튼을 사용합니다. 

![tool-button](/images/tool-button.PNG)

수정 전 버튼들은 위와 같이 비활성화 되어 있습니다. 저장소나 작업을 수정하면 아래와 같이 필요한 버튼들이 활성화 됩니다. 

![tool-button](/images/tool-apply.PNG)

__Cancel__ 을 누르면 수정된 내용을 삭제하고 처음 상태로 돌립니다. 

__Apply__ 를 누르면 수정된 내용을 저장하고 하단의 __Upload__ 버튼이 활성화 됩니다. 활성화된 __Upload__ 버튼을 누르면 Collo로 변경된 내용이 전달되고, Collo를 재시작되며 변경된 내용이 적용됩니다. 주의할 점은 저장소와 작업을 동시에 수정한 후 업데이트를 하는게 좋습니다. 실수로 작업만 수정하고 업데이트 하면 해당 작업에 사용된 새로운 저장소를 찾을 수 없을 수 있으니 주의하시기 바랍니다.

__Delete__ 버튼을 누르면 바로 삭제되면서 Collo가 재시작됩니다. 작업에 사용중인 저장소는 삭제할 수 없습니다.


## License infomation

__Collo__ is distributed under the terms and conditions of the MIT license.
