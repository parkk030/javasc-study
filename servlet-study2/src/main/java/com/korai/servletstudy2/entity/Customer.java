package com.korai.servletstudy2.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customer {
    private int customerId;
    private String name;
    private String phone;
    private String email;
    private String birthDate;
    private String district;
    private String address;
    private String grade;
    private int marketingAgreed;
    private String joinedAt;

    public Customer(Map<String, Object> map) {
        this.customerId = (int) map.get("");
        this.name = (String) map.get("");
        this.phone = (String) map.get("");
        this.email = (String) map.get("");
        this.birthDate = (String) map.get("");
        this.district = (String) map.get("");
        this.address = (String) map.get("");
        this.grade = (String) map.get("");
        this.marketingAgreed = (int) map.get("");
        this.joinedAt = (String) map.get("");
    }
}