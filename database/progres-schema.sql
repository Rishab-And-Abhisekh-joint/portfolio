-- Sheet Progress Tracking Schema
-- Run this after schema.sql to add progress tracking tables

-- Progress Sheets table - stores different sheets/problem sets (e.g., DSA Sheet, CP Sheet)
CREATE TABLE IF NOT EXISTS sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_problems INT DEFAULT 0,
    category VARCHAR(100), -- e.g., 'DSA', 'CP', 'Web Dev'
    difficulty VARCHAR(50), -- e.g., 'Beginner', 'Intermediate', 'Advanced'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sheet Problems table - individual problems in each sheet
CREATE TABLE IF NOT EXISTS sheet_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    problem_name VARCHAR(255) NOT NULL,
    problem_url TEXT,
    platform VARCHAR(50), -- 'LeetCode', 'Codeforces', 'CodeChef', 'GFG', etc.
    difficulty VARCHAR(50), -- 'Easy', 'Medium', 'Hard'
    topic VARCHAR(100), -- 'Arrays', 'DP', 'Graphs', etc.
    problem_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sheet Progress table - tracks individual user progress on sheets
CREATE TABLE IF NOT EXISTS user_sheet_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sheet_id UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    problems_solved INT DEFAULT 0,
    last_solved_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sheet_id)
);

-- User Problem Progress table - tracks which specific problems a user has solved
CREATE TABLE IF NOT EXISTS user_problem_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES sheet_problems(id) ON DELETE CASCADE,
    sheet_id UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'unsolved', -- 'unsolved', 'attempted', 'solved', 'revisit'
    solved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    time_taken_minutes INT,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_sheet_progress_user_id ON user_sheet_progress(user_id);
CREATE INDEX idx_user_sheet_progress_sheet_id ON user_sheet_progress(sheet_id);
CREATE INDEX idx_user_problem_progress_user_id ON user_problem_progress(user_id);
CREATE INDEX idx_user_problem_progress_sheet_id ON user_problem_progress(sheet_id);
CREATE INDEX idx_user_problem_progress_status ON user_problem_progress(status);
CREATE INDEX idx_sheet_problems_sheet_id ON sheet_problems(sheet_id);

-- Leaderboard View - aggregated view for easy leaderboard queries
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.id as user_id,
    u.username,
    u.name,
    COALESCE(SUM(usp.problems_solved), 0) as total_problems_solved,
    COUNT(DISTINCT usp.sheet_id) as sheets_attempted,
    MAX(usp.last_solved_at) as last_activity
FROM users u
LEFT JOIN user_sheet_progress usp ON u.id = usp.user_id
GROUP BY u.id, u.username, u.name
ORDER BY total_problems_solved DESC;

-- Function to update sheet progress when a problem is marked solved
CREATE OR REPLACE FUNCTION update_sheet_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- If a problem is marked as solved
    IF NEW.status = 'solved' AND (OLD IS NULL OR OLD.status != 'solved') THEN
        INSERT INTO user_sheet_progress (user_id, sheet_id, problems_solved, last_solved_at)
        VALUES (NEW.user_id, NEW.sheet_id, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, sheet_id) 
        DO UPDATE SET 
            problems_solved = user_sheet_progress.problems_solved + 1,
            last_solved_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP;
    -- If a problem was solved but now marked as something else
    ELSIF OLD.status = 'solved' AND NEW.status != 'solved' THEN
        UPDATE user_sheet_progress 
        SET problems_solved = GREATEST(problems_solved - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND sheet_id = NEW.sheet_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update sheet progress
DROP TRIGGER IF EXISTS trigger_update_sheet_progress ON user_problem_progress;
CREATE TRIGGER trigger_update_sheet_progress
AFTER INSERT OR UPDATE ON user_problem_progress
FOR EACH ROW
EXECUTE FUNCTION update_sheet_progress();

-- Sample data for a DSA Sheet (optional - comment out if not needed)
-- INSERT INTO sheets (id, name, description, total_problems, category, difficulty) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', 'Striver SDE Sheet', 'Popular DSA problems for SDE interviews', 191, 'DSA', 'Intermediate'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'LeetCode 75', 'Essential LeetCode problems', 75, 'DSA', 'Beginner'),
-- ('550e8400-e29b-41d4-a716-446655440003', 'NeetCode 150', 'Curated list of 150 problems', 150, 'DSA', 'Intermediate');