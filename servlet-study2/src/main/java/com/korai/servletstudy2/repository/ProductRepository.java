package com.korai.servletstudy2.repository;

import com.korai.servletstudy2.model.Product;
import com.korai.servletstudy2.service.ProductService;

import java.util.ArrayList;
import java.util.List;

public class ProductRepository {
    private static ProductRepository instance;
    List<Product> products;
    private int lastId;

    private ProductRepository(){
        products = new ArrayList<>();
        insert(new Product(0,"가나다",123));
        insert(new Product(0,"가나다라",1234));
        lastId = 1;
    }

    public static ProductRepository getInstance(){
        if(instance == null){
            instance = new ProductRepository();
        }
        return instance;
    }

    public void insert(Product product){
        product.setId(lastId++);
        products.add(product);
    }

    public List<Product> findAll(){return products.stream().map(product -> new Product(product)).toList();}
}
