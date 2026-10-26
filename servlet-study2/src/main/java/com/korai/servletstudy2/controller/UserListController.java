package com.korai.servletstudy2.controller;


import com.korai.servletstudy2.model.User;
import com.korai.servletstudy2.service.UserService;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/user/list")
public class UserListController extends HttpServlet {

    private UserService userService;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setAttribute("userList",userService.getUserAll());
        req.getRequestDispatcher("/WEB-INF/views/user-list.jsp").forward(req,resp);
    }

    @Override
    public void init(ServletConfig config) throws ServletException {
        userService = UserService.getInstance();
        userService.register(new User(0,"user1","1234","김준일"));
        userService.register(new User(0,"user2","1234","김준이"));

    }
}
