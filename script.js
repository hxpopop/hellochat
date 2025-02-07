async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const chatContent = document.getElementById('chat-content');

    // 显示用户输入的消息
    chatContent.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    
    // 清空输入框
    document.getElementById('user-input').value = '';

    try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://wishub-x1.ctyun.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer c157bd35e7d0427aaa98406a997469ec'
            },
            body: JSON.stringify({
                "model": "7ba7726dad4c4ea4ab7f39c7741aea68",
                "stream": true,
                "messages": [{ "role": "user", "content": userInput }]
            })
        });

        console.log('Response:', response);

        if(response.ok) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');
            let completeResponse = '';

            while(true) {
                const { done, value } = await reader.read();
                if(done) break;

                const chunk = decoder.decode(value, { stream: true });
                console.log('Chunk:', chunk);
                const lines = chunk.split('\n').map(l => l.trim()).filter(l => l.startsWith('data:') && l !== 'data:[DONE]');

                for(const line of lines) {
                    try {
                        const jsonData = JSON.parse(line.replace(/^data:/, ''));
                        if(jsonData.choices && jsonData.choices.length > 0) {
                            const content = jsonData.choices[0].delta.content || '';
                            completeResponse += content.replace("<think>", "").replace("</think>", "");
                        }
                    } catch(e) {
                        console.error("Failed to parse JSON:", line);
                    }
                }
            }

            // 显示回复
            chatContent.innerHTML += `<p><strong>Bot:</strong> ${completeResponse}</p>`;
        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Error during fetching:', error);
    }
}
