-- ============================================
-- DONNÉES D'EXEMPLE
-- ============================================

-- ============================================
-- USERS (5 utilisateurs)
-- ============================================

INSERT INTO "user" (email, username, privacy_consent, created_at) VALUES
('alice@example.com', 'Alice', true, '2024-01-15 10:00:00'),
('bob@example.com', 'Bob', true, '2024-01-16 11:30:00'),
('charlie@example.com', 'Charlie', true, '2024-01-17 14:00:00'),
('diana@example.com', 'Diana', false, '2024-02-01 09:00:00'),
('eve@example.com', 'Eve', true, '2024-02-05 16:00:00');

-- ============================================
-- USER TOKENS (tokens de session)
-- ============================================

INSERT INTO user_token (user_id, token) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(2, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
(3, 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),
(4, 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'),
(5, 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55');

-- ============================================
-- CIRCLES (3 groupes)
-- ============================================

INSERT INTO circle (name, join_code) VALUES
('Famille Martin', 'FAM2024'),
('Collègues Bureau', 'WORK123'),
('Amis Université', 'UNI789');

-- ============================================
-- CIRCLE MEMBERS (membres des groupes)
-- ============================================

-- Famille Martin (Alice admin, Bob, Charlie)
INSERT INTO circle_member (circle_id, user_id, is_admin) VALUES
(1, 1, true),   -- Alice est admin
(1, 2, false),  -- Bob est membre
(1, 3, false);  -- Charlie est membre

-- Collègues Bureau (Bob admin, Alice, Diana, Eve)
INSERT INTO circle_member (circle_id, user_id, is_admin) VALUES
(2, 2, true),   -- Bob est admin
(2, 1, false),  -- Alice est membre
(2, 4, false),  -- Diana est membre
(2, 5, false);  -- Eve est membre

-- Amis Université (Charlie admin, Diana, Eve)
INSERT INTO circle_member (circle_id, user_id, is_admin) VALUES
(3, 3, true),   -- Charlie est admin
(3, 4, false),  -- Diana est membre
(3, 5, false);  -- Eve est membre

-- ============================================
-- CYCLES (cycles pour chaque circle)
-- ============================================

-- Famille Martin : 2 cycles (1 avec enchères, 1 sans)
INSERT INTO cycle (circle_id, auction_mode, contribution_amount) VALUES
(1, false, 100.00),  -- Cycle normal, 100€/period
(1, true, 150.00);   -- Cycle avec enchères, 150€/period

-- Collègues Bureau : 1 cycle avec enchères
INSERT INTO cycle (circle_id, auction_mode, contribution_amount) VALUES
(2, true, 200.00);   -- 200€/period

-- Amis Université : 1 cycle normal
INSERT INTO cycle (circle_id, auction_mode, contribution_amount) VALUES
(3, false, 50.00);   -- 50€/period

-- ============================================
-- PERIODS (périodes pour chaque cycle)
-- ============================================

-- Cycle 1 (Famille Martin, normal) : 3 périodes
INSERT INTO period (cycle_id) VALUES
(1), (1), (1);

-- Cycle 2 (Famille Martin, enchères) : 2 périodes
INSERT INTO period (cycle_id) VALUES
(2), (2);

-- Cycle 3 (Collègues Bureau) : 4 périodes
INSERT INTO period (cycle_id) VALUES
(3), (3), (3), (3);

-- Cycle 4 (Amis Université) : 2 périodes
INSERT INTO period (cycle_id) VALUES
(4), (4);

-- ============================================
-- CONTRIBUTIONS (paiements)
-- ============================================

-- Période 1 du Cycle 1 (Famille Martin)
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(1, 1, 1, '2024-03-01', 'Contribution mensuelle Mars'),
(1, 2, 1, '2024-03-01', 'Contribution mensuelle Mars'),
(1, 3, 1, '2024-03-02', 'Contribution mensuelle Mars - en retard');

-- Période 2 du Cycle 1
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(2, 1, 2, '2024-04-01', 'Contribution mensuelle Avril'),
(2, 2, 2, '2024-04-01', 'Contribution mensuelle Avril'),
(2, 3, 2, '2024-04-01', 'Contribution mensuelle Avril');

-- Période 1 du Cycle 3 (Collègues Bureau)
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(6, 2, 1, '2024-03-05', 'Cotisation équipe Q1'),
(6, 1, 1, '2024-03-05', 'Cotisation équipe Q1'),
(6, 4, 1, '2024-03-06', 'Cotisation équipe Q1'),
(6, 5, 1, '2024-03-07', 'Cotisation équipe Q1 - retard');

-- ============================================
-- PENALTIES (pénalités pour retards)
-- ============================================

-- Charlie en retard sur période 1
INSERT INTO penalty (period_id, user_id, contribution_id, waived) VALUES
(1, 3, 3, 0);  -- Pénalité non annulée

-- Eve en retard sur période 6
INSERT INTO penalty (period_id, user_id, contribution_id, waived) VALUES
(6, 5, 10, 1);  -- Pénalité annulée

-- ============================================
-- PAYOUTS (versements)
-- ============================================

-- Alice reçoit le payout de la période 1
INSERT INTO payout (period_id, user_id) VALUES
(1, 1);

-- Bob reçoit le payout de la période 2
INSERT INTO payout (period_id, user_id) VALUES
(2, 2);

-- Alice reçoit le payout de la période 6 (Collègues)
INSERT INTO payout (period_id, user_id) VALUES
(6, 1);

-- Diana reçoit le payout de la période 10 (Amis Université)
INSERT INTO payout (period_id, user_id) VALUES
(10, 4);

-- ============================================
-- AUCTIONS (enchères pour les cycles en mode auction)
-- ============================================

-- Période 4 du Cycle 2 (Famille Martin, mode enchères)
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(4, 1, '2024-05-01', 950.00),  -- Alice enchérit à 950€
(4, 2, '2024-05-01', 920.00),  -- Bob enchérit à 920€
(4, 3, '2024-05-01', 980.00);  -- Charlie enchérit à 980€ (gagne)

-- Période 5 du Cycle 2
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(5, 1, '2024-06-01', 900.00),  -- Alice enchérit à 900€
(5, 2, '2024-06-01', 850.00);  -- Bob enchérit à 850€ (gagne avec l'offre la plus basse)

-- Période 6 du Cycle 3 (Collègues Bureau)
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(6, 2, '2024-03-05', 1500.00),
(6, 1, '2024-03-05', 1450.00),  -- Alice gagne
(6, 4, '2024-03-06', 1550.00),
(6, 5, '2024-03-07', 1600.00);
