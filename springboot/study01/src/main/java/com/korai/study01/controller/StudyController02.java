package com.korai.study01.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudyController02 {


    @GetMapping("/api/study02/get01")
    public String get01(){
        return "응답!!!!";
    }

    @PostMapping("/api/study02/post01")
    public String post01(){
        return "post응답!!";
    }

}
