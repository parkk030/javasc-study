package com.korai.study04.init;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class Study01 implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("실행");
    }
}
