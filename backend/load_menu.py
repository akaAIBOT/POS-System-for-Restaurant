from app.core.database import SessionLocal
from app.models.menu_item import MenuItem
from app.models.user import User
from app.models.order import Order
from app.models.work_log import WorkLog

db = SessionLocal()

# Clear existing menu
db.query(MenuItem).delete()

# Menu data from wokncats.pl
menu_items = [
    # Makaron
    {"name": "Makaron w sosie sojowym", "description": "Makaron 'Chow Mein', Sos na bazie sosu sojowego, Warzywa sezonowe, Prażona cebulka", "price": 32.00, "category": "Makaron", "available": True},
    {"name": "Makaron sezamowy", "description": "Makaron 'Chow Mein', Sos na bazie tahini, warzywa sezonowe, Sambal, Prażony sezam", "price": 34.00, "category": "Makaron", "available": True},
    {"name": "Makaron Teriyaki", "description": "Makaron chow mein, sos teryiaki naszej produkcji, cebulka, warzywa sezonowe, ananas, orzechy karmelizowane, sezam", "price": 34.00, "category": "Makaron", "available": True},
    {"name": "Ala Pad Thai", "description": "Makaron 'Chow Mein', warzywa sezonowe, sos na bazie tamaryndowca, orzechy karmelizowane, kolendra", "price": 35.00, "category": "Makaron", "available": True},
    {"name": "Tajski Klasyczek", "description": "Makaron 'Chow Mein', warzywa sezonowe, sos Tom Yum na mleku kokosowym, prażona cebulka", "price": 36.00, "category": "Makaron", "available": True},
    
    # Kluski
    {"name": "Basic klucha", "description": "Kopytka własnej produkcji smażone na masełku", "price": 28.00, "category": "Kluski", "available": True},
    {"name": "Kluska Teriyaki", "description": "Kopytka w sosie Teryiaki własnej produkcji, Warzywa sezonowe, Sezam", "price": 38.00, "category": "Kluski", "available": True},
    {"name": "Kluska Grzybowa", "description": "Kopytka własnej produkcji, bulion grzybowy, Grzybki Shime, podgrzybki, portobello, fasolka szparagowa, masło, cebulka prażona", "price": 38.00, "category": "Kluski", "available": True},
    {"name": "Mr.Bisk", "description": "Kopytka własnej produkcji, warzywa sezonowe, sos pomidorowo-krewetkowy w tajskim stylu, wędzone ryżowe chipsy, kolendra", "price": 40.00, "category": "Kluski", "available": True},
    {"name": "Gorgonzilla", "description": "Kopytka własnej produkcji, warzywa sezonowe, sos gorgonzola beszamel, orzech włoski w ziołach", "price": 38.00, "category": "Kluski", "available": True},
    
    # Chrupytka
    {"name": "Klasyczne", "description": "Chrupiące kopytka, spicy mayo, sos serowy, pikle z czerwonej cebuli i chilli, kolendra", "price": 32.00, "category": "Chrupytka", "available": True},
    {"name": "Shroom Crisps", "description": "Chrupytka ziołowe, mayo grzybowo-truflowy, karmelizowana czerwona cebula, smażone pieczarki, szczypiorek", "price": 34.00, "category": "Chrupytka", "available": True},
    {"name": "Cezariusz", "description": "Chrupytka własnej produkcji, sos Cezar, sałata rzymska baby, piklowana cebula, pomidorki cherry, parmezan", "price": 35.00, "category": "Chrupytka", "available": True},
    {"name": "BBQ bless you", "description": "Chrupytka własnej produkcji, sos śliwkowy BBQ, warzywa grillowane, twaróg wędzony, wędzone ryżowe chipsy", "price": 34.00, "category": "Chrupytka", "available": True},
    
    # Napoje
    {"name": "Coca-Cola Zero 0,5l", "description": "", "price": 8.00, "category": "Napoje", "available": True},
    {"name": "Coca-Cola 0,5l", "description": "", "price": 8.00, "category": "Napoje", "available": True},
    {"name": "Fanta 0,5l", "description": "", "price": 8.00, "category": "Napoje", "available": True},
    {"name": "Sprite 0,5l", "description": "", "price": 8.00, "category": "Napoje", "available": True},
    {"name": "Kropla Beskidu niegazowana 0,5l", "description": "", "price": 6.00, "category": "Napoje", "available": True},
    {"name": "Kropla Beskidu gazowana 0,5l", "description": "", "price": 6.00, "category": "Napoje", "available": True},
    {"name": "Corona cero 330 ml", "description": "Better with lime", "price": 12.00, "category": "Napoje", "available": True},
]

# Add all items
for item_data in menu_items:
    item = MenuItem(**item_data)
    db.add(item)

db.commit()
print(f"✅ Dodano {len(menu_items)} pozycji menu z wokncats.pl")
db.close()
