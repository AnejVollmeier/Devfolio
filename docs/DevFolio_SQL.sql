CREATE DATABASE IF NOT EXISTS DevFolio;

USE DevFolio;

-- TABELE
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS UserType;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Technologies;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Technologies_Projects;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE UserType (
                          id_UserType INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(30)
);

CREATE TABLE Users(
                      id_User INT PRIMARY KEY AUTO_INCREMENT,
                      email VARCHAR(100) UNIQUE NOT NULL,
                      username VARCHAR(20) CHARACTER SET utf8mb4 UNIQUE NOT NULL,
                      password VARCHAR(200) NOT NULL,
                      created_at DATE DEFAULT (CURDATE()),
                      TK_idUserType INT NOT NULL,
                      CONSTRAINT TK_idUserType FOREIGN KEY (TK_idUserType) REFERENCES UserType (id_UserType)
                          ON DELETE RESTRICT
                          ON UPDATE CASCADE
);

CREATE TABLE Projects (
                          id_Project INT PRIMARY KEY AUTO_INCREMENT,
                          title VARCHAR(20) NOT NULL,
                          description TEXT NOT NULL,
                          github_url VARCHAR(100) NOT NULL,
                          address_url VARCHAR(100) NOT NULL,
                          image_url VARCHAR(255),
                          created_at DATE DEFAULT (CURDATE()),
                          TK_idUser INT,
                          CONSTRAINT TK_idUser FOREIGN KEY (TK_idUser) REFERENCES Users (id_User)
                              ON DELETE RESTRICT
                              ON UPDATE CASCADE
);

CREATE TABLE Technologies (
                              id_Technologies INT PRIMARY KEY AUTO_INCREMENT,
                              name VARCHAR(30) NOT NULL,
                              image_url VARCHAR(255),
                              description TEXT
);

CREATE TABLE Messages(
                         id_Messages INT PRIMARY KEY AUTO_INCREMENT,
                         email VARCHAR(100) NOT NULL,
                         subject VARCHAR(30) NOT NULL,
                         message TEXT NOT NULL,
                         created_at DATE DEFAULT (CURDATE())
);

CREATE TABLE Technologies_Projects(
                                      id_Technologies_Projects INT PRIMARY KEY AUTO_INCREMENT,
                                      TK_idTechnologies INT,
                                      TK_idProjects INT,
                                      CONSTRAINT TK_idTechnologies FOREIGN KEY (TK_idTechnologies) REFERENCES Technologies(id_Technologies)
                                          ON DELETE RESTRICT
                                          ON UPDATE CASCADE,
                                      CONSTRAINT TK_Projects FOREIGN KEY (TK_idProjects) REFERENCES Projects (id_Project)
                                          ON DELETE CASCADE
                                          ON UPDATE CASCADE
);

-- INSERT STAVKI

INSERT INTO UserType (name) VALUES
                                ('Admin'),
                                ('Registered');

INSERT INTO Users (email, username, password, TK_idUserType) VALUES
                                                                 ('anej.vollmeier70@gmail.com', 'AnejVollmeier', 'Geslo123', 1),
                                                                 ('Guest', 'Guest', 'Guest', 2);

INSERT INTO Projects (title, description, github_url,address_url, image_url, TK_idUser) VALUES
    ('SkupajTukaj', 'Moja prva stran', 'skupajtukaj.si', 'skupajtukaj.si','/images/projects/skupajtukaj_img.png', 1);

INSERT INTO Technologies (name, image_url, description) VALUES
                                                            ('HTML','/images/technologies/html_img.png','Markup language for web pages.'),
                                                            ('CSS','/images/technologies/css_img.png','Styling language for HTML.'),
                                                            ('JavaScript','/images/technologies/js_img.png','Programming language for the web.'),
                                                            ('Node.js','/images/technologies/node_img.png','Server-side  language.'),
                                                            ('MySQL','/images/technologies/sql_img.png','Relational database management system.'),
                                                            ('Java','/images/technologies/java_img.png','Cool language.');

INSERT INTO Messages (email, subject, message) VALUES
    ('company.company@gmail.com', 'SkupajTukaj Feedback', 'Great work! I love your website.');

INSERT INTO Technologies_Projects (TK_idTechnologies, TK_idProjects) VALUES
                                                                         (1, 1),
                                                                         (2, 1),
                                                                         (3, 1),
                                                                         (4, 1),
                                                                         (5, 1);

UPDATE Users SET password = '$2b$10$N/sHS0/WthA5dKa7Q2NP3uBzXsGIb20zSL1m7pmzay8LLXgp34mFK' WHERE email = 'anej.vollmeier70@gmail.com';
UPDATE Users SET password = '$2b$10$BXrhska6NRdZPt6VEaXpV.4vRXHuF5s3ZIiUMqJL4An7VuUzjNOCG' WHERE email = 'guest.guest';