-- Demo seed: one tournament, 16 teams, and a fully-wired 16→8→4→2→final bracket.
-- Safe to re-run: clears the demo tournament first. Apply with:
--   npm run db:seed:local   (or :remote)
-- Bracket progression rule: a match at slot s feeds the next round's slot floor(s/2),
-- on the 'home' side when s is even and 'away' when s is odd.

DELETE FROM "punishment" WHERE "tournamentId" = 't_demo';
DELETE FROM "match"      WHERE "tournamentId" = 't_demo';
DELETE FROM "team"       WHERE "tournamentId" = 't_demo';
DELETE FROM "tournament" WHERE "id" = 't_demo';

INSERT INTO "tournament"
 ("id","name","status","bracketSize","currentRound","picksDeadline","championTeamId","visible","featured","joinPolicy","joinCode","isGeneralPool","createdAt")
VALUES ('t_demo','Kart Hero General Pool','active',16,'R16', 1893456000000, NULL, 1, 1, 'open', NULL, 1, 1751414400000);

-- 16 teams (seeds 1..16)
INSERT INTO "team" ("id","tournamentId","name","seed","colorHint","eliminated") VALUES
 ('tm_1','t_demo','Fire Foxes',1,'#E5322D',0),
 ('tm_2','t_demo','Star Sprinters',2,'#F5C518',0),
 ('tm_3','t_demo','Shell Shockers',3,'#33C14E',0),
 ('tm_4','t_demo','Night Owls',4,'#7A3CF0',0),
 ('tm_5','t_demo','Piranha FC',5,'#1B4DE4',0),
 ('tm_6','t_demo','Thunder Karts',6,'#F5C518',0),
 ('tm_7','t_demo','Cloud Nine',7,'#1B4DE4',0),
 ('tm_8','t_demo','Lava Lads',8,'#E5322D',0),
 ('tm_9','t_demo','Coin Kings',9,'#F5C518',0),
 ('tm_10','t_demo','Turbo Toads',10,'#33C14E',0),
 ('tm_11','t_demo','Ghost Riders',11,'#7A3CF0',0),
 ('tm_12','t_demo','Rainbow Racers',12,'#E5322D',0),
 ('tm_13','t_demo','Bullet Trains',13,'#1B4DE4',0),
 ('tm_14','t_demo','Mega Shrooms',14,'#33C14E',0),
 ('tm_15','t_demo','Golden Gliders',15,'#F5C518',0),
 ('tm_16','t_demo','Ice Yetis',16,'#1B4DE4',0);

-- Round of 16 (slots 0..7): each slot pairs two seeded teams; winners feed the QF.
INSERT INTO "match"
 ("id","tournamentId","round","slot","homeTeamId","awayTeamId","homeScore","awayScore","wentToPenalties","penaltyWinnerTeamId","status","kickoffAt","feedsIntoMatchId","feedsIntoSide")
VALUES
 ('m_r16_0','t_demo','R16',0,'tm_1','tm_16',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_0','home'),
 ('m_r16_1','t_demo','R16',1,'tm_8','tm_9', NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_0','away'),
 ('m_r16_2','t_demo','R16',2,'tm_5','tm_12',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_1','home'),
 ('m_r16_3','t_demo','R16',3,'tm_4','tm_13',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_1','away'),
 ('m_r16_4','t_demo','R16',4,'tm_6','tm_11',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_2','home'),
 ('m_r16_5','t_demo','R16',5,'tm_3','tm_14',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_2','away'),
 ('m_r16_6','t_demo','R16',6,'tm_7','tm_10',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_3','home'),
 ('m_r16_7','t_demo','R16',7,'tm_2','tm_15',NULL,NULL,0,NULL,'scheduled',NULL,'m_qf_3','away'),
 -- Quarter-finals (slots 0..3)
 ('m_qf_0','t_demo','R8',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_sf_0','home'),
 ('m_qf_1','t_demo','R8',1,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_sf_0','away'),
 ('m_qf_2','t_demo','R8',2,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_sf_1','home'),
 ('m_qf_3','t_demo','R8',3,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_sf_1','away'),
 -- Semi-finals (slots 0..1)
 ('m_sf_0','t_demo','R4',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_final','home'),
 ('m_sf_1','t_demo','R4',1,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'m_final','away'),
 -- Final (slot 0)
 ('m_final','t_demo','R2',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,NULL,NULL);

-- ================================================================
-- Sample import: FIFA World Cup 2022 (Round of 16), imported via the
-- api-sports.io shape. Visible in the public switcher; real R16 matchups.
-- ================================================================
DELETE FROM "match"      WHERE "tournamentId" = 'wc_2022';
DELETE FROM "team"       WHERE "tournamentId" = 'wc_2022';
DELETE FROM "tournament" WHERE "id" = 'wc_2022';

INSERT INTO "tournament"
 ("id","name","status","bracketSize","currentRound","picksDeadline","championTeamId","visible","featured","joinPolicy","joinCode","isGeneralPool","createdAt")
VALUES ('wc_2022','FIFA World Cup 2022','active',16,'R16', 1893456000000, NULL, 1, 0, 'open', NULL, 0, 1751500000000);

-- 16 Round-of-16 nations (seeds 1..16 in real matchup order)
INSERT INTO "team" ("id","tournamentId","name","seed","colorHint","eliminated") VALUES
 ('wt_1','wc_2022','Netherlands',1,'#FF7A1A',0),
 ('wt_2','wc_2022','USA',2,'#1B4DE4',0),
 ('wt_3','wc_2022','Argentina',3,'#0FB5C9',0),
 ('wt_4','wc_2022','Australia',4,'#F5C518',0),
 ('wt_5','wc_2022','France',5,'#1B4DE4',0),
 ('wt_6','wc_2022','Poland',6,'#E5322D',0),
 ('wt_7','wc_2022','England',7,'#EDEDED',0),
 ('wt_8','wc_2022','Senegal',8,'#33C14E',0),
 ('wt_9','wc_2022','Japan',9,'#E5322D',0),
 ('wt_10','wc_2022','Croatia',10,'#E5322D',0),
 ('wt_11','wc_2022','Brazil',11,'#F5C518',0),
 ('wt_12','wc_2022','South Korea',12,'#E5322D',0),
 ('wt_13','wc_2022','Morocco',13,'#33C14E',0),
 ('wt_14','wc_2022','Spain',14,'#E5322D',0),
 ('wt_15','wc_2022','Portugal',15,'#7A3CF0',0),
 ('wt_16','wc_2022','Switzerland',16,'#E5322D',0);

-- Round of 16 with the real matchups; later rounds empty, all playable.
INSERT INTO "match"
 ("id","tournamentId","round","slot","homeTeamId","awayTeamId","homeScore","awayScore","wentToPenalties","penaltyWinnerTeamId","status","kickoffAt","feedsIntoMatchId","feedsIntoSide")
VALUES
 ('wm_r16_0','wc_2022','R16',0,'wt_1','wt_2',  NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_0','home'),
 ('wm_r16_1','wc_2022','R16',1,'wt_3','wt_4',  NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_0','away'),
 ('wm_r16_2','wc_2022','R16',2,'wt_5','wt_6',  NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_1','home'),
 ('wm_r16_3','wc_2022','R16',3,'wt_7','wt_8',  NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_1','away'),
 ('wm_r16_4','wc_2022','R16',4,'wt_9','wt_10', NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_2','home'),
 ('wm_r16_5','wc_2022','R16',5,'wt_11','wt_12',NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_2','away'),
 ('wm_r16_6','wc_2022','R16',6,'wt_13','wt_14',NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_3','home'),
 ('wm_r16_7','wc_2022','R16',7,'wt_15','wt_16',NULL,NULL,0,NULL,'scheduled',NULL,'wm_qf_3','away'),
 ('wm_qf_0','wc_2022','R8',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_sf_0','home'),
 ('wm_qf_1','wc_2022','R8',1,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_sf_0','away'),
 ('wm_qf_2','wc_2022','R8',2,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_sf_1','home'),
 ('wm_qf_3','wc_2022','R8',3,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_sf_1','away'),
 ('wm_sf_0','wc_2022','R4',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_final','home'),
 ('wm_sf_1','wc_2022','R4',1,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,'wm_final','away'),
 ('wm_final','wc_2022','R2',0,NULL,NULL,NULL,NULL,0,NULL,'scheduled',NULL,NULL,NULL);
