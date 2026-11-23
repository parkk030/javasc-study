package com.korai.study03.domain.coupon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CouponResponse {
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
}
