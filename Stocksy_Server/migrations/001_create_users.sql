CREATE TABLE IF NOT EXISTS users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    username VARCHAR(50) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password TEXT NOT NULL,

    provider VARCHAR(20) DEFAULT 'local',

    google_id TEXT,

    avatar TEXT DEFAULT '',

    demo_balance NUMERIC(18,2) DEFAULT 1000000,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);