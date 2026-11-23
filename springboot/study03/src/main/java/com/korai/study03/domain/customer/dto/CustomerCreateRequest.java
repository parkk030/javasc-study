package com.korai.study03.domain.customer.dto;

import com.korai.study03.domain.customer.entity.Customer;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomerCreateRequest {
    private String name;
    private String phone;
    private String email;
    private LocalDate birthDate;
    private String district;
    private String address;
    private String grade;
    private boolean marketingAgreed;

    public Customer toCustomer(){
        return new Customer(0,name,phone,email,birthDate,district,address,grade,marketingAgreed,null);
    }


}
