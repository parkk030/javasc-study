package com.korai.servletstudy2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

        private int id;
        private String productName;
        private int price;

        public Product(Product product){
                this.id = product.id;
                this.productName = product.productName;
                this.price = product.price;
        }

}
