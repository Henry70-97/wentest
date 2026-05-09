export default async function handler(req, res) {
  // Enable CORS for browser requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

  // Validation
  if (!phoneNumber || !amount || !accountReference) {
    return res.status(400).json({
      error: 'Missing required fields: phoneNumber, amount, accountReference'
    });
  }

  // Format Kenyan phone number to 254XXXXXXXXX
  let formattedPhone = phoneNumber.toString().trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }

  // Validate amount is positive number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    const response = await fetch('https://api.lipana.dev/api/v1/stkpush', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LIPANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount: numericAmount,
        accountReference: accountReference,
        transactionDesc: transactionDesc || 'Payment',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lipana.dev returns error details in `message` or `error`
      throw new Error(data.message || data.error || 'STK push failed');
    }

    // Success response
    res.status(200).json({
      success: true,
      data: data,
      message: 'STK push initiated. Check your phone for M-Pesa prompt.'
    });
  } catch (error) {
    console.error('STK Push Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to initiate STK push'
    });
  }
}
