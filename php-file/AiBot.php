<?php include '../php-file/topbar.php'; ?>
<?php include '../php-file/sidebar.php'; ?>

<style>
    html,
    body {
        height: 100%;
        margin: 0;
        background-color: #f8f9fc;
    }

    .chat-wrapper {
        min-height: calc(87vh - 87px);
        /* Adjust this based on your topbar+sidebar height */
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .chat-container {
        width: 75vw;
        height: 70vh;
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        padding: 20px;
    }

    .messages {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        background-color: #f8f9fa;
    }

    /* ✅ Chat Message Container */
    #messageBody {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* ✅ Message Style */
    .message {
        max-width: 75%;
        padding: 10px 15px;
        border-radius: 12px;
        line-height: 1.5;
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    /* ✅ User Bubble */
    .user {
        align-self: flex-end;
        background-color: #e7f1ff;
        color: #0d6efd;
    }

    /* ✅ Bot Bubble */
    .bot {
        align-self: flex-start;
        background-color: #d7f9e8;
        color: #198754;
    }
</style>

<div>
    <h4 class="text-center">AI chatBot</h4>
    <div class="chat-wrapper">
        <div class="chat-container">
            <div class="messages" id="messages">
                <table>
                    <tbody id="messageBody"></tbody>
                </table>
            </div>
            <div class="input-group">
                <input type="text" class="form-control" id="user-input" placeholder="Type your message...">
                <button class="btn btn-primary" id="send-btn">Send</button>
            </div>
        </div>
    </div>
</div>
<?php include '../php-file/footer.php'; ?>

<script>
    (function() {
        const getAIResponse = async () => {
            try {
                const message = $('#user-input').val();
                const response = await saveAjax(`${baseUrl}chat`, {
                    message: message
                })

                // Show user message
                const userMsgHTML = `<div class="message user"><strong>You:</strong> ${message}</div>`;
                $("#messageBody").append(userMsgHTML);
                $('#user-input').val("");
                // const userMessage = `<td style="width:700px" ></td><td class="text-end">${message}</td>`;
                // const aiMessage = `<td class="text-start">${response.data}</td> <td></td>`;
                // $("#messageBody").append(`<tr>${userMessage} </tr>`);
                // $("#messageBody").append(`<tr>${aiMessage}</tr>`);

                const botMsgHTML = `<div class="message bot"><strong>Bot:</strong> ${response.data}</div>`;
                $("#messageBody").append(botMsgHTML);

                $('.messages').scrollTop($('.messages')[0].scrollHeight);

            } catch (error) {
                console.error(error)
            }
        }


        $('#send-btn').click(function() {
            getAIResponse();
        })
    })()
</script>