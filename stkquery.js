// api/lipana/stkquery.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { checkoutRequestId } = req.query;
    
    if (!checkoutRequestId) {
        return res.status(400).json({ error: 'CheckoutRequestID required' });
    }
    
    const LIPANA_QUERY_URL = 'https://lipana.dev/api/stkquery';
    const API_KEY = process.env.LIPANA_API_KEY || 'your_lipana_api_key';
    
    try {
        const response = await fetch(`${LIPANA_QUERY_URL}?checkoutRequestId=${checkoutRequestId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const result = await response.json();
        
        // 0 = success, 1037 = pending, other = failed
        return res.status(200).json(result);
    } catch (error) {
        console.error('Lipana query error:', error);
        return res.status(500).json({ ResultCode: '1037', ResultDesc: 'Pending' });
    }
}
