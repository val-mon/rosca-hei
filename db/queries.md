# Reprsentatives SQL Queries used in the project

Following is a curated list of 10 key SQL queries used in the backend and what each one does.

1. **Sum of funds circulating in active cycles**
   ```sql
   SELECT SUM(
     cy.contribution_amount * (
       SELECT COUNT(*)
       FROM circle_member cm
       WHERE cm.circle_id = cy.circle_id AND cm.valid = true
     )
   ) AS total
   FROM cycle cy
   JOIN circle c ON cy.circle_id = c.id
   WHERE cy.valid = true
     AND c.valid = true;
   ```
   **What it does:** Computes the total amount circulating across all active circles by multiplying each cycle’s contribution amount by its active member count and summing the results. (Used for admin global stats.)

2. **Average circle size**
   ```sql
   SELECT AVG(member_count) as avg FROM (
     SELECT COUNT(*) as member_count
     FROM circle_member cm
     JOIN circle c ON cm.circle_id = c.id
     WHERE c.valid = true AND cm.valid = true
     GROUP BY cm.circle_id
   ) as circle_sizes
   ```
   **What it does:** Calculates the average number of active members per active circle. (Used for admin global stats.)

3. **Admin list of users with circle count and penalty flag**
   ```sql
   SELECT
     u.id,
     u.username as name,
     u.email,
     u.created_at,
     (SELECT COUNT(*) FROM circle_member cm WHERE cm.user_id = u.id AND cm.valid = true) as nbr_circles,
     (SELECT COUNT(*) > 0 FROM penalty p WHERE p.user_id = u.id AND p.waived = 0) as flaged
   FROM "user" u
   WHERE u.valid = true and u.email <> 'admin@rosca-hei.com'
   ORDER BY u.id
   ```
   **What it does:** Fetches all active non-admin users, along with how many circles they belong to and whether they have any unwaived penalties. (Used for admin user management.)

4. **Admin list of circles with membership, progress, funds, and mode**
   ```sql
   SELECT
     c.id,
     c.name as circle_name,
     TO_CHAR(c.modified_date, 'YYYY-MM-DD') as created_date,
     (SELECT u.username FROM "user" u
      JOIN circle_member cm ON cm.user_id = u.id
      WHERE cm.circle_id = c.id AND cm.is_admin = true
      LIMIT 1) as creator,
     (SELECT COUNT(*) FROM circle_member cm WHERE cm.circle_id = c.id AND cm.valid = true) as nbr_members,
     (SELECT COUNT(*) FROM period p
      JOIN cycle cy ON p.cycle_id = cy.id
      WHERE cy.circle_id = c.id) as progress,
     (SELECT SUM(cy.contribution_amount * (
       SELECT COUNT(*) FROM circle_member cm WHERE cm.circle_id = c.id AND cm.valid = true
     ))
      FROM cycle cy WHERE cy.circle_id = c.id) as total_funds,
     (SELECT cy.auction_mode FROM cycle cy
      WHERE cy.circle_id = c.id
      ORDER BY cy.id DESC LIMIT 1) as mode
   FROM circle c
   WHERE c.valid = true
   ORDER BY c.id
   ```
   **What it does:** Builds a detailed admin view of each active circle, including creator, member count, progress, total funds, and payout mode. (Used for admin circle management.)

5. **User dashboard circle overview**
   ```sql
   SELECT
     c.id,
     c.name,
     (SELECT cy.contribution_amount FROM cycle cy WHERE cy.circle_id = c.id ORDER BY cy.id DESC LIMIT 1) as contribution_amount,
     (SELECT cy.auction_mode FROM cycle cy WHERE cy.circle_id = c.id ORDER BY cy.id DESC LIMIT 1) as auction_mode,
     (SELECT COUNT(*) FROM circle_member WHERE circle_id = c.id AND valid = true) as member_count,
     cm.is_admin,
     (SELECT p.due_date FROM period p
      LEFT JOIN payout po ON po.period_id = p.id AND po.valid = true
      JOIN cycle cy ON p.cycle_id = cy.id
      WHERE cy.circle_id = c.id AND p.valid = true AND po.id IS NULL
      ORDER BY p.due_date ASC LIMIT 1) as next_due_date,
     (SELECT p.id FROM period p
      LEFT JOIN payout po ON po.period_id = p.id AND po.valid = true
      JOIN cycle cy ON p.cycle_id = cy.id
      WHERE cy.circle_id = c.id AND p.valid = true AND po.id IS NULL
      ORDER BY p.due_date ASC LIMIT 1) as next_period_id,
     EXISTS(
       SELECT 1 FROM contribution cont
       WHERE cont.period_id = (
         SELECT p.id FROM period p
         LEFT JOIN payout po ON po.period_id = p.id AND po.valid = true
         JOIN cycle cy ON p.cycle_id = cy.id
         WHERE cy.circle_id = c.id AND p.valid = true AND po.id IS NULL
         ORDER BY p.due_date ASC LIMIT 1
       ) AND cont.user_id = $1 AND cont.valid = true
     ) as user_has_paid
   FROM circle c
   JOIN circle_member cm ON c.id = cm.circle_id
   WHERE cm.user_id = $1 AND c.valid = true
   ```
   **What it does:** Builds the per-circle overview shown on the user dashboard, including member count, next due date, and whether the user has paid for the upcoming period. (Used for `/dashboard/userinfo`.)

6. **Active auctions for a user**
   ```sql
   SELECT
     c.id as circle_id,
     c.name as circle_name,
     p.id as period_id,
     p.due_date as end_date,
     cy.contribution_amount * (SELECT COUNT(*) FROM circle_member WHERE circle_id = c.id AND valid = true) as payout_amount,
     COALESCE(user_auction.ammount, 0) as user_bid_amount,
     COALESCE(max_auction.ammount, 0) as current_highest_bid,
     COALESCE(winner.username, '') as current_winner,
     CASE
       WHEN user_auction.ammount = max_auction.ammount AND user_auction.ammount > 0 THEN true
       ELSE false
     END as is_winning
   FROM period p
   JOIN cycle cy ON p.cycle_id = cy.id
   JOIN circle c ON cy.circle_id = c.id
   JOIN circle_member cm ON c.id = cm.circle_id
   LEFT JOIN auction user_auction ON p.id = user_auction.period_id AND user_auction.user_id = $1
   LEFT JOIN (
     SELECT period_id, MAX(ammount) as ammount
     FROM auction
     GROUP BY period_id
   ) max_auction ON p.id = max_auction.period_id
   LEFT JOIN auction winning_auction ON p.id = winning_auction.period_id AND winning_auction.ammount = max_auction.ammount
   LEFT JOIN "user" winner ON winning_auction.user_id = winner.id
   WHERE cm.user_id = $1
     AND cy.auction_mode = true
     AND p.due_date > CURRENT_DATE
     AND c.valid = true
   ORDER BY p.due_date ASC
   ```
   **What it does:** Retrieves upcoming auction periods for a user’s circles, including the payout amount, the user’s bid, the current highest bid, and whether the user is winning. (Used for `/dashboard/useractiveauctions`.)

7. **Latest active cycle for a circle**
   ```sql
   SELECT id, contribution_amount, auction_mode
   FROM cycle
   WHERE circle_id = $1 AND valid = true
   ORDER BY id DESC LIMIT 1
   ```
   **What it does:** Fetches the most recent active cycle for a circle so the API can compute contributions, periods, and auction behavior. (Used in circle details.)

8. **Current (unpaid) period for a cycle**
   ```sql
   SELECT p.id, p.due_date FROM period p
   LEFT JOIN payout po ON po.period_id = p.id AND po.valid = true
   WHERE p.cycle_id = $1 AND p.valid = true AND po.id IS NULL
   ORDER BY p.due_date ASC LIMIT 1
   ```
   **What it does:** Finds the next unpaid period (the current period) for a cycle by excluding periods that already have payouts. (Used for circle details and contributions.)

9. **Flagged users in a circle (3+ penalties)**
   ```sql
   SELECT pen.user_id
   FROM penalty pen
   JOIN period per ON per.id = pen.period_id
   JOIN cycle cy ON cy.id = per.cycle_id
   WHERE cy.circle_id = $1
     AND pen.valid = true
   GROUP BY pen.user_id
   HAVING COUNT(pen.id) >= 3
   ```
   **What it does:** Identifies members who have accumulated three or more penalties in a circle, which the UI can highlight as flagged. (Used for circle details.)

10. **Current auction bids for a period**
    ```sql
    SELECT a.id, a.user_id, a.ammount, a.contribution_date, u.username
    FROM auction a
    JOIN "user" u ON u.id = a.user_id
    WHERE a.period_id = $1 AND a.valid = true
    ORDER BY a.ammount DESC
    ```
    **What it does:** Loads all valid auction bids for the current period, ordered by bid amount, so the API can determine the leading bidder and show the bid list. (Used for circle details in auction mode.)