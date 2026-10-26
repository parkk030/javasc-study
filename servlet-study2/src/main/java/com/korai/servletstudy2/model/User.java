package com.korai.servletstudy2.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
        private int id ;
        private String username;
        private String password;
        private String name;

        //copy생성자
        public User(User other){
                this.id = other.id;
                this.username = other.username;
                this.password = other.password;
                this.name = other.name;
        }
}


