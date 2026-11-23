package com.korai.study02.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study2") // 공통주소
public class StudyController2 {

    // 1. 기본적인 List 응답 (JSON 배열 형태: ["사과", "바나나", "포도"])
    @GetMapping("/list")
    public List<String> getList() {
        List<String> list = new ArrayList<>();
        list.add("사과");
        list.add("바나나");
        list.add("포도");
        return list;
    }

    // 2. 기본적인 Map 응답 (JSON 객체 형태: {"name": "홍길동", "age": 20, "job": "학생"})
    @GetMapping("/map")
    public Map<String, Object> getMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "홍길동");
        map.put("age", 20);
        map.put("job", "학생");
        return map;
    }

    // 3. List 안에 Map이 들어있는 복합 응답 (JSON 객체 배열 형태)
    @GetMapping("/list-map")
    public List<Map<String, Object>> getListMap() {
        List<Map<String, Object>> userList = new ArrayList<>();

        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "홍길동");

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "김철수");

        userList.add(user1);
        userList.add(user2);

        return userList;
    }
}
