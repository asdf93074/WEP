function validateUsername() {
    var usrnm=document.getElementById("username").value;
    if(usrnm.length>10){
        document.getElementById("err1").style.display='block';
        document.getElementById("err1").innerHTML = "Username length must be less than 10 characters.";
    }
    else{
        document.getElementById("err1").style.display='none';
        document.getElementById("err1").innerHTML = "";
    }    
}

function validateEmail(){  
    var email=document.getElementById("email").value;

    if (/^[A-Za-z0-9\_.]+[@]+[A-Za-z0-9]+[.]+[A-Za-z0-9]/.test(email)){  
        document.getElementById("err2").style.display='none';
        document.getElementById("err2").innerHTML = ""; 
    }  
    else{
        document.getElementById("err2").style.display='block';
        document.getElementById("err2").innerHTML = "Email entered is invalid."; 
    } 
}

function validatePasssword() {
    var pssw=document.getElementById("password").value;
    if(pssw.length<6 || pssw.length>24){
        document.getElementById("err3").style.display='block';
        document.getElementById("err3").innerHTML = "Password length must be between 6 to 24 characters.";
    } 
    else{
        document.getElementById("err3").style.display='none';
        document.getElementById("err3").innerHTML = ""; 
    }

   if(  /[a-z]/.test(pssw)   &&   /[A-Z]/.test(pssw)   &&  /[0-9]/.test(pssw)   ){
        document.getElementById("err31").style.display='none';
        document.getElementById("err31").innerHTML = ""; 
    }
    else{   
        document.getElementById("err31").style.display='block';
        document.getElementById("err31").innerHTML = "Password must contain 1 Uppercase letter, 1 lowercase letter and 1 number.";
    }
}

function checkStrength(){   
    var strength = {
        0: "Worst",
        1: "Bad",
        2: "Weak",
        3: "Good",
        4: "Strong"
    }
    var pass = document.getElementById('password');
    var meter = document.getElementById('password-strength-meter');
    var text = document.getElementById('pstrength');
    var val = pass.value;
    var result = zxcvbn(val);

      // Update the password strength meter
    meter.value = result.score;
      // Update the text indicator
    if (val !== "") {
        text.style.display='block';
        text.innerHTML = "Strength: " + strength[result.score]; 
    } 
    else {
        text.style.display='none';
        text.innerHTML = "";
    }
}  

function validateRePassword(){
    var password = document.getElementById("password").value;
    var retypedPassword = document.getElementById("retype-password").value;
    if (password != retypedPassword) {
        console.log("Passwords dont match");
        document.getElementById("err4").style.display='block';
        document.getElementById("err4").innerHTML = "Passwords do not match";
    }
    else{
        document.getElementById("err4").style.display='none';
        document.getElementById("err4").innerHTML = "";
    }
}