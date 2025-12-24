-- ============================================
-- DATABASE CREATION
-- ============================================

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS auction CASCADE;
DROP TABLE IF EXISTS payout CASCADE;
DROP TABLE IF EXISTS penalty CASCADE;
DROP TABLE IF EXISTS contribution CASCADE;
DROP TABLE IF EXISTS period CASCADE;
DROP TABLE IF EXISTS cycle CASCADE;
DROP TABLE IF EXISTS circle_member CASCADE;
DROP TABLE IF EXISTS circle CASCADE;
DROP TABLE IF EXISTS user_token CASCADE;
DROP TABLE IF EXISTS authentification CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ============================================
-- USER TABLES
-- ============================================

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE authentification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  code INTEGER NOT NULL,
  expiration TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE user_token (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- ============================================
-- CIRCLE TABLES
-- ============================================

CREATE TABLE circle (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  join_code VARCHAR(50) UNIQUE,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE circle_member (
  circle_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (circle_id, user_id),
  FOREIGN KEY (circle_id) REFERENCES circle(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE cycle (
  id SERIAL PRIMARY KEY,
  circle_id INTEGER NOT NULL,
  auction_mode BOOLEAN NOT NULL DEFAULT false,
  contribution_amount DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (circle_id) REFERENCES circle(id) ON DELETE CASCADE
);

CREATE TABLE period (
  id SERIAL PRIMARY KEY,
  cycle_id INTEGER NOT NULL,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (cycle_id) REFERENCES cycle(id) ON DELETE CASCADE
);

-- ============================================
-- MONEY TABLES
-- ============================================

CREATE TABLE contribution (
  id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  for_user_id INTEGER NOT NULL,
  contribution_date DATE NOT NULL,
  annotation TEXT,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (period_id) REFERENCES period(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (for_user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE penalty (
  id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  contribution_id INTEGER,
  waived SMALLINT DEFAULT 0,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (period_id) REFERENCES period(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (contribution_id) REFERENCES contribution(id) ON DELETE SET NULL
);

CREATE TABLE payout (
  id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (period_id) REFERENCES period(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE auction (
  id SERIAL PRIMARY KEY,
  period_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  contribution_date DATE NOT NULL,
  ammount DECIMAL(10, 2) NOT NULL,
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (period_id) REFERENCES period(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES (pour optimiser les performances)
-- ============================================

-- Index sur les clés étrangères
CREATE INDEX idx_authentification_user_id ON authentification(user_id);
CREATE INDEX idx_user_token_user_id ON user_token(user_id);
CREATE INDEX idx_circle_member_user_id ON circle_member(user_id);
CREATE INDEX idx_cycle_circle_id ON cycle(circle_id);
CREATE INDEX idx_period_cycle_id ON period(cycle_id);
CREATE INDEX idx_contribution_period_id ON contribution(period_id);
CREATE INDEX idx_contribution_user_id ON contribution(user_id);
CREATE INDEX idx_penalty_period_id ON penalty(period_id);
CREATE INDEX idx_payout_period_id ON payout(period_id);
CREATE INDEX idx_auction_period_id ON auction(period_id);

-- Index sur les champs souvent recherchés
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_circle_join_code ON circle(join_code);
CREATE INDEX idx_user_token_token ON user_token(token);

-- ============================================
-- TRIGGERS pour auto-update modified_date
-- ============================================

CREATE OR REPLACE FUNCTION update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_date = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec modified_date
CREATE TRIGGER update_user_modified_date
  BEFORE UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_circle_modified_date
  BEFORE UPDATE ON circle
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_circle_member_modified_date
  BEFORE UPDATE ON circle_member
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_cycle_modified_date
  BEFORE UPDATE ON cycle
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_period_modified_date
  BEFORE UPDATE ON period
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_contribution_modified_date
  BEFORE UPDATE ON contribution
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_penalty_modified_date
  BEFORE UPDATE ON penalty
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_payout_modified_date
  BEFORE UPDATE ON payout
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER update_auction_modified_date
  BEFORE UPDATE ON auction
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_date();
