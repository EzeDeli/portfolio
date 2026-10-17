# Copiar este archivo como constants.py y completar los valores.
# constants.py esta en el .gitignore: las claves nunca se suben al repo.

API_KEY = 'tu-api-key-de-openweathermap'
CITIES = ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'La Plata']
CSV_FILE = '/opt/airflow/scripts/cities_info.csv'

# Conexion al data warehouse (Amazon Redshift)
DB_PARAMS = {
    'host': 'tu-cluster.redshift.amazonaws.com',
    'port': 5439,
    'dbname': 'tu_base',
    'user': 'tu_usuario',
    'password': 'tu_password',
}

# Alertas por mail cuando una ciudad supera los 30 grados
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USER = 'tu-mail@gmail.com'
EMAIL_PASSWORD = 'tu-app-password'
RECIPIENT_EMAIL = 'destinatario@mail.com'
