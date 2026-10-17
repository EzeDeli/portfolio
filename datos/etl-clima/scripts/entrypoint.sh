#!/bin/bash
airflow db init
airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@example.com
# El scheduler es el que ejecuta el DAG cada hora; el webserver solo muestra la interfaz
airflow scheduler &
exec airflow webserver