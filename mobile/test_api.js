const axios = require('axios');
axios.post('http://127.0.0.1:8000/api/stores/manage', {
  name: "Test Store",
  category: "RETAIL",
  business_type: "Electronics",
  store_type: "RETAIL",
  description: "Test description",
  latitude: 9.0192,
  longitude: 38.7525
}, {
  headers: {
    'Cookie': '__Secure-better-auth.session_token=SfJhLShU6dmSDY6M0Aoi6DB7gV3rm7KJ.3kBuDt9VG/JXgd5pojP2IPSWo6Avo77T+NRSt9KEDHQ='
  }
}).then(res => console.log(res.data)).catch(e => console.log(e.response.data));
