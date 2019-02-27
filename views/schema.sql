DROP TABLE ;

CREATE TABLE IF NOT EXISTS  (
    id SERIAL PRIMARY KEY,
    author VARCHAR(),
    title VARCHAR(),
    isbn VARCHAR(),
    image_url VARCHAR(),
    description VARCHAR()
)