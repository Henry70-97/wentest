// api/lipana/stkpush.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { amount, phone, accountRef } = req.body;
    
    // Validate input
    if (!amount || amount < 10) {
        return res.status(400).json({ error: 'Amount must be at least KES 10' });
    }
    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: 'Valid phone number required' });
    }
    
    // Lipana.dev API endpoint
    const LIPANA_API_URL = 'https://lipana.dev/api/stkpush';
    const API_KEY = process.env.LIPANA_API_KEY || 'your_lipana_api_key';
    const SHORTCODE = process.env.LIPANA_SHORTCODE || 'your_shortcode';
    const PASSKEY = process.env.LIPANA_PASSKEY || 'your_passkey';
    const CALLBACK_URL = `${process.env.VERCEL_URL || 'https://your-domain.vercel.app'}/api/lipana/callback`;
    
    try {
        const response = await fetch(LIPANA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                shortcode: SHORTCODE,
                passkey: PASSKEY,
                amount: amount,
                phone: phone,
                account_ref: accountRef,
                callback_url: CALLBACK_URL
            })
        });
        
        const result = await response.json();
        
        if (result.success || result.ResponseCode === '0') {
            return res.status(200).json({ 
                success: true, 
                CheckoutRequestID: result.CheckoutRequestID || result.merchant_request_id 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: result.errorMessage || result.message || 'STK Push failed' 
            });
        }
    } catch (error) {
        console.error('Lipana API error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
