import requests

url = 'https://api.upstox.com/v2/instruments/search'

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI3SEFUUTciLCJqdGkiOiI2OWUzOGRmYjAyYmFlMzRhMWM0ZTlhZWUiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlzRXh0ZW5kZWQiOnRydWUsImlhdCI6MTc3NjUyMDY5OSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxODA4MDg1NjAwfQ.TUFPhkldv2eI5XGPk1eHDTIJ7VXO88nldnGIahSrD1U'
}

params = {
    'query': 'RELIANCE',
    'exchanges': 'NSE',
    'segments': 'FO',
    'instrument_types': 'CE,PE',
    'expiry': 'current_month',
    'atm_offset': 0,
    'page_number': 1,
    'records': 20
}

response = requests.get(url, headers=headers, params=params)

print(response.status_code)
print(response.json())