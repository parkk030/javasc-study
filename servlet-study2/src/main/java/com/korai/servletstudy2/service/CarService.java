package com.korai.servletstudy2.service;

import com.korai.servletstudy2.model.Car;
import com.korai.servletstudy2.repository.CarRepository;

import java.util.List;


public class CarService {
    private static CarService instance;
    private CarRepository carRepository;

    private CarService(CarRepository carRepository){
        this.carRepository = carRepository;
    }


    public static CarService getInstance(){
        if(instance==null){
            instance = new CarService(CarRepository.getInstance());
        }
        return instance;
    }

    public void regist(Car car){
       carRepository.insert(car);
    }

    public List<Car> getCar(){
        return carRepository.findAll();
    }




}
