package com.korai.servletstudy2.repository;

import com.korai.servletstudy2.model.User;

import java.util.ArrayList;
import java.util.List;

public class UserRepository {
    private static UserRepository instance;
    private int lastId;
    private List<User> users;

    private UserRepository(){
        lastId=1;
        users= new ArrayList<>();
    }

    public static UserRepository getInstance(){
        if (instance == null){
            instance = new UserRepository();
        }
        return instance;
    }

    public void insert(User user){
        user.setId(lastId++);
        users.add(user);
    }

    public User findByUsername(String username){
//        for(int i=0;i<users.size();i++){
//            if(users.get(i).getUsername().equals(username)){
//                return users.get(i);
//            }
//        }
        for(User user : users){
            if(user.getUsername().equals(username)){
                return user;
            }
        }
        return null;
    }

    public User findByid(int id){

        for(User user : users){
           if(user.getId()==id){
                return user;
            }
        }
        return null;
    }

    public List<User> findAll(){
        return users.stream().map(user -> new User(user)).toList();
    }



}
