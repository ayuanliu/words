let root = null;
export function Node(nodeValue) {
    this.nodeValue = nodeValue;
    this.childNodes = [];
    this.flag = 0;
}
export function createRoot() {
    root = new Node(undefined);
    return root;
}
// 判断单个字符串是否存在于树中或者数组中的某一个是否存在于树中
Node.isInTree = function (arr) {
    let temp = root;
    if (!temp) {
        return false;
    }
    // 如果传入的是数组
    if (arr instanceof Array) {
        let index = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                // 将字母转换成在数组中对应的索引
                index = arr[i][j].charCodeAt(0) - 97;
                if (temp.childNodes[index] != null) {
                    temp = temp.childNodes[index];
                } else {
                    break;
                }
            }
            if (temp.flag) {
                return temp.index;
            }
            // 回到起点准备查找下一个单词
            temp = root;
        }
        return false;
    } else {
        // 如果传入的是字符串
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
        if (temp.flag) {
            return temp.index;
        } else {
            return false;
        }
    }

}

// 将数组插入树中
/*
    参数:
        arr                插入的数组
*/
Node.prototype.insertTree = function (arr) {
    let temp = this;
    let index = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            // 将字母转换成在数组中对应的索引
            index = arr[i][j].charCodeAt(0) - 97;
            if (!temp.childNodes[index]) {
                temp.childNodes[index] = new Node(arr[i][j]);
            }
            temp = temp.childNodes[index];
        }
        temp.flag = 1;
        // 单词在数组中的索引
        temp.index = i;
        // 插入一个单词后回到根节点
        temp = this;
    }
}