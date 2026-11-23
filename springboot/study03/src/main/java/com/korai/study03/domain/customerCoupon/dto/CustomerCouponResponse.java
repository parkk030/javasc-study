package com.korai.study03.domain.customerCoupon.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CustomerCouponResponse {
    private int id;
    private int customerId;
    private int couponId;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private Integer usedOrderId;
}
