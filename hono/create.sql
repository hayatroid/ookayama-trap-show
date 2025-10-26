CREATE TABLE user(
  id CHAR(36) PRIMARY KEY,
  screen_name VARCHAR(16) NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  -- 公開状態．public: 公開, private: 非公開, internal: 学内限定
  visibility TEXT NOT NULL,
  -- リストに表示するか
  listed BOOLEAN NOT NULL,
  -- 過去の記録を表示するか
  displays_past BOOLEAN NOT NULL,
  -- トークンのハッシュ値
  hashed_token TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (screen_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE location(
  id VARCHAR(16) PRIMARY KEY, -- e.g. isct
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (ユーザ, 日付, 場所) をキーとする
CREATE TABLE checkin(
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  day INT NOT NULL,
  hours INT NOT NULL,
  location_id VARCHAR(16) NOT NULL,
  count INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (location_id) REFERENCES location(id),
  UNIQUE (user_id, year, month, day, hours, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO location (id) VALUES ("isct");
INSERT INTO location (id) VALUES ("others");
