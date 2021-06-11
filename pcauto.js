const config = {
  start: [2020, 12],
  range: 5, //总月份，含开始月
}; //在此修改配置

function get(URL) {
  return new Promise(function (resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('GET', URL, true);
    req.onload = function () {
      if (req.status === 200) {
        resolve(req.responseText);
      } else {
        reject(new Error(req.statusText));
      }
    };
    req.onerror = function () {
      reject(new Error(req.statusText));
    };
    req.send();
  });
}

function saveFile(fileName, content) {
  let export_blob = new Blob([content], {
    type: 'text/plain,charset=UTF-8',
  });
  let save_link = document.createElement('a');
  save_link.href = window.URL.createObjectURL(export_blob);
  save_link.download = fileName;
  save_link.click();
}

function outputCsv(data) {
  let output = '\ufeff'; //utf8
  for (let i = 0; i < data.length; i++) {
    const line = data[i];
    for (let j = 0; j < line.length; j++) {
      output += line[j] + ',';
    }
    output += `
`;
  }
  return output;
}

function substrA(str, a, b) {
  while (true) {
    let start = str.indexOf(a) + 1;
    let end = str.lastIndexOf(b);
    if (start == 0 || end == -1) {
      break;
    }
    str = str.substring(start, end);
  }
  return str;
}

async function main() {
  let current = config.start;
  let range = config.range;
  const data = [];
  while (range > 0) {
    let res = await get(
      `https://price.pcauto.com.cn/top/evsales/s1-t1-y${current[0]}-m${current[1]}.html`
    );
    res = substrA(res, '<table', '</table>');
    const listArr = res.split('<tr>');
    console.log(`y${current[0]}-m${current[1]}`, listArr.length);
    for (let i = 2; i < listArr.length; i++) {
      const element = listArr[i];
      const elementArr = element.split('/td>');
      const elementRet = [`${current[0]}年${current[1]}月`];
      for (let j = 0; j < 6; j++) {
        elementRet.push(substrA(elementArr[j], '>', '<'));
      }
      data.push(elementRet);
    }
    console.log('data', data.length);
    range--;
    current[1]++;
    if (current[1] > 12) {
      current[1] = 1;
      current[0]++;
    }
  }
  console.log('finished', data.length);
  saveFile('output.csv', outputCsv(data));
}

main();
