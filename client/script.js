let socket = io.connect();

const registerModal = document.querySelector(".register");
const loginModal = document.querySelector(".login");

const registerModalLink = document.querySelector(".register .link");
const loginModalLink = document.querySelector(".login .link");

const registerModalButton = document.querySelector(".register button");
const loginModalButton = document.querySelector(".login button");

const chatbox = document.querySelector(".chatbox");
const chatboxUsernameEl = document.querySelector(".chatbox .chatbox__input h3");
const chatboxCheckboxAllEl = document.querySelector(".chatbox .message-to-all");
const chatboxCheckboxSelfEl = document.querySelector(".chatbox .message-to-self");
const chatboxTextarea = document.querySelector(".chatbox textarea");
const chatboxSubmitBtn = document.querySelector(".chatbox .chatbox__btn");
const chatboxOutput = document.querySelector(".chatbox .chatbox__output");
const chatboxLogoutBtn = document.querySelector(".chatbox .chatbox__logout");
const chatboxOnlineUsersList = document.querySelector(".chatbox .chatbox__online-users ul");

const loadLoginModal = () => {
    registerModal.style.display = "none";
    loginModal.style.display = "flex";
}

const loadRegisterModal = () => {
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
}

const register = () => { 
    let username = document.querySelector(".register .register__username").value;
    let password = document.querySelector(".register .register__password").value;
    let confirmPassword = document.querySelector(".register .register__confirm-password").value;

    if (password === confirmPassword) {
        let loginCredentials = {
            username: username,
            password: password
        }
        localStorage.setItem(`loginCredentials_${username}`, JSON.stringify(loginCredentials));
        document.querySelector(".register .register__succes").style.maxHeight = "50px";
        document.querySelector(".register .register__succes").style.marginBottom = "1rem";
        setTimeout(() => {
            document.querySelector(".register .register__succes").style.maxHeight = "0";
            document.querySelector(".register .register__succes").style.marginBottom = "0";
            loadLoginModal();
        }, 4000);
    } else {
        document.querySelector(".register .register__password").classList.add("warning");
        document.querySelector(".register .register__confirm-password").classList.add("warning");
        document.querySelector(".register .register__warning").style.maxHeight = "50px";
        document.querySelector(".register .register__warning").style.marginBottom = "1rem";

        setTimeout(() => {
            document.querySelector(".register .register__password").classList.remove("warning");
            document.querySelector(".register .register__confirm-password").classList.remove("warning");
            document.querySelector(".register .register__warning").style.maxHeight = "0";
            document.querySelector(".register .register__warning").style.marginBottom = "0";
        }, 4000);
    }
}

const login = () => {
    let username = document.querySelector(".login .login__username").value;
    let password = document.querySelector(".login .login__password").value;

    if (localStorage.getItem(`loginCredentials_${username}`)){
        let loginCredentials = JSON.parse(localStorage.getItem(`loginCredentials_${username}`));
        if (loginCredentials.password === password) {
            document.querySelector(".login .login__succes").style.maxHeight = "50px";
            document.querySelector(".login .login__succes").style.marginBottom = "1rem";
            setTimeout(() => {
                document.querySelector(".login .login__succes").style.maxHeight = "0";
                document.querySelector(".login .login__succes").style.marginBottom = "0";
                enterChatbox(username);
            }, 4000);
        } else {
            document.querySelector(".login .login__password").classList.add("warning");
            document.querySelector(".login .login__warning-password").style.maxHeight = "50px";
            document.querySelector(".login .login__warning-password").style.marginBottom = "1rem";

            setTimeout(() => {
                document.querySelector(".login .login__password").classList.remove("warning");
                document.querySelector(".login .login__warning-password").style.maxHeight = "0";
                document.querySelector(".login .login__warning-password").style.marginBottom = "0";
            }, 4000);
        }
    } else {
        document.querySelector(".login .login__warning-username").style.maxHeight = "50px";
        document.querySelector(".login .login__warning-username").style.marginBottom = "1rem";

        setTimeout(() => {
            document.querySelector(".login .login__warning-username").style.maxHeight = "0";
            document.querySelector(".login .login__warning-username").style.marginBottom = "0";
        }, 4000);
    }
}

const enterChatbox = (username) => {
    loginModal.style.display = "none";
    socket.emit('logIn', (username));
    chatbox.style.display = "flex";
    chatboxUsernameEl.innerText = `Welcome ${username}`;
    chatboxUsernameEl.dataset.username = username;
}

const typingInTextarea = () => {
    let username = chatboxUsernameEl.dataset.username;
    let triggerTypeMsg = false;
    if (chatboxTextarea.value.length > 0 && chatboxCheckboxAllEl.checked === true && triggerTypeMsg === false) {
        triggerTypeMsg = true;
    } else {
        triggerTypeMsg = false;
    }
    if (triggerTypeMsg){
        socket.emit('typing', (username));
    } else {
        socket.emit('stoppedTyping', (username));
    }
}

const submitMsg = () => {
    let msg = document.querySelector(".chatbox textarea").value;
    let username = chatboxUsernameEl.dataset.username;
    if(chatboxCheckboxAllEl.checked === true){
        let dataArr = [msg, username, "all"];
        socket.emit('sendToAll', (dataArr));
    } else {
        let dataArr = [msg, username, "self"];
        socket.emit('sendToMe', (dataArr));
    }
    chatboxTextarea.value = "";
    socket.emit('stoppedTyping', (username));
}

const logout = () => {
    let username = chatboxUsernameEl.dataset.username;
    loginModal.style.display = "flex";
    socket.emit('logOut', (username));
    chatbox.style.display = "none";
}

socket.on('sendToAll', (message, username, audience) => {
    io.emit("displayMessage", (message, username, audience));
});

socket.on('sendToMe', (message, username, audience) => {
    io.emit("displayMessage", (message, username, audience));
});

socket.on('displayMessage', (message, username, audience) => {
    let article = document.createElement("article");
    article.classList.add("chatbox__message");
    if (username !== chatboxUsernameEl.dataset.username) {
        article.classList.add("chatbox__message--other");
    };
    let infoUser = document.createElement("p");
    if (username === chatboxUsernameEl.dataset.username) {
        username = "You";
    };
    if (audience === "self") {
        article.classList.add("chatbox__message--self");
    }
    let infoUserTextNode = document.createTextNode(`${username} wrote to ${audience}:`);
    let chatMessage = document.createElement("q");
    let chatMessageTextNode = document.createTextNode(message);
    infoUser.appendChild(infoUserTextNode);
    chatMessage.appendChild(chatMessageTextNode);
    article.appendChild(infoUser);
    article.appendChild(chatMessage);
    if (document.querySelector(".chatbox__typing")) {
        chatboxOutput.insertBefore(article, document.querySelector(".chatbox__typing"));
    } else {
        chatboxOutput.appendChild(article);
    }
});


socket.on('displayTyping', (typingUsers) => {

    
    document.querySelectorAll(".chatbox__typing").forEach(paragraph => {
        paragraph.remove();
    });

    typingUsers.forEach(username => {
        if (username !== chatboxUsernameEl.dataset.username) {
            let paragraph = document.createElement("p");
            let span1 = document.createElement("span");
            let span2 = document.createElement("span");
            let span3 = document.createElement("span");
            paragraph.classList.add("chatbox__typing");
            paragraph.classList.add(`chatbox__typing--${username}`);
            let typingTextNode = document.createTextNode(`${username} is typing `);
            paragraph.appendChild(typingTextNode);
            paragraph.appendChild(span1);
            paragraph.appendChild(span2);
            paragraph.appendChild(span3);
            chatboxOutput.appendChild(paragraph);
        }
    })
});

socket.on('removeTyping', (typingUsers) => {

    document.querySelectorAll(".chatbox__typing").forEach(paragraph => {
        paragraph.remove();
    });

    typingUsers.forEach(username => {
        if (username !== chatboxUsernameEl.dataset.username) {
            let paragraph = document.createElement("p");
            let span1 = document.createElement("span");
            let span2 = document.createElement("span");
            let span3 = document.createElement("span");
            paragraph.classList.add("chatbox__typing");
            paragraph.classList.add(`chatbox__typing--${username}`);
            let typingTextNode = document.createTextNode(`${username} is typing `);
            paragraph.appendChild(typingTextNode);
            paragraph.appendChild(span1);
            paragraph.appendChild(span2);
            paragraph.appendChild(span3);
            chatboxOutput.appendChild(paragraph);
        }
    });
});

socket.on('displayUsers', (usersArr) => {
    chatboxOnlineUsersList.innerHTML = "";
    let liYou = document.createElement("li");
    let bold = document.createElement("b");
    let liYouTextNode = document.createTextNode("You");
    liYou.appendChild(bold);
    bold.appendChild(liYouTextNode);
    chatboxOnlineUsersList.appendChild(liYou);
    usersArr.forEach(user => {
        if (user !== chatboxUsernameEl.dataset.username) {
            let li = document.createElement("li");
            let liTextNode = document.createTextNode(user);
            li.appendChild(liTextNode);
            chatboxOnlineUsersList.appendChild(li);
        }
    });
});

registerModalLink.addEventListener("click", loadLoginModal);
loginModalLink.addEventListener("click", loadRegisterModal);

registerModalButton.addEventListener("click", register);
loginModalButton.addEventListener("click", login);

chatboxTextarea.addEventListener("keyup", typingInTextarea);

chatboxSubmitBtn.addEventListener("click", submitMsg);

chatboxLogoutBtn.addEventListener("click", logout);