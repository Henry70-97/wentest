// api/auth.js
let users = {};

// Initialize users (in production, use a database)
function initUsers() {
    if (typeof window === 'undefined') {
        // Server-side initialization
        users = {
            'hankwane1@gmail.com': { 
                id: 'admin1', 
                email: 'hankwane1@gmail.com', 
                name: 'Administrator', 
                password: 'admin123', 
                role: 'admin', 
                realBalance: 10000, 
                demoBalance: 10000, 
                totalEarned: 0, 
                kycStatus: 'verified', 
                referralCode: 'ADMIN123', 
                bonusGiven: false,
                createdAt: new Date().toISOString()
            }
        };
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    initUsers();
    
    const { action } = req.query;
    const { email, password, name } = req.body;
    
    // Login
    if (action === 'login' && req.method === 'POST') {
        const user = users[email];
        if (user && user.password === password) {
            const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({ 
                success: true, 
                user: userWithoutPassword, 
                token 
            });
        }
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Signup
    if (action === 'signup' && req.method === 'POST') {
        if (users[email]) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        const newUser = {
            id: Date.now().toString(),
            email,
            name,
            password,
            role: 'user',
            realBalance: 0,
            demoBalance: 10000,
            totalEarned: 0,
            kycStatus: 'unverified',
            referralCode: email.slice(0, 8).toUpperCase(),
            bonusGiven: false,
            createdAt: new Date().toISOString()
        };
        users[email] = newUser;
        const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(200).json({ success: true, user: userWithoutPassword, token });
    }
    
    // Get user (with token validation)
    if (action === 'getUser' && req.method === 'GET') {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        // Simple token validation (in production, use JWT)
        const token = authHeader.split(' ')[1];
        const userId = Buffer.from(token, 'base64').toString().split(':')[0];
        const user = Object.values(users).find(u => u.id === userId);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({ success: true, user: userWithoutPassword });
        }
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    // Update balance
    if (action === 'updateBalance' && req.method === 'POST') {
        const { amount, type, isReal } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const userId = Buffer.from(token, 'base64').toString().split(':')[0];
        const user = Object.values(users).find(u => u.id === userId);
        
        if (user) {
            const field = isReal ? 'realBalance' : 'demoBalance';
            user[field] = (user[field] || 0) + amount;
            if (amount > 0) user.totalEarned = (user.totalEarned || 0) + amount;
            
            // Store updated user
            users[user.email] = user;
            
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({ success: true, user: userWithoutPassword });
        }
        return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
