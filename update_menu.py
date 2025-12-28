from app.core.database import SessionLocal
from app.models.menu_item import MenuItem

db = SessionLocal()

# Delete all existing items
db.query(MenuItem).delete()
db.commit()

# Add real menu items from Wok'N'Cats
items = [
    # Makaron (Noodles)
    MenuItem(name='Makaron w sosie sojowym', description='Makaron Chow Mein, Sos na bazie sosu sojowego, Warzywa sezonowe, Prażona cebulka', price=32.00, category='Makaron', available=True),
    MenuItem(name='Makaron sezamowy', description='Makaron Chow Mein, Sos na bazie tahini, warzywa sezonowe, Sambal, Prażony sezam', price=34.00, category='Makaron', available=True),
    MenuItem(name='Makaron Teriyaki', description='Makaron chow mein, sos teryiaki, cebulka, warzywa sezonowe, ananas, orzechy karmelizowane, sezam', price=34.00, category='Makaron', available=True),
    MenuItem(name='Ala Pad Thai', description='Makaron Chow Mein, warzywa sezonowe, sos na bazie tamaryndowca, orzechy karmelizowane, kolendra', price=35.00, category='Makaron', available=True),
    MenuItem(name='Tajski Klasyczek', description='Makaron Chow Mein, warzywa sezonowe, sos Tom Yum na mleku kokosowym, prażona cebulka', price=36.00, category='Makaron', available=True),
    
    # Kluski (Noodles - different type)
    MenuItem(name='Kluski ramen miso', description='Kluski ramen, bulion miso, warzywa sezonowe, jajko', price=38.00, category='Kluski', available=True),
    MenuItem(name='Kluski udon', description='Kluski udon, warzywa, sos teriyaki', price=36.00, category='Kluski', available=True),
    MenuItem(name='Kluski soba', description='Kluski gryczane soba, warzywa, sos sojowy', price=35.00, category='Kluski', available=True),
    
    # Sushi
    MenuItem(name='California Roll', description='Krab, awokado, ogórek, sezam', price=28.00, category='Sushi', available=True),
    MenuItem(name='Philadelphia Roll', description='Łosoś, ser philadelphia, ogórek', price=32.00, category='Sushi', available=True),
    MenuItem(name='Spicy Tuna Roll', description='Tuńczyk, sos chili, ogórek, sezam', price=34.00, category='Sushi', available=True),
    MenuItem(name='Nigiri Set', description='Mix nigiri: łosoś, tuńczyk, krewetka', price=42.00, category='Sushi', available=True),
    
    # Napoje (Drinks)
    MenuItem(name='Coca Cola', description='Napój gazowany 330ml', price=8.00, category='Napoje', available=True),
    MenuItem(name='Sprite', description='Napój gazowany 330ml', price=8.00, category='Napoje', available=True),
    MenuItem(name='Herbata zielona', description='Herbata zielona 300ml', price=10.00, category='Napoje', available=True),
    MenuItem(name='Sok pomarańczowy', description='Świeżo wyciskany sok 250ml', price=12.00, category='Napoje', available=True),
    
    # Dodatki
    MenuItem(name='Spring rolls', description='Sajgonki warzywne 4 szt', price=18.00, category='Dodatki', available=True),
    MenuItem(name='Gyoza', description='Pierożki gyoza z kurczakiem 5 szt', price=22.00, category='Dodatki', available=True),
    MenuItem(name='Edamame', description='Gotowane strączki soi z solą morską', price=15.00, category='Dodatki', available=True),
]

db.add_all(items)
db.commit()
print(f'✅ Dodano {len(items)} pozycji z menu WokNCats')
db.close()
