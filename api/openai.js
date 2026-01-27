// Vercel Serverless Function to proxy OpenAI API requests
// This keeps the API key secure on the server-side

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS for your domain (adjust if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { prompt, model } = req.body;

        // Validate input
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get API key from environment variable
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // List of models to try in order
        const models = model ? [model] : ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
        let lastError = null;

        // Try each model until one succeeds
        for (const currentModel of models) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: currentModel,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7
                    })
                });

                const data = await response.json();

                // Check for OpenAI API errors
                if (data.error) {
                    throw new Error(data.error.message);
                }

                // Check for valid response
                if (!data.choices || !data.choices[0]) {
                    throw new Error('No response from OpenAI');
                }

                // Success! Return the response
                return res.status(200).json({
                    success: true,
                    response: data.choices[0].message.content.trim(),
                    model: currentModel
                });

            } catch (error) {
                console.warn(`Failed with model ${currentModel}:`, error.message);
                lastError = error;
                // Continue to next model
            }
        }

        // All models failed
        throw lastError || new Error('All models failed');

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate response'
        });
    }
}
