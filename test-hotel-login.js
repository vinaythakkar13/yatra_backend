const fetch = require('node-fetch');

async function runTest() {
  try {
    const response = await fetch('http://localhost:5001/api/auth/hotel-login', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        "login_id": "HTL-0003",
        "password": "Bqjbd8uwyH%p"
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

runTest();
