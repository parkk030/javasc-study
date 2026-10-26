<%@ page import="com.korai.servletstudy2.model.User" %>
<%@ page import="java.util.List" %><%--
  Created by IntelliJ IDEA.
  User: pk
  Date: 26. 10. 26.
  Time: 오후 12:21
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
  List<User> userList = (List<User>) request.getAttribute("userList");
%>
<html>
  <head>
    <title>Title</title>
    <style>
      table {
        border: 1px solid #222;
        border-collapse: collapse;
      }

      th, td {
        border: 1px solid #222;
        width: 300px;
        height: 40px;
      }
    </style>
  </head>
  <body>
  <button onclick="location.href='/user/register'">등록</button>
  /* /로 시작하면 절대경로 , 아니면 상대경로 */
  <table>
    <thead>
      <tr>
        <th>번호</th>
        <th>사용자이름</th>
        <th>비밀번호</th>
        <th>성명</th>
      </tr>
    </thead>
    <tbody>
      <%  // 스크립틀릿
          for(User user :userList){
      %>
      <tr>
        <td><%=user.getId()%></td>
        <td><%=user.getUsername()%></td>
        <td><%=user.getPassword()%></td>
        <td><%=user.getName()%></td>
      </tr>
      <%
        }
      %>
    </tbody>
  </table>
  </body>
</html>
