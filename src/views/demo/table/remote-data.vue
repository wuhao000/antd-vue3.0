<template>
  <a-table
      :columns="columns"
      :row-key="record => record.login.uuid"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange">
    <template v-slot:name="name"> {{ name.first }} {{ name.last }} </template>
  </a-table>
</template>
<script>
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      width: '20%',
      slots: { customRender: 'name' },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filters: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
      ],
      width: '20%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
  ];

  export default {
    name: 'TableRemoteData',
    data() {
      return {
        data: [],
        pagination: {},
        loading: false,
        columns,
      };
    },
    mounted() {
      this.fetch();
    },
    methods: {
      handleTableChange({pagination, filters, sorter}) {
        const pager = { ...this.pagination };
        pager.current = pagination.current;
        this.pagination = pager;
        this.fetch({
          results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters,
        });
      },
      fetch(params = {}) {
        this.loading = true;
        setTimeout(() => {
          const data =
              {"results":[{"gender":"male","name":{"title":"Mr","first":"Jake","last":"Moore"},"location":{"street":{"number":9170,"name":"Lake Terrace"},"city":"Timaru","state":"Tasman","country":"New Zealand","postcode":46833,"coordinates":{"latitude":"64.5571","longitude":"-162.5024"},"timezone":{"offset":"+4:30","description":"Kabul"}},"email":"jake.moore@example.com","login":{"uuid":"88ae7dc6-1cb0-4caf-89dd-9f47fa7398c2","username":"ticklishsnake659","password":"miranda","salt":"fWSbUN8X","md5":"3ea00e8d708cf4b7b8c9627191eb2c1a","sha1":"2c96c87256d94db34c233d41723a2ca7a550f97f","sha256":"dfb630f5dd88f1783d015a78e3b8f932622611da2a4fe54992c850fa19208bd4"},"dob":{"date":"1997-01-24T22:43:38.305Z","age":23},"registered":{"date":"2007-08-20T19:09:16.633Z","age":13},"phone":"(964)-155-7167","cell":"(329)-459-6778","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/men/49.jpg","medium":"https://randomuser.me/api/portraits/med/men/49.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/49.jpg"},"nat":"NZ"},{"gender":"female","name":{"title":"Miss","first":"Bobbie","last":"Perkins"},"location":{"street":{"number":21,"name":"Depaul Dr"},"city":"Mesquite","state":"Idaho","country":"United States","postcode":48931,"coordinates":{"latitude":"24.8393","longitude":"85.4471"},"timezone":{"offset":"+6:00","description":"Almaty, Dhaka, Colombo"}},"email":"bobbie.perkins@example.com","login":{"uuid":"63f78fab-cdfe-41b0-8028-365e93a5d4ee","username":"whitelion956","password":"tracy","salt":"t4JlNv2r","md5":"7751b9183bbc4429d31d8f91324042b4","sha1":"da7262f04ff4fac14f6ac2041c93d964588132a6","sha256":"0d45663c77b5f59a47bb358696a2b3ca1aa04a2563a7f2d6a83165b55c1a8b05"},"dob":{"date":"1980-04-06T10:01:58.768Z","age":40},"registered":{"date":"2017-09-05T04:32:10.967Z","age":3},"phone":"(296)-597-1314","cell":"(347)-244-8499","id":{"name":"SSN","value":"008-01-2333"},"picture":{"large":"https://randomuser.me/api/portraits/women/21.jpg","medium":"https://randomuser.me/api/portraits/med/women/21.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/21.jpg"},"nat":"US"},{"gender":"male","name":{"title":"Mr","first":"Martin","last":"Adams"},"location":{"street":{"number":6321,"name":"Church Street"},"city":"Longford","state":"South Dublin","country":"Ireland","postcode":15241,"coordinates":{"latitude":"9.8761","longitude":"162.6490"},"timezone":{"offset":"-3:00","description":"Brazil, Buenos Aires, Georgetown"}},"email":"martin.adams@example.com","login":{"uuid":"ae34e98f-c152-4767-8477-d7ee00c02355","username":"whitecat912","password":"scratch","salt":"aBnsBYnM","md5":"60bcf64bb62dd5d0031fc6143e82e012","sha1":"d0cb125decd2aae50102e5c8be85f5dc8055d701","sha256":"21e4d3f14579822a4097ff7f4926db941721d8fb16308ec83f7f5d20cd2af61e"},"dob":{"date":"1962-02-18T00:08:33.814Z","age":58},"registered":{"date":"2018-11-04T04:07:46.447Z","age":2},"phone":"061-058-2081","cell":"081-906-2514","id":{"name":"PPS","value":"4666819T"},"picture":{"large":"https://randomuser.me/api/portraits/men/66.jpg","medium":"https://randomuser.me/api/portraits/med/men/66.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/66.jpg"},"nat":"IE"},{"gender":"female","name":{"title":"Mrs","first":"Maya","last":"Fortin"},"location":{"street":{"number":5470,"name":"Lake of Bays Road"},"city":"Cartwright","state":"Manitoba","country":"Canada","postcode":"E8C 2N0","coordinates":{"latitude":"-25.2007","longitude":"34.0219"},"timezone":{"offset":"0:00","description":"Western Europe Time, London, Lisbon, Casablanca"}},"email":"maya.fortin@example.com","login":{"uuid":"4a05a19d-0073-447c-b9cf-2e5fac09d40c","username":"beautifuldog501","password":"linkin","salt":"TRXqVKf3","md5":"7b1fe49eb55df88e61e4bd3cd64cfc0c","sha1":"de6caee09192857063aa137d66ec7c56ca54be6c","sha256":"b4b4600ba7c966ec96fc6f99e37d3767e31bfcabcd588fe463b37fd59790d116"},"dob":{"date":"1989-06-09T15:26:42.983Z","age":31},"registered":{"date":"2017-01-04T02:53:42.960Z","age":3},"phone":"974-707-9970","cell":"485-949-9584","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/59.jpg","medium":"https://randomuser.me/api/portraits/med/women/59.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/59.jpg"},"nat":"CA"},{"gender":"female","name":{"title":"Ms","first":"Begüm","last":"Poçan"},"location":{"street":{"number":2323,"name":"Talak Göktepe Cd"},"city":"İstanbul","state":"Manisa","country":"Turkey","postcode":22619,"coordinates":{"latitude":"-57.7326","longitude":"159.0690"},"timezone":{"offset":"+5:30","description":"Bombay, Calcutta, Madras, New Delhi"}},"email":"begum.pocan@example.com","login":{"uuid":"0b39177a-aad1-4f2e-84a7-89222bbc4c91","username":"angrymouse628","password":"swim","salt":"jqQQNUqk","md5":"9d9120a9d27d4c0edb450150ece2c798","sha1":"258a33cc934f5a77a42f60b7b25eaa06d6c29ad1","sha256":"694097466796dfaaa96b558cda3f47de05d06bd7f7c4d3c1e238895c766f423c"},"dob":{"date":"1978-01-22T13:57:55.503Z","age":42},"registered":{"date":"2004-08-20T22:41:33.732Z","age":16},"phone":"(670)-505-1883","cell":"(117)-391-9969","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/39.jpg","medium":"https://randomuser.me/api/portraits/med/women/39.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/39.jpg"},"nat":"TR"},{"gender":"male","name":{"title":"Mr","first":"Theo","last":"Hall"},"location":{"street":{"number":8590,"name":"Kaikorai Valley Road"},"city":"Blenheim","state":"Bay of Plenty","country":"New Zealand","postcode":70298,"coordinates":{"latitude":"68.7471","longitude":"16.0563"},"timezone":{"offset":"+4:30","description":"Kabul"}},"email":"theo.hall@example.com","login":{"uuid":"137dd9fc-7c1c-4efb-97d8-f6ff8e72c138","username":"ticklishelephant477","password":"20002000","salt":"6bpEr6KQ","md5":"a9bc93053bd25544b57e6b2bd904c1d5","sha1":"652f7800150b5b7d903c0a9871f845954cbe85e9","sha256":"50d5fc100dd1a27bde6d11a6b466e79e6eb94e42b65080c15449eae3b1b2c870"},"dob":{"date":"1975-05-28T02:32:34.294Z","age":45},"registered":{"date":"2010-08-20T11:24:27.556Z","age":10},"phone":"(937)-164-1118","cell":"(288)-939-7117","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/men/88.jpg","medium":"https://randomuser.me/api/portraits/med/men/88.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/88.jpg"},"nat":"NZ"},{"gender":"female","name":{"title":"Ms","first":"Nieves","last":"Saez"},"location":{"street":{"number":2974,"name":"Calle del Arenal"},"city":"Valencia","state":"Castilla y León","country":"Spain","postcode":78691,"coordinates":{"latitude":"-79.3477","longitude":"153.7581"},"timezone":{"offset":"-7:00","description":"Mountain Time (US & Canada)"}},"email":"nieves.saez@example.com","login":{"uuid":"f2bdb346-8224-4baa-b42e-0a9926ac0818","username":"blackgoose326","password":"nikki1","salt":"3d08jpvf","md5":"3c333edf3e1b1cfbd3e6c5818b94ff19","sha1":"6a7b7e566086c1723d394271394d87b6d42c7e05","sha256":"457f7c5252875d3f184ec639ab3026b12d414e31d6b934a35f738770bbdcff28"},"dob":{"date":"1992-02-28T01:34:44.956Z","age":28},"registered":{"date":"2004-03-19T21:34:34.814Z","age":16},"phone":"973-751-901","cell":"626-317-542","id":{"name":"DNI","value":"35865771-A"},"picture":{"large":"https://randomuser.me/api/portraits/women/43.jpg","medium":"https://randomuser.me/api/portraits/med/women/43.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/43.jpg"},"nat":"ES"},{"gender":"male","name":{"title":"Mr","first":"Mason","last":"Gregory"},"location":{"street":{"number":465,"name":"W Campbell Ave"},"city":"Maitland","state":"South Australia","country":"Australia","postcode":559,"coordinates":{"latitude":"-60.5032","longitude":"130.8436"},"timezone":{"offset":"-7:00","description":"Mountain Time (US & Canada)"}},"email":"mason.gregory@example.com","login":{"uuid":"d512b5f2-feae-4e1e-bad6-11ae0374e9a0","username":"bluerabbit369","password":"samsam","salt":"Zm4tUhEd","md5":"0f7a2cbab893ae377bc28f35bd90778b","sha1":"80124a91ade3d46bf6a9aa4b9f0edcedace0be7c","sha256":"9e2533a0fd6043c9edc3ab8e18925db0093275323e438e859c6f66122d3cce7b"},"dob":{"date":"1973-12-02T00:31:49.991Z","age":47},"registered":{"date":"2003-11-06T07:57:39.258Z","age":17},"phone":"00-8191-2269","cell":"0416-938-896","id":{"name":"TFN","value":"877221699"},"picture":{"large":"https://randomuser.me/api/portraits/men/96.jpg","medium":"https://randomuser.me/api/portraits/med/men/96.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/96.jpg"},"nat":"AU"},{"gender":"female","name":{"title":"Mrs","first":"Mary","last":"Neal"},"location":{"street":{"number":6813,"name":"Central St"},"city":"Fresno","state":"New Hampshire","country":"United States","postcode":98169,"coordinates":{"latitude":"62.0898","longitude":"-85.5285"},"timezone":{"offset":"+4:00","description":"Abu Dhabi, Muscat, Baku, Tbilisi"}},"email":"mary.neal@example.com","login":{"uuid":"697ef5c2-a632-42c3-adf6-ec21b6dbdd34","username":"sadrabbit839","password":"father","salt":"RXqiF8H4","md5":"47c8a014b9d6118f5987e1f75b032275","sha1":"d7e9709136e5e9c6f218e88338b9d5902790e3f1","sha256":"07033785f464e0adf039694ffe51f24435caa1350ebe0f7b92453d47baefd636"},"dob":{"date":"1949-10-01T10:23:13.504Z","age":71},"registered":{"date":"2010-03-20T08:44:19.564Z","age":10},"phone":"(994)-268-1003","cell":"(480)-917-1887","id":{"name":"SSN","value":"113-49-8370"},"picture":{"large":"https://randomuser.me/api/portraits/women/48.jpg","medium":"https://randomuser.me/api/portraits/med/women/48.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/48.jpg"},"nat":"US"},{"gender":"female","name":{"title":"Ms","first":"Ava","last":"Martin"},"location":{"street":{"number":2543,"name":"9th St"},"city":"Lafontaine","state":"Newfoundland and Labrador","country":"Canada","postcode":"X8F 3M5","coordinates":{"latitude":"44.1248","longitude":"151.2950"},"timezone":{"offset":"+10:00","description":"Eastern Australia, Guam, Vladivostok"}},"email":"ava.martin@example.com","login":{"uuid":"5ce0ff24-51a2-454e-97c5-b82f013a51b8","username":"sadkoala398","password":"biteme","salt":"UvRhfKvQ","md5":"93dfb3861d8193035bcd191e0f2e10af","sha1":"f0384ace23abc7ac9b09840229ad3a6688ed567b","sha256":"bde78158c0f261e5b5ae5f51232c6330402a6feb9fa3e632fbc16f6599fad98b"},"dob":{"date":"1956-08-28T04:57:34.442Z","age":64},"registered":{"date":"2016-10-20T13:28:17.118Z","age":4},"phone":"296-799-2715","cell":"055-079-2681","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/85.jpg","medium":"https://randomuser.me/api/portraits/med/women/85.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/85.jpg"},"nat":"CA"}],"info":{"seed":"6ff368cc7af0f286","results":10,"page":1,"version":"1.3"}};
          const pagination = { ...this.pagination };
          // Read total count from server
          // pagination.total = data.totalCount;
          pagination.total = 200;
          this.loading = false;
          this.data = data.results;
          this.pagination = pagination;
        }, 200);
      },
    },
  };
</script>
