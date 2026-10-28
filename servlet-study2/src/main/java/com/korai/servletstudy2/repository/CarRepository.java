package com.korai.servletstudy2.repository;

import com.korai.servletstudy2.model.Car;

import java.util.ArrayList;
import java.util.List;

public class CarRepository {
    private static CarRepository instance;
    private static List<Car> cars;
    private int lastId;

    private CarRepository(){
        cars = new ArrayList<>();
        insert(new Car(0,"씽씽카",30000,"삼성"));
        insert(new Car(0,"붕붕카",30000,"현대"));
        lastId=1;
    }


    public static CarRepository getInstance(){
        if(instance==null){
            instance = new CarRepository();
        }
        return instance;
    }

    public void insert(Car car){
        car.setId(lastId);
        cars.add(car);
    }

    public List<Car> findAll(){
        return cars.stream().map(car -> new Car(car)).toList();
    }

}
