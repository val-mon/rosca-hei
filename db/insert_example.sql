-- ============================================
-- DONNÉES D'EXEMPLE
-- ============================================

-- ============================================
-- USERS (7 utilisateurs)
-- ============================================

INSERT INTO "user" (email, username, privacy_consent, created_at) VALUES
('alice@example.com', 'Alice', true, '2025-11-15 10:00:00'),
('bob@example.com', 'Bob', true, '2025-11-20 11:30:00'),
('charlie@example.com', 'Charlie', true, '2025-11-25 14:00:00'),
('diana@example.com', 'Diana', false, '2025-12-05 09:00:00'),
('eve@example.com', 'Eve', true, '2025-12-10 16:00:00'),
('admin@rosca-hei.com', 'Admin', true, '2025-10-01 08:00:00'),
('vmonod5@gmail.com', 'ValMon', true, '2026-01-05 16:33:33');

-- ============================================
-- USER TOKENS (tokens de session)
-- ============================================

INSERT INTO user_token (user_id, token) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(2, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
(3, 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),
(4, 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'),
(5, 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'),
(6, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00'),
(7, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01');

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

-- Amis Université (Charlie admin, Diana, Eve, ValMon)
INSERT INTO circle_member (circle_id, user_id, is_admin) VALUES
(3, 3, true),   -- Charlie est admin
(3, 4, false),  -- Diana est membre
(3, 5, false),  -- Eve est membre
(3, 7, false);  -- ValMon est membre

-- ValMon rejoint aussi Famille Martin
INSERT INTO circle_member (circle_id, user_id, is_admin) VALUES
(1, 7, false);  -- ValMon est membre

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
INSERT INTO period (cycle_id, due_date) VALUES
(1, '2025-11-15'),
(1, '2025-12-15'),
(1, '2026-01-10');

-- Cycle 2 (Famille Martin, enchères) : 2 périodes
INSERT INTO period (cycle_id, due_date) VALUES
(2, '2026-01-06'),
(2, '2026-01-13');

-- Cycle 3 (Collègues Bureau) : 4 périodes
INSERT INTO period (cycle_id, due_date) VALUES
(3, '2025-11-20'),
(3, '2025-12-20'),
(3, '2026-01-05'),
(3, '2026-01-13');

-- Cycle 4 (Amis Université) : 2 périodes
INSERT INTO period (cycle_id, due_date) VALUES
(4, '2025-12-01'),
(4, '2026-01-08');

-- ============================================
-- CONTRIBUTIONS (paiements)
-- ============================================

-- Période 1 du Cycle 1 (Famille Martin)
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(1, 1, 1, '2025-11-10', 'Contribution mensuelle Novembre'),
(1, 2, 1, '2025-11-11', 'Contribution mensuelle Novembre'),
(1, 3, 1, '2025-11-18', 'Contribution mensuelle Novembre - en retard');

-- Période 2 du Cycle 1
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(2, 1, 2, '2025-12-10', 'Contribution mensuelle Décembre'),
(2, 2, 2, '2025-12-10', 'Contribution mensuelle Décembre'),
(2, 3, 2, '2025-12-10', 'Contribution mensuelle Décembre');

-- Période 1 du Cycle 3 (Collègues Bureau)
INSERT INTO contribution (period_id, user_id, for_user_id, contribution_date, annotation) VALUES
(6, 2, 1, '2025-11-18', 'Cotisation équipe Q1'),
(6, 1, 1, '2025-11-18', 'Cotisation équipe Q1'),
(6, 4, 1, '2025-11-19', 'Cotisation équipe Q1'),
(6, 5, 1, '2025-11-22', 'Cotisation équipe Q1 - retard');


-- ============================================
-- AUTHENFICATION
-- ============================================
-- Ajout d'un code spécial pour l'admin
INSERT INTO authentification (user_id, code, expiration) VALUES
(6, 123987, '2026-01-13 23:59:59');

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

-- Bob reçoit le payout de la période 7 (Collègues)
INSERT INTO payout (period_id, user_id) VALUES
(7, 2);

-- Diana reçoit le payout de la période 8 (Collègues)
INSERT INTO payout (period_id, user_id) VALUES
(8, 4);

-- Diana reçoit le payout de la période 10 (Amis Université)
INSERT INTO payout (period_id, user_id) VALUES
(10, 4);

-- Charlie reçoit le payout de la période 4 (Famille Martin, enchères)
INSERT INTO payout (period_id, user_id) VALUES
(4, 3);

-- ============================================
-- AUCTIONS (enchères pour les cycles en mode auction)
-- ============================================

-- Période 4 du Cycle 2 (Famille Martin, mode enchères)
-- Payout total = 150 CHF × 4 membres = 600 CHF
-- Les enchères doivent être < 600 CHF
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(4, 1, '2026-01-06', 450.00),  -- Alice enchérit à 450 CHF (reçoit 150 CHF net)
(4, 2, '2026-01-06', 420.00),  -- Bob enchérit à 420 CHF (reçoit 180 CHF net)
(4, 3, '2026-01-06', 480.00);  -- Charlie enchérit à 480 CHF (gagne, reçoit 120 CHF net)

-- Période 5 du Cycle 2
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(5, 1, '2026-01-13', 400.00),  -- Alice enchérit à 400 CHF (reçoit 200 CHF net)
(5, 2, '2026-01-13', 350.00);  -- Bob enchérit à 350 CHF (gagne, reçoit 250 CHF net)

-- Période 6 du Cycle 3 (Collègues Bureau)
-- Payout total = 200 CHF × 4 membres = 800 CHF
-- Les enchères doivent être < 800 CHF
INSERT INTO auction (period_id, user_id, contribution_date, ammount) VALUES
(6, 2, '2025-11-20', 600.00),  -- Bob enchérit à 600 CHF (reçoit 200 CHF net)
(6, 1, '2025-11-20', 550.00),  -- Alice enchérit à 550 CHF (gagne, reçoit 250 CHF net)
(6, 4, '2025-11-21', 650.00),  -- Diana enchérit à 650 CHF (reçoit 150 CHF net)
(6, 5, '2025-11-22', 700.00);  -- Eve enchérit à 700 CHF (reçoit 100 CHF net)