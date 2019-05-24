# Collocō

## Collo 는 Collocō의 약어입니다.


Collo는 간단한 세팅을 통해 여러 포멧과 저장소로 흩여져 있는 당신의 데이터들을 원하는 저장소로 손쉽게 모을 수 있습니다.

원하는 저장소의 데이터를 검색할 수 있는 방법이 있다면 원하는 데이터만 선별적으로 가져올 수 있으며, 그 데이터를 수정하여 저장할 수 있고, 원하는 추가 데이터를 삽입하여 저장할 수 있습니다. 예를들어 MySQL에서 데이터를 가져온다면 SQL을 사용하여 검색한 후 데이터를 가공하여 저장할 수 있습니다.

Collo는 아래의 저장소에서 데이터를 읽을 수 있습니다.
 - MSSQL, MySQL, Elasticsearch, Redis, File System, AWS S3

Collo는 아래의 저장소에 데이터를 기록 할 수 있습니다.
- MSSQL, MySQL, Elasticsearch, Redis, File System

Collo는 오픈소스이므로 조금의 노력만 들인다면 손쉽게 새로운 저장소에 작업할 수 있도록 수정하여 사용할 수 있으며, 다른 사용자들을 위해 당신의 노력을 Collo에 공유해주시길 부탁드립니다.

# 사용하기

저장소와 작업을 등록하면 Collo를 실행할 수 있습니다.
"repos.json"파일에 읽거나 쓸 저장소를 등록하고, "jobs.json"파일에 데이터를 읽거나 쓸 작업을 등록하면 됩니다.
아래 샘플과 포함된 링크를 읽어보세요.

## Setting repositories - [ repos.js ]

<pre><code>
 <b>“저장소_이름”</b>: {
   <b>name</b> : “저장소_별명_파라미터에_이_별명을_활용할_수_있습니다.”,
   <b>type</b> : “저장소 타입을 입력하세요. MSSQL이라면 ‘mssql’이라고 입력하세요.”,
   <b>config</b> :  { 
    …   // 저장소에 따른 상세 설명을 참고하세요.
   }
 }
</code></pre>

## Setting jobs - [ jobs.js ]

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

## Run - [ collo.js ]

“collo”를 실행하려면 NodeJS가 필요합니다. Collo를 설치한 폴더에서 아래와 같이 실행하세요.
>  npm start

## Management Tool

Collo는 관리툴을 지원합니다. 이를 통해 저장소와 작업 리스트를 설정할 수 있습니다. Collo를 실행한 시스템에서는 http://localhost:10530 로 접속하면 관리툴을 확인할 수 있습니다. 

관리툴은 세 개의 메뉴로 나뉘어 있습니다. 

### Dashboard

### Repositories/Jobs

### Management


You can check some warnings and errors in “logs” folder. Of course you can see the logs on the management tool in realtime. 
You have to open the http port to connect to the management tool on your firewall. Check this link for detail informations.


# Contributing

We encourage contributions of all kinds. If you would like to contribute in some way, please review our guidelines for contributing.


# License

MIT License
