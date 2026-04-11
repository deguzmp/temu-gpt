const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000; // We will run the server on port 3000 by default

// --- Middleware Setup ---

// This tells Express to serve all static files (HTML, CSS, JS images)
// from the 'public' directory. When a user hits '/', Express looks for public/index.html.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- API Endpoint for the Token ---
// (Keeping this for compatibility, but moving logic to /api/chat is better)
app.get('/api/token', (req, res) => {
    try {
        const token = fs.readFileSync(path.join(__dirname, 'token'), 'utf8').trim();
        res.json({ token });
    } catch (error) {
        console.error("Error reading token file:", error);
        res.status(500).json({ error: "Could not read token file" });
    }
});

// --- Proxy Endpoint for LM Studio ---
app.post('/api/chat', async (req, res) => {
    try {
        const token = fs.readFileSync(path.join(__dirname, 'token'), 'utf8').trim();
        
        // Use environment variable for LM Studio host if available (useful for Docker)
        const LM_STUDIO_HOST = process.env.LM_STUDIO_HOST || "localhost";
        const LM_STUDIO_URL = `http://${LM_STUDIO_HOST}:1234/v1/chat/completions`;

        const response = await fetch(LM_STUDIO_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).send(errorText);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error proxying to LM Studio:", error);
        res.status(500).json({ error: "Could not connect to LM Studio API. Is it running?" });
    }
});


// --- Server Start ---

app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================================');
    console.log('🚀 LM Studio Web App Server running!');
    console.log(`🌐 Access your application at: http://localhost:${PORT}`);
    console.log('✅ Make sure LM Studio is running on http://localhost:1234!');
    console.log('=================================================');
});

