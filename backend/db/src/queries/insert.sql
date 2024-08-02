/*
  @name upsertUser
  @param stats -> (launchpad!, wallet!, paymentToken!, totalAmount!, lastReferrer!, participationValid!)
*/
INSERT INTO launchpad_users
VALUES :stats
ON CONFLICT (launchpad, wallet)
DO UPDATE SET
participationValid = EXCLUDED.participationValid, lastReferrer = EXCLUDED.lastReferrer, totalAmount = (launchpad_users.totalAmount::DECIMAL + EXCLUDED.totalAmount::DECIMAL)::TEXT;

/*
  @name insertParticipation
  @param stats -> (launchpad!, wallet!, paymentToken!, paymentAmount!, referrer!, itemIds!, itemQuantities!, txHash!, blockHeight!, preconditionsMet!)
*/
INSERT INTO launchpad_participations
VALUES :stats
ON CONFLICT
DO NOTHING;

/*
  @name insertUserItems
  @param stats -> (launchpad!, wallet!, itemId!, quantity!)
*/
INSERT INTO launchpad_user_items
VALUES :stats
ON CONFLICT
DO NOTHING;
