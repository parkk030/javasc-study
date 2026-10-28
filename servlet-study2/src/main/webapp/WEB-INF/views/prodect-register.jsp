<%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 27.
  Time: 오후 3:34
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <input type="text" name = "name" placeholder="상품명" onkeyup="handleProductNameInputOnKeyup(event)">
    <input type="text" name = "price" placeholder="가격"onkeyup="handlePriceInputOnKeyup(event)">
    <button onclick="handleRegisterButtonOnClick(event)">등록</button>

<script>

    let product = {
        productName: "",
        price: 0,
    }

    function handleProductNameInputOnKeyup(e){
        console.log(e.target.value);
        product = {
            ...product,
            productName : e.target.value,
        }
    }
    function handlePriceInputOnKeyup(e){
        console.log(e.target.value);
        product = {
            ...product,
            price : e.target.value, //key값
        }

    }

    function handleRegisterButtonOnClick(e){

        fetch("http://localhost:8080/api/products",{  //요청하기 fetch
            method: "POST",//POST - 생성, 등록
            body: JSON.stringify(product), //java문법으로 되어있어서 json으로 변경해서 보내야함
            headers: {  // ?
                "Content-Type" : "application/json", // ?
            }
        });

        location.replace("/product/list");

    }
</script>

</body>
</html>
