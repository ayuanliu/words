import { dictionary } from "./dictionary.js";
import { createRoot, Node } from "./tree.js";
window.onload = function () {
    const wordbox = document.querySelector('.wordbox');
    // 所有单词组成的数组
    let wordArr = [];
    // 获取到本地数据
    let localData = JSON.parse(localStorage.getItem('words'));
    let tree = null
    const wordDOMArr = [];
    // 选择文件后的初始化
    selectFilebox(function (data) {
        // 创建树
        tree = createRoot();
        // 将单词以存入wordArr数组中
        wordArr = data.trim().split('\n');
        // 将单词全部存入tree树中
        tree.insertTree(wordArr);
        // 将单词封装成DOM结构并渲染在页面
        for (let i = 0; i < wordArr.length; i++) {
            wordDOMArr[i] = `
                <div class="word">
                    ${wordArr[i]}
                    <div class="times">0</div>
                </div>
            `
        }
        wordbox.innerHTML = wordDOMArr.join('');
        // 对渲染在页面中的单词进行初始化
        for (let key in localData) {
            // 本地数据在单词数组中的索引
            let index = Node.isInTree(key);
            if (index !== false) {
                // 根据访问的次数去改变页面单词背景颜色
                let times = localData[key];
                wordbox.children[index].children[0].innerHTML = times;
                wordbox.children[index].children[0].style.display = 'block';
                changeColor(wordbox.children[index], times);
            }
        }
    });
    // 导入数据后的初始化
    importFilebox(function () {

    })
    let ordered = true;     // 有序
    searchbox();
    function searchbox() {
        // DOM
        const searchbtn = document.querySelector('.searchbtn');
        const go = document.querySelector('.go');
        const last = go.children[0];
        const current = go.children[1];
        const total = go.children[2];
        const next = go.children[3];
        const searchbox = searchbtn.children[1];
        const textarea = searchbox.children[0];
        const search = searchbox.children[1];
        const notfoundbtn = document.querySelector('.notfoundbtn');
        const notfoundwords = notfoundbtn.children[1]
        // 搜索到的所有单词在wordArr中的索引组成的数组
        let indexsArr = [];
        // 索引组成的数组的索引
        let indexsArrIndex = 0;
        // 当前单词索引
        let curIndex = 0;
        // 当前单词
        let curWordDOM = null;
        // 未搜索到的所有单词组成的数组
        let notfoundDOMArr = [];
        // 搜索
        search.onclick = function () {
            if (!ordered) {
                // 无序则恢复
                wordbox.innerHTML = wordDOMArr.join('');
                // 对渲染在页面中的单词进行初始化
                for (let key in localData) {
                    // 本地数据在单词数组中的索引
                    let index = Node.isInTree(key);
                    if (index !== false) {
                        // 根据访问的次数去改变页面单词背景颜色
                        let times = localData[key];
                        wordbox.children[index].children[0].innerHTML = times;
                        wordbox.children[index].children[0].style.display = 'block';
                        changeColor(wordbox.children[index], times);
                    }
                }
                ordered = true;
            }
            // 初始化current与total
            current.innerHTML = 0;
            total.innerHTML = 0;
            // 先清空上一次搜索到的单词的索引组成的数组
            indexsArr.length = 0;
            // 清空上一次未搜索到单词(DOM)组成的数组
            notfoundDOMArr.length = 0
            // 第二次点搜索将上一次的选中的单词状态变为不选中状态
            if (curWordDOM) {
                curWordDOM.style.outline = `0px solid yellow`
            }
            // 获取到用户输入的单词
            let data = textarea.value;
            let index = 0;
            let searchWords = dataIntercept(data)
            // 更新页面 判断用户输入的单词是否在树中有并更新页面中搜索到的单词的次数
            searchWords.forEach(word => {
                index = Node.isInTree(word);
                // 单词在树中
                if (index !== false) {
                    // 将该单词在单词数组中的索引存入索引数组中
                    indexsArr.push(index);
                    // wordArr[index]为单词(字符串)(对应本地存储key值)
                    // 更新本地数据
                    let times = localData[wordArr[index]];
                    if (times) {
                        // 本地有该key值
                        if (times < 999) {
                            times++;
                        }
                    } else {
                        // 本地没有
                        // 将本地该key对应的值设置为1
                        times = 1;
                        // 该单词的次数第一次出现需要设置为block 可见
                        wordbox.children[index].children[0].style.display = 'block';
                    }
                    localData[wordArr[index]] = times;
                    // 更改颜色
                    changeColor(wordbox.children[index], times)
                    // 更新页面中次数
                    wordbox.children[index].children[0].innerHTML = times;
                } else {
                    // 单词不在树中
                    notfoundDOMArr.push(`<li>${word}</li>`);
                }
            });
            // 更新搜索到的单词总数
            total.innerHTML = indexsArr.length;
            // 如果搜索到单词
            if (indexsArr.length) {
                // 保存到本地
                localStorage.setItem('words', JSON.stringify(localData));
                // 对搜索到的单词的索引进行升序这样下一个上一个跳转有顺序
                indexsArr.sort(function (a, b) {
                    return a - b;
                })
                // 在这里计算当前单词初始值
                // 获取到当前页面上卷的大小
                // 一行单词的占位
                let wordYDistance = wordbox.children[0].offsetTop * 2 + wordbox.children[0].offsetHeight;
                // 一排单词的占位
                let wordXDistance = wordbox.children[0].offsetLeft * 2 + wordbox.children[0].offsetWidth;
                // 当前行最后一个单词索引
                let curLineLastWord = document.documentElement.scrollTop / wordYDistance * parseInt(wordbox.offsetWidth / wordXDistance);
                // 跳转到当前行 距离 搜索到的单词中最近的那个单词
                for (let i = 0; i < indexsArr.length; i++) {
                    // 当前行最后一个单词索引小于索引数组中第一个单词索引
                    if (i == 0 && curLineLastWord <= indexsArr[i]) {
                        // 跳转到的单词
                        curIndex = indexsArr[i];
                        curWordDOM = wordbox.children[curIndex];
                        current.innerHTML = i + 1;
                        document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                        document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                        // 跳转到的单词在索引数组中的索引
                        indexsArrIndex = i;
                        break;
                    }
                    // 当前行最后一个单词索引大于索引数组中最后一个单词索引
                    else if (i == indexsArr.length - 1 && curLineLastWord >= indexsArr[i]) {
                        curIndex = indexsArr[i];
                        curWordDOM = wordbox.children[curIndex]
                        current.innerHTML = i + 1;
                        document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                        document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                        indexsArrIndex = i;
                        break;
                    }
                    // 当前行最后一个单词索引在索引数组中前一个单词索引与后一个单词索引之间
                    else if (curLineLastWord > indexsArr[i] && curLineLastWord < indexsArr[i + 1]) {
                        if (curLineLastWord - indexsArr[i] > indexsArr[i + 1] - curLineLastWord) {
                            curIndex = indexsArr[i + 1];
                            curWordDOM = wordbox.children[curIndex]
                            current.innerHTML = i + 2;
                            document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                            document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                            indexsArrIndex = i + 1;
                            break;
                        } else {
                            curIndex = indexsArr[i];
                            curWordDOM = wordbox.children[curIndex]
                            current.innerHTML = i + 1;
                            document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                            document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                            indexsArrIndex = i;
                        }
                    }
                }
                if (curWordDOM) {
                    curWordDOM.style.outline = '5px solid yellow';
                }
            }
            // 未搜索到的单词
            notfoundwords.innerHTML = notfoundDOMArr.join('');
            go.style.display = 'block';
        }
        // 上一个
        last.onclick = function () {
            if (!ordered) {
                // 无序则恢复
                wordbox.innerHTML = wordDOMArr.join('');
                // 对渲染在页面中的单词进行初始化
                for (let key in localData) {
                    // 本地数据在单词数组中的索引
                    let index = Node.isInTree(key);
                    if (index !== false) {
                        // 根据访问的次数去改变页面单词背景颜色
                        let times = localData[key];
                        wordbox.children[index].children[0].innerHTML = times;
                        wordbox.children[index].children[0].style.display = 'block';
                        changeColor(wordbox.children[index], times);
                    }
                }
                ordered = true;
            }
            let oldVal = parseInt(current.innerHTML)
            if (oldVal > 1) {
                // 移动到下一个单词前将当前单词的背景颜色复原
                let times = localData[wordArr[curIndex]];
                changeColor(curWordDOM, times)
                // 移动到下一个单词前将当前单词的背景颜色复原
                // 当前单词索引
                curIndex = indexsArr[indexsArrIndex]
                // 当前单词
                curWordDOM = wordbox.children[curIndex]
                curWordDOM.style.outline = '0px solid yellow'
                indexsArrIndex--;
                current.innerHTML = oldVal - 1;
                // 跳转到当前单词的位置
                // 当前单词索引
                curIndex = indexsArr[indexsArrIndex]
                // 当前单词
                curWordDOM = wordbox.children[curIndex]
                document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                curWordDOM.style.outline = '5px solid yellow'
            }
        }
        // 下一个
        next.onclick = function () {
            if (!ordered) {
                // 无序则恢复
                wordbox.innerHTML = wordDOMArr.join('');
                // 对渲染在页面中的单词进行初始化
                for (let key in localData) {
                    // 本地数据在单词数组中的索引
                    let index = Node.isInTree(key);
                    if (index !== false) {
                        // 根据访问的次数去改变页面单词背景颜色
                        let times = localData[key];
                        wordbox.children[index].children[0].innerHTML = times;
                        wordbox.children[index].children[0].style.display = 'block';
                        changeColor(wordbox.children[index], times);
                    }
                }
                ordered = true;
            }
            let oldVal = parseInt(current.innerHTML)
            if (oldVal < parseInt(total.innerHTML)) {
                // 移动到下一个单词前将当前单词的背景颜色复原
                let times = localData[wordArr[curIndex]];
                changeColor(curWordDOM, times)
                // 当前单词索引
                curIndex = indexsArr[indexsArrIndex]
                // 当前单词
                curWordDOM = wordbox.children[curIndex]
                curWordDOM.style.outline = '0px solid yellow'
                indexsArrIndex++;
                current.innerHTML = parseInt(current.innerHTML) + 1
                // 跳转到当前单词的位置
                // 当前单词索引
                curIndex = indexsArr[indexsArrIndex]
                // 当前单词
                curWordDOM = wordbox.children[curIndex]
                document.documentElement.scrollTop = curWordDOM.offsetTop - 200;
                document.documentElement.scrollLeft = curWordDOM.offsetLeft - 550;
                curWordDOM.style.outline = '5px solid yellow'
            }
        }
    }
    descendingbtn();
    function descendingbtn() {
        const btnbox = document.querySelector('.btnbox');
        const descendingbtn = btnbox.children[2];
        descendingbtn.onclick = function () {
            if (ordered) {
                ordered = false;    // 无序
                // 将单词根据次数进行排序然后展示在页面中
                // 先判断wordArr中单词多还是本地的单词多
                const arr = [];
                // 保存将要展示在页面中的单词
                const resultArr = [];
                for (let key in localData) {
                    // 创建数组收集在词典中的单词
                    // 判断本地数据中单词是否在树中
                    let index = Node.isInTree(key)
                    if (index !== false) {
                        // 保存所有的在树中的单词的索引
                        arr.push(index);
                    }
                }
                // 将arr中的索引进行降序排序便于删除
                arr.sort(function (a, b) {
                    return b - a;
                })
                arr.forEach(index => {
                    resultArr.push({
                        index,
                        times: parseInt(wordbox.children[index].children[0].innerHTML)
                    });
                    wordbox.removeChild(wordbox.children[index]);
                });
                resultArr.sort(function (a, b) {
                    return b.times - a.times;
                })
                // 
                let wordHtml = [];
                // 包装单词加入页面
                resultArr.forEach(obj => {
                    wordHtml.push(`
                    <div class="word">
                        ${wordArr[obj.index]}
                        <div class="times">${obj.times}</div>
                    </div>`);
                })
                let result = wordHtml.join('');
                wordbox.insertAdjacentHTML('afterbegin', result);
                for (let i = 0; i < resultArr.length; i++) {
                    // 改变元素的颜色
                    changeColor(wordbox.children[i], resultArr[i].times);
                    wordbox.children[i].children[0].style.display = 'block'
                }
            }
        }
    }
    downLoad();
}

// 获取文件中的数据
function selectFilebox(callback) {
    const tools = document.querySelector('.tools');
    const selectFile = tools.children[0];
    const inputFile = selectFile.children[0];
    const selectFilebtn = selectFile.children[1];
    selectFilebtn.onclick = function () {
        inputFile.click();
    }
    inputFile.onchange = function (e) {
        let read = new FileReader()
        let file = e.target.files[0]
        read.readAsText(file);
        read.onload = function () {
            // 将读取的文件的结果传给回调
            callback && callback(read.result)
        }
        selectFilebtn.innerHTML = file.name;
    }
}
// 根据次数改变对应的单词颜色
function changeColor(element, times) {
    if (times >= 7) {
        element.style.backgroundColor = `hsl(90,90%,50%)`
    } else {
        element.style.backgroundColor = `hsl(60,${15 * times}%,75%)`;
    }
}
// 打开文件后对获取到的数据的一系列处理
function dataIntercept(data) {
    // 去除左右两端空格
    data = data.trim();
    // 将用户输入的单词转换成数组
    let searchWords = data.split(/[\n]+/);
    // 临时单词
    let tempWord = null;
    // 将一些特殊单词修改为原型并存入单词数组中
    for (let i = 0; i < searchWords.length; i++) {
        // 先查看字典中是否有该单词
        let result = dictionary.queryTree(searchWords[i])
        tempWord = [];
        tempWord.push(searchWords[i]);
        // 查找到有该单词
        if (result) {
            // 将该单词赋值给搜索单词数组
            // searchWords[i] = result;
            tempWord.push(result);
        }
        // 对后缀进行处理
        // ves结尾
        let reg = /ves$/;
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 3)
            tempWord.push(temp.concat('f'));
            tempWord.push(temp.concat('fe'));
        }
        // ies或者ied结尾
        reg = /ie[sd]$/;
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 3)
            tempWord.push(temp.concat('y'));
        }
        // es或者ed结尾
        reg = /e[sd]$/;
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 2)
            tempWord.push(temp)
        }
        // s或者d结尾
        reg = /[sd]$/;
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 1)
            tempWord.push(temp)
        }
        // ying结尾
        reg = /ying$/;
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 4)
            tempWord.push(temp.concat('ie'));
        }
        // ing结尾
        reg = /ing$/
        if (reg.test(searchWords[i])) {
            let temp = searchWords[i].slice(0, searchWords[i].length - 3)
            tempWord.push(temp)
            tempWord.push(temp.slice(0, temp.length - 1))
        }
        // 存在非原型单词
        if (tempWord.length > 1) {
            searchWords[i] = tempWord;
        }
    }
    // 对用户输入的单词不合理的进行过滤
    searchWords = searchWords.filter(element => {
        let reg = /^\s+$/
        return !reg.test(element);
    })
    return searchWords;
}
// 保存本地浏览器中的数据在文件中
function downLoad() {
    const tools = document.querySelector('.tools');
    const downLoadbox = tools.children[1];
    const downLoadbtn = downLoadbox.children[0];
    downLoadbtn.onclick = function () {
        let data = localStorage.getItem('words');
        let blob = new Blob([data], { type: 'text/plain' });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.style = "display: none";
        a.href = url;
        a.setAttribute('download', 'data.txt')
        a.click();
    }
}
// 导入数据
function importFilebox(callback) {
    const tools = document.querySelector('.tools');
    const importFilebox = tools.children[2];
    const inputFile = importFilebox.children[0];
    const importbtn = importFilebox.children[1];
    importbtn.onclick = function () {
        inputFile.click();
    }
    inputFile.onchange = function (e) {
        // 操作文件
        let read = new FileReader();
        let file = e.target.files[0];
        read.readAsText(file);
        read.onload = function () {
            // 将导入的数据保存在本地
            localStorage.setItem('words', read.result);
            // 重新加载页面
            location.reload();
        }
    }
}