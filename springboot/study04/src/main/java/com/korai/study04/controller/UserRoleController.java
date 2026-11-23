package com.korai.study04.controller;

import com.korai.study04.service.UserRoleService;
import com.korai.study04.service.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserRoleController {

    private final UserRoleService userRoleService;
    private UserService userService;
    private String name;

        
}
