package com.korai.study03.domain.customer.mapper;

import com.korai.study03.domain.customer.entity.Customer;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomerMapper {
    int insert(Customer customer);
}
