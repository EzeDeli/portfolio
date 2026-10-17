CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100),
    temperature FLOAT,
    humidity FLOAT,
    description VARCHAR(200),
    population INT,
    country VARCHAR(100),
    extract_date DATE,
    timestamp TIMESTAMP
);