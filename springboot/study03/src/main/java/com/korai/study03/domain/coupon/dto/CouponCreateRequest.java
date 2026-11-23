package com.korai.study03.domain.coupon.dto;

import com.korai.study03.domain.coupon.entity.Coupon;
import com.korai.study03.domain.customer.entity.Customer;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CouponCreateRequest {

    private String code;
    private String name;
    private String discountType;
    private int discountValue;
    private int maxDiscount;
    private int minOrderAmount;
    private int validDays;
    private boolean isActive;

    public Coupon toCoupon(){
        return new Coupon(0,code,name,discountType,discountValue,maxDiscount,minOrderAmount,validDays,isActive,null);
    }

}
