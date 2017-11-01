CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
	sess json NOT NULL,
	expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE TYPE gender AS ENUM ('M', 'F', 'O');

CREATE TABLE t_user (
    id SERIAL PRIMARY KEY,
    login VARCHAR(200),
    email VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    firstname VARCHAR(200),
    lastname VARCHAR(200),
    gender gender,
    profile_picture VARCHAR(200)
);

CREATE TABLE t_message (
    id SERIAL PRIMARY KEY,
    fk_author INTEGER REFERENCES t_user NOT NULL,
    creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    content TEXT NOT NULL,
    fk_thread_parent INTEGER NOT NULL
);

CREATE TABLE t_thread (
    id SERIAL PRIMARY KEY,
    creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    title VARCHAR(200),
    fk_author INTEGER REFERENCES t_user,
    fk_conversation INTEGER NOT NULL,
    fk_thread_parent INTEGER REFERENCES t_thread,
    fk_message_parent INTEGER REFERENCES t_message
);

ALTER TABLE t_message
ADD FOREIGN KEY (fk_thread_parent)
REFERENCES t_thread;

CREATE TABLE t_tag_thread (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    fk_thread INTEGER NOT NULL REFERENCES t_thread
);

CREATE TABLE t_conversation (
    id SERIAL PRIMARY KEY,
    fk_root_thread INTEGER REFERENCES t_thread,
    title VARCHAR(200),
    picture VARCHAR(200)
);

ALTER TABLE t_thread
ADD FOREIGN KEY (fk_conversation)
REFERENCES t_conversation;

CREATE TABLE t_conversation_user (
    id SERIAL PRIMARY KEY,
    fk_conversation INTEGER NOT NULL REFERENCES t_conversation,
    fk_member INTEGER NOT NULL REFERENCES t_user
);
