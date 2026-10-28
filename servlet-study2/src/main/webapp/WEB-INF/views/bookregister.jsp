<%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 27.
  Time: 오전 9:25
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
        <input type="text" name="bookname" placeholder="책이름" onkeyup="handleOnChange(event)">
    </div>
    <div>
        <input type="text" name="bookprice" placeholder="가격" onkeyup="handleOnChange(event)">
    </div>
    <button>등록하기</button>
</form>

<script>
    let book = {
        bookname : "",
        bookprice : "",
    }

    function handleOnSubmit(event){

    }
</script>


</body>
</html>
