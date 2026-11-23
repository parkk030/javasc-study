package com.korai.study03.domain.customer.service;


import com.korai.study03.domain.customer.dto.CustomerCreateRequest;
import com.korai.study03.domain.customer.dto.CustomerResponse;
import com.korai.study03.domain.customer.entity.Customer;
import com.korai.study03.domain.customer.mapper.CustomerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service //싱글톤
public class CustomerService {

    @Autowired
    private CustomerMapper customerMapper;

    public CustomerResponse create(CustomerCreateRequest request){
        Customer customer = request.toCustomer();
        System.out.println("전");
        System.out.println(customer);
        customerMapper.insert(customer);
        System.out.println("후");
        System.out.println(customer);
        return customer.toCustomerResponse();
    }
}
