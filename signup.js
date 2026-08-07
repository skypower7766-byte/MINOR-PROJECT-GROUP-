// ---------- OTP + registration ----------
let generatedOTP = "";
let otpTimer = null;
let otpExpired = false;

function sendOTP() {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  otpExpired = false;

  // TEMP for testing only — a real app sends this via email/SMS from a backend,
  // never shows it in an alert. Remove this line once you have a backend.
  alert("Your OTP is: " + generatedOTP);
  console.log("Generated OTP:", generatedOTP);

  const sendBtn = document.getElementById("sendBtn");
  sendBtn.disabled = true;

  let secondsLeft = 60;
  sendBtn.textContent = secondsLeft + "s";

  if (otpTimer) clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    secondsLeft--;
    if (secondsLeft > 0) {
      sendBtn.textContent = secondsLeft + "s";
    } else {
      clearInterval(otpTimer);
      otpExpired = true;
      sendBtn.disabled = false;
      sendBtn.textContent = "Send";
    }
  }, 1000);
}
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        icon.innerHTML = "🙈";
    } else {
        input.type = "password";
        icon.innerHTML = "👁️";
    }
}

document.getElementById("registerForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("NAME").value.trim();
  const username = document.getElementById("USERNAME").value.trim();
  const password = document.getElementById("PASSWORD").value;
  const confirm_password = document.getElementById("CONFIRM_PASSWORD").value;
  const number = document.getElementById("MOBILE").value.trim();
  const enteredOTP = document.getElementById("OTP").value.trim();
  const email = document.getElementById("EMAIL").value.trim();
  const location = document.getElementById("LOCATION").value.trim();
  const msg = document.getElementById("formMessage");

  if (!name || !username || !password || !confirm_password || !number || !email) {
    showMessage("Please fill in all required fields.", false);
    return;
  }

  if (password !== confirm_password) {
    showMessage("Passwords do not match.", false);
    return;
  }

  if (!enteredOTP) {
    showMessage("Please enter the OTP.", false);
    return;
  }

  if (!generatedOTP) {
    showMessage('Please click "Send" to get an OTP first.', false);
    return;
  }

  if (otpExpired) {
    showMessage("OTP has expired. Please request a new one.", false);
    return;
  }

  if (enteredOTP !== generatedOTP) {
    showMessage("Invalid OTP. Please try again.", false);
    return;
  }

  if (localStorage.getItem("user_" + username)) {
    showMessage("User already exists. Please log in.", false);
    return;
  }

  // All checks passed — save the user
  const user = { name, username, password, number, email, location };
  localStorage.setItem("user_" + username, JSON.stringify(user));

  showMessage("Registration successful! You can now log in.", true);
  document.getElementById("shell").classList.add("success-flash");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});

function showMessage(text, isSuccess) {
  const msg = document.getElementById("formMessage");
  msg.textContent = text;
  msg.style.color = isSuccess ? "var(--success)" : "var(--error)";
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