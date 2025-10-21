export const parseAnsiColors = (text: string): string => {
  // ANSI 颜色代码映射 - 使用更适合终端的颜色
  const ansiColorMap: { [key: string]: string } = {
    '30': '#2e3440',  // 黑色
    '31': '#bf616a',  // 红色
    '32': '#a3be8c',  // 绿色
    '33': '#ebcb8b',  // 黄色
    '34': '#5e81ac',  // 蓝色
    '35': '#b48ead',  // 洋红
    '36': '#88c0d0',  // 青色
    '37': '#d8dee9',  // 白色
    '90': '#4c566a',  // 亮黑色(灰色)
    '91': '#bf616a',  // 亮红色
    '92': '#a3be8c',  // 亮绿色
    '93': '#ebcb8b',  // 亮黄色
    '94': '#5e81ac',  // 亮蓝色
    '95': '#b48ead',  // 亮洋红
    '96': '#88c0d0',  // 亮青色
    '97': '#eceff4'   // 亮白色
  };

  let result = text;
  let openSpans = 0;

  // 处理 ANSI 转义序列
  result = result.replace(/\x1b\[[0-9;]*m/g, (match) => {
    const codes = match.slice(2, -1).split(';').filter(code => code !== '');
    
    if (codes.includes('0') || codes.length === 0) {
      // 重置所有样式
      const closeTags = '</span>'.repeat(openSpans);
      openSpans = 0;
      return closeTags;
    }

    const styles: string[] = [];
    for (const code of codes) {
      if (ansiColorMap[code]) {
        styles.push(`color: ${ansiColorMap[code]}`);
      } else if (code === '1') {
        styles.push('font-weight: bold');
      }
    }

    if (styles.length > 0) {
      openSpans++;
      return `<span style="${styles.join('; ')}">`;
    }
    return '';
  });

  // 确保所有打开的 span 都被关闭
  if (openSpans > 0) {
    result += '</span>'.repeat(openSpans);
  }

  return result;
};

export const stripAnsiColors = (text: string): string => {
  // 简单移除所有 ANSI 转义序列
  return text.replace(/\x1b\[[0-9;]*m/g, '');
};