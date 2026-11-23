package com.korai.study03.domain.restaurant.mapper;



import com.korai.study03.domain.restaurant.entity.Restaurant;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RestaurantMapper {
    int insert(Restaurant restaurant);
}
