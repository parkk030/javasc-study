package com.korai.study03.domain.customer.controller;


import com.korai.study03.domain.customer.dto.CustomerCreateRequest;
import com.korai.study03.domain.customer.dto.CustomerResponse;
import com.korai.study03.domain.customer.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/customers") //URL 패턴 : /api/entity(복수형)
@RestController
public class CustomerController {
    // 컨트롤러 이름 규칙
    //Entity명 + Controller
    // 매서드 이름 규칙
    //CRUD
    // C -> POST: 생성
    // createCustomer , addCustomer , registerCustomer
    // R -> GET : 조회
    // 단건조회 : getCustomer , findCustomer
    // 다건조회 : getCustomers , listCustomers
    // U -> PUT(전체) , PATCH(부분) : 수정
    // updateCustomer , modifyCustomer
    // D -> Delete : 삭제
    // deleteCustomer , removeCustomer
    @Autowired //
    private CustomerService customerService;

    @PostMapping
    public CustomerResponse create(@RequestBody CustomerCreateRequest request){
        System.out.println(request);
        CustomerResponse customerResponse = customerService.create(request);
        return customerResponse;
    }

    // request, response body - json 자동변환

}
