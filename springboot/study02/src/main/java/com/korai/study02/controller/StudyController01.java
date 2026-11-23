package com.korai.study02.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study") // 공통주소
public class StudyController01 {

    @GetMapping("/a")
    public String get() {
        return "";
    }

    @PostMapping("/b")
    public String post() {
        return "";
    }

    @PutMapping("/c")
    public String put() {
        return "";
    }

    @DeleteMapping("/d")
    public String delete() {
        return "";
    }
}

