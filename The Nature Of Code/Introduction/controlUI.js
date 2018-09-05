/*var depthOf = function (object) {
    var level = 1;
    var key;
    for (key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if (typeof object[key] == 'object') {
            var depth = depthOf(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
}

window.onload = function () {
    var conTop = document.getElementById('control');
    var sub = document.getElementsByClassName('speButtons');

    //var flow = find(conTop);

    function find(cur) {
        if (cur.childElementCount === 0) return;
        let c = cur.children;
        if (c.class === 'speButtons') {
            c = c.children;
        }
        for (var i = 0; i < c.length; i++) {
            c[i].onclick = function () {
                if (this.getAttribute('data-display-state') === 'folder') {
                    for (var i = 0; i < sub.length; i++) {
                        if (depthOf(sub) > depthOf(this)) {
                            if (sub[i] !== this.firstChild) {
                                sub[i].classList.remove('selected');
                            } else {
                                sub[i].classList.add('selected');
                            }
                        }
                    }
                } else {

                }
            };
            if (c[i].getAttribute('data-display-state') === 'folder') {
                find(c[i]);
            }
        }
    }


    /*var con = document.getElementsByClassName('state');
    var state = 'randomWalk';

    for (var i = 0; i < con.length; i++) {
        con[i].onclick = function () {
            if (this.getAttribute('data-display-state') !== 'folder') {
                state = this.getAttribute('data-display-state');
                toggleButtons(this);
            } else {
                var sub = document.getElementsByClassName('speButtons');
                for (var i = 0; i < sub.length; i++) {
                    if (this.childNodes[1] === sub[i]) {
                        sub[i].style.display = 'inline-block';
                    } else {
                        sub[i].style.display = 'none';
                    }
                }
                var conTop = document.getElementById('control').children;
                for (var i = 0; i < conTop.length; i++) {
                    if (this !== conTop[i]) {
                        con[i].classList.remove('selected');
                    } else {
                        con[i].classList.add('selected');
                    }
                }
            }
        };
    }

    function toggleButtons(cur) {
        for (var i = 0; i < con.length; i++) {
            if (con[i].getAttribute('data-display-state') !== 'folder' || cur.parentElement.id === 'control') {
                if (con[i].getAttribute('data-display-state') !== cur.getAttribute('data-display-state')) {
                    con[i].classList.remove('selected');
                } else {
                    con[i].classList.add('selected');
                }
            }
        }
    }
}*/

/*function myFunction() {
    document.getElementById("controlButtons").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}*/
/*var state = 'randomWalk';
window.onload = function () {
    var b = document.getElementsByClassName('dropbtn');
    for (var i = 0; i < b.length; i++) {
        b[i].onclick = function () {
            console.log(this.nextSibling);
            if (this.nextSibling !== null) {
                this.nextSibling.classList.toggle("show");
            } else {
                //state = this.getAttribute('data-display-state');
            }
        }
    }
}*/

var state = 'randomWalk';
filterSelection("walkers", null)
var removeClass, addClass;
var current;

function filterSelection(c, t) {
    var current2 = document.getElementsByClassName("active");
    var z = document.getElementsByClassName("subState");
    for (var i = 0; i < z.length; i++) {
        removeClass(z[i], "show");
        if (z[i].className.indexOf(c) > -1) addClass(z[i], "show");
    }
    if (t !== null && current2[0] === t) {
        t.className.replace(" active", "");
        current.className += " active";
        for (var i = 0; i < z.length; i++) {
            removeClass(z[i], "show");
        }
    }
}

function changeState(c) {
    state = c;
    console.log(state);
}

window.onload = function () {

    addClass = function (element, name) {
        var arr1 = element.className.split(" ");
        var arr2 = name.split(" ");
        for (var i = 0; i < arr2.length; i++) {
            if (arr1.indexOf(arr2[i]) === -1) {
                element.className += " " + arr2[i];
            }
        }
    }


    removeClass = function (element, name) {
        var arr1 = element.className.split(" ");
        var arr2 = name.split(" ");
        for (var i = 0; i < arr2.length; i++) {
            while (arr1.indexOf(arr2[i]) > -1) {
                arr1.splice(arr1.indexOf(arr2[i]), 1);
            }
        }
        element.className = arr1.join(" ");
    }


    var btns = document.getElementsByClassName("btn");
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () {
            current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
}