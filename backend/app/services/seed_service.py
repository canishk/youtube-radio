import json
from sqlalchemy.orm import Session

from app.models.category import Category

def seed_categories(db: Session):
    existing = db.query(Category).first()
    if existing:
        print("Categories already seeded.")
        return
    with open("app/data/categories.json", "r") as file:
        categories = json.load(file)
        for cat in categories:
            category = Category(
                id=cat["id"],
                name=cat["name"], 
                description=cat["description"],
                thumbnail=cat["thumbnail"],
                auto_mode=cat["auto_mode"]
            )
            db.add(category)
        db.commit()
        print(f"Seeded {len(categories)} categories.")
    
