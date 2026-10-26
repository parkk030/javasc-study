package com.korai.servletstudy2.service;

import com.korai.servletstudy2.exception.DupicatedException;
import com.korai.servletstudy2.model.User;
import com.korai.servletstudy2.repository.UserRepository;

import java.util.List;

public class UserService {
    private static UserService instance;
    private UserRepository userRepository;

    private UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public static UserService getInstance(){
        if(instance==null){
            instance = new UserService(UserRepository.getInstance());
        }
        return instance;
    }

    public void register(User user) throws RuntimeException{

        if(isDuplicatedUsername(user.getUsername())){
            throw new DupicatedException("이미 존재하는 사용자이름입니다.");
        }
        userRepository.insert(user);

    }

    public boolean isDuplicatedUsername(String username){
        return userRepository.findByUsername(username) != null;
    }

    public List<User> getUserAll() {
        return userRepository.findAll();
    }

}
