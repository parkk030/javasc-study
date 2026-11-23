package com.korai.study03.domain.coupon.controller;


import com.korai.study03.domain.coupon.dto.CouponCreateRequest;
import com.korai.study03.domain.coupon.dto.CouponResponse;
import com.korai.study03.domain.coupon.service.CouponService;
import com.korai.study03.domain.customer.dto.CustomerCreateRequest;
import com.korai.study03.domain.customer.dto.CustomerResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/{couponId}")
    public List<CouponResponse> getAll(@PathVariable int couponId){
        return couponService.getAll(couponId);
    }

    @PostMapping
    public CouponResponse create(@RequestBody CouponCreateRequest request){
        System.out.println(request);
        CouponResponse couponResponse = couponService.create(request);
        return couponResponse;
    }


}
