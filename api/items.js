import Airtable from 'airtable';
import formidable from 'formidable';

// Airtableの環境変数を設定
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);

// 画像アップロード用関数 (AirtableのAPIは直接Base64を受け付けないため、一時的な解決策)
async function uploadImageToAirtable(dataUrl) {
    // この実装は、AirtableのAPIの制約により、直接のアップロードをサポートしていません。
    // 実際の運用では、外部の画像ホスティングサービス(Cloudinary, Imgurなど)にアップロードし、そのURLをAirtableに保存する方式が一般的です。
    // または、AirtableのAttachmentフィールドを直接扱うためのライブラリや手法が必要です。
    // このコードでは、現時点では写真アップロードは未実装としてエラーを返すか、Base64を破棄します。
    console.warn("Airtableへの写真の直接アップロードは現在の実装ではサポートされていません。");
    return null;
}

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case 'GET':
                const records = await table.select().all();
                res.status(200).json({ records });
                break;

            case 'POST':
                const { name, count, category, handling, destination, addedBy, memo, photoDataUrl } = req.body;
                
                // 写真アップロードは未実装のため、一旦スキップ
                let photoAttachment = null;
                if (photoDataUrl) {
                    // ここに写真アップロードのロジックを実装
                    console.log("写真アップロード処理は未実装のためスキップされます。");
                }
                
                const newRecord = await table.create({
                    '品名': name,
                    '個数': count,
                    '属性': category,
                    '取扱い方法': handling,
                    '送り先': destination,
                    '決定済み': false,
                    '登録者': addedBy,
                    '登録日時': new Date().toISOString(),
                    'メモ': memo,
                    // '写真': photoAttachment // 写真のURLをここに設定
                });
                res.status(201).json(newRecord);
                break;

            case 'PATCH':
                const { id } = req.query;
                const updates = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'IDが指定されていません。' });
                }
                const updatedRecord = await table.update(id, updates);
                res.status(200).json(updatedRecord);
                break;
            
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('APIエラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
}
