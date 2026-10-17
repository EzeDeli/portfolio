import requests
import pandas as pd
import psycopg2
from datetime import datetime

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from constants.constants import *

def extract_weather_data():
    data = []
    for city in CITIES:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'
        response = requests.get(url)
        if response.status_code == 200:
            weather_data = response.json()
            data.append({
                'city': city,
                'temperature': weather_data['main']['temp'],
                'humidity': weather_data['main']['humidity'],
                'description': weather_data['weather'][0]['description'],
                'timestamp': datetime.now()
            })
    return pd.DataFrame(data)

def extract_city_info():
    return pd.read_csv(CSV_FILE)

def transform_data(weather_df, city_info_df):
    # Combinar los dataframes
    df = pd.merge(weather_df, city_info_df, on='city')
    
    # Añadir columnas derivadas
    df['temperature_fahrenheit'] = df['temperature'] * 9/5 + 32
    df['extract_date'] = datetime.now().date()
    
    return df

def load_data(df, table_name='weather_data'):
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    
    for _, row in df.iterrows():
        cur.execute(
            f"""
            INSERT INTO {table_name} 
            (city, temperature, humidity, description, population, country, extract_date, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (row['city'], row['temperature'], row['humidity'], row['description'],
             row['population'], row['country'], row['extract_date'], row['timestamp'])
        )
    
    conn.commit()
    cur.close()
    conn.close()

def send_alert(city, temperature):
    subject = f'Alerta de temperatura alta en {city}'
    body = f'La temperatura en {city} ha alcanzado {temperature}°C, superando el umbral de alerta.'
    
    message = MIMEMultipart()
    message['From'] = EMAIL_USER
    message['To'] = RECIPIENT_EMAIL
    message['Subject'] = subject
    message.attach(MIMEText(body, 'plain'))
    
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(message)

def check_temperature_alerts(df, threshold=30):
    high_temp_cities = df[df['temperature'] > threshold]
    for _, row in high_temp_cities.iterrows():
        send_alert(row['city'], row['temperature'])


# Funcion que llama a todas las funciones
def etl_process():
    weather_data = extract_weather_data()
    city_info = extract_city_info()
    transformed_data = transform_data(weather_data, city_info)
    load_data(transformed_data)
    check_temperature_alerts(transformed_data)

if __name__ == "__main__":
    etl_process()
