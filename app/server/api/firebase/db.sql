Game Table:
game_id: SERIAL PRIMARY KEY
game_name: TEXT NOT NULL
game_description: TEXT

Round Table:
round_id: SERIAL PRIMARY KEY
game_id: INTEGER REFERENCES Game(game_id) ON DELETE CASCADE
round_name: TEXT
round_description: TEXT

Round_Questions Table (Junction Table):
round_id: INTEGER REFERENCES Round(round_id) ON DELETE CASCADE
question_id: INTEGER REFERENCES Questions(question_id) ON DELETE CASCADE
PRIMARY KEY (round_id, question_id)

Questions Table:
question_id: SERIAL PRIMARY KEY
question_text: TEXT NOT NULL
score_total: INTEGER
question_type: TEXT CHECK (question_type IN ('MC', 'FR', 'TF')) -- MC: Multiple Choice, FR: Free Response, TF: True/False
correct_answer: JSONB -- Stores multiple correct answers if needed

Session Table:
session_id: SERIAL PRIMARY KEY
game_id: INTEGER REFERENCES Game(game_id) ON DELETE CASCADE
session_status: TEXT CHECK (session_status IN ('active', 'completed', 'cancelled'))

User Table:
user_id: SERIAL PRIMARY KEY
user_name: TEXT NOT NULL
email: TEXT UNIQUE NOT NULL
number_wins: INTEGER DEFAULT 0

User_Sessions Table (Junction Table):
user_id: INTEGER REFERENCES Users(user_id) ON DELETE CASCADE
session_id: INTEGER REFERENCES Session(session_id) ON DELETE CASCADE
PRIMARY KEY (user_id, session_id)
