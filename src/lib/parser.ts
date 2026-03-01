import Papa from "papaparse";

export const parseNordeaCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(), 
      complete: (results) => {
        try {
          // 过滤并清洗数据
          const cleanedData = results.data
            .map((row: any) => {
              // 从你截图看到的准确字段名：'Booking date', 'Amount', 'Name'
              const rawDate = row['Booking date'];
              const rawDesc = row['Name'] || row['Message'];
              const rawAmount = row['Amount'];

              if (!rawAmount || !rawDesc) return null;

              // 处理像 "-12,90" 这样带引号和逗号的字符串
              const sanitizedAmount = String(rawAmount)
                .replace(/[ "]/g, '') // 去掉引号和空格
                .replace(',', '.');   // 逗号转小数点
              
              const parsedAmount = parseFloat(sanitizedAmount);

              return {
                date: rawDate,
                description: rawDesc,
                amount: parsedAmount, 
              };
            })
            .filter((item: any) => 
              item !== null && 
              !isNaN(item.amount) && 
              item.amount < 0 // 只看消费
            )
            .map(item => ({
              ...item,
              amount: Math.abs(item.amount) // 转正数给 AI 分析
            }));

          console.log("✅ 解析后的数据预览:", cleanedData.slice(0, 3));
          resolve(cleanedData);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
};