package com.korai.servletstudy2.controller;

import com.korai.servletstudy2.model.Car;
import com.korai.servletstudy2.model.Product;
import com.korai.servletstudy2.service.CarService;
import tools.jackson.databind.ObjectMapper;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/car")
public class CarApiController extends HttpServlet {

private CarService carService;

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }



    @Override
    public void init(ServletConfig config) throws ServletException {
        carService = CarService.getInstance();
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        List<Car> cars = carService.getCar();
        ObjectMapper om = new ObjectMapper();
        String json = om.writeValueAsString(cars);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(json);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        ObjectMapper om = new ObjectMapper();

        Car car = om.readValue(req.getInputStream(),Car.class);

        System.out.println(car);

        carService.regist(car);
    }
}
