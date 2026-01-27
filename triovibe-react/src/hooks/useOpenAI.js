import { useState } from 'react';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key_v1';

export const useOpenAI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getApiKey = () => {
        return import.meta.env.VITE_OPENAI_API_KEY;
    };

    const generateReply = async (reviewText, reviewerName, tone = 'Professional', length = 'Short') => {
        const apiKey = getApiKey();
        if (!apiKey) {
            setError('API Key required');
            return null;
        }

        setLoading(true);
        setError(null);

        // Map UI lengths to specific word counts
        const lengthPromptMap = {
            'Short': 'under 30 words',
            'Medium': 'between 30 and 60 words',
            'Long': 'detailed and around 80 words'
        };

        const lengthInstruction = lengthPromptMap[length] || 'concise';

        const prompt = `
            You are a customer service representative.
            Write a ${tone.toLowerCase()} reply to this review from "${reviewerName}".
            The reply should be ${lengthInstruction}.
            
            Review: "${reviewText}"
            
            Reply:
        `;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'OpenAI API Error');
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err) {
            console.error('OpenAI Error:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { generateReply, loading, error };
};
