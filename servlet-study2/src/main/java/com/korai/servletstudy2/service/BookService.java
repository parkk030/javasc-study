package com.korai.servletstudy2.service;

import com.korai.servletstudy2.model.Book;
import com.korai.servletstudy2.repository.BookRepository;

import java.util.List;

public class BookService {
    private static BookService instance;
    private BookRepository bookRepository;

    private BookService (BookRepository bookRepository){
        this.bookRepository=bookRepository;
    }

    public static BookService getInstance(){
        if(instance==null){
            instance = new BookService(BookRepository.getInstance());
        }
        return instance;
    }

    public void register(Book book){
        bookRepository.insert(book);
    }

    public List<Book> getBooksAll(){
        return bookRepository.findAll();
    }
}
