package com.korai.servletstudy2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Car {
    private int id;
    private String name;
    private int price;
    private String brand;

    public Car(Car car){
        this.id = car.id;
        this.name = car.name;
        this.price = car.price;
        this.brand = car.brand;
    }
}
