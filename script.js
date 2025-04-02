
    
      
      
        
            document.addEventListener("DOMContentLoaded", function () {
                const chatsContainer = document.querySelector(".chats-container");
                const promptForm = document.querySelector(".prompt-form");
                const promptInput = promptForm.querySelector(".prompt-input");
                const suggestions = document.querySelector(".suggestions");
            
              console.log(API_KEY)
                const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            
                let userMessage = "";
                let chatHistory = [];
            
                const createMsgElement = (content, classes) => {
                    const div = document.createElement("div");
                    div.classList.add("message", ...classes);
                    div.innerHTML = content;
                    return div;
                };
            
                const generateResponse = async (botMsgDiv) => {
                    chatHistory.push({
                        role: "user",
                        parts: [{ text: userMessage }],
                    });
            
                    try {
                        const response = await fetch(API_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contents: chatHistory }),
                        });
            
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error.message);
            
                        const responseText = data.candidates[0].content.parts[0].text.trim();
            
                        chatHistory.push({
                            role: "model",
                            parts: [{ text: responseText }],
                        });
            
                        botMsgDiv.querySelector(".message-text").textContent = responseText;
                    } catch (error) {
                        console.error("API Error:", error);
                        botMsgDiv.querySelector(".message-text").textContent = "Sorry, I encountered an error.";
                    }
                };
            
                const handleFormSubmit = (e) => {
                    e.preventDefault();
                    userMessage = promptInput.value.trim();
                    if (!userMessage) return;
            
                    promptInput.value = "";
            
                    if (suggestions) {
                        suggestions.style.display = "none";
                    }
            
                    if (chatsContainer) {
                        chatsContainer.classList.add("show-messages");
                        const userMsgHTML = `<p class="message-text">${userMessage}</p>`;
                        const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
                        chatsContainer.appendChild(userMsgDiv);
            
                        setTimeout(() => {
                            const botMsgHTML = `<span class="avatar-wrapper"><img src="Gemini.png" class="avatar"></span><p class="message-text">Just a sec...</p>`;
                            const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
                            chatsContainer.appendChild(botMsgDiv);
                            generateResponse(botMsgDiv);
                        }, 600);
                    }
                };
            
                if (promptForm) {
                    promptForm.addEventListener("submit", handleFormSubmit);
                }
            
                const clearChatButton = document.getElementById("clear-chat-btn");
                if (clearChatButton) {
                    clearChatButton.addEventListener("click", function () {
                        if (chatsContainer) {
                            chatsContainer.innerHTML = "";
                            chatsContainer.classList.remove("show-messages");
                        }
                        chatHistory = [];
                        if (suggestions) {
                            suggestions.style.display = "grid";
                        }
                    });
                }
            
                const addFileButton = document.getElementById("add-file-btn");
                if (addFileButton) {
                    addFileButton.addEventListener("click", function () {
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.multiple = true;
                        fileInput.click();
            
                        fileInput.addEventListener("change", function (event) {
                            const files = event.target.files;
                            if (files && files.length > 0) {
                                for (let i = 0; i < files.length; i++) {
                                    const file = files[i];
                                    let fileInfoHTML = `
                                        <p><strong>File Name:</strong> ${file.name}</p>
                                        <p><strong>File Size:</strong> ${file.size} bytes</p>
                                        <p><strong>File Type:</strong> ${file.type}</p>
                                    `;
            
                                    if (file.type.startsWith('text/')) {
                                        const reader = new FileReader();
                                        reader.onload = function (event) {
                                            fileInfoHTML += `<p><strong>File Content:</strong></p><pre>${event.target.result}</pre>`;
                                            const fileMsgDiv = createMsgElement(fileInfoHTML, "file-message");
                                            chatsContainer.appendChild(fileMsgDiv);
                                        };
                                        reader.readAsText(file);
                                    } else {
                                      const fileMsgDiv = createMsgElement(fileInfoHTML, "file-message");
                                      chatsContainer.appendChild(fileMsgDiv);
                                    }
                                }
                            }
                        });
                    });
                }
            });