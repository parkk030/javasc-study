package com.korai.study03.domain.restaurant.entity;


import com.korai.study03.domain.restaurant.dto.RestaurantResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    private int restaurantId;
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

    public RestaurantResponse toRestaurantResponse(){
        return new RestaurantResponse(
                restaurantId,
                name,
                category,
                district,
                address,
                phone,
                minOrderAmount,
                deliveryFee,
                openTime,
                closeTime,
                openedAt,
                isOpen
        );
    }

}



