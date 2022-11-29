import { IrregularNouns } from '../public/IrregularNouns.js'
import { IrregularVerbs } from '../public/IrregularVerbs.js'
// 一组单词
let groupNounsWords = [];
let groupVerbsWords = [];
function dicNode(nodeValue) {
    this.nodeValue = nodeValue;
    this.childNodes = [];
}
// 将数组插入树中
/*
    参数:
        arr                插入的数组
*/
dicNode.prototype.insertTree = function (arr) {
    let temp = this;
    let index = 0;
    for (let i = 0; i < arr.length; i++) {
        // 第一个为原型不需要加入节点
        for (let j = 1; j < arr[i].length; j++) {
            for (let k = 0; k < arr[i][j].length; k++) {
                // 将字母转换成在数组中对应的索引
                index = arr[i][j][k].charCodeAt(0) - 97;
                if (!temp.childNodes[index]) {
                    temp.childNodes[index] = new dicNode(arr[i][j][k]);
                }
                temp = temp.childNodes[index];
            }
            temp.result = arr[i][0];
            // 插入一个单词后回到根节点
            temp = this;
        }
    }
}
// 查询原型返回原型
dicNode.prototype.queryTree = function (arr) {
    let temp = this;
    if (!temp) {
        return false;
    }
    let index = 0;
    for (let i = 0; i < arr.length; i++) {
        // 将字母转换成在数组中对应的索引
        index = arr[i].charCodeAt(0) - 97;
        if (temp.childNodes[index] != null) {
            temp = temp.childNodes[index];
        } else {
            return false;
        }
    }
    if (temp.result) {
        return temp.result;
    } else {
        return false;
    }
}
// 加载不规则单词
export const dictionary = new dicNode(undefined);
handleIrregularWords();
function handleIrregularWords() {
    groupNounsWords = IrregularNouns.trim().split('\n');
    for (let i = 0; i < groupNounsWords.length; i++) {
        groupNounsWords[i] = groupNounsWords[i].split(/\s+/);
    }
    // 将数据装进树中
    dictionary.insertTree(groupNounsWords);
    groupVerbsWords = IrregularVerbs.trim().split('\n');
    for (let i = 0; i < groupVerbsWords.length; i++) {
        groupVerbsWords[i] = groupVerbsWords[i].split(/\s+/);
    }
    dictionary.insertTree(groupVerbsWords);
}