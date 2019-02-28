DROP TABLE IF EXISTS books ;

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn VARCHAR(255),
    image_url VARCHAR(255),
    description VARCHAR(255)
);

INSERT INTO books (title, author, isbn, image_url, description) 
VALUES('Cranking Out Code With Sam','Sam Hamm','ISBN 1234567','https://via.placeholder.com/30','Coding with Sam is a blast');

INSERT INTO books (title, author, isbn, image_url, description) 
VALUES('Barking with Demi','Demi Dog','ISBN 7654321','https://via.placeholder.com/30','Who is that knocking at the door?');