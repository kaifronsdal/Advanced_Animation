window.onload = function(){console.log("recursive method:\n");recursive();console.log("\nbuiltin method:\n");docAll();console.log("\nstring method:\n");indexing();};

function indexing() {
    var doc = document.documentElement.outerHTML;
    var curIndex = doc.indexOf("<");
    var count = 0;
    var arrEl = [];
    while (curIndex > -1) {
        if (doc.substring(curIndex+1, curIndex+2) !== "/") {
            arrEl.push(doc.substring(curIndex + 1, (doc.indexOf(">", curIndex) < doc.indexOf(" ", curIndex)) ? doc.indexOf(">", curIndex) : doc.indexOf(" ", curIndex)));
        }
        curIndex = doc.indexOf("<", curIndex+1);
    }
    console.log(arrEl);
    return arrEl;
}

function docAll() {
    var doc = Array.prototype.slice.call(document.all);
    console.log(doc);
    return doc;
}

function recursive() {
    var arrEl = [];
    function loop(obj) {
        arrEl.push(obj);
        for (var i = 0; i < obj.children.length; i++) {
            loop(obj.children[i]);
        }
    }
    loop(document.documentElement);

    console.log(arrEl);
    return arrEl;
};