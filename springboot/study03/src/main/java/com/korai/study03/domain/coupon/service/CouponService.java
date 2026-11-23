package com.korai.study03.domain.coupon.service;

import com.korai.study03.domain.coupon.dto.CouponCreateRequest;
import com.korai.study03.domain.coupon.dto.CouponResponse;
import com.korai.study03.domain.coupon.entity.Coupon;
import com.korai.study03.domain.coupon.mapper.CouponMapper;

import com.korai.study03.domain.customer.dto.CustomerCreateRequest;
import com.korai.study03.domain.customer.dto.CustomerResponse;
import com.korai.study03.domain.customer.entity.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponMapper CouponMapper;

    public List<CouponResponse> getAll(int customerId){
        return CouponMapper.findAll(customerId)
                .stream()
                .map(Coupon::toCouponResponse)
                .toList();
    }

    public CouponResponse create(CouponCreateRequest request){
        Coupon coupon = request.toCoupon();
        CouponMapper.insert(coupon);
        return coupon.toCouponResponse();
    }

}
