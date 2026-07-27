import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import Debt from '@/models/Debt';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;
  const userId = req.userId;
  const debt = await Debt.findOne({ _id: id, userId });
  if (!debt) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });

  if (req.method === 'PATCH') {
    Object.assign(debt, req.body || {});
    if (req.body.settled) debt.settledDate = new Date();
    await debt.save();
    return res.status(200).json({ debt });
  }

  if (req.method === 'DELETE') {
    await debt.deleteOne();
    return res.status(204).end();
  }

  return res.status(405).end();
}

export default withAuth(handler);
