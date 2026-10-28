package com.korai.servletstudy2.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

//@WebFilter("/api/*")
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("전처리");
        System.out.println("11");
        HttpServletRequest req = (HttpServletRequest) request;
        String method= req.getMethod();
        System.out.println(method);  //OPTIONS
        HttpServletResponse resp = (HttpServletResponse) response;

        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if("OPTIONS".equals(method)){
            resp.setStatus(200);
            return;
        }


        chain.doFilter(request,response);
        System.out.println("22");
        System.out.println("후처리");
    }
}
