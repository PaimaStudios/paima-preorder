CREATE TABLE launchpad_users (
  launchpad TEXT NOT NULL,
  wallet TEXT NOT NULL,
  paymentToken TEXT NOT NULL,
  totalAmount TEXT NOT NULL,
  lastReferrer TEXT NOT NULL,
  participationValid BOOLEAN NOT NULL,
  PRIMARY KEY (launchpad, wallet)
);

CREATE TABLE launchpad_participations (
  launchpad TEXT NOT NULL,
  wallet TEXT NOT NULL,
  paymentToken TEXT NOT NULL,
  paymentAmount TEXT NOT NULL,
  referrer TEXT NOT NULL,
  itemIds TEXT NOT NULL,
  itemQuantities TEXT NOT NULL,
  txHash TEXT NOT NULL,
  blockHeight INTEGER NOT NULL,
  preconditionsMet BOOLEAN NOT NULL,
  PRIMARY KEY (launchpad, txHash, wallet)
);

CREATE TABLE launchpad_user_items (
  launchpad TEXT NOT NULL,
  wallet TEXT NOT NULL,
  itemId INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (launchpad, wallet, itemId),
  FOREIGN KEY (launchpad, wallet) REFERENCES launchpad_users (launchpad, wallet)
);
