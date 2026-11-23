package com.korai.study03.domain.restaurant.dto;


import com.korai.study03.domain.restaurant.entity.Restaurant;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RestaurantCreateRequest {
    private String name;
    private String category;
    private String district;
    private String address;
    private String phone;
    private int minOrderAmount;
    private int deliveryFee;
    private String openTime;
    private String closeTime;
    private LocalDate openedAt;
    private boolean isOpen;

    public Restaurant toRestaurant(){
        return new Restaurant(0,name,category,district,address,phone,minOrderAmount,deliveryFee,openTime,closeTime,openedAt,isOpen);
    }

}
