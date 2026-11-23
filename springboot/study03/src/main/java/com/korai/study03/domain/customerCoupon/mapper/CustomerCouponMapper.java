package com.korai.study03.domain.customerCoupon.mapper;

import com.korai.study03.domain.customerCoupon.entity.CustomerCoupon;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;


@Mapper
public interface CustomerCouponMapper {

    List<CustomerCoupon> findAll(@Param("customerId") int customerId);

    CustomerCoupon findById(@Param("customerCouponId") int customerCouponId);

}
