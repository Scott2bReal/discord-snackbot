CREATE TABLE events (
    id serial PRIMARY KEY,
    name text,
    "date" date,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id serial PRIMARY KEY,
    discord_id text,
    user_name text
);

CREATE TABLE responses (
    id serial PRIMARY KEY,
    event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    available boolean
);
