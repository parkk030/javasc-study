package com.korai.study03.domain.coupon.mapper;

import com.korai.study03.domain.coupon.entity.Coupon;
import com.korai.study03.domain.customerCoupon.entity.CustomerCoupon;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CouponMapper {

    List<Coupon> findAll(@Param("couponId") int couponId);

    int insert(Coupon coupon);

}
