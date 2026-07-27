import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Deadline from '@/models/Deadline';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  const userId = req.userId;
  const deadline = await Deadline.findOne({ _id: id, userId });
  if (!deadline) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

  if (req.method === 'PATCH') {
    Object.assign(deadline, req.body || {});
    await deadline.save();
    return res.status(200).json({ deadline });
  }

  if (req.method === 'DELETE') {
    await deadline.deleteOne();
    return res.status(204).end();
  }

  return res.status(405).end();
}

export default withAuth(handler);
