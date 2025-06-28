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
function continueToDashboard() {
    window.location.href = "../dashboard/dashboard.html";  
    console.log("login successful!")
}
const closeBtn= document.querySelector('#cls-btn');
closeBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    window.location.href="../TechTalk/index.html";
})