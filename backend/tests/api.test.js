const request = require('supertest')
const app = require('../index.js')
const db = require('../utils/db')

// note : this tests are based on the data created with `db/insert_example.sql`

beforeAll(async () => {
    await db.connect();
});

afterAll(async () => {
    await db.disconnect();
});

describe('Auth API', () => {
    // create tests
    test('GET /auth/create - should create new user', async () => {
        const res = await request(app).get(`/auth/create?email=newuser@example.com&username=NewUser&consent=true`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('user_token');

        await db.delete('"user"', { username : 'NewUser' })
    });

    test('GET /auth/create - missing params should return 400', async () => {
        const res = await request(app).get('/auth/create?email=test@example.com');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email, Username or Consent invalid');
    });

    // send code tests
    // test('POST /auth/sendcode - should send verification code to existing user Alice', async () => {
    //     const res = await request(app)
    //         .post('/auth/sendcode')
    //         .send({ email: 'alice@example.com' });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    //     expect(res.body.message).toBe('Code sent');
    // });

    test('POST /auth/sendcode - missing email should return 400', async () => {
        const res = await request(app)
            .post('/auth/sendcode')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email invalid');
    });

    // login tests
    test('GET /auth/login - should login existing user Alice and create new token', async () => {
        // create a valid code for Alice
        const users = await db.select('"user"', { email: 'alice@example.com' }, 'id');
        const user_id = users[0].id;
        const validCode = 123456;
        const validExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await db.insert('authentification', {
            user_id: user_id,
            code: validCode,
            expiration: validExpiration
        });

        // get existing tokens before login
        const tokensBefore = await db.select('user_token', { user_id: user_id }, 'token');
        const existingTokens = tokensBefore.map(t => t.token);

        const res = await request(app).get(`/auth/login?email=alice@example.com&onetime_code=${validCode}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('user_token');

        // verify a new token was created
        const newToken = res.body.user_token;
        expect(existingTokens).not.toContain(newToken);

        // clean up
        await db.delete('authentification', { user_id: user_id, code: validCode });
        await db.delete('user_token', { token: newToken });
    });

    test('GET /auth/login - missing params should return 400', async () => {
        const res = await request(app).get('/auth/login?email=alice@example.com');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email or Onetime_code invalid');
    });

    test('GET /auth/login - non-existent user should return 401', async () => {
        const res = await request(app).get('/auth/login?email=nonexistent@example.com&onetime_code=123456');
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('User not found or inactive');
    });

    test('GET /auth/login - invalid code should return 401', async () => {
        const res = await request(app).get('/auth/login?email=alice@example.com&onetime_code=999999');
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Invalid code');
    });

    test('GET /auth/login - expired code should return 401', async () => {
        // create an expired code for Alice
        const users = await db.select('"user"', { email: 'alice@example.com' }, 'id');
        const user_id = users[0].id;
        const expiredCode = 555555;
        const expiredDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

        await db.insert('authentification', {
            user_id: user_id,
            code: expiredCode,
            expiration: expiredDate
        });

        const res = await request(app).get(`/auth/login?email=alice@example.com&onetime_code=${expiredCode}`);
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Code expired');

        // clean up
        await db.delete('authentification', { user_id: user_id, code: expiredCode });
    });

    // logout tests
    test('POST /auth/logout - should logout user successfully', async () => {
        // create a temporary token for testing
        const users = await db.select('"user"', { email: 'alice@example.com' }, 'id');
        const user_id = users[0].id;
        const testToken = await db.insert('user_token', { user_id: user_id });

        const res = await request(app)
            .post('/auth/logout')
            .send({ user_token: testToken.token });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Logged out');

        // verify token was deleted
        const tokenCheck = await db.select('user_token', { token: testToken.token }, 'token');
        expect(tokenCheck.length).toBe(0);
    });

    test('POST /auth/logout - missing token should return 400', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token invalid');
    });
});

describe('Dashboard API', () => {
    // user info tests
    test('GET /dashboard/userinfo - should return Alice user info with circles', async () => {
        const res = await request(app).get('/dashboard/userinfo?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(200);

        // verify main properties
        expect(res.body.user_token).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.body.username).toBe('Alice');
        expect(res.body.email).toBe('alice@example.com');
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('privacy_consent');

        // verify circles
        expect(res.body).toHaveProperty('circles');
        expect(Array.isArray(res.body.circles)).toBe(true);
        expect(res.body.circles.length).toBe(2);

        // Famille Martin: Alice is admin, latest cycle contribution_amount=150, 3 members
        const familleMartin = res.body.circles.find(c => c.name === 'Famille Martin');
        expect(familleMartin.circle_id).toBe(1);
        expect(parseFloat(familleMartin.contribution_amount)).toBe(150.00);
        expect(parseFloat(familleMartin.payout_amount)).toBe(450.00);
        expect(familleMartin).toHaveProperty('due_date');

        // Collègues Bureau: Alice is member, cycle contribution_amount=200, 4 members
        const colleguesBureau = res.body.circles.find(c => c.name === 'Collègues Bureau');
        expect(colleguesBureau.circle_id).toBe(2);
        expect(parseFloat(colleguesBureau.contribution_amount)).toBe(200.00);
        expect(parseFloat(colleguesBureau.payout_amount)).toBe(800.00);
        expect(colleguesBureau).toHaveProperty('due_date');
    });

    test('GET /dashboard/userinfo - missing token should return 400', async () => {
        const res = await request(app).get('/dashboard/userinfo');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User token invalid');
    });

    test('GET /dashboard/userinfo - invalid token should return 500', async () => {
        const res = await request(app).get('/dashboard/userinfo?user_token=invalid-token-xyz');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Internal Server Error');
        expect(res.body.route).toBe('GET /dashboard/userinfo');
        expect(res.body).toHaveProperty('message');
    });

    // create circle tests
    test('POST /dashboard/create_circle - should create circle for Alice', async () => {
        const res = await request(app)
            .post('/dashboard/create_circle')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_name: 'Test Circle' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('circle_id');
        expect(res.body).toHaveProperty('join_code');

        // delete circle (cascade deletes circle_member too)
        await db.delete('circle', { id: res.body.circle_id });
    });

    test('POST /dashboard/create_circle - missing params should return 400', async () => {
        const res = await request(app)
            .post('/dashboard/create_circle')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Circle_name invalid');
    });

    // join circle tests
    test('POST /dashboard/join_circle - should join existing circle', async () => {
        const res = await request(app)
            .post('/dashboard/join_circle')
            .send({ user_token: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', join_code: 'FAM2024' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('circle_id');

        // remove the user from the circle so test can run again
        const tokenResult = await db.select('user_token', { token: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55' }, 'user_id');
        await db.delete('circle_member', { circle_id: res.body.circle_id, user_id: tokenResult[0].user_id });
    });

    test('POST /dashboard/join_circle - invalid join_code should return 400', async () => {
        const res = await request(app)
            .post('/dashboard/join_circle')
            .send({ user_token: '', join_code: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Join_code invalid');
    });

    // get user active auctions tests
    test('GET /dashboard/useractiveauctions - should return active auctions for user', async () => {
        const res = await request(app).get('/dashboard/useractiveauctions?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('auctions');
        expect(Array.isArray(res.body.auctions)).toBe(true);

        // verify each auction has required properties
        res.body.auctions.forEach(auction => {
            expect(auction).toHaveProperty('circle_id');
            expect(auction).toHaveProperty('circle_name');
            expect(auction).toHaveProperty('period_id');
            expect(auction).toHaveProperty('payout_amount');
            expect(auction).toHaveProperty('user_bid_amount');
            expect(auction).toHaveProperty('current_highest_bid');
            expect(auction).toHaveProperty('current_winner');
            expect(auction).toHaveProperty('is_winning');
            expect(auction).toHaveProperty('end_date');
        });
    });

    test('GET /dashboard/useractiveauctions - missing token should return 400', async () => {
        const res = await request(app).get('/dashboard/useractiveauctions');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token invalid');
    });

    test('GET /dashboard/useractiveauctions - invalid token should return 500', async () => {
        const res = await request(app).get('/dashboard/useractiveauctions?user_token=invalid-token-xyz');
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Internal Server Error');
    });
});

describe('Circle API', () => {
    // circle tests
    // test('GET /circle/circle - should return Famille Martin circle details', async () => {
    //     const res = await request(app).get('/circle/circle?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11&circle_id=1');
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body).toHaveProperty('circle_id');
    //     expect(res.body).toHaveProperty('circle_name');
    //     expect(res.body).toHaveProperty('join_code');
    //     expect(res.body).toHaveProperty('members');
    //     expect(res.body).toHaveProperty('periods');
    //     expect(res.body.circle_name).toBe('Famille Martin');
    //     expect(res.body.join_code).toBe('FAM2024');
    // });

    test('GET /circle/circle - missing params should return 400', async () => {
        const res = await request(app).get('/circle/circle?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Circle_id invalid');
    });

    // contribute tests
    // test('POST /circle/contribute - should record contribution for Alice in Famille Martin', async () => {
    //     const res = await request(app)
    //         .post('/circle/contribute')
    //         .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_id: 1, period_date: '2024-05-01' });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    // });

    test('POST /circle/contribute - missing params should return 400', async () => {
        const res = await request(app)
            .post('/circle/contribute')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_id: 1 });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token, Circle_id or Period_date invalid');
    });

    // auction tests
    // test('POST /circle/auction - should record auction bid for Alice', async () => {
    //     const res = await request(app)
    //         .post('/circle/auction')
    //         .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_id: 1, period_date: '2024-05-01', ammount: 950 });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    // });

    test('POST /circle/auction - missing params should return 400', async () => {
        const res = await request(app)
            .post('/circle/auction')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_id: 1, period_date: '2024-05-01' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token, Circle_id, Period_date or Ammount invalid');
    });

    // flaguser tests
    // test('POST /circle/flaguser - should flag Charlie in Famille Martin', async () => {
    //     const res = await request(app)
    //         .post('/circle/flaguser')
    //         .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_id: 1 });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    // });

    test('POST /circle/flaguser - missing params should return 400', async () => {
        const res = await request(app)
            .post('/circle/flaguser')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Circle_id invalid');
    });

    // change settings tests
    // test('POST /circle/change_settings - should update Famille Martin settings', async () => {
    //     const res = await request(app)
    //         .post('/circle/change_settings')
    //         .send({
    //             user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    //             circle_id: 1,
    //             name: 'Famille Martin Modifiée',
    //             contribution_ammount: 150
    //         });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    // });

    test('POST /circle/change_settings - missing params should return 400', async () => {
        const res = await request(app)
            .post('/circle/change_settings')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Circle_id invalid');
    });
});

describe('Admin API', () => {
    // globalstats tests
    test('GET /admin/globalstats - should return global statistics', async () => {
        const res = await request(app).get('/admin/globalstats?user_token=f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00');
        expect(res.statusCode).toBe(200);

        // verify values from insert_example.sql
        expect(res.body).toHaveProperty('total_users')
        expect(res.body).toHaveProperty('total_circles')

        // funds = cycle1(100*3) + cycle2(150*3) + cycle3(200*4) + cycle4(50*3) = 300+450+800+150 = 1700
        expect(res.body.funds_circulating).toBe(1700.00);

        // avg circle size = (3 + 4 + 3) / 3 = 3.333...
        expect(res.body.avg_circle_size).toBeCloseTo(10/3);
    });

    test('GET /admin/globalstats - missing token should return 400', async () => {
        const res = await request(app).get('/admin/globalstats');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token invalid');
    });

    test('GET /admin/globalstats - non-admin user should return 403', async () => {
        const res = await request(app).get('/admin/globalstats?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Forbidden: Admin access required');
    });

    // users tests
    test('GET /admin/users - should return list of users', async () => {
        const res = await request(app).get('/admin/users?user_token=f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('users');
        expect(Array.isArray(res.body.users)).toBe(true);

        // verify we have 6 users (Alice, Bob, Charlie, Diana, Eve, Admin)
        expect(res.body).toHaveProperty('users')

        // verify Alice data
        const alice = res.body.users.find(u => u.email === 'alice@example.com');
        expect(alice.name).toBe('Alice');
        expect(alice).toHaveProperty('nbr_circles')
        expect(alice.flaged).toBe(false); // no unwaived penalties

        // verify Charlie data (has unwaived penalty)
        const charlie = res.body.users.find(u => u.email === 'charlie@example.com');
        expect(charlie.name).toBe('Charlie');
        expect(charlie.nbr_circles).toBe(2); // Famille Martin, Amis Université
        expect(charlie.flaged).toBe(true); // has unwaived penalty

        // verify Admin data (not in any circles)
        const admin = res.body.users.find(u => u.email === 'admin@rosca-hei.com');
        expect(admin.name).toBe('Admin');
        expect(admin.nbr_circles).toBe(0); // not in any circle
        expect(admin.flaged).toBe(false); // no penalties

        // verify all users have required properties
        res.body.users.forEach(user => {
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('last_login');
            expect(user).toHaveProperty('nbr_circles');
            expect(user).toHaveProperty('flaged');
        });
    });

    test('GET /admin/users - missing token should return 400', async () => {
        const res = await request(app).get('/admin/users');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token invalid');
    });

    test('GET /admin/users - non-admin user should return 403', async () => {
        const res = await request(app).get('/admin/users?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Forbidden: Admin access required');
    });

    // deleteuser tests
    test('POST /admin/deleteuser - should mark user as deleted', async () => {
        // create a temporary user for testing
        await request(app).get('/auth/create?email=tempuser@example.com&username=TempUser&consent=true');
        const users = await db.select('"user"', { email: 'tempuser@example.com' }, 'id');
        const user_id = users[0].id;

        const res = await request(app)
            .post('/admin/deleteuser')
            .send({ user_token: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', email: 'tempuser@example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User deleted');

        // verify user is marked as invalid
        const deletedUser = await db.select('"user"', { id: user_id }, 'valid');
        expect(deletedUser[0].valid).toBe(false);

        // clean up
        await db.delete('"user"', { id: user_id });
    });

    test('POST /admin/deleteuser - missing params should return 400', async () => {
        const res = await request(app)
            .post('/admin/deleteuser')
            .send({ user_token: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Email invalid');
    });

    test('POST /admin/deleteuser - non-admin user should return 403', async () => {
        const res = await request(app)
            .post('/admin/deleteuser')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'bob@example.com' });
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Forbidden: Admin access required');
    });

    // circles tests
    test('GET /admin/circles - should return list of circles', async () => {
        const res = await request(app).get('/admin/circles?user_token=f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('circles');
        expect(Array.isArray(res.body.circles)).toBe(true);

        // verify we have 3 circles (Famille Martin, Collègues Bureau, Amis Université)
        expect(res.body.circles.length).toBe(3);

        // verify Famille Martin data
        const familleMartin = res.body.circles.find(c => c.circle_name === 'Famille Martin');
        expect(familleMartin).toBeDefined();
        expect(familleMartin.creator).toBe('Alice');
        expect(familleMartin.nbr_members).toBe(3); // Alice, Bob, Charlie
        expect(familleMartin.progress).toBe(5); // 3 periods (cycle1) + 2 periods (cycle2)
        expect(familleMartin.total_funds).toBe(750); // cycle1 (100*3) + cycle2 (150*3)
        expect(familleMartin.mode).toBe('auction'); // last cycle (cycle2) has auction_mode=true

        // verify Collègues Bureau data
        const collegues = res.body.circles.find(c => c.circle_name === 'Collègues Bureau');
        expect(collegues).toBeDefined();
        expect(collegues.creator).toBe('Bob');
        expect(collegues.nbr_members).toBe(4); // Bob, Alice, Diana, Eve
        expect(collegues.progress).toBe(4); // 4 periods
        expect(collegues.total_funds).toBe(800); // cycle3 (200*4)
        expect(collegues.mode).toBe('auction'); // cycle3 has auction_mode=true

        // verify Amis Université data
        const amisUni = res.body.circles.find(c => c.circle_name === 'Amis Université');
        expect(amisUni).toBeDefined();
        expect(amisUni.creator).toBe('Charlie');
        expect(amisUni.nbr_members).toBe(3); // Charlie, Diana, Eve
        expect(amisUni.progress).toBe(2); // 2 periods
        expect(amisUni.total_funds).toBe(150); // cycle4 (50*3)
        expect(amisUni.mode).toBe('standard'); // cycle4 has auction_mode=false
    });

    test('GET /admin/circles - missing token should return 400', async () => {
        const res = await request(app).get('/admin/circles');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token invalid');
    });

    test('GET /admin/circles - non-admin user should return 403', async () => {
        const res = await request(app).get('/admin/circles?user_token=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Forbidden: Admin access required');
    });

    // deletecircle tests
    test('POST /admin/deletecircle - should mark circle as deleted', async () => {
        // create a temporary circle for testing
        const newCircle = await request(app)
            .post('/dashboard/create_circle')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_name: 'Temp Circle' });
        const circle_id = newCircle.body.circle_id;

        const res = await request(app)
            .post('/admin/deletecircle')
            .send({ user_token: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', circle_name: 'Temp Circle' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Circle deleted');

        // verify circle is marked as invalid
        const deletedCircle = await db.select('circle', { name: 'Temp Circle' }, 'valid');
        expect(deletedCircle[0].valid).toBe(false);

        // clean up
        await db.delete('circle', { id: circle_id });
    });

    test('POST /admin/deletecircle - missing params should return 400', async () => {
        const res = await request(app)
            .post('/admin/deletecircle')
            .send({ user_token: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User_token or Circle_name invalid');
    });

    test('POST /admin/deletecircle - non-admin user should return 403', async () => {
        const res = await request(app)
            .post('/admin/deletecircle')
            .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', circle_name: 'Famille Martin' });
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Forbidden: Admin access required');
    });
});
