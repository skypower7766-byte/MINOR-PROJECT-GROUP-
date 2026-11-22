// ---------- OTP + registration (backend: api/*.php) ----------
let otpTimer = null;

async function sendOTP() {
  const email = document.getElementById("EMAIL").value.trim();
  if (!email) {
    showMessage("Please enter your email first.", false);
    return;
  }

  const sendBtn = document.getElementById("sendBtn");
  sendBtn.disabled = true;

  try {
    const res = await fetch("api/send_otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error || "Could not send OTP.", false);
      sendBtn.disabled = false;
      return;
    }

    // DEV ONLY: live karte waqt ye alert hata dein (OTP email se jana chahiye)
    alert("Your OTP is: " + data.dev_otp);
    showMessage("OTP sent. It is valid for 60 seconds.", true);
  } catch (err) {
    showMessage("Server error. Is Apache running?", false);
    sendBtn.disabled = false;
    return;
  }

  let secondsLeft = 60;
  sendBtn.textContent = secondsLeft + "s";

  if (otpTimer) clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    secondsLeft--;
    if (secondsLeft > 0) {
      sendBtn.textContent = secondsLeft + "s";
    } else {
      clearInterval(otpTimer);
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

document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("NAME").value.trim();
  const username = document.getElementById("USERNAME").value.trim();
  const password = document.getElementById("PASSWORD").value;
  const confirm_password = document.getElementById("CONFIRM_PASSWORD").value;
  const mobile = document.getElementById("MOBILE").value.trim();
  const otp = document.getElementById("OTP").value.trim();
  const email = document.getElementById("EMAIL").value.trim();
  const location = document.getElementById("LOCATION").value.trim();

  if (!name || !username || !password || !confirm_password || !mobile || !email) {
    showMessage("Please fill in all required fields.", false);
    return;
  }
  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", false);
    return;
  }
  if (password !== confirm_password) {
    showMessage("Passwords do not match.", false);
    return;
  }
  if (!otp) {
    showMessage("Please enter the OTP.", false);
    return;
  }

  try {
    const res = await fetch("api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, mobile, email, location, otp })
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.error || "Registration failed.", false);
      return;
    }
  } catch (err) {
    showMessage("Server error. Is Apache running?", false);
    return;
  }

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