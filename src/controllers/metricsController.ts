import { type Request, type Response} from 'express';

export async function getSystemMetrics(req: Request, res: Response) {

    return res.status(200).json({ totalRequest: 1204, activeUsers: 42, CacheHits: 89});
    
}