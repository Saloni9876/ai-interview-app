document.addEventListener("DOMContentLoaded",()=>{
    const resetForm = document.getElementById("reset-form");
    if(resetForm){
       resetForm.addEventListener("submit",(e)=>{
        e.preventDefault();

    const email = document.querySelector(".email_box").value ;
    const password = document.querySelectorAll(".password_box")[0].value ;
    const confirmPassword = document.querySelectorAll(".password_box")[1].value ;

    if(password !== confirmPassword){
        alert("Password do not match!");
        return;
    }
    alert(`Password reset successfully for ${email}`);
    window.location.href ="./dashboard.html";
       });
    }
});