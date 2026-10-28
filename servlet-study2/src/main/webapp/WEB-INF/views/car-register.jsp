<%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 28.
  Time: 오후 12:00
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <input type="text" placeholder="차이름" name ="carname" onkeyup="handleCarNameOnKeyup(event)">
    <input type="number" placeholder="가격" name ="price" onkeyup="handlePriceOnKeyup(event)">
    <input type="text" placeholder="브랜드" name = "brand" onkeyup="handleBrandOnKeyup(event)">
<button onclick="handleRegistButtonOnClick(event)">등록</button>

<script>

    let car = {
        name: "",
        price:0,
        brand:"",
    }

    function handleCarNameOnKeyup(e){
        car = {
            ...car,
            name: e.target.value,
        }
    }
    function handlePriceOnKeyup(e){
        car = {
            ...car,
            price : e.target.value,
        }
    }
    function handleBrandOnKeyup(e){
        car = {
            ...car,
            brand : e.target.value,
        }
    }
    function handleRegistButtonOnClick(e){
        fetch("http://192.168.2.12:8080/api/car",{
            method:"POST",
            body: JSON.stringify(car),
            headers:{
                "Content-Type" : "application/json",
            }
        });
        // location.replace("/car/list")

    }




</script>

</body>
</html>
