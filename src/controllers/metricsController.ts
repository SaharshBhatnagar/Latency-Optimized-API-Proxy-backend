import { type Request, type Response } from 'express';
import { connectDb } from '../config/database.js';
import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Backend Redis Error', err));
redisClient.connect().catch(console.error);

export async function getSystemMetrics(req: Request, res: Response) {
    try {
        
        const userQuery = 'SELECT COUNT(*) AS count FROM users';
        const dbResult = await connectDb(userQuery);
        const activeUsers = parseInt(dbResult.rows[0].count, 10);

        const totalRequests = await redisClient.get('gateway:total_requests');
        const cacheHits = await redisClient.get('gateway:cache_hits');

        res.status(200).json({
            totalRequest: totalRequests ? parseInt(totalRequests, 10) : 0,
            activeUsers: activeUsers,
            CacheHits: cacheHits ? parseInt(cacheHits, 10) : 0
        });
    } catch (err) {
        console.error('Metrics fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
}