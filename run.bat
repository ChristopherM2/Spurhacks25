git pull origin main --force


start powershell -NoExit -Command "cd backend;. .\.venv\Scripts\Activate; pip install -r requirements.txt;  python manage.py runserver "


start powershell -NoExit -Command "cd frontend; npm install; npm run dev"

timeout 5

start http://localhost:3000