from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId

uri = "mongodb+srv://MongoDBTestKittithat:9Xc923j1nHEmRTGx@cluster0.ihapg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

app = Flask(__name__)

CORS(app, resources={r"/books/*": {"origins": "https://opulent-space-barnacle-jj799j9vq5w9c474-5173.app.github.dev"}})

client = MongoClient(uri, server_api=ServerApi('1'))
db = client.BookStore
books_collection = db.Books

@app.route("/books", methods=['POST'])
def create_book():
    data = request.get_json()
    if not all(key in data for key in ("title", "author", "image_url")):
        return jsonify({"error": "Missing required fields"}), 400
    
    last_book = books_collection.find_one(sort=[("id", -1)])
    new_id = last_book["id"] + 1 if last_book else 1
    
    new_book = {
        "id": new_id,
        "title": data["title"],
        "author": data["author"],
        "image_url": data["image_url"]
    }
    
    result = books_collection.insert_one(new_book)
    new_book['_id'] = str(result.inserted_id)
    
    return jsonify(new_book), 201

@app.route('/books', methods=['GET'])
def get_all_books():
    books = list(books_collection.find())
    for book in books:
        book['_id'] = str(book['_id'])
    return jsonify({"books": books})

@app.route('/books/<book_id>', methods=['GET'])
def get_book(book_id):
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if book:
        book['_id'] = str(book['_id'])
        return jsonify(book)
    else:
        return jsonify({"error": "Book not found"}), 404

@app.route('/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if book:
        data = request.get_json()

        updated_book = {
            "title": data["title"],
            "author": data["author"],
            "image_url": data["image_url"]
        }
        
        books_collection.update_one({"_id": ObjectId(book_id)}, {"$set": updated_book})

        updated_book["_id"] = book_id
        return jsonify(updated_book), 200
    else:
        return jsonify({"error": "Book not found"}), 404




@app.route('/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    result = books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Book deleted successfully"})
    else:
        return jsonify({"error": "Book not found"}), 404

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
