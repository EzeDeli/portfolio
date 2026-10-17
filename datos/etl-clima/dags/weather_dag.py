from io import StringIO

import pandas as pd
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator
from datetime import datetime, timedelta
from scripts.etl_weather import extract_weather_data, extract_city_info, transform_data, load_data, check_temperature_alerts

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'email': ['tu_email@example.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'weather_etl',
    default_args=default_args,
    description='A DAG for weather ETL process',
    schedule_interval=timedelta(hours=1),
    catchup=False,
)


# Las tareas se pasan los datos por XCom. Un DataFrame no se puede guardar
# ahi directamente, asi que viaja como JSON y se vuelve a armar del otro lado.
def a_json(df):
    return df.to_json(orient='records', date_format='iso')


def desde_json(ti, task_id):
    return pd.read_json(StringIO(ti.xcom_pull(task_ids=task_id)), orient='records')


def tarea_extract_weather():
    return a_json(extract_weather_data())


def tarea_extract_city():
    return a_json(extract_city_info())


def tarea_transform(ti):
    weather_df = desde_json(ti, 'extract_weather_data')
    city_info_df = desde_json(ti, 'extract_city_info')
    return a_json(transform_data(weather_df, city_info_df))


def tarea_load(ti):
    df = desde_json(ti, 'transform_data')
    # JSON no guarda tipos de fecha: se recuperan antes de insertar
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['extract_date'] = pd.to_datetime(df['extract_date']).dt.date
    load_data(df)


def tarea_alertas(ti):
    check_temperature_alerts(desde_json(ti, 'transform_data'))


start = EmptyOperator(task_id='start', dag=dag)

extract_weather = PythonOperator(
    task_id='extract_weather_data',
    python_callable=tarea_extract_weather,
    dag=dag,
)

extract_city = PythonOperator(
    task_id='extract_city_info',
    python_callable=tarea_extract_city,
    dag=dag,
)

transform = PythonOperator(
    task_id='transform_data',
    python_callable=tarea_transform,
    dag=dag,
)

load = PythonOperator(
    task_id='load_data',
    python_callable=tarea_load,
    dag=dag,
)

alert = PythonOperator(
    task_id='check_temperature_alerts',
    python_callable=tarea_alertas,
    dag=dag,
)

end = EmptyOperator(task_id='end', dag=dag)

start >> [extract_weather, extract_city] >> transform >> load >> alert >> end
