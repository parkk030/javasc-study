package com.korai.study03.domain.restaurant.service;

import com.korai.study03.domain.restaurant.dto.RestaurantCreateRequest;
import com.korai.study03.domain.restaurant.dto.RestaurantResponse;
import com.korai.study03.domain.restaurant.entity.Restaurant;
import com.korai.study03.domain.restaurant.mapper.RestaurantMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantMapper restaurantMapper;

    public RestaurantResponse create(RestaurantCreateRequest request){
        Restaurant restaurant = request.toRestaurant();
        System.out.println("전");
        System.out.println(restaurant);
        restaurantMapper.insert(restaurant);
        System.out.println("후");
        System.out.println(restaurant);
        return restaurant.toRestaurantResponse();
    }

}

