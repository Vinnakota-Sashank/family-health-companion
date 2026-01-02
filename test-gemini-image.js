
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Native fetch in Node 18+ includes FormData and Blob

async function test() {
    const imagePath = path.join(__dirname, 'test-prescription.jpg');

    if (!fs.existsSync(imagePath)) {
        console.error(`Error: Test image not found at ${imagePath}`);
        console.log("Please place a 'test-prescription.jpg' file in this directory to run the test.");
        return;
    }

    try {
        const fileBuffer = fs.readFileSync(imagePath);
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
        formData.append('image', blob, 'test-prescription.jpg');

        console.log("Sending request...");
        const response = await fetch('http://localhost:3001/api/parse-prescription-image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

test();
