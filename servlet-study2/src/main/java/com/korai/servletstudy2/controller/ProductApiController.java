package com.korai.servletstudy2.controller;

import com.korai.servletstudy2.model.Product;
import com.korai.servletstudy2.service.ProductService;
import lombok.Data;
import tools.jackson.databind.ObjectMapper;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/products")
public class ProductApiController extends HttpServlet {

    private ProductService productService;

    @Override
    public void init(ServletConfig config) throws ServletException {
        productService = ProductService.getInstance();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<Product> products = productService.getProducts();

        ObjectMapper om = new ObjectMapper();
        String json = om.writeValueAsString(products);

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(json);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//        System.out.println("요청들어옴");
//        BufferedReader bufferedReader = req.getReader();
//        String json = "";
//        while((json = bufferedReader.readLine()) != null) {
//            System.out.println(json);
//        }

        ObjectMapper om = new ObjectMapper();


        Product p = om.readValue(req.getInputStream(),Product.class);

        System.out.println(p);

        productService.register(p);
    }
}


