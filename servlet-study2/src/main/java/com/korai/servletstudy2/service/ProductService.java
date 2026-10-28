package com.korai.servletstudy2.service;

import com.korai.servletstudy2.model.Product;
import com.korai.servletstudy2.repository.ProductRepository;

import java.util.List;

public class ProductService {
    private static ProductService instance;
    private ProductRepository productRepository;

    private ProductService(ProductRepository productRepository){
        this.productRepository=productRepository;
    }

    public static ProductService getInstance(){
        if(instance==null){
            instance = new ProductService(ProductRepository.getInstance());
        }
        return instance;
    }

    public void register(Product product){
        productRepository.insert(product);
    }

    public List<Product> getProducts(){
        return productRepository.findAll();
    }

}
