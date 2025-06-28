// API Test Script
const testApiCall = async () => {
  const apiKey = 'd3468440-4124-45e2-a0ff-13d8f89bec42';
  const pubUserId = 'MomentScienceUSPDemo';
  
  const requestBody = {
    placement: 'checkout_confirmation_page',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    ip: '192.168.1.1',
    adpx_fp: '12345678-1234-4567-8901-123456789012',
    pub_user_id: pubUserId,
    dev: '1',
    membershipID: 'A45GRE987343PKD'
  };

  try {
    console.log('Making API call to:', `https://api-staging.adspostx.com/native/v2/offers.json?api_key=${apiKey}`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`https://api-staging.adspostx.com/native/v2/offers.json?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log('Response keys:', Object.keys(data));
    console.log('Offers found:', data.offers ? data.offers.length : 'No offers property');

  } catch (error) {
    console.error('Network Error:', error.message);
  }
};

testApiCall();
