import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import AdmZip from 'adm-zip';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // necessário para usar formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Arquivo não encontrado' });
    }

    const zipBuffer = fs.readFileSync(file.filepath);
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    const fileList = entries.map(entry => entry.entryName);

    return res.status(200).json({ files: fileList });
  } catch (err) {
    console.error('Erro ao inspecionar ZIP:', err);
    return res.status(500).json({ error: 'Erro interno ao processar o ZIP' });
  }
}