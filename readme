# 0.1. create .env from .env.example (ADD YOUR PERSONAL GEMINI KEY)

cp .env.example .env # Windows: copy .env.example .env

# 1. Create venv

python -m venv .venv

# 2. Activate it

.venv\Scripts\Activate # Windows
source .venv/bin/activate # Mac/Linux

# 3. Install dependencies

pip install -r requirements.txt

# 3.5 Creating Database

    # 3.6 Download the Food.com dataset
    #Go to the Kaggle dataset:
    https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews

    # Download the dataset ZIP & extract RAW_recipes.csv
    # Place it in the project under:
    ./data/RAW_recipes.csv

    # 3.7 Run the ETL script from project root
    python etl_foodcom.py

        # You should see progress logs like:

        # Loaded 5000 recipes...
        # Loaded 10000 recipes...
        # ...
        # ETL Completed!
        # When it finishes, you should see recipes.db 

# 4. Run Server

python -m uvicorn main:app --reload

#API available at: Swagger UI: http://127.0.0.1:8000/docs

# After setting up venv and requirements (generate db)

python etl_foodcom.py

# REMEMBER: update requirements if additional ones added

pip freeze > requirements.txt
