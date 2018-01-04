<?php
$conn=pg_connect("host=localhost dbname=webproject user=postgres password=orangechoc port=5432") or die("Connecting to database failed");
if($conn){
  echo 'Successfully connected to DB'."<br/>";
}

?>
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="web.css">
  <!--For bootstrap-->
  <!--
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css">-->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.6/umd/popper.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js"></script>-->
  <!--For google sign in-->
  <script src="https://apis.google.com/js/platform.js" async defer></script>
  <meta name="google-signin-client_id" content="641965152291-qol5pm47g3blhkk78emoh6h60ahr5sne.apps.googleusercontent.com">
 
  <!--For icons-->
  <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">-->
</head>

<script src="https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.2.0/zxcvbn.js"></script>
<?php
  if(isset($_POST["submitter"])){
    $vemailid=$_POST["memailid"];
    $vusername=$_POST["musername"];
    $vpassword= password_hash($_POST["mpassword"], PASSWORD_DEFAULT);
     echo "password_hash: ".$vpassword."<br>";
    echo $vemailid." ".$vusername." ".$vpassword."<br/>";
    $num=0;
    $sql=pg_query_params($conn,
      "INSERT INTO regusers (emailaddress, username, password, wins, losses, draws, totalscore, mmr) 
      values($1,$2,$3,$4,$5,$6,$7,$8)",
      array($vemailid,$vusername,$vpassword,$num,$num,$num,$num,$num) 
    );
    if($sql){
      echo 'Inserted into table';
    }
  }
?>
<body>

  <!--<script type="text/javascript" src="facebookAPI.js"></script>Facebook API JS-->
  <!--<script type="text/javascript" src="googleAPI.js"></script>Google API JS-->
<script type="text/javascript" src="login-signup.js"></script><!--Form validation JS-->

<section class="col-sm-1 col-md-2 col-lg-3"></section>
<section class="col-sm-10 col-md-8 col-lg-6 signup">
    <div class="title">Sign Up</div>
    <form id="loginForm" action="#" method="post" autocomplete="on">
        
      <div class="external-signup">
          <label class="social"><i>with your social network</i></label>
        
          <!--Google--><!--
           <div id="my-signin2" style="margin-bottom: 20px"></div>
         <script src="https://apis.google.com/js/platform.js?onload=renderButton" async defer></script>-->

          <!--Facebook-->
         <!-- <div class="fb-login-button" data-max-rows="1" data-size="medium" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="false" style="display:inline-block;"></div>-->
      </div>

      <table width="100%">
          <td><hr /></td>
          <td id="or"><i>Or</i></td>
          <td><hr /></td>
      </table>​

      <div class="localsignup">    
          
        <label><span style="display:inline" class="glyphicon glyphicon-user"></span>Username</label>
        <input id="musername" name="musername" class="col-sm-10 col-md-10 col-lg-12" type="text" required placeholder="Username" ><!--onkeyup="validateUsername()"-->
                
        <br>
           
            
        <a ahref="#" data-toggle="tooltip" title="Select a username here."></a>
        <script type="text/javascript">
            $(document).ready(function(){
                $('[data-toggle="tooltip"]').tooltip();   
            });
        </script>

        <p id="err1"></p>

        <br>


        <label><span class="glyphicon glyphicon-envelope"></span>Email</label>
         <a ahref="#" data-toggle="tooltip" title="Enter your email here.">
            <input class="col-sm-10 col-md-10 col-lg-12" name="memailid" id="emailid" type="text" required placeholder="Email" >
            <!--onkeyup="validateEmail();"-->
        </a>
        <p id="err2"></p>
        <!--STEAM ID-->
        <br><br>
        <label><span class="glyphicon glyphicon-lock"></span>Steam ID</label>
        <a ahref="#" data-toggle="tooltip" title="Enter a valid Steam ID here.">
            <input class="col-sm-10 col-md-10 col-lg-12" name="msteamid" id="steamid" type="number" required placeholder="SteamID"><!--onkeyup="checkStrength(); validatePasssword();"-->
        </a>

        <!--PASSWORD-->
        <br><br>
        <label><span class="glyphicon glyphicon-lock"></span>Password</label>
        <a ahref="#" data-toggle="tooltip" title="Select a password here.">
            <input class="col-sm-10 col-md-10 col-lg-12" name="mpassword" id="password" type="password" required placeholder="Password"><!--onkeyup="checkStrength(); validatePasssword();"-->
        </a>
        <br> <br>
        <label style="font-size: 12px; padding-top: 10px;">Password Strength</label>
        <meter max="4" id="password-strength-meter"></meter>
        <label id="pstrength" style="font-size: 12px; padding-top: 0px; padding-bottom: 0px;"></label>
        <p id="err3"></p>
        <p id="err31"></p>

        
        <label><span class="glyphicon glyphicon-lock"></span>Retype Password</label>
        <a ahref="#" data-toggle="tooltip" title="Retype your password here.">
            <input class="col-sm-10 col-md-10 col-lg-12" id="retype-password" type="password" placeholder="Retype Password">
            <!--required onkeyup="validateRePassword()"-->
        </a>
        <p id="err4"></p>
       
        <br><br>
        <input type="submit" class="okay" name="submitter" value="Register"/>
        <!--<a href="#" class="okay" name="submitter">Register</a> -->
    </div><!--End class local sign up-->
  </form>
</section>

<section class="col-sm-1 col-md-2 col-lg-3"></section>
</body>
</html>
<!--Client Id:641965152291-qol5pm47g3blhkk78emoh6h60ahr5sne.apps.googleusercontent.com-->
<!--Client Secret: w3bxc7Kt_aYEpwzQegAW2EJl -->
<!--Project Name: My Project 60354; Project Id: awesome-delight-189721-->
<!--API key: AIzaSyCIkWICCEiK5CF9t_GMWD-pS0K9HVe2P-8-->