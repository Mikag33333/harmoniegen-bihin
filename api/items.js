import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case 'GET':
                const records = await table.select().all();
                res.status(200).json({ records });
                break;
            case 'POST':
                const { name, count, category, handling, destination, addedBy, memo } = req.body;
                
                const newRecord = await table.create({
                    '品名': name,
                    '個数': count,
                    '属性': category,
                    '取り扱い方法': handling,
                    '送り先': destination,
                    '決定済み': false,
                    '登録者': addedBy,
                    '登録日時': new Date().toISOString(),
                    'メモ': memo,
                });
                res.status(201).json(newRecord);
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('APIエラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
}
