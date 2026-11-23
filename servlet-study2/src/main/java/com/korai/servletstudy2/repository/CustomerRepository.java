package com.korai.servletstudy2.repository;

import com.korai.servletstudy2.database.DatabaseProvider;
import com.korai.servletstudy2.entity.Customer;

import java.util.List;

public class CustomerRepository implements Repository<Customer>{


    public List<Customer> findAllByLikeName(String value){
        String sql = """
                select * from customers where name like '%?%'
                """;
        return null;
    }


    @Override
    public List<Customer> findAll() {
        String sql = """
                select
                    *
                from
                    customers""";

        try {
            return select(DatabaseProvider.getInstance().getConnection(), sql,null)
                    .stream()
                    .map(Customer::new)
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
        }


        return List.of();
    }

    @Override
    public Customer findById(int id) {
        String sql = """
                select
                    *
                from
                    customers
                    
                    """;
        return null;
    }
}

