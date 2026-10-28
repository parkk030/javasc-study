package com.korai.servletstudy2.controller;

import com.korai.servletstudy2.model.Student;
import tools.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/students")
public class StudentApiController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("2");
        ObjectMapper om = new ObjectMapper();
        Student student = om.readValue(req.getInputStream(), Student.class);
        System.out.println(student);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(om.writeValueAsString(Map.of("massage","학생등록요청완료")));
    }
}
