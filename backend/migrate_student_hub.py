# migrate_student_hub.py
import sys
import os
import json
from sqlalchemy import text

# Ensure we can import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import SessionLocal

def run_migrations_and_seeding():
    db = SessionLocal()
    print("Running Student Hub migrations...")
    try:
        # 1. Create college_notes table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS college_notes (
                note_id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                semester INTEGER NOT NULL,
                subject_code VARCHAR(50) NOT NULL,
                subject_name VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_size INTEGER NOT NULL,
                download_count INTEGER DEFAULT 0,
                institution_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: college_notes table created.")

        # 2. Create programming_topics table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS programming_topics (
                topic_id SERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                icon VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: programming_topics table created.")

        # 3. Create programming_questions table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS programming_questions (
                question_id SERIAL PRIMARY KEY,
                topic_id INTEGER REFERENCES programming_topics(topic_id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                difficulty VARCHAR(50) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: programming_questions table created.")

        # 4. Create student_programming_progress table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_programming_progress (
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                question_id INTEGER REFERENCES programming_questions(question_id) ON DELETE CASCADE,
                completed BOOLEAN DEFAULT TRUE,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_id, question_id)
            );
        """))
        db.commit()
        print("OK: student_programming_progress table created.")

        # --- SEEDING DATA ---
        print("Seeding Student Hub tables...")

        # A. Seed College Notes
        notes_count = db.execute(text("SELECT COUNT(*) FROM college_notes")).scalar()
        if notes_count == 0:
            notes_data = [
                ("Alternating Current (AC) Circuits Analysis", "Fundamentals of AC circuits, impedance, phase relations, and resonance filters.", 1, "EE101", "Basic Electrical Engineering"),
                ("Calculus and Linear Algebra Guide", "Detailed walkthroughs of Taylor series expansion, eigenvalue analysis, and vector calculus.", 1, "MA101", "Engineering Mathematics I"),
                ("Newtonian Mechanics & Wave Optics", "Review notes covering physical friction, harmonics oscillator equations, and double slit diffraction.", 2, "PH102", "Engineering Physics"),
                ("Pointers and Memory Allocation in C", "Deep dive guide explaining memory layouts, pointer arithmetic, void pointers, dynamic allocation, and struct alignment.", 2, "CS102", "Programming in C"),
                ("Binary Search Trees & Heap Implementations", "Step-by-step algorithms, node rotations, complexity bounds, and priority queues implementations.", 3, "CS201", "Data Structures and Algorithms"),
                ("Karnaugh Maps and Logic Gate Minimization", "Detailed examples on simplifying Boolean expressions, multiplexers, decoders, and synchronous counters.", 3, "EC201", "Digital Electronics"),
                ("Normal Forms and Transaction Concurrency Control", "Guide on relational schemas, 1NF/2NF/3NF/BCNF mappings, ACID logs, and two-phase locking.", 4, "CS202", "Database Management Systems"),
                ("Operating Systems: CPU Scheduling & Semaphores", "Visual walkthrough of Round Robin, SJF, SRTF, and solutions to the dining philosophers problem.", 4, "CS203", "Operating Systems"),
                ("Supervised Learning Regression Models", "Detailed math for Gradient Descent, Linear/Logistic regression, cost curves, and overfitting corrections.", 5, "CS301", "Machine Learning"),
                ("AWS EC2 and Serverless Architecture Design", "Hands-on guide explaining VPC subnetting, Lambda handlers, API gateway routes, and S3 asset buckets.", 6, "CS302", "Cloud Computing"),
                ("Asymmetric Cryptography and SSL/TLS Handshake", "Explains RSA mathematical proofs, Diffie-Hellman exchanges, certificate sign authorities, and HTTPS packets.", 7, "CS401", "Cybersecurity"),
                ("Solidity Smart Contract Security Best Practices", "Preventing reentrancy hacks, overflow errors, block timestamp vulnerabilities, and gas cost optimization patterns.", 8, "CS402", "Emerging Technologies")
            ]
            for title, desc, sem, code, name in notes_data:
                db.execute(text("""
                    INSERT INTO college_notes (title, description, semester, subject_code, subject_name, file_url, file_name, file_size, download_count)
                    VALUES (:title, :desc, :sem, :code, :name, 'https://arxiv.org/pdf/1706.03762.pdf', :fname, :fsize, :dcount)
                """), {
                    "title": title,
                    "desc": desc,
                    "sem": sem,
                    "code": code,
                    "name": name,
                    "fname": f"{title.lower().replace(' ', '_').replace('(', '').replace(')', '')}.pdf",
                    "fsize": 1024 * 1450,
                    "dcount": int(20 + 80 * (sem / 8))
                })
            db.commit()
            print("OK: Seeded 12 college notes across Semesters 1 to 8.")
        else:
            print(f"Notes table already seeded ({notes_count} records). Skipping.")

        # B. Seed Programming Topics & Questions
        topics_count = db.execute(text("SELECT COUNT(*) FROM programming_topics")).scalar()
        if topics_count == 0:
            topics_data = [
                # category, title, description, icon
                ("DSA", "Arrays & Hashing", "Master memory layouts, prefix arrays, two-pointer tracking, hash tables lookup, and sorting boundaries.", "LayoutTemplate"),
                ("DSA", "Linked Lists & Trees", "Learn pointers routing, fast/slow runners, tree traversals (DFS/BFS), and BST search properties.", "Infinity"),
                ("DSA", "Dynamic Programming", "Understand memoization templates, tabular subproblems, and knapsack optimizations.", "TrendingUp"),
                ("Languages", "Python Mastery", "Learn list comprehensions, decorators, generators, dunder methods, and asyncio routines.", "BrainCircuit"),
                ("Languages", "C++ Programming", "Explore templates, smart pointers (unique/shared), STL algorithms, and memory scopes.", "Cpu"),
                ("Languages", "JavaScript Core", "Master closures, event loops, promises async/await, prototype chains, and DOM triggers.", "Sparkles")
            ]
            for cat, title, desc, icon in topics_data:
                topic_id = db.execute(text("""
                    INSERT INTO programming_topics (category, title, description, icon)
                    VALUES (:cat, :title, :desc, :icon)
                    RETURNING topic_id
                """), {"cat": cat, "title": title, "desc": desc, "icon": icon}).scalar()

                # Seed Questions based on topic
                questions_to_seed = []
                if title == "Arrays & Hashing":
                    questions_to_seed = [
                        ("Two Sum", "Easy", "Leetcode", "https://leetcode.com/problems/two-sum/"),
                        ("Contains Duplicate", "Easy", "Leetcode", "https://leetcode.com/problems/contains-duplicate/"),
                        ("Group Anagrams", "Medium", "Leetcode", "https://leetcode.com/problems/group-anagrams/"),
                        ("Product of Array Except Self", "Medium", "Leetcode", "https://leetcode.com/problems/product-of-array-except-self/"),
                        ("Array Subsegment sum query", "Hard", "Codeforces", "https://codeforces.com/problemset/problem/1201/C")
                    ]
                elif title == "Linked Lists & Trees":
                    questions_to_seed = [
                        ("Reverse Linked List", "Easy", "Leetcode", "https://leetcode.com/problems/reverse-linked-list/"),
                        ("Merge Two Sorted Lists", "Easy", "Leetcode", "https://leetcode.com/problems/merge-two-sorted-lists/"),
                        ("Lowest Common Ancestor of a BST", "Medium", "Leetcode", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"),
                        ("Binary Tree Level Order Traversal", "Medium", "Leetcode", "https://leetcode.com/problems/binary-tree-level-order-traversal/"),
                        ("BST balancing sheet tutorial", "Easy", "GitHub", "https://github.com/jwasham/coding-interview-university")
                    ]
                elif title == "Dynamic Programming":
                    questions_to_seed = [
                        ("Climbing Stairs", "Easy", "Leetcode", "https://leetcode.com/problems/climbing-stairs/"),
                        ("Coin Change", "Medium", "Leetcode", "https://leetcode.com/problems/coin-change/"),
                        ("Longest Common Subsequence", "Medium", "Leetcode", "https://leetcode.com/problems/longest-common-subsequence/"),
                        ("0-1 Knapsack Practice Sheet", "Medium", "HackerRank", "https://www.hackerrank.com/domains/algorithms"),
                        ("Edit Distance", "Hard", "Leetcode", "https://leetcode.com/problems/edit-distance/")
                    ]
                elif title == "Python Mastery":
                    questions_to_seed = [
                        ("Write a Function (Intro)", "Easy", "HackerRank", "https://www.hackerrank.com/challenges/write-a-function/problem"),
                        ("Decorators 2 - Name Directory", "Medium", "HackerRank", "https://www.hackerrank.com/challenges/decorators-2-name-directory/problem"),
                        ("Python AsyncIO Handbook", "Easy", "GitHub", "https://github.com/vinta/awesome-python"),
                        ("List Comprehensions Practice", "Easy", "HackerRank", "https://www.hackerrank.com/challenges/list-comprehensions/problem")
                    ]
                elif title == "C++ Programming":
                    questions_to_seed = [
                        ("Virtual Functions practice", "Medium", "HackerRank", "https://www.hackerrank.com/challenges/virtual-functions/problem"),
                        ("C++ Vector sorting algorithm", "Easy", "HackerRank", "https://www.hackerrank.com/challenges/vector-sort/problem"),
                        ("Modern C++ features summary", "Medium", "GitHub", "https://github.com/AnthonyCalandra/modern-cpp-features")
                    ]
                elif title == "JavaScript Core":
                    questions_to_seed = [
                        ("Closure logic interview checks", "Easy", "Practice", "https://github.com/lydiahallie/javascript-questions"),
                        ("Promise Time Limit", "Medium", "Leetcode", "https://leetcode.com/problems/promise-time-limit/"),
                        ("Event Loop visualization tool", "Easy", "GitHub", "https://github.com/latteandcode/js-event-loop-visualizer")
                    ]

                for q_title, diff, plat, url in questions_to_seed:
                    db.execute(text("""
                        INSERT INTO programming_questions (topic_id, title, difficulty, platform, url)
                        VALUES (:tid, :title, :diff, :plat, :url)
                    """), {"tid": topic_id, "title": q_title, "diff": diff, "plat": plat, "url": url})

            db.commit()
            print("OK: Seeded programming topics and questions.")
        else:
            print(f"Programming topics already seeded ({topics_count} records). Skipping.")

    except Exception as e:
        print(f"Error migrating Student Hub: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations_and_seeding()
