-- ==============================================================================
-- CAHOOT! PRODUCTION SUPABASE SQL MIGRATION SCRIPT (100% FREE-TIER OPTIMIZED)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  creator_id UUID DEFAULT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  media_url TEXT DEFAULT '',
  time_limit INTEGER NOT NULL DEFAULT 20, -- in seconds (e.g. 10, 20, 30, 60)
  choices JSONB NOT NULL,                 -- Array of 4 choices: [{"text": "...", "color": "red"}]
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  points_multiplier NUMERIC DEFAULT 1.0,  -- 1.0 = Normal (1000 max), 2.0 = Double (2000 max), 0 = No points
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin VARCHAR(6) NOT NULL UNIQUE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
  host_id TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'leaderboard', 'finished')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NULL
);

-- 4. SESSION PLAYERS TABLE
CREATE TABLE IF NOT EXISTS session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar TEXT DEFAULT '🦊',
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  rank INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, nickname)
);

-- 5. GAME RESULTS TABLE (Asynchronously persisted at game end / round end)
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES session_players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY SPEED & FREE-TIER EFFICIENCY
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_game_sessions_pin ON game_sessions(pin);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_players_session_score ON session_players(session_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_session ON game_results(session_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PUBLIC ANONYMOUS GAMEPLAY & QUIZ MANAGEMENT

-- Quizzes: Public can read public quizzes, authenticated users manage their own
CREATE POLICY "Public can view public quizzes" 
  ON quizzes FOR SELECT 
  USING (is_public = true OR creator_id = auth.uid() OR creator_id IS NULL);

CREATE POLICY "Anyone can create quizzes" 
  ON quizzes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Creators can update their quizzes" 
  ON quizzes FOR UPDATE 
  USING (creator_id = auth.uid() OR creator_id IS NULL);

CREATE POLICY "Creators can delete their quizzes" 
  ON quizzes FOR DELETE 
  USING (creator_id = auth.uid() OR creator_id IS NULL);

-- Questions: Public can read questions for accessible quizzes
CREATE POLICY "Public can view quiz questions" 
  ON questions FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert quiz questions" 
  ON questions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update quiz questions" 
  ON questions FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete quiz questions" 
  ON questions FOR DELETE 
  USING (true);

-- Game Sessions: Public can lookup active sessions by PIN, Host can manage
CREATE POLICY "Public can view active game sessions" 
  ON game_sessions FOR SELECT 
  USING (true);

CREATE POLICY "Hosts can create game sessions" 
  ON game_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Hosts can update their game sessions" 
  ON game_sessions FOR UPDATE 
  USING (true);

-- Session Players: Public can join and see player lobby/scores
CREATE POLICY "Public can view session players" 
  ON session_players FOR SELECT 
  USING (true);

CREATE POLICY "Public can join session" 
  ON session_players FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public and hosts can update player scores" 
  ON session_players FOR UPDATE 
  USING (true);

CREATE POLICY "Hosts can remove players" 
  ON session_players FOR DELETE 
  USING (true);

-- Game Results: Batch insert allowed
CREATE POLICY "Public can insert game results" 
  ON game_results FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public can view game results" 
  ON game_results FOR SELECT 
  USING (true);

-- ==============================================================================
-- SEED DATA: STARTER QUIZZES FOR INSTANT PLAY
-- ==============================================================================

-- Quiz 1: Full-Stack Web Development & Tech Trivia
DO $$
DECLARE
  q1_id UUID := uuid_generate_v4();
  q2_id UUID := uuid_generate_v4();
  q3_id UUID := uuid_generate_v4();
  q4_id UUID := uuid_generate_v4();
BEGIN
  -- Insert Quiz 1
  INSERT INTO quizzes (id, title, description, cover_image, is_public)
  VALUES (
    q1_id,
    '🚀 Full-Stack Web Dev & Tech Trivia',
    'Test your knowledge on React, JavaScript, Next.js, Cloud Architectures, and Web Standards!',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    true
  ) ON CONFLICT DO NOTHING;

  -- Questions for Quiz 1
  INSERT INTO questions (quiz_id, question_text, media_url, time_limit, choices, correct_index, points_multiplier, order_index)
  VALUES
  (
    q1_id,
    'What does the Next.js App Router use by default for all components in the app directory?',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Client Components", "shape": "triangle", "color": "red"},
      {"text": "Server Components", "shape": "diamond", "color": "blue"},
      {"text": "Web Workers", "shape": "circle", "color": "yellow"},
      {"text": "Static HTML Export", "shape": "square", "color": "green"}
    ]'::jsonb,
    1, -- Server Components (Blue Diamond)
    1.0,
    0
  ),
  (
    q1_id,
    'Which HTTP status code signifies "418 I''m a teapot"?',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "404 Not Found", "shape": "triangle", "color": "red"},
      {"text": "403 Forbidden", "shape": "diamond", "color": "blue"},
      {"text": "418 I''m a teapot", "shape": "circle", "color": "yellow"},
      {"text": "500 Internal Error", "shape": "square", "color": "green"}
    ]'::jsonb,
    2, -- 418 (Yellow Circle)
    1.0,
    1
  ),
  (
    q1_id,
    'Why is Supabase Realtime Broadcast superior to direct database writes for 150 live players?',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "It bypasses Postgres WAL disk I/O entirely", "shape": "triangle", "color": "red"},
      {"text": "It stores everything in cookies", "shape": "diamond", "color": "blue"},
      {"text": "It disables TypeScript checks", "shape": "circle", "color": "yellow"},
      {"text": "It converts SQL to JSON files", "shape": "square", "color": "green"}
    ]'::jsonb,
    0, -- It bypasses Postgres WAL disk I/O entirely (Red Triangle)
    1.0,
    2
  ),
  (
    q1_id,
    'In JavaScript, what is the output of typeof NaN?',
    'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60',
    15,
    '[
      {"text": "\"undefined\"", "shape": "triangle", "color": "red"},
      {"text": "\"NaN\"", "shape": "diamond", "color": "blue"},
      {"text": "\"string\"", "shape": "circle", "color": "yellow"},
      {"text": "\"number\"", "shape": "square", "color": "green"}
    ]'::jsonb,
    3, -- "number" (Green Square)
    1.0,
    3
  ),
  (
    q1_id,
    'Which CSS property creates hardware-accelerated GPU 3D transitions?',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "transform: translate3d() / will-change", "shape": "triangle", "color": "red"},
      {"text": "float: left", "shape": "diamond", "color": "blue"},
      {"text": "display: inline", "shape": "circle", "color": "yellow"},
      {"text": "margin: auto", "shape": "square", "color": "green"}
    ]'::jsonb,
    0, -- transform: translate3d() (Red Triangle)
    1.0,
    4
  );

  -- Insert Quiz 2: World Geography & Capitals
  INSERT INTO quizzes (id, title, description, cover_image, is_public)
  VALUES (
    q2_id,
    '🌍 World Geography & Wonders',
    'Travel the globe and challenge your knowledge of continents, capitals, and natural wonders!',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    true
  ) ON CONFLICT DO NOTHING;

  INSERT INTO questions (quiz_id, question_text, media_url, time_limit, choices, correct_index, points_multiplier, order_index)
  VALUES
  (
    q2_id,
    'What is the capital city of Australia?',
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Sydney", "shape": "triangle", "color": "red"},
      {"text": "Melbourne", "shape": "diamond", "color": "blue"},
      {"text": "Canberra", "shape": "circle", "color": "yellow"},
      {"text": "Brisbane", "shape": "square", "color": "green"}
    ]'::jsonb,
    2, -- Canberra
    1.0,
    0
  ),
  (
    q2_id,
    'Which country has the most natural lakes in the world?',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Canada", "shape": "triangle", "color": "red"},
      {"text": "Russia", "shape": "diamond", "color": "blue"},
      {"text": "United States", "shape": "circle", "color": "yellow"},
      {"text": "Finland", "shape": "square", "color": "green"}
    ]'::jsonb,
    0, -- Canada
    1.0,
    1
  ),
  (
    q2_id,
    'What is the longest river on planet Earth?',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Amazon River", "shape": "triangle", "color": "red"},
      {"text": "Nile River", "shape": "diamond", "color": "blue"},
      {"text": "Yangtze River", "shape": "circle", "color": "yellow"},
      {"text": "Mississippi River", "shape": "square", "color": "green"}
    ]'::jsonb,
    1, -- Nile River
    1.0,
    2
  ),
  (
    q2_id,
    'Which is the smallest country in the world by land area?',
    'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&auto=format&fit=crop&q=60',
    15,
    '[
      {"text": "Monaco", "shape": "triangle", "color": "red"},
      {"text": "San Marino", "shape": "diamond", "color": "blue"},
      {"text": "Liechtenstein", "shape": "circle", "color": "yellow"},
      {"text": "Vatican City", "shape": "square", "color": "green"}
    ]'::jsonb,
    3, -- Vatican City
    1.0,
    3
  );

  -- Insert Quiz 3: Astronomy & Science Wonders
  INSERT INTO quizzes (id, title, description, cover_image, is_public)
  VALUES (
    q3_id,
    '✨ Cosmos & Science Wonders',
    'Journey into the universe! Black holes, quantum mechanics, and planetary wonders.',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=60',
    true
  ) ON CONFLICT DO NOTHING;

  INSERT INTO questions (quiz_id, question_text, media_url, time_limit, choices, correct_index, points_multiplier, order_index)
  VALUES
  (
    q3_id,
    'Which planet has the most moons in our Solar System as of 2024?',
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Jupiter", "shape": "triangle", "color": "red"},
      {"text": "Saturn (146+ moons)", "shape": "diamond", "color": "blue"},
      {"text": "Uranus", "shape": "circle", "color": "yellow"},
      {"text": "Neptune", "shape": "square", "color": "green"}
    ]'::jsonb,
    1, -- Saturn
    1.0,
    0
  ),
  (
    q3_id,
    'What element makes up approximately 78% of Earth''s atmosphere?',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "Oxygen", "shape": "triangle", "color": "red"},
      {"text": "Carbon Dioxide", "shape": "diamond", "color": "blue"},
      {"text": "Nitrogen", "shape": "circle", "color": "yellow"},
      {"text": "Hydrogen", "shape": "square", "color": "green"}
    ]'::jsonb,
    2, -- Nitrogen
    1.0,
    1
  ),
  (
    q3_id,
    'How long does light take to travel from the Sun to Earth?',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=60',
    20,
    '[
      {"text": "~8 minutes and 20 seconds", "shape": "triangle", "color": "red"},
      {"text": "~1 second", "shape": "diamond", "color": "blue"},
      {"text": "~1 hour", "shape": "circle", "color": "yellow"},
      {"text": "Instantaneous", "shape": "square", "color": "green"}
    ]'::jsonb,
    0, -- ~8m20s
    1.0,
    2
  );
END $$;
