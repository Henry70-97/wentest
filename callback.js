// api/lipana/callback.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { Body } = req.body;
    const resultCode = Body?.stkCallback?.ResultCode;
    const checkoutRequestId = Body?.stkCallback?.CheckoutRequestID;
    const amount = Body?.stkCallback?.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
    
    console.log(`Payment callback received:`, { resultCode, checkoutRequestId, amount });
    
    // Here you would update your database with the payment result
    // You can use Vercel Postgres, Upstash Redis, or any other storage
    
    if (resultCode === '0') {
        // Payment successful - credit user's account
        console.log(`Payment successful for ${checkoutRequestId}: KES ${amount}`);
    } else {
        console.log(`Payment failed for ${checkoutRequestId}: ${Body?.stkCallback?.ResultDesc}`);
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
}
