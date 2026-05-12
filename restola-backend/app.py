from flask import Flask, jsonify, request
from flask_cors import CORS
from decouple import config
from supabase import create_client, Client
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
from werkzeug.utils import secure_filename

# JWT Settings
JWT_SECRET = config('JWT_SECRET', default='your-secret-key-change-this')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 1

# Local auth storage (for when Supabase Auth is rate-limited)
# Format: {email: {"password_hash": "...", "user_id": "..."}}
local_auth_store = {
    # "sanketbarde7322@gmail.com": {
    #     "password_hash": bcrypt.hashpw("S@mbhavbkl03".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
    #     "user_id": "temp-user-id"
    # },
    "admin@restola.com": {
        "password_hash": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "user_id": "admin-user-id"
    }
}

app = Flask(__name__)
CORS(app, origins="*")

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Supabase client setup
def get_supabase_client() -> Client:
    supabase_url = config('SUPABASE_URL', default='')
    supabase_key = config('SUPABASE_KEY', default='')
    if not supabase_url or not supabase_key:
        raise ValueError("Supabase URL and Key must be provided in the .env file.")
    return create_client(supabase_url, supabase_key)

# Helper function to format datetime fields
def format_datetime_fields(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    elif isinstance(data, list):
        for item in data:
            format_datetime_fields(item)
    return data


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def parse_request_data():
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        return request.form.to_dict()
    return request.get_json(silent=True) or {}


def save_logo_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        saved_name = f"restaurant_logo_{uuid.uuid4().hex}.{extension}"
        save_path = os.path.join(UPLOAD_FOLDER, saved_name)
        file.save(save_path)
        return f"{request.host_url.rstrip('/')}/static/uploads/{saved_name}"
    raise ValueError("Invalid image file type")

# ==================== AUTHENTICATION ====================
@app.route('/api/token/', methods=['POST'])
def login():
    """Login endpoint that returns JWT token and user data."""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400
        
        supabase = get_supabase_client()
        
        # Get profile data first
        profile_response = supabase.table('profiles').select('*').eq('email', email).execute()
        profiles = profile_response.data or []
        print(f"Found {len(profiles)} profiles for {email}")
        
        if not profiles:
            # Check if user exists in local auth store (for admin or rate-limited users)
            if email in local_auth_store:
                print(f"Using local auth store for {email}")
                stored = local_auth_store[email]
                # Create a virtual user object
                user = {
                    'id': stored['user_id'],
                    'email': email,
                    'full_name': 'Admin User' if email == 'admin@restola.com' else 'User',
                    'role': 'admin' if email == 'admin@restola.com' else 'customer',
                    'phone': None,
                    'address': None,
                    'created_at': datetime.now().isoformat()
                }
            else:
                print(f"No profile found for {email}")
                return jsonify({"detail": "Invalid credentials"}), 401
        else:
            user = profiles[0]
            print(f"Profile found: {user.get('id')}")
        
        # Verify with Supabase Auth or local store
        auth_success = False
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            auth_success = True
        except Exception as auth_error:
            print(f"Supabase Auth failed: {str(auth_error)}")
            # Try local auth store
            if email in local_auth_store:
                stored = local_auth_store[email]
                if bcrypt.checkpw(password.encode('utf-8'), stored['password_hash'].encode('utf-8')):
                    auth_success = True
                    print(f"Local auth successful for {email}")
        
        if not auth_success:
            return jsonify({"detail": "Invalid credentials"}), 401
        
        # Determine role (special case for admin email)
        role = user.get('role', 'customer')
        if email == "admin@restola.com":
            role = 'admin'
        
        # Generate JWT token
        payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
        }
        access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Update user object with correct role
        user_response = dict(user)
        user_response['role'] = role
        
        return jsonify({
            'access': access_token,
            'user': user_response
        })
        
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@app.route('/api/token/refresh/', methods=['POST'])
def refresh_token():
    """Refresh JWT token."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"detail": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_exp": False})
        except jwt.InvalidTokenError:
            return jsonify({"detail": "Invalid token"}), 401
        
        # Generate new token
        new_payload = {
            'user_id': payload['user_id'],
            'email': payload['email'],
            'role': payload.get('role', 'customer'),
            'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
        }
        new_token = jwt.encode(new_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify({'access': new_token})
        
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

# ==================== EMAIL VERIFICATION ====================
@app.route('/api/verify-email/', methods=['POST'])
def verify_email():
    """Verify email using the token from the verification email."""
    try:
        data = request.json
        token = data.get('token')
        email = data.get('email')
        
        if not token or not email:
            return jsonify({"detail": "Token and email are required"}), 400
        
        supabase = get_supabase_client()
        
        # Verify the email using Supabase
        try:
            supabase.auth.verify_oauth({
                token: token,
                type: 'email'
            })
            return jsonify({"message": "Email verified successfully"}), 200
        except Exception as verify_error:
            # Try alternative verification method
            try:
                supabase.auth.update_user({
                    email: email,
                    email_confirm: True
                })
                return jsonify({"message": "Email verified successfully"}), 200
            except Exception as update_error:
                print(f"Email verification error: {str(update_error)}")
                return jsonify({"detail": "Invalid or expired verification token"}), 400
                
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@app.route('/api/resend-verification/', methods=['POST'])
def resend_verification():
    """Resend verification email."""
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({"detail": "Email is required"}), 400
        
        supabase = get_supabase_client()
        
        try:
            supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    "emailRedirectTo": f"{request.host_url}verify-email"
                }
            })
            return jsonify({"message": "Verification email sent successfully"}), 200
        except Exception as resend_error:
            print(f"Resend verification error: {str(resend_error)}")
            return jsonify({"detail": "Failed to resend verification email"}), 400
                
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

# ==================== PROFILES ====================
@app.route('/api/profiles/', methods=['GET'])
def get_profiles():
    try:
        supabase = get_supabase_client()
        email = request.args.get('email')
        
        if email:
            # Filter by email
            response = supabase.table('profiles').select('*').eq('email', email).execute()
        else:
            # Get all profiles
            response = supabase.table('profiles').select('*').order('created_at', desc=True).execute()
        
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profiles/', methods=['POST'])
def create_profile():
    """Create a new profile. If password is provided, also creates Supabase Auth user with email verification."""
    try:
        supabase = get_supabase_client()
        data = request.json
        password = data.pop('password', None)
        
        # Create Supabase Auth user if password is provided
        auth_created = False
        email_confirmation_sent = False
        if password:
            try:
                auth_response = supabase.auth.sign_up({
                    "email": data['email'],
                    "password": password,
                    "options": {
                        "emailRedirectTo": f"{request.host_url}verify-email"
                    }
                })
                # Use the auth user ID for the profile
                data['id'] = auth_response.user.id
                auth_created = True
                email_confirmation_sent = True
                print(f"Supabase Auth user created: {data['id']}")
            except Exception as auth_error:
                # If auth fails (rate limit, etc), generate our own UUID and store locally
                data['id'] = str(uuid.uuid4())
                # Store in local auth store
                local_auth_store[data['email']] = {
                    'password_hash': bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                    'user_id': data['id']
                }
                print(f"Local auth stored for {data['email']}")
        else:
            data['id'] = str(uuid.uuid4())
        
        data['created_at'] = datetime.now().isoformat()
        data['role'] = data.get('role', 'customer')
        
        # Combine first and last name if provided separately
        if 'first_name' in data and 'last_name' in data:
            data['full_name'] = f"{data.pop('first_name', '')} {data.pop('last_name', '')}".strip()
        
        response = supabase.table('profiles').insert(data).execute()
        result = response.data[0] if response.data else {}
        
        # Add information about email verification
        if password and auth_created:
            result['_message'] = 'Registration successful! Please check your email to verify your account.'
            result['_email_sent'] = email_confirmation_sent
        elif password and not auth_created:
            result['_note'] = 'Auth service temporarily unavailable. Please contact support.'
        
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profiles/<profile_id>/', methods=['GET'])
def get_profile(profile_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('profiles').select('*').eq('id', profile_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Profile not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profiles/<profile_id>/', methods=['PUT', 'PATCH'])
def update_profile(profile_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        
        # Check if profiles table has first_name and last_name columns
        try:
            # Test with a simple select to see what columns exist
            test_response = supabase.table('profiles').select('first_name').limit(1).execute()
            has_first_name = len(test_response.data or []) > 0
        except:
            has_first_name = False
            
        try:
            test_response = supabase.table('profiles').select('last_name').limit(1).execute()
            has_last_name = len(test_response.data or []) > 0
        except:
            has_last_name = False
        
        # Handle missing columns gracefully
        update_data = {}
        
        if has_first_name:
            if 'first_name' in data:
                update_data['first_name'] = data['first_name']
        if has_last_name:
            if 'last_name' in data:
                update_data['last_name'] = data['last_name']
        
        # Always include these fields
        if 'full_name' in data:
            update_data['full_name'] = data['full_name']
        if 'email' in data:
            update_data['email'] = data['email']
        if 'phone' in data:
            update_data['phone'] = data['phone']
        if 'address' in data:
            update_data['address'] = data['address']
        
        response = supabase.table('profiles').update(update_data).eq('id', profile_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Profile not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profiles/<profile_id>/', methods=['DELETE'])
def delete_profile(profile_id):
    try:
        supabase = get_supabase_client()
        supabase.table('profiles').delete().eq('id', profile_id).execute()
        return jsonify({"message": "Profile deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== CUSTOMERS (alias for profiles) ====================
@app.route('/api/customers/', methods=['GET'])
def get_customers():
    return get_profiles()

@app.route('/api/customers/', methods=['POST'])
def create_customer():
    """Alias for create_profile - handles registration."""
    return create_profile()

# ==================== RESTAURANT DETAILS ====================
@app.route('/api/restaurant-details/', methods=['GET'])
def get_restaurant_details():
    try:
        supabase = get_supabase_client()
        response = supabase.table('restaurant_details').select('*').limit(1).execute()
        data = response.data or []
        # Map about to description for frontend
        for item in data:
            if 'about' in item:
                item['description'] = item['about']
        results = data if data else []
        return jsonify({"results": results, "count": len(results)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/restaurant-details/<detail_id>/', methods=['GET'])
def get_restaurant_detail(detail_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('restaurant_details').select('*').eq('id', detail_id).execute()
        data = response.data or []
        if data:
            result = data[0]
            # Map about to description for frontend
            if 'about' in result:
                result['description'] = result['about']
            return jsonify(result)
        return jsonify({"error": "Restaurant details not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/restaurant-details/', methods=['POST'])
def create_restaurant_detail():
    try:
        supabase = get_supabase_client()
        data = parse_request_data()
        # Map description to about for database
        if 'description' in data:
            data['about'] = data.pop('description')
        if 'logo' in request.files:
            data['logo_url'] = save_logo_file(request.files['logo'])
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('restaurant_details').insert(data).execute()
        result = response.data[0] if response.data else {}
        # Map back to description
        if 'about' in result:
            result['description'] = result['about']
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/restaurant-details/<detail_id>/', methods=['PUT', 'PATCH'])
def update_restaurant_detail(detail_id):
    try:
        supabase = get_supabase_client()
        data = parse_request_data()
        # Map description to about for database
        if 'description' in data:
            data['about'] = data.pop('description')
        if 'logo' in request.files:
            data['logo_url'] = save_logo_file(request.files['logo'])
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('restaurant_details').update(data).eq('id', detail_id).execute()
        result = response.data or []
        if result:
            # Map back to description
            if 'about' in result[0]:
                result[0]['description'] = result[0]['about']
            return jsonify(result[0])
        return jsonify({"error": "Restaurant details not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== MENU CATEGORIES ====================
@app.route('/api/menu-categories/', methods=['GET'])
def get_menu_categories():
    try:
        supabase = get_supabase_client()
        response = supabase.table('menu_categories').select('*').order('name').execute()
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-categories/', methods=['POST'])
def create_menu_category():
    try:
        supabase = get_supabase_client()
        data = request.json
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        response = supabase.table('menu_categories').insert(data).execute()
        return jsonify(response.data[0] if response.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-categories/<category_id>/', methods=['GET'])
def get_menu_category(category_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('menu_categories').select('*').eq('id', category_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Category not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-categories/<category_id>/', methods=['PUT', 'PATCH'])
def update_menu_category(category_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        response = supabase.table('menu_categories').update(data).eq('id', category_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Category not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-categories/<category_id>/', methods=['DELETE'])
def delete_menu_category(category_id):
    try:
        supabase = get_supabase_client()
        supabase.table('menu_categories').delete().eq('id', category_id).execute()
        return jsonify({"message": "Category deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== MENU ITEMS ====================
@app.route('/api/menu-items/', methods=['GET'])
def get_menu_items():
    try:
        supabase = get_supabase_client()
        response = supabase.table('menu_items').select('*, menu_categories(name)').order('name').execute()
        data = response.data or []
        # Format the data to include category and category_name
        for item in data:
            # Map category_id to category for frontend compatibility
            if 'category_id' in item:
                item['category'] = item['category_id']
            if item.get('menu_categories'):
                item['category_name'] = item['menu_categories']['name']
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-items/', methods=['POST'])
def create_menu_item():
    try:
        supabase = get_supabase_client()
        data = request.json
        # Map frontend 'category' to database 'category_id'
        if 'category' in data:
            data['category_id'] = data.pop('category')
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('menu_items').insert(data).execute()
        result = response.data[0] if response.data else {}
        # Map category_id back to category for frontend
        if 'category_id' in result:
            result['category'] = result['category_id']
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-items/<item_id>/', methods=['GET'])
def get_menu_item(item_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('menu_items').select('*, menu_categories(name)').eq('id', item_id).execute()
        data = response.data or []
        if data:
            item = data[0]
            if item.get('menu_categories'):
                item['category_name'] = item['menu_categories']['name']
            return jsonify(item)
        return jsonify({"error": "Menu item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-items/<item_id>/', methods=['PUT', 'PATCH'])
def update_menu_item(item_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        # Map frontend 'category' to database 'category_id'
        if 'category' in data:
            data['category_id'] = data.pop('category')
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('menu_items').update(data).eq('id', item_id).execute()
        result = response.data or []
        if result:
            # Map category_id back to category for frontend
            if 'category_id' in result[0]:
                result[0]['category'] = result[0]['category_id']
            return jsonify(result[0])
        return jsonify({"error": "Menu item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu-items/<item_id>/', methods=['DELETE'])
def delete_menu_item(item_id):
    try:
        supabase = get_supabase_client()
        supabase.table('menu_items').delete().eq('id', item_id).execute()
        return jsonify({"message": "Menu item deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== ORDERS ====================
@app.route('/api/orders/', methods=['GET'])
def get_orders():
    try:
        supabase = get_supabase_client()
        response = supabase.table('orders').select('*, order_items(*)').order('created_at', desc=True).execute()
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/', methods=['POST'])
def create_order():
    try:
        supabase = get_supabase_client()
        data = request.json or {}
        items = data.pop('items', [])

        allowed_order_fields = {
            'customer_name',
            'phone',
            'address',
            'total_amount',
            'status',
            'payment_status',
            'payment_method',
            'user_id',
        }
        order_data = {k: v for k, v in data.items() if k in allowed_order_fields}
        order_data['id'] = str(uuid.uuid4())
        order_data['created_at'] = datetime.now().isoformat()
        order_data['updated_at'] = datetime.now().isoformat()

        # Create order
        order_response = supabase.table('orders').insert(order_data).execute()
        order = order_response.data[0] if order_response.data else None

        # Create order items
        if order and items:
            for item in items:
                if 'order' in item:
                    item['order_id'] = item.pop('order')
                if 'menu_item' in item:
                    item['menu_item_id'] = item.pop('menu_item')
                if 'price' in item and 'quantity' in item and 'total_price' not in item:
                    item['total_price'] = float(item['price']) * int(item['quantity'])
                if 'food_name' not in item and 'menu_item_id' in item:
                    menu_response = supabase.table('menu_items').select('name').eq('id', item['menu_item_id']).execute()
                    if menu_response.data:
                        item['food_name'] = menu_response.data[0].get('name')
                item['id'] = str(uuid.uuid4())
                item['order_id'] = order['id']
                item['created_at'] = datetime.now().isoformat()
            supabase.table('order_items').insert(items).execute()

        return jsonify(order), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<order_id>/', methods=['GET'])
def get_order(order_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('orders').select('*, order_items(*)').eq('id', order_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Order not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<order_id>/', methods=['PUT', 'PATCH'])
def update_order(order_id):
    try:
        supabase = get_supabase_client()
        data = request.json or {}

        allowed_order_fields = {
            'customer_name',
            'phone',
            'address',
            'total_amount',
            'status',
            'payment_status',
            'payment_method',
            'user_id',
        }
        update_data = {k: v for k, v in data.items() if k in allowed_order_fields}
        update_data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('orders').update(update_data).eq('id', order_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Order not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<order_id>/', methods=['DELETE'])
def delete_order(order_id):
    try:
        supabase = get_supabase_client()
        supabase.table('orders').delete().eq('id', order_id).execute()
        return jsonify({"message": "Order deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== ORDER ITEMS ====================
@app.route('/api/order-items/', methods=['GET'])
def get_order_items():
    try:
        supabase = get_supabase_client()
        query = supabase.table('order_items').select('*')
        
        # Filter by order_id if provided (frontend uses ?order=orderId)
        order_id = request.args.get('order')
        if order_id:
            query = query.eq('order_id', order_id)
        
        response = query.order('created_at', desc=True).execute()
        data = response.data or []
        
        # Map menu_item_id to menu_item for frontend compatibility
        for item in data:
            if 'menu_item_id' in item:
                item['menu_item'] = item['menu_item_id']
        
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/order-items/', methods=['POST'])
def create_order_item():
    try:
        supabase = get_supabase_client()
        data = request.json
        # Map frontend fields to database fields
        if 'order' in data:
            data['order_id'] = data.pop('order')
        if 'menu_item' in data:
            data['menu_item_id'] = data.pop('menu_item')
        # Calculate total_price if not provided
        if 'price' in data and 'quantity' in data and 'total_price' not in data:
            data['total_price'] = float(data['price']) * int(data['quantity'])
        # Set food_name if not provided (fetch from menu_items)
        if 'food_name' not in data and 'menu_item_id' in data:
            menu_response = supabase.table('menu_items').select('name').eq('id', data['menu_item_id']).execute()
            if menu_response.data:
                data['food_name'] = menu_response.data[0]['name']
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        response = supabase.table('order_items').insert(data).execute()
        result = response.data[0] if response.data else {}
        # Map back to frontend fields
        if 'order_id' in result:
            result['order'] = result['order_id']
        if 'menu_item_id' in result:
            result['menu_item'] = result['menu_item_id']
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/order-items/<item_id>/', methods=['GET'])
def get_order_item(item_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('order_items').select('*').eq('id', item_id).execute()
        data = response.data or []
        if data:
            result = data[0]
            # Map to frontend fields
            if 'order_id' in result:
                result['order'] = result['order_id']
            if 'menu_item_id' in result:
                result['menu_item'] = result['menu_item_id']
            return jsonify(result)
        return jsonify({"error": "Order item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/order-items/<item_id>/', methods=['PUT', 'PATCH'])
def update_order_item(item_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        # Map frontend fields to database fields
        if 'order' in data:
            data['order_id'] = data.pop('order')
        if 'menu_item' in data:
            data['menu_item_id'] = data.pop('menu_item')
        response = supabase.table('order_items').update(data).eq('id', item_id).execute()
        result = response.data or []
        if result:
            # Map back to frontend fields
            if 'order_id' in result[0]:
                result[0]['order'] = result[0]['order_id']
            if 'menu_item_id' in result[0]:
                result[0]['menu_item'] = result[0]['menu_item_id']
            return jsonify(result[0])
        return jsonify({"error": "Order item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== TABLE RESERVATIONS ====================
@app.route('/api/table-reservations/', methods=['GET'])
def get_table_reservations():
    try:
        supabase = get_supabase_client()
        email = request.args.get('email') or request.args.get('user_email')
        query = supabase.table('table_reservations').select('*')
        if email:
            query = query.eq('email', email)
        response = query.order('created_at', desc=True).execute()
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/table-reservations/', methods=['POST'])
def create_table_reservation():
    try:
        supabase = get_supabase_client()
        data = request.json
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('table_reservations').insert(data).execute()
        return jsonify(response.data[0] if response.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/table-reservations/<reservation_id>/', methods=['GET'])
def get_table_reservation(reservation_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('table_reservations').select('*').eq('id', reservation_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Reservation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/table-reservations/<reservation_id>/', methods=['PUT', 'PATCH'])
def update_table_reservation(reservation_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('table_reservations').update(data).eq('id', reservation_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Reservation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/table-reservations/<reservation_id>/', methods=['DELETE'])
def delete_table_reservation(reservation_id):
    try:
        supabase = get_supabase_client()
        supabase.table('table_reservations').delete().eq('id', reservation_id).execute()
        return jsonify({"message": "Reservation deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== EVENT BOOKINGS ====================
@app.route('/api/event-bookings/', methods=['GET'])
def get_event_bookings():
    try:
        supabase = get_supabase_client()
        email = request.args.get('email') or request.args.get('user_email')
        query = supabase.table('event_bookings').select('*')
        if email:
            query = query.eq('email', email)
        response = query.order('created_at', desc=True).execute()
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/event-bookings/', methods=['POST'])
def create_event_booking():
    try:
        supabase = get_supabase_client()
        data = request.json
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('event_bookings').insert(data).execute()
        return jsonify(response.data[0] if response.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/event-bookings/<booking_id>/', methods=['GET'])
def get_event_booking(booking_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('event_bookings').select('*').eq('id', booking_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Booking not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/event-bookings/<booking_id>/', methods=['PUT', 'PATCH'])
def update_event_booking(booking_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('event_bookings').update(data).eq('id', booking_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Booking not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/event-bookings/<booking_id>/', methods=['DELETE'])
def delete_event_booking(booking_id):
    try:
        supabase = get_supabase_client()
        supabase.table('event_bookings').delete().eq('id', booking_id).execute()
        return jsonify({"message": "Booking deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== PAYMENTS ====================
@app.route('/api/payments/', methods=['GET'])
def get_payments():
    try:
        supabase = get_supabase_client()
        # Query orders table for payment information
        response = supabase.table('orders').select('*').order('created_at', desc=True).execute()
        data = response.data or []
        # Transform order data to payment format for frontend
        payments = []
        for item in data:
            payment = {
                'id': item['id'],
                'order': item['id'],
                'amount': item.get('total_amount', 0),
                'payment_method': item.get('payment_method', 'cod'),
                'status': item.get('payment_status', 'pending'),
                'created_at': item.get('created_at'),
                'customer_name': item.get('customer_name', '')
            }
            payments.append(payment)
        return jsonify({"results": payments, "count": len(payments)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payments/', methods=['POST'])
def create_payment():
    # Payments are created as part of orders, not separately
    return jsonify({"error": "Payments are created with orders. Use POST /api/orders/ instead"}), 400

@app.route('/api/payments/<payment_id>/', methods=['GET'])
def get_payment(payment_id):
    try:
        supabase = get_supabase_client()
        # Query orders table for payment information
        response = supabase.table('orders').select('*').eq('id', payment_id).execute()
        data = response.data or []
        if data:
            item = data[0]
            # Transform order data to payment format
            payment = {
                'id': item['id'],
                'order': item['id'],
                'amount': item.get('total_amount', 0),
                'payment_method': item.get('payment_method', 'cod'),
                'status': item.get('payment_status', 'pending'),
                'created_at': item.get('created_at'),
                'customer_name': item.get('customer_name', '')
            }
            return jsonify(payment)
        return jsonify({"error": "Payment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payments/<payment_id>/', methods=['PUT', 'PATCH'])
def update_payment(payment_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        # Map frontend fields to database fields
        update_data = {}
        if 'status' in data:
            update_data['payment_status'] = data['status']
        if 'payment_method' in data:
            update_data['payment_method'] = data['payment_method']
        update_data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('orders').update(update_data).eq('id', payment_id).execute()
        result = response.data or []
        if result:
            item = result[0]
            # Transform order data to payment format
            payment = {
                'id': item['id'],
                'order': item['id'],
                'amount': item.get('total_amount', 0),
                'payment_method': item.get('payment_method', 'cod'),
                'status': item.get('payment_status', 'pending'),
                'created_at': item.get('created_at'),
                'customer_name': item.get('customer_name', '')
            }
            return jsonify(payment)
        return jsonify({"error": "Payment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payments/<payment_id>/', methods=['DELETE'])
def delete_payment(payment_id):
    # Payments are tied to orders, delete the order instead
    try:
        supabase = get_supabase_client()
        supabase.table('orders').delete().eq('id', payment_id).execute()
        return jsonify({"message": "Payment deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== GALLERY IMAGES ====================
@app.route('/api/gallery-images/', methods=['GET'])
def get_gallery_images():
    try:
        supabase = get_supabase_client()
        response = supabase.table('gallery_images').select('*').order('created_at', desc=True).execute()
        data = response.data or []
        return jsonify({"results": data, "count": len(data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gallery-images/', methods=['POST'])
def create_gallery_image():
    try:
        supabase = get_supabase_client()
        data = request.json
        data['id'] = str(uuid.uuid4())
        data['created_at'] = datetime.now().isoformat()
        response = supabase.table('gallery_images').insert(data).execute()
        return jsonify(response.data[0] if response.data else {}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gallery-images/<image_id>/', methods=['GET'])
def get_gallery_image(image_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table('gallery_images').select('*').eq('id', image_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gallery-images/<image_id>/', methods=['PUT', 'PATCH'])
def update_gallery_image(image_id):
    try:
        supabase = get_supabase_client()
        data = request.json
        response = supabase.table('gallery_images').update(data).eq('id', image_id).execute()
        data = response.data or []
        if data:
            return jsonify(data[0])
        return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gallery-images/<image_id>/', methods=['DELETE'])
def delete_gallery_image(image_id):
    try:
        supabase = get_supabase_client()
        supabase.table('gallery_images').delete().eq('id', image_id).execute()
        return jsonify({"message": "Image deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/api/health/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
