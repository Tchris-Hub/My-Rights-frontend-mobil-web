const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd2NicnVxdnl3YWtjdm9rbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDAyNzcsImV4cCI6MjA5MDYxNjI3N30.FO8vVOhmuwzjVi_GJYNKDaTa97KGfHT53jlyxhUoP4s';

async function test() {
    console.log('--- Testing secure legal-advisor proxy ---');
    const url = 'https://prwcbruqvywakcvoknai.supabase.co/functions/v1/legal-advisor';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
            },
            body: JSON.stringify({ 
                messages: [{ role: 'user', content: 'Say hello in one word' }],
                stream: false 
            }),
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

test();
