# INTERFACE
```
🌐 Site
│
├── Home Page
│   ├── Login Popup
│   └── Signup Popup
│
├── Admin System Page
│
├── Dashboard Page
│   ├── Join Circle Popup
│   └── Create Circle Popup
│
└── Circle Page
    ├── (Admin) Start Circle Popup
    └── Place Bid Popup
```

# RDB
Note : to visualize this diagram, paste this code on [dbdiagram.io](https://dbdiagram.io)
``` sql
// #region USER
Table user {
  id serial [primary key]
  email nvarchar
  username nvarchar
  privacy_consent bool
  created_at timestamp

  modified_date datetime
  valid bool
}

Table authentification {
  id serial [primary key]
  user_id integer
  code integer
  expiration datetime
}
Ref: "authentification"."user_id" < "user"."id"

Table user_token {
	id serial [primary key]
	user_id integer
	token uuid
}
Ref: "user_token"."user_id" < "user"."id"
// #endregion

// #region CIRCLE
// -- A circle = a group of people participating in a rotating savings
Table circle {
  id serial [primary key]
  name NVARCHAR
  join_code varchar

  modified_date datetime
  valid bool
}

// -- Members of a circle
Table circle_member {
  circle_id serial [primary key]
  user_id integer
  is_admin bool               // -- ff true, can modify circle settings

  modified_date datetime
  valid bool
}
Ref: "circle_member"."user_id" < "user"."id"
Ref: "circle_member"."circle_id" < "circle"."id"

// -- A cycle = a savings session with N periods (where N = number of members)
Table cycle {
  id serial [primary key]
  circle_id integer
  auction_mode bool               // -- if true, members bid to receive the payout
  contribution_amount decimal     // -- amount each member must pay per period

  modified_date datetime
  valid bool
}
Ref: "cycle"."circle_id" < "circle"."id"

// -- A period = a time unit (2 week by default) where contributions are collected
Table period {
  id serial [primary key]
  cycle_id integer
  due_date date

  modified_date datetime
  valid bool
}
Ref: "period"."cycle_id" < "cycle"."id"
// #endregion

// #region MONEY
// -- Money PAID by a member during a period
Table contribution {
  id serial [primary key]
  period_id integer
  user_id integer             // -- member who PAYS
  for_user_id integer         // -- member who potentially pay for the origninal member
  contribution_date date
  annotation text

  modified_date datetime
  valid bool
}
Ref: "contribution"."period_id" < "period"."id"
Ref: "contribution"."user_id" < "user"."id"
Ref: "contribution"."for_user_id" < "user"."id"

// -- Penalty for a member who did NOT pay on time
Table penalty {
  id serial [primary key]
  period_id integer
  user_id integer
  contribution_id integer
  waived tinyint              // -- the circle admin can waived(cancel) the penality

  modified_date datetime
  valid bool
}
Ref: "penalty"."period_id" < "period"."id"
Ref: "penalty"."user_id" < "user"."id"
Ref: "penalty"."contribution_id" < "contribution"."id"

// -- Total pot RECEIVED by a member for a given period
Table payout {
  id serial [primary key]
  period_id integer
  user_id integer

  modified_date datetime
  valid bool
}
Ref: "payout"."period_id" < "period"."id"
Ref: "payout"."user_id" < "user"."id"

// -- Member bids to receive the payout BEFORE their turn
Table auction {
  id serial [primary key]
  period_id integer
  user_id integer
  contribution_date date
  amount decimal

  modified_date datetime
  valid bool
}
Ref: "auction"."period_id" < "period"."id"
Ref: "auction"."user_id" < "user"."id"
// #endregion

```

# API
```js
/*
	HTTP QUERIES : GET, POST
	RETURN FORMAT : JSON
	NOTE: All params are passed via query string for GET, body for POST
*/

// CONNECTION (auth.js)
get : "/create" (params : email, username, consent) -> {
  success: true,
  user_token,
  user: { id, email, username }
}
post : "/sendcode" (params : email) -> { success: true, message }
get : "/login" (params : email, onetime_code) -> {
  success: true,
  user_token,
  user: { id, email, username }
}
post : "/logout" (params : user_token) -> { success: true, message }

// DASHBOARD (dashboard.js)
get : "/userinfo" (params : user_token) -> {
  user_token,
  id,
  username,
  email,
  privacy_consent,
  circles [
    {
      id,
      name,
      members,
      contributionAmount,
      nextDueDate,
      upcomingPayout,
      userHasPaid,
      amountOwed,
      isAdmin,
      payoutMode // 'auction' or 'random'
    }
  ]
}
post : "/create_circle" (params : user_token, circle_name) -> {
  success: true,
  circle_id,
  join_code
}
post : "/join_circle" (params : user_token, join_code) -> {
  success: true,
  circle_id
}
get : "/useractiveauctions" (params : user_token) -> {
  auctions [
    {
      circle_id,
      circle_name,
      period_id,
      payout_amount,
      user_bid_amount,
      current_highest_bid,
      current_winner,
      is_winning,
      end_date
    }
  ]
}

// CIRCLE PAGE (circle.js)
get : "/circle" (params : user_token, circle_id) -> {
  joinCode,
  members [
    {
      id,
      name,
      email,
      position,
      hasPaid,
      latePayments,
      totalPenalties,
      isFlagged,
      flagReason,
      hasReceivedPayout
    }
  ],
  periods [
    {
      id,
      startDate,
      endDate,
      recipient,
      recipientId,
      status, // 'current', 'upcoming', 'completed'
      amount,
      hasAuction
    }
  ],
  hasCycle,
  currentAuction: {
    periodId,
    startDate,
    endDate,
    payoutAmount,
    currentHighestBid,
    currentWinner,
    bids [
      {
        id,
        memberId,
        memberName,
        bidAmount,
        timestamp,
        isWinning
      }
    ],
    hasUserBid,
    userBidAmount,
    isActive,
    canUserBid
  }
}
post : "/contribute" (params : user_token, circle_id, period_date) -> {
  success: true
}
post : "/auction" (params : user_token, circle_id, period_date, ammount) -> {
  success: true
}
post : "/change_settings" (params : user_token, circle_id, circle_name) -> {
  success: true,
  message
}
post : "/start_cycle" (params : user_token, circle_id, contribution_amount, payout_mode) -> {
  success: true,
  message,
  cycle_id
}
post : "/kick_member" (params : user_token, circle_id, member_id) -> {
  success: true,
  message
}

// ADMIN SYSTEM PAGE (admin.js)
get : "/globalstats" (params : user_token) -> {
  total_users,
  total_circles,
  funds_circulating,
  average_circle_size
}
get : "/users" (params : user_token) -> {
  users [
    {
      username,
      email,
      totalCircles,
      registrationDate,
      flaged
    }
  ]
}
post : "/deleteuser" (params : user_token, email) -> {
  success: true,
  message
}
get : "/circles" (params : user_token) -> {
  circles [
    {
      id,
      name,
      createdDate,
      creator,
      members,
      progress,
      total_funds,
      payoutMode // 'auction' or 'random'
    }
  ]
}
post : "/deletecircle" (params : user_token, circle_id) -> {
  success: true,
  message
}
```
