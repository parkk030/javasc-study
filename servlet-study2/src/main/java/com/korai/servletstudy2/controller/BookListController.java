package com.korai.servletstudy2.controller;


import com.korai.servletstudy2.model.Book;
import com.korai.servletstudy2.service.BookService;
import com.korai.servletstudy2.service.UserService;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/book/list")
public class BookListController extends HttpServlet {
private BookService bookService;

    @Override
    public void init(ServletConfig config) throws ServletException {
    bookService = BookService.getInstance();
    bookService.register(new Book(1,"홍길동전",10000));
    bookService.register(new Book(2,"홍삼캔디",500));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setAttribute("booklist", bookService.getBooksAll());
        req.getRequestDispatcher("/WEB-INF/views/book-list.jsp").forward(req,resp);
    }

}
