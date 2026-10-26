<%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 26.
  Time: 오후 12:21
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <title>Title</title>
  </head>
  <body>
    <form method="post" onsubmit="handleOnSubmit(event)">
      <div>
        <input type="text" name="username" placeholder = "사용자이름" onkeyup="handleOnChange(event)">
      </div>
      <div>
        <input type="password" name="password" placeholder = "비밀번호" onkeyup="handleOnChange(event)">
      </div>
      <div>
        <input type="text" name="name" placeholder = "이름" onkeyup="handleOnChange(event)">
      </div>
      <button>등록하기</button>
    </form>

    <script>
      let user = {
        username : "",
        password : "",
        name: ""
      }

      function handleOnChange(event){
        const name = event.target.name;
        const value = event.target.value;
        user = {
          ...user,
          [name]: value,
        };

        console.log(user);
      }

      async function registerApi(data){
        const jsonData = JSON.stringify(data);
        const response = await fetch("http://localhost:8080/api/users", {
          method: "post",
          headers: {
            "Content-Type" : "application/json",
          },
          body: jsonData,
        });

        console.log(response)

        const responseBody = await  response.json();
        console.log(responseBody)
        alert(responseBody.message);

        if(response.status !== 200){
          return;
        }
        location.replace("/user/list");
      }

      function handleOnSubmit(event){
        event.preventDefault();
        registerApi(user);
      }
    </script>
  </body>
</html>
