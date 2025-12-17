# INTERFACE
```
🌐 Site
│
├── 🏠 Home Page
│   ├── 🔐 Login Popup
│   └── 📝 Signup Popup
│
├── 📊 Dashboard Page
│   └── ➕ Create Circle Popup
│
└── 👥 Circle Page
    ├── 🛠️ Admin Actions
    │   ├── ⚙️ Manage Popup
    │   ├── 🚫 Waive Popup
    │   └── 🚩 Flag Popup
    │
    ├── 💰 Contribution Popup
    └── 🔨 Auction Popup
```

# RDB
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
Table circle {
  id serial [primary key]
  name NVARCHAR
  join_code varchar

  modified_date datetime
  valid bool
}

Table circle_member {
  circle_id serial [primary key]
  user_id integer
  is_admin bool

  modified_date datetime
  valid bool
}
Ref: "circle_member"."user_id" < "user"."id"
Ref: "circle_member"."circle_id" < "circle"."id"

Table cycle {
  id serial [primary key]
  circle_id integer
  auction_mode bool

  modified_date datetime
  valid bool
}
Ref: "cycle"."circle_id" < "circle"."id"

Table period {
  id serial [primary key]
  cycle_id integer
  modified_date datetime
  valid bool
}
Ref: "period"."cycle_id" < "cycle"."id"
// #endregion

// #region MONEY
Table contribution {
  id serial [primary key]
  period_id integer
  user_id integer
  for_user_id integer
  contribution_date date
  annotation text

  modified_date datetime
  valid bool
}
Ref: "contribution"."period_id" < "period"."id"
Ref: "contribution"."user_id" < "user"."id"
Ref: "contribution"."for_user_id" < "user"."id"

Table penalty {
  id serial [primary key]
  period_id integer
  user_id integer
  contribution_id integer
  waived tinyint

  modified_date datetime
  valid bool
}
Ref: "penalty"."period_id" < "period"."id"
Ref: "penalty"."user_id" < "user"."id"
Ref: "penalty"."contribution_id" < "contribution"."id"

Table payout {
  id serial [primary key]
  period_id integer
  user_id integer

  modified_date datetime
  valid bool
}
Ref: "payout"."period_id" < "period"."id"
Ref: "payout"."user_id" < "user"."id"

// bid to get the amount fewer
Table auction {
  id serial [primary key]
  period_id integer
  user_id integer
  contribution_date date
  ammount decimal

  modified_date datetime
  valid bool
}
Ref: "auction"."period_id" < "period"."id"
Ref: "auction"."user_id" < "user"."id"
// #endregion

```

# API
```js
// INFO
/*
	HTTP QUERIES : GET, POST, PUT (and DELETE)
	RETURN FORMAT : JSON
*/

// CONNECTION
get : "/create" (params : email, username, consent) -> user_token
post : "/sendcode" (params : email)
get : "/login" (params : email, onetime_code) -> user_token
post : "/logout" (params : user_token)

// DASHBOARD
get : "/userinfo" (params : user_token) -> {
	user_token,
  user_id,
	name,
	email,
	consent,
	circles {
		circle_id,
		name, 
		contribution_ammount,
		due_date,
		payout_ammount
	}
}
post :"/create_circle" (params : user_id, circle_name)
post :"/join_circle" (params : user_id, join_code)

// CIRCLE PAGE
get : "/circle" (params : user_token, circle_id) -> {
	circle_id,
	circle_name,
  join_code,
	contribution_ammount,
	members {
		logged : bool,
		isadmin : bool,
    user_id,
		member_name,
		contribution_ammount,
		due_date,
		penalties {
			paid
		}
	}
	periods {
		date,
		member_name
	}
}
post : "/contribute" (params : user_id, circle_id, period_date)
post : "/auction" (params : user_id, circle_id, period_date, ammount)

post : "/flaguser" (params : user_id, circle_id)
post : "/change_settings" (params : circle_id, name, contribution_ammount, perdiod_duration, auction_mode)

// ADMIN SYSTEM PAGE
get : "/users" (params : user_token) -> {
  user_token,
	name,
	email,
	consent,
}

get : "/circles" (params : user_token) -> {
	circles {
    circle_name,
    join_code,
    contribution_ammount,
    members {
      logged : bool,
      isadmin : bool,
      user_id,
      member_name,
      contribution_ammount,
      due_date,
      penalties {
        paid
      }
	}	
}
```
