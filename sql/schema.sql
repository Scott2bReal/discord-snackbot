CREATE TABLE discord_users (
    id int PRIMARY KEY AUTO_INCREMENT NOT NULL,
    discord_id varchar(255),
    user_name varchar(255)
);

CREATE TABLE events (
    id int PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name varchar(255),
    date date,
    user_id int NOT NULL,
    expected_responses int,
    discord_user_id int,
    KEY discord_user_id_key (discord_user_id)
);

CREATE TABLE responses (
    id int PRIMARY KEY AUTO_INCREMENT NOT NULL,
    event_id int NOT NULL,
    user_id int NOT NULL,
    available boolean,
    KEY event_id_key (event_id),
    KEY user_id_key (user_id)
);
