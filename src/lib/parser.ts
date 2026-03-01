import Papa from "papaparse";

export const parseNordeaCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(), 
      complete: (results) => {
        try {
          const cleanedData = results.data
            .map((row: any) => {
              const rawDate = row['Booking date'];
              const rawDesc = row['Name'] || row['Message'];
              const rawAmount = row['Amount'];

              if (!rawAmount || !rawDesc) return null;

              // 处理金额格式：去掉引号、空格，将逗号换成点
              const sanitizedAmount = String(rawAmount)
                .replace(/[ "]/g, '')
                .replace(',', '.');
              
              const parsedAmount = parseFloat(sanitizedAmount);

              return {
                date: rawDate,
                description: rawDesc,
                amount: parsedAmount, 
              };
            })
            // 关键修复：显式告诉 TypeScript 过滤掉 null 且只保留支出
            .filter((item): item is { date: string; description: string; amount: number } => 
              item !== null && 
              !isNaN(item.amount) && 
              item.amount < 0 // 💡 只保留负数（支出），避免把存入的钱当成花掉的钱
            )
            .map(item => ({
              ...item,
              amount: Math.abs(item.amount) // 将支出转为正数，方便 AI 统计分类
            }));

          // 限制给 AI 的数据量，防止超出 Token 限制
          const finalizedData = cleanedData.slice(0, 100); 
          console.log("✅ 解析后的数据预览:", finalizedData.slice(0, 3));
          resolve(finalizedData);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
};