<?php
session_start();
$conn=pg_connect("host=localhost dbname=webproject user=postgres password=orangechoc port=5432") or die("Connecting to database failed");
if($conn){
  echo 'Successfully connected to DB'."<br/>";
}
#COOKIE FOR USERNAME
if (isset($_POST['useremail']) && isset($_POST['userpass']) && isset($_POST['rememberme']) ) {
            setcookie("userEmailCookie",$_POST['useremail'], time()+60*60*24*365, '/');
}

?>
<!DOCTYPE html>
<html>
<head>
   <link rel="stylesheet" type="text/css" href="web.css">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.6/umd/popper.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js"></script>
</head>

<body>
<script type="text/javascript" src="login-signup.js"> </script>  

<section class="login">
	<div class="title">User Login</div>
	<form class="col-sm-10 col-md-10 col-lg-12" action="#" method="post">
        <label>Email</label>
        <input class="col-sm-10 col-md-10 col-lg-12" type="text" required placeholder="Email" name="useremail">
        <?php
          if(isset($_POST["submitterlogin"])){
            $v=$_POST["useremail"];
            $result = pg_query_params ($conn, "SELECT checkuser($1)", array($v));
            
            while ($row = pg_fetch_array($result)) {
              $value = $row[0];
            }
            if($value==1){echo "Username FOUND in database"."<br>";}
            else if($value==0){echo "Username NOT FOUND in database"."<br/>";}
          }
        ?>

        <label>Password</label>
        <input class="col-sm-10 col-md-10 col-lg-12" type="password" required placeholder="Password" name="userpass">
        <?php
        if(isset($_POST["submitterlogin"])){
            $v=$_POST["useremail"];
            $y=$_POST["userpass"];
            $rethash=pg_query_params ($conn,"SELECT returnpasshash($1)", array($v));
            while ($row = pg_fetch_array($rethash)) {
              $value1 = $row[0];
            }
           
           $passver=password_verify($y,$value1);
           
            if($passver==1){
              echo "Password CORRECT"."<br>";
              $_SESSION["sentusername"] = $v;
              header("location:http://localhost:3000/");
            }
            else if($passver==0){echo "Password INCORRECT"."<br/>";}
          }
        ?>
        
        <div class="other" class="col-sm-10 col-md-10 col-lg-12">
        	<div class="col"><a href="signUpPage.html">Sign Up</a></div>
          <div class="col"><a href="#">Forgot Password?</a></div>
          <label style="display:inline;">Remember Me:</label> <input type="checkbox" name="rememberme" value="1" style="display:inline;"><br>
        </div>
        <input type="submit" name="submitterlogin" value="Sign In" class="okay"/>
       <!-- <a href="#" class="okay" class="col-sm-10 col-md-10 col-lg-12" >Sign In</a>-->
    </form>
</section>

</body>
</html>