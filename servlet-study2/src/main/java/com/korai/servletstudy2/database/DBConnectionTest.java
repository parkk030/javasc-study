package com.korai.servletstudy2.database;

import com.korai.servletstudy2.entity.Menu;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DBConnectionTest {
    public static void main(String[] args) {
        String protocol = "jdbc:mysql";
        String host = "localhost";
        String port = "3308";
        String username = "root";
        String password = "1q2w3e4r!";
        String databaseName ="hanip_delivery02";

        String url = String.format("%s://%s:%s/%s",protocol,host,port,databaseName);
        // jdbc:mysql :: // localhost:3308 / hanip_delivery02

        List<Menu> menus = new ArrayList<>();


        try(Connection connection = DriverManager.getConnection(url,username,password)){ //db연결 , connection 자동 끊기
            PreparedStatement pstmt = connection.prepareStatement("""
select *
from menus
""");
            ResultSet rs = pstmt.executeQuery();
            while(rs.next()){ //next 호출시 행옮김
                Menu menu = new Menu(
                        rs.getInt("menu_id"),
                        rs.getInt("restaurant_id"),
                        rs.getString("name"),
                        rs.getInt("price"),
                        rs.getString("description"),
                        rs.getBoolean("is_signature"),
                        rs.getBoolean("is_sold_out")
                );

                menus.add(menu);

//                System.out.println(rs.getInt("menu_id"));
//                System.out.println(rs.getInt("restaurant_id"));
//                System.out.println(rs.getString("name"));
//                System.out.println(rs.getInt("price"));
//                System.out.println(rs.getString("description"));
//                System.out.println(rs.getBoolean("is_signature"));
//                System.out.println(rs.getBoolean("is_sold_out"));
            }
        } catch (SQLException e) {
            System.out.println("db연결실패");
            e.printStackTrace();
        }

        menus.forEach(System.out::println);


    }
}
