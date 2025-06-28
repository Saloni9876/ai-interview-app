const signUpBtn= document.querySelector('#signup');
const loginBtn = document.querySelector('#login');
const loginBox = document.querySelector(".login-box");
const signupBox = document.querySelector(".signup-box");
signupBox.style.display = "none";
signUpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loginBox.style.display = "none";
    signupBox.style.display = "block";
});
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signupBox.style.display = "none";
    loginBox.style.display = "block";
});

function handleSignup() {
    const email = document.querySelector(".signup-box .email_box").value;
    const passwordInputs = document.querySelectorAll(".signup-box .password_box");
    const password = passwordInputs[0].value;
    const confirmPassword = passwordInputs[1].value;
  
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    fetch("http://localhost:5500/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Signup successful") {
          alert("Signup successful! Please log in.");
          document.querySelector(".signup-box").style.display = "none";
          document.querySelector(".login-box").style.display = "block";
        } else {
          alert(data.error || "Signup failed.");
        }
      })
      .catch(err => {
        console.error("Signup error:", err);
        alert("Server error during signup.");
      });
  }
  
  
function continueToDashboard() {
    const emailInput = document.querySelector(".login-box .email_box").value;
    const passwordInput = document.querySelector(".login-box .password_box").value;
  
    fetch("http://localhost:5500/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput, password: passwordInput })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Login successful") {
          localStorage.setItem("user_email", emailInput);
          window.location.href = "../dashboard/dashboard.html";
        } else {
          alert(data.error || "Login failed");
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        alert("Server error");
      });
  }
  
const closeBtn= document.querySelector('#cls-btn');
closeBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    window.location.href="../TechTalk/index.html";
})