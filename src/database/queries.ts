export const GUILD_CREATE_QUERY = `\
  CREATE TABLE IF NOT EXISTS guilds (\
    guild_id VARCHAR(20) PRIMARY KEY,\
    allow_responses BOOLEAN DEFAULT TRUE,\
    rank_up_channel VARCHAR(20) DEFAULT ''\
  );\
`;

export const USER_CREATE_QUERY = `\
  CREATE TABLE IF NOT EXISTS user_stats (\
    id INT AUTO_INCREMENT PRIMARY KEY,\
    guild_id VARCHAR(20) NOT NULL,\
    user_id VARCHAR(20) NOT NULL,\
    messages INT DEFAULT 0,\
    voice_time INT DEFAULT 0,\
    join_time INT DEFAULT 0,\
    last_gain_time INT DEFAULT 0,\
    total_experience INT DEFAULT 0,\
    level_experience INT DEFAULT 0,\
    level_value INT DEFAULT 0,\
    score INT DEFAULT 0,\
    name VARCHAR(255) DEFAULT '',\
    previous_messages INT DEFAULT 0,\
    previous_voice_time INT DEFAULT 0,\
    UNIQUE KEY unique_guild_user (guild_id, user_id),\
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE\
  );\
`;

export const GUILD_SELECT_QUERY = "SELECT * FROM guilds;";
export const USER_SELECT_QUERY = "SELECT * FROM user_stats;";

export const GUILD_INSERT_QUERY = `INSERT INTO guilds\
  (guild_id, allow_responses, rank_up_channel)\
  VALUES (?, ?, ?)\
  ON DUPLICATE KEY UPDATE\
    allow_responses = VALUES(allow_responses),\
    rank_up_channel = VALUES(rank_up_channel)\
  ;\
`;

export const USER_INSERT_QUERY = `INSERT INTO user_stats\
  (guild_id, user_id, messages, voice_time, join_time,\
    last_gain_time, total_experience, level_experience,\
    level_value, name, previous_messages,\
    previous_voice_time)\
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\
  ON DUPLICATE KEY UPDATE\
    messages = VALUES(messages),\
    voice_time = VALUES(voice_time),\
    join_time = VALUES(join_time),\
    last_gain_time = VALUES(last_gain_time),\
    total_experience = VALUES(total_experience),\
    level_experience = VALUES(level_experience),\
    level_value = VALUES(level_value),\
    name = VALUES(name),\
    previous_messages = VALUES(previous_messages),\
    previous_voice_time = VALUES(previous_voice_time)\
  ;\
`;
