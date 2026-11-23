package com.korai.study03.domain.customerCoupon.entity;

import com.korai.study03.domain.customerCoupon.dto.CustomerCouponResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CustomerCoupon {
    private int customerCouponId;
    private int customerId;
    private int couponId;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private Integer usedOrderId;

    public CustomerCouponResponse toCustomerCouponResponse(){
        return new CustomerCouponResponse(
                customerCouponId,
                customerId,
                couponId,
                issuedAt,
                expiresAt,
                usedOrderId

        );
    }


}
