package com.korai.servletstudy2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Book {
    private int id;
    private String bookName;
    private int price;

    public Book(Book book){
        this.id = book.id;
        this.bookName = book.bookName;
        this.price = book.price;
    }

}
