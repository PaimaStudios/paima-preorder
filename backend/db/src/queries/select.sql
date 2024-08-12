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
SELECT itemId, quantity, wallet FROM launchpad_user_items
WHERE launchpad = :launchpad! AND (:wallet::TEXT IS NULL OR wallet = :wallet)
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

/*
  @name getRefunds
*/
WITH LastValidParticipation AS (
  SELECT
    wallet,
    MAX(blockHeight) AS last_valid_block
  FROM
    launchpad_participations
  WHERE
    launchpad = :launchpad!
    AND participationValid = TRUE
    AND (:wallet::TEXT IS NULL OR wallet = :wallet)
  GROUP BY
    wallet
),
InvalidParticipations AS (
  SELECT
    lp.wallet,
    lp.launchpad,
    lp.paymentToken,
    lp.paymentAmount,
    lp.referrer,
    lp.itemIds,
    lp.itemQuantities,
    lp.txHash,
    lp.blockHeight,
    lp.preconditionsMet,
    lp.participationValid
  FROM
    launchpad_participations lp
  LEFT JOIN
    LastValidParticipation lvp ON lp.wallet = lvp.wallet
  WHERE
    lp.launchpad = :launchpad!
    AND (:wallet::TEXT IS NULL OR lp.wallet = :wallet)
    AND (
      (lp.blockHeight > lvp.last_valid_block
      AND lp.preconditionsMet = TRUE
      AND lp.participationValid = FALSE)
      OR
      (lp.preconditionsMet = FALSE)
    )
)
SELECT
  wallet,
  launchpad, paymentToken, paymentAmount, referrer, itemIds, itemQuantities, txHash, blockHeight, preconditionsMet, participationValid
FROM
  InvalidParticipations
ORDER BY wallet, blockHeight
;