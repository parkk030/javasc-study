package com.korai.study03.domain.customerCoupon.service;

import com.korai.study03.domain.customerCoupon.dto.CustomerCouponResponse;
import com.korai.study03.domain.customerCoupon.entity.CustomerCoupon;
import com.korai.study03.domain.customerCoupon.mapper.CustomerCouponMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerCouponService {

    @Autowired
    private CustomerCouponMapper customerCouponMapper;

    public List<CustomerCouponResponse> getAll(int customerId){
        return customerCouponMapper.findAll(customerId)
                .stream()
                .map(CustomerCoupon::toCustomerCouponResponse)
                .toList();
    }


    public CustomerCouponResponse getById(int customerCouponId) {

       return customerCouponMapper.findById(customerCouponId).toCustomerCouponResponse();


    }





}
