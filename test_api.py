import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_auth():
    print("Testing Registration...")
    user_data = {
        "username": "testteacher",
        "email": "test@example.com",
        "password": "password123"
    }
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if res.status_code == 200:
            print("✅ Registration successful")
            token = res.json()["access_token"]
        else:
            print(f"❌ Registration failed: {res.text}")
            # Try login if already registered
            res = requests.post(f"{BASE_URL}/auth/login", data={"username": "testteacher", "password": "password123"})
            if res.status_code == 200:
                print("✅ Login successful")
                token = res.json()["access_token"]
            else:
                return
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nTesting Me endpoint...")
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if res.status_code == 200:
        print(f"✅ Me endpoint works: {res.json()['username']}")
    else:
        print(f"❌ Me endpoint failed: {res.text}")

    print("\nTesting Brainstorm endpoint...")
    res = requests.post(f"{BASE_URL}/brainstorm", json="Интерактивная химия", headers=headers)
    if res.status_code == 200:
        print("✅ Brainstorm works")
    else:
        print(f"❌ Brainstorm failed: {res.text}")

if __name__ == "__main__":
    print("Starting integration tests...")
    test_auth()
