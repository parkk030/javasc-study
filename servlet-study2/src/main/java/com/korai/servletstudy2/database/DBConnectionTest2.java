package com.korai.servletstudy2.database;

import com.korai.servletstudy2.entity.Customer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DBConnectionTest2 {

    public static void main(String[] args) {
        String protocol = "jdbc:mysql";
        String host = "localhost";
        String port = "3308";
        String username = "root";
        String password = "1q2w3e4r!";
        String databaseName ="hanip_delivery02";

        String url = String.format("%s://%s:%s/%s",protocol,host,port,databaseName);
        // jdbc:mysql :: // localhost:3308 / hanip_delivery02

        List<Customer> customers  = new ArrayList<>();


        try(Connection connection = DriverManager.getConnection(url,username,password)){ //db연결 , connection 자동 끊기
            PreparedStatement pstmt = connection.prepareStatement("""
select *
from customers
""");
            ResultSet rs = pstmt.executeQuery();
            while(rs.next()){ //next 호출시 행옮김
                Customer customer = new Customer(
                        rs.getInt("customer_id"),
                        rs.getString("name"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("birth_date"),
                        rs.getString("district"),
                        rs.getString("address"),
                        rs.getString("grade"),
                        rs.getBoolean("marketing_agreed"),
                        rs.getString("joined_at")
                );

                customers.add(customer);

//
            }
        } catch (SQLException e) {
            System.out.println("db연결실패");
            e.printStackTrace();
        }

        customers.forEach(System.out::println);


    }


}
