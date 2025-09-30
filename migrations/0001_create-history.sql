-- Migration number: 0001 	 2025-09-30T10:50:44.280Z
DROP INDEX IF EXISTS id_history;
DROP TABLE IF EXISTS history;

CREATE TABLE history (
  user_name TEXT NOT NULL,
  chat_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE INDEX id_history ON history (user_name, chat_id);