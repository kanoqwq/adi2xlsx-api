const { AdifReader } = require('tcadif');
import fs from 'fs';

export const getQsoJsonData = (adiFile: any) => new Promise((resolve, reject) => {
    try {
        let JsonData: Array<ADIJsonRecord> = []
        const input = fs.createReadStream(adiFile.filepath);

        const reader = new AdifReader();

        input.on('error', () => { throw new Error() })

        reader.on('data', (record: ADIJsonRecord) => {
            JsonData.push(record)
        });

        reader.on('error', (err: Error) => {
            throw new Error(err.message)
        });

        reader.on('finish', () => {
            resolve({ ok: true, data: JsonData })
        })
        //need  piping
        input.pipe(reader);
    } catch (e: any) {
        reject({ ok: false, message: "parse adi file failed !" })
    }
})