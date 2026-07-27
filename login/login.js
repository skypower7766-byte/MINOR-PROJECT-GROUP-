document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // stops the page from refreshing

    const username = document.getElementById("USERNAME").value;
    const password = document.getElementById("password").value; // match your actual password input id

    // basic check — replace with real validation later
    if (username.trim() === "" || password.trim() === "") {
        showMessage("Please fill in all fields.", false);
        return;
    }

    // TEMP: dummy check — swap this for real auth later (backend/localStorage/etc.)
    if (username === "admin" && password === "1234") {
        showMessage("Login successful!", true);
    } else {
        showMessage("Invalid username or password.", false);
    }
});

function showMessage(text, isSuccess) {
    let msg = document.querySelector(".login-successful");
    if (!msg) {
        msg = document.createElement("p");
        msg.classList.add("login-successful");
        document.querySelector(".login-container").appendChild(msg);
    }
    msg.textContent = text;
    msg.style.color = isSuccess ? "lightgreen" : "rgb(243, 7, 7)";
}