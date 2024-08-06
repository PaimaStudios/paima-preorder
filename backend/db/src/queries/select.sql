/*
  @name getUser
*/
SELECT * FROM launchpad_users
WHERE launchpad = :launchpad! AND wallet = :wallet!
;

/*
  @name getParticipations
*/
SELECT * FROM launchpad_participations
WHERE launchpad = :launchpad! AND wallet = :wallet!
ORDER BY blockHeight
;

/*
  @name getParticipatedAmountTotal
*/
SELECT SUM(paymentAmount::DECIMAL) FROM launchpad_participations
WHERE launchpad = :launchpad! AND wallet = :wallet! AND paymentToken = :paymentToken!
;

/*
  @name getUserItems
*/
SELECT itemId, quantity FROM launchpad_user_items
WHERE launchpad = :launchpad! AND wallet = :wallet!
;

/*
  @name getItemsPurchasedQuantityExceptUser
*/
SELECT SUM(quantity) FROM launchpad_user_items
WHERE launchpad = :launchpad! AND itemId = :itemId! AND wallet != :wallet!
;

/*
  @name getAllItemsPurchasedQuantity
*/
SELECT itemId, SUM(quantity) FROM launchpad_user_items
WHERE launchpad = :launchpad!
GROUP BY itemId
;