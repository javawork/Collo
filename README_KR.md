# Collocō


## Collo 는 Collocō의 약어입니다.

Collo는 간단한 세팅을 통해 다양한 포멧으로 저장되어 여러 저장소로 흩어진 데이터들을 원하는 저장소로 손쉽게 모으기 위해 만들어졌습니다.

저희 회사([LnK](http://www.logickorea.co.kr/))에서 DW와 통계 시스템을 구축할 때, 여러 팀에서 사용하는 여러 DB, File 등에 기록된 다양한 포멧의 데이터를 Elasticsearch와 MySql로 통합하기 위해 Javascript로 제작된 작은 코드로 제작되었으며, 현재는 보다 다양한 저장소의 데이터를 가져오고 저장할 수 있도록 개선되었습니다. 

저장소의 데이터를 (SQL과 같은) 검색할 수 있는 방법이 있다면 원하는 데이터만 선별적으로 가져와 저장할 수 있고, 원하는 데이터를 추가 할 수도 있습니다. 예를들어 MySQL에서 데이터를 가져온다면 SQL을 사용하여 검색한 후 이를 가공하여 Elasticsearch, file 등에 저장할 수 있습니다.

현재 Collo는 아래의 같은 저장소를 지원합니다.
 읽기 가능한 저장소 : MSSQL, MySQL, Elasticsearch, Redis, File System, AWS S3
 쓰기 가능한 저장소 : MSSQL, MySQL, Elasticsearch, Redis, File System

Collo는 단계적으로 사용 가능한 저장소를 늘릴 예정입니다. 이에 대해서는 하단의 ToDo List에서 확인하실 수 있습니다.


### 활용 예

- 각기 다른 DB 간 마이그레이션을 할 때
- 파일에 기록되는 로그를 RDBMS 혹은 Elasticsearch, Redis 등으로 저장하고 싶을 때
- DB에 기록되는 데이터를 선별적으로 다른 저장소에 저장하고 싶을 때
- DB에 기록된 데이터를 쿼리를 통해 얻은 결과를 DB 혹은 S3 등에 저장하고 싶을 때

조회 혹은 저장할 때 grok, SQL, Elasticsearch DSL 등을 그대로 사용할 수 있어 여러 용도로 활용할 수 있습니다. 내부적으로 모든 데이터를 JOSN 형태로 다루기 때문에 손쉽게 필요한 기능들을 추가, 수정할 수 있습니다. 아래 샘플을 통해 좀 더 상세히 설명하겠습니다.


### 샘플 실행하기

실행을 위해 [NodeJS](https://nodejs.org)와 [npm](https://www.npmjs.com/get-npm)을 설치하시기 바랍니다.

테스트를 위한 실행은 아래와 같이 실행하면 됩니다.

<pre><code> node collo.js </code></pre>

테스트를 위해 두 개의 샘플 파일을 준비해 두었습니다. 

<pre><code>
/samples/line_formated_sample.log  // 웹 서버의 로그 포멧으로 제작된 샘플 파일입니다. grok을 사용해서 데이터를 읽어오는 샘플을 볼 수 있습니다.
/samples/sample.json  // json 포멧으로 제작된 샘플 파일입니다.
</code></pre>

### MySql, MSSQL과 연동하기




### 실행하기

“collo”를 실행하려면 NodeJS가 필요합니다. Collo를 설치한 폴더에서 아래와 같이 실행하세요.
>  npm start

저장소와 작업을 등록하면 Collo를 실행할 수 있습니다.
"repos.json"파일에 읽거나 쓸 저장소를 등록하고, "jobs.json"파일에 데이터를 읽거나 쓸 작업을 등록하면 됩니다.
아래 샘플과 포함된 링크를 읽어보세요.
 
 
## 설정하기 

### Setting repositories - [ repos.js ]

<pre><code>
 <b>“저장소_이름”</b>: {
   <b>name</b> : “저장소_별명_파라미터에_이_별명을_활용할_수_있습니다.”,
   <b>type</b> : “저장소 타입을 입력하세요. MSSQL이라면 ‘mssql’이라고 입력하세요.”,
   <b>config</b> :  { 
    …   // 저장소에 따른 상세 설명을 참고하세요.
   }
 }
</code></pre>

### Setting jobs - [ jobs.js ]

<pre><code>
 <b>“작업이름”</b> : {
   <b>schedule</b> : “* * * * * *”, // “cron” 설정과 같습니다.
   <b>from</b> : “‘repos.js’파일에서 데이터를 읽어 올 ‘저장소_이름’을 이곳에 입력하세요.”,
   <b>get_query</b> :  “데이터를 읽어 올 쿼리 혹은 명령어를 입력하세요.”,
   <b>get_query_param</b> : “필요한 경우 ‘get_query’를 위해 몇몇 파라미터를 설정할 수 있습니다.”,
   <b>to</b> : “‘repos.js’파일에서 데이터를 저장 할 ‘저장소_이름’을 이곳에 입력하세요.”,
   <b>set_query</b> : “데이터를 저장 할 쿼리 혹은 명령어를 입력하세요.”,
   <b>set_query_param</b> : “필요한 경우 ‘set_query’를 위해 몇몇 파라미터를 설정할 수 있습니다.”
}
</code></pre>

저장소와 작업 설정을 위한 상세한 정보는 [이 문서](SETTING.md) 에서 확인할 수 있습니다.

### Management Tool

Collo는 관리툴을 지원합니다. 이를 통해 저장소와 작업 리스트를 설정할 수 있습니다. Collo를 실행한 시스템에서 http://localhost:10531 로 접속하면 관리툴을 확인할 수 있습니다. 

툴의 상단에 "Dashboard", "Setting" 이렇게 두 개의 메뉴를 제공합니다. 

#### Dashboard

Dashboard에서는 현재 Collo의 상태를 확인할 수 있습니다. 
화면 중앙에는 실시간으로 기록중인 로그를 확인 할 수 있어 현재 어떤 작업들이 진행중인지, 에러가 발생하는지를 쉽게 확인할 수 있습니다.
하단의 Clear 버튼을 누르면 화면의 텍스트를 다 지울 수 있으며, 특정 길이를 넘어가면 자동으로 지워집니다. 

![tool-dashboard](/images/tool-dashboard.png)

#### Setting

Setting에서는 설정된 저장소와 작업을 수정/삭제하거나 새로운 저장소와 작업을 실시간으로 등록할 수 있습니다. 저장소와 작업을 추가/수정하면 Collo는 nodemon에 의해 재실행되며 변경된 내용을 바로 적용하게 됩니다.

![tool-repo](/images/tool-repo.PNG)

저장소와 작업을 설정하는 방법에 대해서는 [이 문서](SETTING_KR.md) 에서 확인할 수 있습니다.


# Contributing

We encourage contributions of all kinds. If you would like to contribute in some way, please review our guidelines for contributing.

# License

MIT License
