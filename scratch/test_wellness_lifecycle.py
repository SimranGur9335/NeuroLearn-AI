import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("=======================================")
    print("RUNNING LEARNING WELLNESS MODULE TESTS")
    print("=======================================")

    # 1. Login as student
    login_payload = {
        "email": "student@neurolearn.ai",
        "password": "Password123",
        "role": "student",
        "institution_id": 1
    }
    print("[1] Logging in...")
    r = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} {r.text}")
        sys.exit(1)
    
    resp_data = r.json()
    token = resp_data["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login success! Token retrieved: {token[:20]}...")

    # 2. Get preferences
    print("\n[2] Getting wellness preferences...")
    r = requests.get(f"{BASE_URL}/wellness/preferences", headers=headers)
    assert r.status_code == 200, f"Failed getting preferences: {r.text}"
    prefs = r.json()
    print("Current Preferences:", json.dumps(prefs, indent=2))

    # 3. Update preferences
    print("\n[3] Updating wellness preferences...")
    update_pref_payload = {
        "pomodoro_preset": 30,
        "daily_study_goal": 5.5,
        "daily_sleep_goal": 7.5,
        "preferred_focus_duration": 45,
        "reminder_time": "08:30",
        "notification_preference": False
    }
    r = requests.put(f"{BASE_URL}/wellness/preferences", json=update_pref_payload, headers=headers)
    assert r.status_code == 200, f"Failed updating preferences: {r.text}"
    updated_prefs = r.json()
    print("Updated Preferences:", json.dumps(updated_prefs, indent=2))
    assert updated_prefs["pomodoro_preset"] == 30
    assert float(updated_prefs["daily_study_goal"]) == 5.5
    assert float(updated_prefs["daily_sleep_goal"]) == 7.5
    assert updated_prefs["preferred_focus_duration"] == 45
    assert updated_prefs["reminder_time"] == "08:30"
    assert updated_prefs["notification_preference"] is False
    print("Preferences update successfully verified!")

    # 4. Check-in validation and lifecycle
    print("\n[4] Testing Daily Check-in validation constraints...")
    
    # Try invalid sleep hours
    invalid_checkin = {
        "mood": "happy",
        "energy_level": 8,
        "focus_level": 8,
        "stress_level": 3,
        "sleep_hours": 25.0, # invalid
        "planned_study_hours": 4.0,
        "learning_goal": "Study ML algorithms"
    }
    r = requests.post(f"{BASE_URL}/wellness/checkin", json=invalid_checkin, headers=headers)
    assert r.status_code == 400, f"Expected 400 validation error for sleep hours, got: {r.status_code} {r.text}"
    print("Validated sleep hours > 24 correctly blocked.")

    # Try invalid mood
    invalid_checkin["sleep_hours"] = 8.0
    invalid_checkin["mood"] = "excited" # invalid mood
    r = requests.post(f"{BASE_URL}/wellness/checkin", json=invalid_checkin, headers=headers)
    assert r.status_code == 400, f"Expected 400 validation error for invalid mood, got: {r.status_code} {r.text}"
    print("Validated invalid mood correctly blocked.")

    # Valid check-in submission
    print("Submitting valid check-in...")
    valid_checkin = {
        "mood": "focused",
        "energy_level": 9,
        "focus_level": 8,
        "stress_level": 2,
        "sleep_hours": 8.0,
        "planned_study_hours": 5.0,
        "learning_goal": "Code APIs in FastAPI"
    }
    r = requests.post(f"{BASE_URL}/wellness/checkin", json=valid_checkin, headers=headers)
    assert r.status_code == 200, f"Failed posting checkin: {r.text}"
    checkin_resp = r.json()
    print("Check-in Response:", checkin_resp)
    assert checkin_resp["success"] is True

    # Read today's check-in
    r = requests.get(f"{BASE_URL}/wellness/checkin/today", headers=headers)
    assert r.status_code == 200, f"Failed getting today's checkin: {r.text}"
    today_checkin = r.json()
    print("Today's Check-in:", json.dumps(today_checkin, indent=2))
    assert today_checkin["mood"] == "focused"
    assert int(today_checkin["energy_level"]) == 9
    assert float(today_checkin["sleep_hours"]) == 8.0
    
    # Update today's check-in
    print("Updating today's check-in...")
    update_checkin = {
        "mood": "happy",
        "energy_level": 10,
        "sleep_hours": 8.5
    }
    r = requests.put(f"{BASE_URL}/wellness/checkin/today", json=update_checkin, headers=headers)
    assert r.status_code == 200, f"Failed updating today's checkin: {r.text}"
    
    # Verify updated check-in
    r = requests.get(f"{BASE_URL}/wellness/checkin/today", headers=headers)
    assert r.status_code == 200
    today_checkin = r.json()
    assert today_checkin["mood"] == "happy"
    assert int(today_checkin["energy_level"]) == 10
    assert float(today_checkin["sleep_hours"]) == 8.5
    print("Check-in update successfully verified!")

    # 5. Weekly Reflection lifecycle
    print("\n[5] Testing Weekly Reflection CRUD...")
    
    # Try invalid reflection length
    invalid_reflection = {
        "reflection_text": "hi" # too short (<3 chars)
    }
    r = requests.post(f"{BASE_URL}/wellness/reflection", json=invalid_reflection, headers=headers)
    assert r.status_code == 400, f"Expected 400 for short reflection, got {r.status_code}"
    print("Validated short reflection text blocked.")

    # Create reflection
    valid_reflection = {
        "reflection_text": "This week I made great progress in completing the Learning Wellness backend integration. I solved the database schema, Pydantic validations, and statistics recalculation engine."
    }
    r = requests.post(f"{BASE_URL}/wellness/reflection", json=valid_reflection, headers=headers)
    assert r.status_code == 200, f"Failed creating reflection: {r.text}"
    reflection_id = r.json()["reflection_id"]
    print(f"Created reflection ID: {reflection_id}")

    # Read reflection by ID
    r = requests.get(f"{BASE_URL}/wellness/reflection/{reflection_id}", headers=headers)
    assert r.status_code == 200, f"Failed getting reflection: {r.text}"
    ref = r.json()
    print("Reflection Details:", ref)
    assert ref["reflection_text"] == valid_reflection["reflection_text"]

    # Update reflection
    updated_reflection = {
        "reflection_text": "Updated reflection text for the weekly evaluation to make sure CRUD works flawlessly."
    }
    r = requests.put(f"{BASE_URL}/wellness/reflection/{reflection_id}", json=updated_reflection, headers=headers)
    assert r.status_code == 200, f"Failed updating reflection: {r.text}"

    # Get history
    r = requests.get(f"{BASE_URL}/wellness/reflection/history", headers=headers)
    assert r.status_code == 200, f"Failed getting history: {r.text}"
    history = r.json()
    assert len(history) > 0
    assert history[0]["reflection_id"] == reflection_id
    assert history[0]["reflection_text"] == updated_reflection["reflection_text"]
    print("Reflection history verified!")

    # 6. Focus Session Studio lifecycle and interruptions tracking
    print("\n[6] Testing Focus Session Studio operations...")
    
    # Start focus session
    start_payload = {
        "preset_minutes": 25
    }
    r = requests.post(f"{BASE_URL}/wellness/focus/start", json=start_payload, headers=headers)
    assert r.status_code == 200, f"Failed starting focus session: {r.text}"
    session_data = r.json()
    session_id = session_data["session_id"]
    print(f"Started focus session ID: {session_id}")
    assert session_data["status"] == "running"
    assert session_data["interruptions_count"] == 0

    # Pause focus session (increments interruptions)
    r = requests.post(f"{BASE_URL}/wellness/focus/{session_id}/pause", headers=headers)
    assert r.status_code == 200, f"Failed pausing focus: {r.text}"
    print("Focus session paused.")

    # Resume focus session
    r = requests.post(f"{BASE_URL}/wellness/focus/{session_id}/resume", headers=headers)
    assert r.status_code == 200, f"Failed resuming focus: {r.text}"
    print("Focus session resumed.")

    # Pause focus session again (second interruption)
    r = requests.post(f"{BASE_URL}/wellness/focus/{session_id}/pause", headers=headers)
    assert r.status_code == 200
    print("Focus session paused second time.")

    # Complete focus session
    complete_payload = {
        "duration_minutes": 20,
        "status": "completed",
        "interruptions_count": 2
    }
    r = requests.post(f"{BASE_URL}/wellness/focus/{session_id}/complete", json=complete_payload, headers=headers)
    assert r.status_code == 200, f"Failed completing focus session: {r.text}"
    complete_data = r.json()
    print("Complete Response:", complete_data)
    assert complete_data["success"] is True
    assert complete_data["xp_earned"] == 50
    assert complete_data["status"] == "completed"

    # Verify session details in focus history
    r = requests.get(f"{BASE_URL}/wellness/focus/history", headers=headers)
    assert r.status_code == 200, f"Failed getting focus history: {r.text}"
    focus_history = r.json()
    latest_sess = [f for f in focus_history if f["session_id"] == session_id][0]
    print("Latest focus session in history:", latest_sess)
    assert latest_sess["status"] == "completed"
    assert latest_sess["interruptions_count"] == 2
    assert latest_sess["duration_minutes"] == 20
    print("Focus studio session lifecycle and interruptions tracking verified!")

    # 7. Statistics recalculations and Dashboard metrics
    print("\n[7] Testing Statistics calculations...")
    r = requests.get(f"{BASE_URL}/wellness/statistics?range=weekly", headers=headers)
    assert r.status_code == 200, f"Failed getting statistics: {r.text}"
    stats = r.json()
    print("Wellness Statistics Dashboard:", json.dumps(stats, indent=2))
    
    assert "focus_score" in stats
    assert "weekly_study_hours" in stats
    assert "monthly_study_hours" in stats
    assert "average_stress" in stats
    assert "average_sleep" in stats
    assert "chart_data" in stats
    
    print("\nALL LEARNING WELLNESS MODULE INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================")

if __name__ == "__main__":
    run_tests()
