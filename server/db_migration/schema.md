-- 2. Create the datasets table within that schema
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    row_count BIGINT,
    avg_distance DECIMAL,
    avg_duration DECIMAL,
    outlier_percentage DECIMAL,
    rmse_score DECIMAL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB 
);