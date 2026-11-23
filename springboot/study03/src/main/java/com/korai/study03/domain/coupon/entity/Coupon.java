package com.korai.study03.domain.coupon.entity;


import com.korai.study03.domain.coupon.dto.CouponResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Coupon {
    private int couponId;
    private String code;
    private String name;
    private String discountType;
    private int discountValue;
    private int maxDiscount;
    private int minOrderAmount;
    private int validDays;
    private boolean isActive;
    private LocalDateTime createdAt;

    public CouponResponse toCouponResponse(){
        return new CouponResponse(
                couponId,
                code,
                name,
                discountType,
                discountValue,
                maxDiscount,
                minOrderAmount,
                validDays,
                isActive,
                createdAt
        );
    }
}
