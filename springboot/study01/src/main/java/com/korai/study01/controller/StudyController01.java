package com.korai.study01.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;import org.springframework.web.bind.annotation.RestController;


@Controller
public class StudyController01 {

    @ResponseBody
    @GetMapping("/api/get01")
    public String get01(){
        return "/Usagi.webp";  //Responsebody 없으면 경로
    }

    @Value("${user.dir}")
    private String projectDir;


    @GetMapping("/api/get02")
    public String get02(){
        System.out.println(projectDir + "src/main/resources/upload");
        String uploadPath = projectDir + "src/main/resources/upload";
        return "/" + uploadPath + "/Usagi.webp";  // Responsebody 존재하면 값으로 존재
    }

    @ResponseBody
    @GetMapping("/api/get03")
    public String get03(){
        return "데이터 응답";
    }

}
