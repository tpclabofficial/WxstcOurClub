// 数据清洗模块
function cleanData(data, type) {
    switch(type) {
        case 'csv':
            return cleanCSV(data);
        case 'json':
            return cleanJSON(data);
        case 'text':
            return cleanText(data);
        default:
            return data;
    }
}

// CSV清洗
function cleanCSV(data) {
    const rows = data.split('\n');
    const cleaned = [];
    
    // 去重
    const uniqueRows = [...new Set(rows)];
    
    // 过滤空行
    uniqueRows.forEach(row => {
        if(row.trim() && row.includes(',')) {
            cleaned.push(row);
        }
    });
    
    return cleaned.join('\n');
}

// JSON清洗
function cleanJSON(data) {
    try {
        const parsed = JSON.parse(data);
        // 深度去重
        return JSON.stringify(removeDuplicates(parsed), null, 2);
    } catch (e) {
        return `JSON解析失败: ${e.message}`;
    }
}

// 文本清洗
function cleanText(data) {
    // 移除多余空格
    let result = data.replace(/\s+/g, ' ');
    // 分句处理
    result = result.split('. ').join('.\n');
    return result;
}

// 数据标准化
function standardizeData(data, type) {
    switch(type) {
        case 'csv':
            return standardizeCSV(data);
        case 'json':
            return standardizeJSON(data);
        case 'text':
            return standardizeText(data);
        default:
            return data;
    }
}

// CSV标准化
function standardizeCSV(data) {
    const rows = data.split('\n');
    const headers = rows[0].split(',').map(h => h.toLowerCase().trim());
    const standardized = [headers.join(',')];
    
    for(let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const formatted = values.map((v, idx) => {
            // 日期标准化
            if(headers[idx].includes('date')) {
                return formatDate(v);
            }
            // 数字标准化
            if(!isNaN(v)) {
                return parseFloat(v).toFixed(2);
            }
            return v.trim();
        });
        standardized.push(formatted.join(','));
    }
    
    return standardized.join('\n');
}

// JSON标准化
function standardizeJSON(data) {
    try {
        const parsed = JSON.parse(data);
        const standardized = Array.isArray(parsed) ? [] : {};
        
        if(Array.isArray(parsed)) {
            return parsed.map(item => standardizeObject(item)).join('\n');
        }
        
        return JSON.stringify(standardizeObject(parsed), null, 2);
    } catch (e) {
        return `JSON标准化失败: ${e.message}`;
    }
}

// 通用对象标准化
function standardizeObject(obj) {
    const result = {};
    
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const lowerKey = key.toLowerCase().replace(/\s+/g, '_');
        
        if(typeof value === 'string' && value.includes('/')) {
            result[lowerKey] = formatDate(value);
        } else if(!isNaN(value)) {
            result[lowerKey] = parseFloat(value).toFixed(2);
        } else {
            result[lowerKey] = value.trim();
        }
    });
    
    return result;
}

// 文本标准化
function standardizeText(data) {
    return data
        .replace(/\bthe\b/gi, 'The')
        .replace(/\bfor\b/gi, 'For')
        .replace(/\bof\b/gi, 'Of')
        .replace(/\band\b/gi, 'And');
}

// 日期格式化
function formatDate(dateString) {
    const date = new Date(dateString);
    if(date.toString() === 'Invalid Date') return dateString;
    
    return date.toISOString().split('T')[0];
}

// 深度去重
function removeDuplicates(obj) {
    const seen = new WeakSet();
    
    return function deepDuplicationCheck(obj) {
        if(typeof obj === 'object' && obj !== null) {
            if(seen.has(obj)) return null;
            seen.add(obj);
            
            if(Array.isArray(obj)) {
                return obj.map(deepDuplicationCheck).filter(Boolean);
            }
            
            const result = {};
            Object.keys(obj).forEach(key => {
                const value = deepDuplicationCheck(obj[key]);
                if(value !== null) result[key] = value;
            });
            return result;
        }
        return obj;
    }(obj);
}