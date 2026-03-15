const fetch = require('node-fetch'); // wait, standard fetch is available in node 18+

async function runTest() {
  try {
    const response = await fetch('http://localhost:5001/api/registrations/by-pnr/8543542442', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBjOTY5YzA5LTQyZjgtNDlhNC1iMWMzLWM1M2RiYjM0MmM5NyIsImVtYWlsIjoiYWRtaW5AeWF0cmEuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzczNTQ4MDY5LCJleHAiOjE3NzM2MzQ0Njl9.kjyvkCvEINlGIcq355pYMHrTepFEm7zVzzBUMLd2bUQ'
      }
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

runTest();
