import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import ImportantDate from '@/models/ImportantDate';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  const userId = req.userId;
  const record = await ImportantDate.findOne({ _id: id, userId });
  if (!record) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

  if (req.method === 'PATCH') {
    Object.assign(record, req.body || {});
    await record.save();
    return res.status(200).json({ date: record });
  }

  if (req.method === 'DELETE') {
    await record.deleteOne();
    return res.status(204).end();
  }

  return res.status(405).end();
}

export default withAuth(handler);
