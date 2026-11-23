package com.korai.study03.domain.customer.entity;

import com.korai.study03.domain.customer.dto.CustomerResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
//dto 는 클라이언트와맞춤
//entity는 database 테이블과 맞춤
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    private int customerId;
    private String name;
    private String phone;
    private String email;
    private LocalDate birthDate;
    private String district;
    private String address;
    private String grade;
    private boolean marketingAgreed;
    private LocalDateTime joinedAt;

    public CustomerResponse toCustomerResponse(){
        return new CustomerResponse(
          customerId,
          name,
          phone,
          email,
          birthDate,
          district,
          address,
          grade,
          marketingAgreed,
          joinedAt
        );
    }
}
