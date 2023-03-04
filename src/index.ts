import * as xlsx from 'xlsx';
import fs from 'fs';

type SensorData = {
  Time: string;
  Humidity: string;
  Tempurature: string;
  ThermalArray: string;
}

type DataRange = [number, number];

const randomNumber = (min: number, max: number, precision?: number): string => {
  const random = Math.random() * (max - min) + min;
  return random.toFixed(precision);
}

export const objectToWorkbook = (
  objects: Object[],
  worksheetColumnName: string[],
  worksheetName: string,
): xlsx.WorkBook => {
  const data = objects.map((object) => [...Object.values(object)]);

  const workBook = xlsx.utils.book_new();
  const workSheetData = [worksheetColumnName, ...data];
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);

  xlsx.utils.book_append_sheet(workBook, workSheet, worksheetName);

  return workBook;
};

const main = () => {
  const INITIAL_DATA_TIME = new Date('2023-03-03 00:00:00');
  const DATA_INTERVAL = 3 * 60 * 1000;
  const DATA_COUNT = 1000;

  const HUMIDITY_RANGE: DataRange = [30, 60];
  const TEMPURATURE_RANGE: DataRange = [30, 60];
  const THERMAL_ARRAY_RANGE: DataRange = [30, 60];

  const FILE_NAME = 'data.xlsx';
  const SHEET_NAME = 'SensorData';

  const data: SensorData[] = [];

  console.log(`[${new Date().toLocaleString()}] start generating data...`)

  for (let i = 0; i < DATA_COUNT; i++) {
    const time = new Date(INITIAL_DATA_TIME.getTime() + DATA_INTERVAL * i);
    const humidity = randomNumber(...HUMIDITY_RANGE, 2);
    const tempurature = randomNumber(...TEMPURATURE_RANGE, 2);
    const thermalArray = Array.from({ length: 24 * 32 }, () => randomNumber(...THERMAL_ARRAY_RANGE, 2));

    data.push({
      Time: time.toISOString().replace('T', ' ').replace(/\..+/, ''),
      Humidity: humidity,
      Tempurature: tempurature,
      ThermalArray: thermalArray.join(','),
    });

    if (i % 10000 === 0) {
      console.log(`[${new Date().toLocaleString()}] ${i} data generated...`)
    }
  }

  console.log(`[${new Date().toLocaleString()}] ${DATA_COUNT} data generated successfully!`)
  console.log(`[${new Date().toLocaleString()}] writing to disk...`)

  const workbook = objectToWorkbook(data, ['Time', 'Humidity', 'Tempurature', 'ThermalArray'], SHEET_NAME);

  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
  }

  fs.writeFileSync(`./output/${FILE_NAME}`, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  console.log(`[${new Date().toLocaleString()}] write to disk successfully!`)
}

main();
