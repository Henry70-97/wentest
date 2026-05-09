export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { checkoutRequestID } = req.body;

  if (!checkoutRequestID) {
    return res.status(400).json({ error: 'Missing checkoutRequestID' });
  }

  try {
    const response = await fetch('https://api.lipana.dev/api/v1/stkquery', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LIPANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutRequestID: checkoutRequestID,
      }),
    });

    const data = await response.json();

    // Forward the exact response from Lipana.dev
    res.status(200).json({
      success: response.ok,
      data: data
    });
  } catch (error) {
    console.error('STK Query Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
