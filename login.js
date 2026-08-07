// ---------- Auth ----------
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // stops the page from refreshing

  const username = document.getElementById("USERNAME").value.trim();
  const password = document.getElementById("PASSWORD").value; // matches the actual password input id
  const loginBtn = document.getElementById("loginBtn");

  if (username === "" || password === "") {
    showMessage("Please fill in all fields.", false);
    return;
  }

  // Real check — looks up the account created on the signup page,
  // stored under the same 'user_<username>' key.
  const storedUser = JSON.parse(localStorage.getItem("user_" + username));

  if (storedUser && password === storedUser.password) {
    sessionStorage.setItem("login", "true");
    sessionStorage.setItem("currentUser", username);

    showMessage("Login successful!", true);
    loginBtn.disabled = true;
    loginBtn.textContent = "Redirecting…";
    document.getElementById("shell").classList.add("success-flash");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } else {
    showMessage("Invalid username or password.", false);
  }
});

function showMessage(text, isSuccess) {
  const msg = document.getElementById("formMessage");
  msg.textContent = text;
  msg.style.color = isSuccess ? "var(--success)" : "var(--error)";
}
function togglePassword(id, eye) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        eye.textContent = "🙈";
    } else {
        input.type = "password";
        eye.textContent = "👁️";
    }
}

// ---------- Cinematic touches ----------

// Button ripple on click
document.querySelectorAll("button.cta, button.ghost").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

// Subtle 3D tilt on the ticket card, following the cursor
const shell = document.getElementById("shell");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (shell && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  shell.addEventListener("mousemove", (e) => {
    const rect = shell.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    shell.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });

  shell.addEventListener("mouseleave", () => {
    shell.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}