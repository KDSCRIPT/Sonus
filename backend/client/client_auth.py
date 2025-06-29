from flask import request, jsonify,Blueprint
from utils.env_variables_loader import CLERK_PUBLISHABLE_KEY
from functools import wraps
import requests
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from jwt.algorithms import RSAAlgorithm


CLERK_FRONTEND_API = CLERK_PUBLISHABLE_KEY.split("_")[1]  # e.g. 'test', 'abcd123'
CLERK_ISSUER = "https://accepted-narwhal-55.clerk.accounts.dev"
JWKS_URL = "https://accepted-narwhal-55.clerk.accounts.dev/.well-known/jwks.json"

def verify_clerk_token(token: str):
    """Verify Clerk JWT token and return user claims"""
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[len("Bearer "):]

        # Decode header to get 'kid'
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            print("No 'kid' found in token header")
            return None

        # Fetch JWKS from Clerk
        jwks_response = requests.get(JWKS_URL)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

        # Find the JWK with the correct 'kid'
        key_data = next((key for key in jwks["keys"] if key["kid"] == kid), None)
        if not key_data:
            print("No matching key found in JWKS")
            return None

        # Convert JWK to public RSA key
        public_key = RSAAlgorithm.from_jwk(key_data)

        # Decode and verify token
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}  # Set to True if you need audience check
        )

        return payload

    except ExpiredSignatureError:
        print("Token expired")
        return None
    except JWTError as e:
        print(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error during verification: {e}")
        return None
    
# Clerk Auth Decorator
def auth_required(f):
    """Decorator to ensure that the user is authenticated using Clerk token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract the token from the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "Authorization header required"}), 401
        
        # Verify the Clerk token
        user_data = verify_clerk_token(auth_header)
        if not user_data:
            return jsonify({"message": "Invalid or expired token"}), 401
        
        # Add user info to the request context
        request.user = {
            'id': user_data.get('sub'),  # Clerk user ID
            'email': user_data.get('email'),
            'name': user_data.get('name', ''),
            'first_name': user_data.get('given_name', ''),
            'last_name': user_data.get('family_name', '')
        }
        
        return f(*args, **kwargs)
    
    return decorated_function