<%@ page import="java.util.List" %>
<%@ page import="com.korai.servletstudy2.model.Book" %><%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 26.
  Time: 오후 4:49
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    List<Book> bookList = (List<Book>)request.getAttribute("booklist");
%>
<html>
<head>
    <title>Title</title>
    <style>
    table{
        border: 1px solid #222;
        border-collapse: collapse;
    }

    th, td{
        border: 1px solid #222;
        text-align: center;
        width: 300px;
        height: 50px;
    }

    </style>
</head>
<body>
    <button>등록</button>
<table>
    <thead>
    <tr>
        <th>번호</th>
        <th>책이름</th>
        <th>가격</th>
    </tr>
    </thead>
    <tbody>
    <%
        for(Book book : bookList) {
    %>
        <tr>
            <td><%=book.getId()%></td>
            <td><%=book.getBookName()%></td>
            <td><%=book.getPrice()%></td>
        </tr>
<% } %>
    </tbody>
</table>

</body>
</html>
