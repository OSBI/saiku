<%@ taglib prefix="authz" uri="http://www.springframework.org/security/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
  <title>Sparklr</title>
  <link type="text/css" rel="stylesheet" href="<c:url value="/style.css"/>"/>

  <authz:authorize ifAllGranted="ROLE_USER">
    <script type='text/javascript'>
      function pictureDisplay(json) {
        for (var i = 0; i < json.photos.photo.length; i++) {
          var photo = json.photos.photo[i];
          document.write('<img src="rest/jpg/photo/' + photo['@id'] + '" alt="' + photo.name + '">');
        }
      }
    </script>
  </authz:authorize>
</head>

<body>
<div id="container">
  <div id="header">
    <div id="headertitle">Sparklr</div>
  </div>
  <div id="mainbody">
    <div class="header1">Home</div>

    <p class="bodytext">This is a great site to store and view your photos. Unfortunately, we don't have any services
    for printing your photos.  For that, you'll have to go to <a href="#">Tonr.com</a>.</p>

    <authz:authorize ifNotGranted="ROLE_USER">
      <div class="header1">Login</div>
      <form action="<c:url value="/login.do"/>" method="POST">
        <p class="formtext">Username: <input type='text' name='j_username' value="marissa"></p>
        <p class="formtext">Password: <input type='password' name='j_password' value="koala"></p>
        <p class="formtext"><input name="login" value="login" type="submit"></p>
      </form>
    </authz:authorize>
    <authz:authorize ifAllGranted="ROLE_USER">
      <div align="center"><form action="<c:url value="/logout.do"/>"><input type="submit" value="logout"></form></div>
      <div class="header1">Your Photos</div>

      <p class="bodytext">
        <script type='text/javascript' src='json/photos?callback=pictureDisplay'>
        </script>
      </p>
    </authz:authorize>
  </div>

  <div id="footer">Design by <a href="http://www.pyserwebdesigns.com" target="_blank">Pyser Web Designs</a></div>

</div>
</body>
</html>
