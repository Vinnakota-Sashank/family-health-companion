

// Native fetch in Node 18+


async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/parse-prescription-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Rx: Dolo 650mg, 1 tablet twice daily after food for 3 days. Amoxicillin 500mg, 1 cap thrice daily for 5 days."
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

test();
