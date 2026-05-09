export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

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

    res.status(200).json({
      success: true,
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
