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
    // test('GET /auth/create - should create new user', async () => {
    //     const res = await request(app).get('/auth/create?email=newuser@example.com&username=NewUser&consent=true');
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body).toHaveProperty('user_token');
    // });

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
    // });

    test('POST /auth/sendcode - missing email should return 400', async () => {
        const res = await request(app)
            .post('/auth/sendcode')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email invalid');
    });

    // login tests
    // test('GET /auth/login - should login existing user Alice', async () => {
    //     const res = await request(app).get('/auth/login?email=alice@example.com&onetime_code=123456');
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body).toHaveProperty('user_token');
    // });

    test('GET /auth/login - missing params should return 400', async () => {
        const res = await request(app).get('/auth/login?email=alice@example.com');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email or Onetime_code invalid');
    });

    // logout tests
    // test('POST /auth/logout - should logout user with Alice token', async () => {
    //     const res = await request(app)
    //         .post('/auth/logout')
    //         .send({ user_token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    // });

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
