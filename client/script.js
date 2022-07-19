let socket = io.connect();

const registerModal = document.querySelector(".register");
const loginModal = document.querySelector(".login");

const registerModalLink = document.querySelector(".register .link");
const loginModalLink = document.querySelector(".login .link");

const registerModalButton = document.querySelector(".register button");
const loginModalButton = document.querySelector(".login button");

const chatbox = document.querySelector(".chatbox");
const chatboxUsernameEl = document.querySelector(".chatbox .chatbox__input h3");
const chatboxSubmitToAllBtn = document.querySelector(".chatbox .btn__send-to-all");
const chatboxSubmitToSelfBtn = document.querySelector(".chatbox .btn__send-to-self");
const chatboxOutput = document.querySelector(".chatbox .chatbox__output");

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
    chatbox.style.display = "flex";
    chatboxUsernameEl.innerText = `Welcome ${username}`;
    chatboxUsernameEl.dataset.username = username;
}

const submitToAll = () => {
    let msg = document.querySelector(".chatbox textarea").value;
    let username = chatboxUsernameEl.dataset.username;
    let dataArr = [msg, username, "all"];
    socket.emit('sendToAll', (dataArr));
    document.querySelector(".chatbox textarea").value = "";
};

const submitToSelf = () => {
    let msg = document.querySelector(".chatbox textarea").value;
    let username = chatboxUsernameEl.dataset.username;
    let dataArr = [msg, username, "self"];
    socket.emit('sendToMe', (dataArr));
    document.querySelector(".chatbox textarea").value = "";
}

socket.on('sendToAll', (message, username, audience) =>{
    io.emit("displayMessage", (message, username, audience));
});

socket.on('sendToMe', (message, username, audience) =>{
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
    let infoUserTextNode = document.createTextNode(`${username} wrote to ${audience}:`);
    let chatMessage = document.createElement("q");
    let chatMessageTextNode = document.createTextNode(message);
    infoUser.appendChild(infoUserTextNode);
    chatMessage.appendChild(chatMessageTextNode);
    article.appendChild(infoUser);
    article.appendChild(chatMessage);
    chatboxOutput.appendChild(article);
});


registerModalLink.addEventListener("click", loadLoginModal);
loginModalLink.addEventListener("click", loadRegisterModal);

registerModalButton.addEventListener("click", register);
loginModalButton.addEventListener("click", login);

chatboxSubmitToAllBtn.addEventListener("click", submitToAll);
chatboxSubmitToSelfBtn.addEventListener("click", submitToSelf);


