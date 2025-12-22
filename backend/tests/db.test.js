require('dotenv').config();
const db = require('../utils/db');

describe('Database Connection', () => {
    afterAll(async () => {
        await db.disconnect();
    });

    test('should connect to database', async () => {
        const pool = await db.connect();
        expect(pool).toBeDefined();
    });

    test('should return existing pool on second connect', async () => {
        const pool1 = await db.connect();
        const pool2 = await db.connect();
        expect(pool1).toBe(pool2);
    });
});

describe('Database Operations', () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('SELECT operations', () => {
        test('should build SELECT query without WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: [] });

            await db.select('users');

            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users', []);
            mockQuery.mockRestore();
        });

        test('should build SELECT query with WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: [] });

            await db.select('users', { id: 1 });

            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
            mockQuery.mockRestore();
        });

        test('should build SELECT query with specific columns', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: [] });

            await db.select('users', { id: 1 }, 'name, email');

            expect(mockQuery).toHaveBeenCalledWith('SELECT name, email FROM users WHERE id = $1', [1]);
            mockQuery.mockRestore();
        });

        test('should return rows from query result', async () => {
            const mockRows = [{ id: 1, name: 'Test User' }];
            jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: mockRows });

            const result = await db.select('users', { id: 1 });

            expect(result).toEqual(mockRows);
        });
    });

    describe('INSERT operations', () => {
        test('should build INSERT query correctly', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({
                rows: [{ id: 1, name: 'John', email: 'john@example.com' }]
            });

            await db.insert('users', { name: 'John', email: 'john@example.com' });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users (name, email)'),
                ['John', 'john@example.com']
            );
            mockQuery.mockRestore();
        });

        test('should return inserted row', async () => {
            const mockRow = { id: 1, name: 'John', email: 'john@example.com' };
            jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: [mockRow] });

            const result = await db.insert('users', { name: 'John', email: 'john@example.com' });

            expect(result).toEqual(mockRow);
        });
    });

    describe('UPDATE operations', () => {
        test('should build UPDATE query with WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({
                rows: [{ id: 1, name: 'Jane' }]
            });

            await db.update('users', { name: 'Jane' }, { id: 1 });

            expect(mockQuery).toHaveBeenCalledWith(
                'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
                ['Jane', 1]
            );
            mockQuery.mockRestore();
        });

        test('should build UPDATE query without WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({
                rows: [{ name: 'Jane' }]
            });

            await db.update('users', { name: 'Jane' });

            expect(mockQuery).toHaveBeenCalledWith(
                'UPDATE users SET name = $1 RETURNING *',
                ['Jane']
            );
            mockQuery.mockRestore();
        });

        test('should return updated row', async () => {
            const mockRow = { id: 1, name: 'Jane' };
            jest.spyOn(db.pool, 'query').mockResolvedValue({ rows: [mockRow] });

            const result = await db.update('users', { name: 'Jane' }, { id: 1 });

            expect(result).toEqual(mockRow);
        });
    });

    describe('DELETE operations', () => {
        test('should build DELETE query with WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({});

            await db.delete('users', { id: 1 });

            expect(mockQuery).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [1]);
            mockQuery.mockRestore();
        });

        test('should build DELETE query without WHERE clause', async () => {
            const mockQuery = jest.spyOn(db.pool, 'query').mockResolvedValue({});

            await db.delete('users');

            expect(mockQuery).toHaveBeenCalledWith('DELETE FROM users', []);
            mockQuery.mockRestore();
        });

        test('should execute DELETE without errors', async () => {
            jest.spyOn(db.pool, 'query').mockResolvedValue({});

            await expect(db.delete('users', { id: 1 })).resolves.not.toThrow();
        });
    });
});
