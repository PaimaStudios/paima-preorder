/*
  @name deleteUserItems
*/
DELETE FROM launchpad_user_items
WHERE launchpad = :launchpad! AND wallet = :wallet!
;