/*
	Author：黑有有、wzy、heiyouyou
	Date：2016-4-26
	Version：1.0.0
	Description：自定义js和收集的工具类库
*/


//封装获取样式的方法
function getCssStyle(obj, value) {
	/*return obj.currentStyle?obj.currentStyle[value]:getComputedStyle(obj)[value];*/
	//value = value.trim();//这种方法只能将字符串的前后空格去掉不能将中间的空格去掉
	var values = value.split(" ");//split与join结合使用就可以将中间空格去掉
	var value = values.join("");
	if (obj.currentStyle) {//这里表示哪个浏览器支持就往下执行if语句里的代码，要不然就执行else里的语句
		return obj.currentStyle[value];//注意这里不能点只能用[]包裹变量，且必须传入的是字符串
	} else {
		return getComputedStyle(obj)[value];
	}
};

//封装通过元素名称获取元素的方法
function getTag(obj, ele) {
	return obj.getElementsByTagName(ele);
};

//正则封装兼容ie678的获取某一类样式的元素的写法
function getClass(cN, obj) {
	obj = obj || document;
	if (obj.getElementsByClassName) {
		var elements = obj.getElementsByClassName(cN);
		return Array.prototype.slice.call(elements);//将其转成数组
	} else {
		var arr = [];
		/*var reg = /\bcN\b/;这样写不对！！!*/
		var reg = new RegExp("\\b" + cN + "\\b");
		var allE = obj.getElementsByTagName("*");
		for (var i = 0; i < allE.length; i++) {
			if (reg.test(allE[i].className)) {
				arr.push(allE[i]);
			}
		}
		return arr;
	};
};

//封装获取id元素的方法
function dom(id) {
	return document.getElementById(id);
};

//封装siblings方法，获取除当前元素外的其他兄弟元素
function siblings(obj, callback) {
	//通过当前对象找到父类下的所有子类节点
	var pDoms = obj.parentNode.children;
	//通过数组的slice方法将其变成数组
	var arr = [].slice.call(pDoms);
	//调用数组的过滤方法filter筛选出与当前对象不同的兄弟元素
	arr.filter(function (others) {
		if (others != obj) {
			callback.call(others);
		};
	});
	// 或者
	// var parentObj = ele.parentElement;
	// var children = parentObj.children;
	// //循环的目标就是为了去排除本身
	// for(var i=0,len=children.length;i<len;i++){
	// 	if(children[i]==ele){
	// 		continue;
	// 	}else{
	// 		callback.call(children[i]);
	// 	}
	// }
};

//封装获取（id和className）元素和函数执行的方法
function $All(param, obj) {//jQuery中的传入id和className形式：$("#id"),$(".className")
	obj = obj || document;
	var typeP = typeof param;//将传入的param进行类型判断
	if (typeP == "function") {//判断传入的param是函数还是字符串
		window.onload = param;
	} else if (typeP.toUpperCase() == "STRING") {//调用toUpperCase()是为了解决不同浏览器因为对字符串string的大小写判断不一
		var firStr = param.charAt();//charAt()不传入任何参数，默认是返回下标为0的字符,这里的意思是用来判断传入id还是className
		if (firStr == "#") {
			param = param.substring(1, param.length);//从param下标1截取后面部分
			return obj.getElementById(param);//返回传入的id给函数$All()
		} else if (firStr == ".") {
			param = param.substring(1, param.length);
			//这个方法支持ie9+和其他浏览器
			if (obj.getElementsByClassName) {//只有ie9+和其他浏览器支持才会执行if语句里的东西
				return obj.getElementsByClassName(param);//获取obj对象下类名为传入的param的元素而组成的数组，然后返回数组给函数$
			}
			var all = obj.getElementsByTagName("*");
			var arrClass = [];//用一个空数组来接收具有类样式box的元素
			for (var i = 0; i < all.length; i++) {
				var arr = all[i].className.split(" ");//通过split()以空格号来划分具有多个类样式的元素的className切割成数组用arr来存，注意className都是字符串！！！
				for (var j = 0; j < arr.length; j++) {//循环嵌套循环，每个循环的边界变量最好不要相同，易引起混乱
					if (arr[j] == param) {
						arrClass.push(all[i]);//将具有box样式的元素存入原来的空数组arrClass
					};
				};
			};
			return arrClass;//返回一个传入类样式(类名)为param的数组
		};
	};
};

//封装监听事件的绑定
function jsBind(obj, eName, fn) {
	if (obj.addEventListener) {
		//obj.addEventListener(eName,fn,false);//如果只是传入一个函数名fn,this就指代当前调用函数的obj
		obj.addEventListener(eName, function () {
			fn.call(obj);//如果函数是这样执行时利用call将this重新指向obj,要不然就是undefined
		}, false);
	} else {
		//obj.attachEvent("on"+eName,fn);//如果只传入函数名fn，this指代不明也是会报错的
		obj.attachEvent("on" + eName, function () {
			fn.call(obj);//如果函数是这样执行时利用call将this重新指向obj,要不然就是报错
		});
	}
};

//封装具有过渡与延迟效果的动画方法
function Run(obj, json, times, callback) {
	//清除上一次结束动画
	clearInterval(obj.timer);
	//动态给对象绑定一个定时器
	obj.timer = setInterval(function () {
		//定义一个开着的锁，用来进行判断是否清除定时器
		var mark = true;
		//先将json里的值全拿出来才会跳出循环执行下一次定时器
		for (var attr in json) {
			//这里不要放在定时器外面，要每次更新pos的值,并且判断对象元素有没有属性attr，没有就pos赋值0
			if (attr == "opacity") {
				//乘以100变成百分比
				var pos = getStyle(obj, attr) * 100;
			} else {
				//获取样式其它属性（具有px的属性，若没有则用0代替）
				var pos = parseInt(getStyle(obj, attr)) || 0;
			}
			//拿到json对象里的目标值
			var target = json[attr];
			//将速度进行动态减速
			var speed = (target - pos) * 0.4;
			/*//当target大于pos时
			if(speed>0){
				speed = Math.ceil(speed);
			}
			//当target小于pos时
			if(speed<0){
				speed = Math.floor(speed);
			}*/
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
			//当pos达不到目标位置时继续改变属性值
			if (pos != target) {
				//每次从上次的位置改变
				if (attr == "opacity") {
					obj.style[attr] = (pos + speed) / 100;
					console.log(speed + "===" + pos + "===" + (pos + speed));
				} else {
					obj.style[attr] = pos + speed + "px";
				}
				//只要传入的attr没有达到目标值，mark始终为false
				mark = false;
			}
		}
		//如果为真进行清除定时器
		if (mark) {
			clearInterval(obj.timer);
			//当上一次动画执行完回调函数就执行
			if (callback) callback.call(obj);
		}
	}, times);
};

/*
	时间：2016-05-18
	作者：韦志有
	动画移动函数
	dom---dom对象
	json===={width:100,height:100}
	callback:回调函数
*/
function move(dom, json, callback) {
	//让每一次动画都是全新的
	if (dom.timer) clearInterval(dom.timer);
	dom.timer = setInterval(function () {
		//所有元素执行完毕以后的状态
		var mark = true;
		//循环所有动画的属性
		for (var attr in json) {
			var cur = null;
			//如果是opacity的透明的动画
			if (attr == "opacity") {
				//获取已经产生的透明度
				cur = getStyle(dom, attr) * 100;
			} else {
				//获取已经执行的距离
				cur = parseInt(getStyle(dom, attr)) || 0;
			}
			//获取目标终止值
			var target = json[attr];
			//速度，*0.2是增加摩擦力
			var speed = (target - cur) / 8;
			//如果cur在执行过程中因为已经除去了小数部分。而速度可能会产生小数位
			//所有说当cur执行的递增，那么可能cur到达不了目标,当速度是大于0的上取整，然后整数+speed==目标
			//199 +1 200 反之向下取整
			speed = (speed > 0 ? Math.ceil(speed) : Math.floor(speed));
			if (cur != target) {
				mark = false;
				if (attr == "opacity") {
					dom.style.opacity = (cur + speed) / 100;
					dom.style.filter = "alpha(opacity=" + ((cur + speed)) + ")";
				} else {
					dom.style[attr] = cur + speed + "px";
				}
			}
		}
		//如果执行完毕，
		if (mark) {
			//清楚动画
			clearInterval(dom.timer);
			//回调函数，一定要放在下面。要不然你动画没有关闭。
			if (callback) callback.call(dom);
		}
	}, 30);
};

//封装匀速移动的方法
function run1(obj, attr, target, speed, times, callback) {
	clearInterval(obj.timer2);
	obj.timer2 = setInterval(function () {
		//防止对象元素没有传入的attr样式所以取或后面的0
		var pos = parseInt(getStyle(obj, attr)) || 0;
		console.log(pos);
		if (pos == target) {
			clearInterval(obj.timer2);
			if (callback) {
				callback.call(obj);
			}
		} else {
			obj.style[attr] = pos + speed + "px";
			console.log(pos + speed + "px");
		}
		/*停在对象上时停止移动*/
		/*obj.addEventListener("mouseover",function(ev){
			var e = ev||event;
			clearInterval(this.timer2);
			//判断目标对象是否是span
			var span = e.target.tagName;
			if(span.toLowerCase() == "span"){
				//为obj中span元素添加内容
				this.querySelector(span).innerHTML = "点击即可查看当前系统时间^-^";
			};
		},false)*/
		tg(obj).on("mouseover", "span", function () {
			clearInterval(obj.timer2);
			this.innerHTML = "点击即可查看当前系统时间^-^";
		});
		/*离开对象时出发移动*/
		obj.onmouseout = function () {
			run1(obj, attr, target, speed, times, callback);
		};
	}, times);
};

/*
	时间：2016-05-18
	作者：韦志有
	螺纹淡出函数
	parentDom---父对象
	row---行数
	cells---列数
*/
function whorl(row, cells, parentDom, time) {
	//有时间传入就用传入的，没有传入用默认的20
	var time = time || 20;
	//li的总个数
	var len = row * cells;
	//定义一个初始行数
	var rows = 0;
	//定义一个初始列数
	var cols = 0;
	//每行每列的拐弯最小初始点，有控制环数的作用
	var min = 0;
	//每行的拐弯最大初始点，有控制环数的作用
	var max1 = row - 1;
	//每列的拐弯最大初始点，有控制环数的作用
	var max2 = cells - 1;
	//初始索引
	var index1 = 1;
	//拿到父元素的孩子
	var chd = parentDom.children;
	var timer1 = setInterval(function () {
		//每变换一行
		move(chd[cells * rows + cols], { opacity: 0 });
		//从到左上角极限位置开始，列数递增
		if (rows == min && cols < max2) {
			cols = cols + 1;
		} else if (rows < max1 && cols == max2) {//从右上角极限位置，行数递增
			rows = rows + 1;
		} else if (rows == max1 && cols > min) {//从右下角极限位置，列数递减
			cols = cols - 1;
		} else if (cols == min && rows > min) {//从左下角极限位置，行数递减
			rows = rows - 1;
		}
		//当前环数闭合，也即是：行数递减到最小值和列数递减到最小值时；最小拐点变大，最大拐点变小
		if (rows - 1 == min && cols == min) {
			min = min + 1;
			max1 = max1 - 1;
			max2 = max2 - 1;
		}
		//当索引递增到等于li总个数，清除动画
		if (index1 == len) {
			console.log(index1);
			clearInterval(timer1);
		}
		index1++;
	}, time);
}

//获取系统当前时间的年月日时间函数
function getFixedTime() {
	var timers = new Date();
	var years = timers.getFullYear();
	var months = timers.getMonth() + 1;
	var date = timers.getDate();
	var day = timers.getDay();
	var hour = timers.getHours();
	var minutes = timers.getMinutes();
	var seconds = timers.getSeconds();
	switch (day) {
		case 0:
			day = "星期天";
			break;
		case 1:
			day = "星期一";
			break;
		case 2:
			day = "星期二";
			break;
		case 3:
			day = "星期三";
			break;
		case 4:
			day = "星期四";
			break;
		case 5:
			day = "星期五";
			break;
		case 6:
			day = "星期六";
			break;
	};
	function two(key) {
		key < 10 ? key = "0" + key : key = key;
		return key;
	}
	return years + "年" + months + "月" + date + "日" + day + two(hour) + ":" + two(minutes) + ":" + two(seconds);
};

//封装当前系统动态时间的方法
function currentTime(obj) {
	setInterval(function () {
		var timers = new Date();
		var years = timers.getFullYear();
		var months = timers.getMonth() + 1;
		var date = timers.getDate();
		var day = timers.getDay();
		var hour = timers.getHours();
		var minutes = timers.getMinutes();
		var seconds = timers.getSeconds();
		switch (day) {
			case 0:
				day = "星期天";
				break;
			case 1:
				day = "星期一";
				break;
			case 2:
				day = "星期二";
				break;
			case 3:
				day = "星期三";
				break;
			case 4:
				day = "星期四";
				break;
			case 5:
				day = "星期五";
				break;
			case 6:
				day = "星期六";
				break;
		};
		function two(key) {
			key < 10 ? key = "0" + key : key = key;
			return key;
		}
		obj.innerText = years + "年" + months + "月" + date + "日" + day + two(hour) + ":" + two(minutes) + ":" + two(seconds);
	}, 1000);
};

//封装倒计时方法
function countDown(y, m, d, time) {
	var timeDom = document.getElementById("time");
	var startTime = new Date();//注意这里不能放在time方法外！！！
	var endTime = new Date(y, m - 1, d);//传入要进行倒计时的时间
	var ms = endTime.getTime() - startTime.getTime();//先拿到传入的时间与当前时间的差值 单位为毫秒
	var sec = ms / 1000;//然后将毫秒数转成秒除1000
	var day = Math.floor(sec / 60 / 60 / 24);//得到剩余多少整数天
	var hour = Math.floor(sec / 60 / 60 % 24);//将取余得到的小时赋值给hour
	var min = Math.floor(sec / 60 % 60);//将取余得到的分钟赋值给min
	var ss = Math.floor(sec % 60);//将取余得到的秒数赋值给ss
	function two(n) {//将分秒小于10时变成两位数
		if (n < 10) {
			n = "0" + n;
		}
		return n;
	};
	var text = "距离" + endTime.getFullYear() + "年" + (endTime.getMonth() + 1) + "月" + endTime.getDate() + "日<span style='color:red;'>高考还有" + day + "日" + hour + "小时" + two(min) + "分钟" + two(ss) + "秒</span>";
	timeDom.innerHTML = text;
};

//封装事件委托的方法
var tg = function (obj) {
	var dom = obj;
	return {
		on: function (eventType, targetElement, callback) {
			dom.addEventListener(eventType, function (ev) {
				//获取目标对象的标签名称
				var e = ev || event;
				//兼容ie678的写法
				var t = e.target || e.srcElement;
				//如果目标对象的标签名与传递过来的标签名一致
				if (t.tagName.toLowerCase() == targetElement) {
					//第一个参数表示改变回调函数this的指针，将其指向传递过来的目标元素，第二个参数表示事件类型
					callback.call(t, e);
				}
			}, false);
		}
	}
};

//封装获取和设置属性的方法
function attr(obj, key, value) {
	if (value) {
		obj.setAttribute(key, value);
	} else {
		return obj.getAttribute(key);
	};
};

//随机rgb颜色
function randomColor() {
	var r = Math.floor(Math.random() * 256);
	var g = Math.floor(Math.random() * 256);
	var b = Math.floor(Math.random() * 256);
	return "rgb(" + r + "," + g + "," + b + ")";//IE7不支出rgb
};

//随机十六进制颜色
function randomColor16() {
	var r = Math.floor(Math.random() * 256).toString(16);
	var g = Math.floor(Math.random() * 256).toString(16);
	var b = Math.floor(Math.random() * 256).toString(16);
	return "#" + r + g + b;
	//方法二：
	//0-255
	//var r = this.random(255).toString(16);
	//var g = this.random(255).toString(16);
	//var b = this.random(255).toString(16);
	//255的数字转换成十六进制
	//if(r.length<2)r = "0"+r;
	//if(g.length<2)g = "0"+g;
	//if(b.length<2)b = "0"+b;
	//return "#"+r+g+b;
};

function randomColor_16() {
	var oColor = Math.ceil(Math.random() * 16777215).toString(16);//16777215 >> ffffff十六进制的最大值
	// 可能出现5位或者6位的十六进制数
	while (oColor.length < 6) {
		oColor = "0" + oColor;
	}
	return "#" + oColor;
}

//产生一个范围[0~num]之间的一个随机整数
function random(num) {
	return Math.floor(Math.random() * (num + 1));
};

//获取数组中最小值对应的最小索引
function getMinIndex(arr) {
	//先设定索引为零的为最小值
	var value = arr[0];
	//先设定数组最小值索引为零
	var index = 0;
	//从下标为1遍历比较数组最小值拿到对应最小索引
	for (var i = 1; i < arr.length; i++) {
		if (arr[i] < value) {
			//将最小值重新赋值
			value = arr[i];
			//将最小索引重新赋值
			index = i;
		};
	};
	//返回最小索引
	return index;
	/*//将传入的数组进行重新copy一份
	var oldArr = Array.prototype.slice.call(arr);
	arr.sort(function(a,b){
		return a-b;
	});
	return oldArr.indexOf(arr[0]) ;*/
};

/*
	时间：2016-05-18
	作者：韦志有
	获取鼠标的位置。兼容ie678
*/
function getXY(e) {
	var ev = e || window.event;
	var x = 0, y = 0;
	if (ev.pageX) {
		x = ev.pageX;
		y = ev.pageY;
	} else {
		//拿到scrollTop 和scrollLeft
		var sleft = 0, stop = 0;
		//ie678---
		if (document.documentElement) {
			stop = document.documentElement.scrollTop;
			sleft = document.documentElement.scrollLeft;
		} else {
			//ie9+ 谷歌
			stop = document.body.scrollTop;
			sleft = document.body.scrollLeft;
		}
		x = ev.clientX + sleft;
		y = ev.clientY + stop;
	}
	return { x: x, y: y };
};

/*
	时间：2016-06-5
	作者：韦志有
	螺纹算法&淡出效果函数
*/
function whorl(row, cells, parent, time) {
	var time = time || 20;
	//li的总个数
	var len = row * cells;
	//定义一个初始行数
	var rows = 0;
	//定义一个初始列数
	var cols = 0;
	//每行每列的拐弯最小初始点，有控制环数的作用
	var min = 0;
	//每行的拐弯最大初始点，有控制环数的作用
	var max1 = row - 1;
	//每列的拐弯最大初始点，有控制环数的作用
	var max2 = cells - 1;
	//初始索引
	var index1 = 1;
	var chd = parent.children;
	var timer1 = setInterval(function () {
		//每变换一行
		move(chd[cells * rows + cols], { opacity: 0 });
		//从到左上角极限位置开始，列数递增
		if (rows == min && cols < max2) {
			cols = cols + 1;
		} else if (rows < max1 && cols == max2) {//从右上角极限位置，行数递增
			rows = rows + 1;
		} else if (rows == max1 && cols > min) {//从右下角极限位置，列数递减
			cols = cols - 1;
		} else if (cols == min && rows > min) {//从左下角极限位置，行数递减
			rows = rows - 1;
		}
		//当前环数闭合，也即是：行数递减到最小值和列数递减到最小值时；最小拐点变大，最大拐点变小
		if (rows - 1 == min && cols == min) {
			min = min + 1;
			max1 = max1 - 1;
			max2 = max2 - 1;
		}
		if (index1 == len) {
			console.log(index1);
			clearInterval(timer1);
		}
		index1++;
	}, time);
};

/*
	时间：2016-06-5
	作者：韦志有
	json对象依据某种属性排序
	jsonArr:是要排序的对象
	filed:要依据什么属性排序
	sortMark:desc 降序  asc 降序 默认升序 as
*/
function jsonArrSort(jsonArr, field, sortMark) {
	//判断传入的是否是一个数组
	if (Array.isArray(jsonArr)) {
		return;
	};
	//判断有没有传入sortMark值按降序desc还是按升序asc，默认按升序asc排序
	sortMark = sortMark || "asc";
	jsonArr.sort(function (a, b) {
		if (sortMark == "asc") {
			return a.field - b.field;
		} else if (sortMark == "desc") {
			return b.field - a.field;
		};
	});
};

//将一个htmlcollection转换成数组对象
function toArray(doms) {
	return Array.prototype.slice.call(doms);
};

//字符串转换成javascript中的日期对象
function stringToDate(stringDate) {
	return new Date(stringDate.replace(/-/g, "/").replace(".0", ""));
};

//获取某个元素在dom集合中的索引
function getDomIndex(doms, dom) {
	var _index = -1;
	for (var i = 0, len = doms.length; i < len; i++) {
		if (doms[i] == dom) {
			_index = i;
			break;
		}
	}
	return _index;
};

// 参数：
// pdom :必选项。对象(dom)。要插入到 object 邻近的对象。
// position :必选项。字符串(String)。beforeBegin | afterBegin | beforeEnd | afterEnd
// beforeBegin :　 将 pdom 插到 dom 的开始标签之前。
// afterBegin :　 将 pdom 插到 dom 的开始标签之后。但是在dom的所有原有内容之前。
// beforeEnd :　 将 pdom 插到 dom 的结束标签之前。但是在dom的所有原有内容之后。
// afterEnd :　 将 pdom 插到 dom 的结束标签之后。
// 返回值：
// oElement :　 对象(Element)。返回插入的对象的引用。
function insertHtml(dom, position, pdom) {
	dom.insertAdjacentHTML(position, pdom);
}
function insertText(dom, position, pdom) {
	dom.insertAdjacentText(position, pdom);
}
function insertElement(dom, position, pdom) {
	dom.insertAdjacentElement(position, pdom);
}

// 获取表单控件的值，以对象的形式返回，注意空控件必须有name属性
// @param formDom:为原生dom的表单对象元素
function getFormValue(formDom) {
	var formElements = formDom.elements;
	// 将表单的值放在json中
	var json = {};
	for (var i = 0, len = formElements.length; i < len; i++) {
		// 拿到表单的每个控件元素类型
		var type = formElements[i].type.toLowerCase();
		if (type != "button" && type != "submit" && type != "reset") {
			// 获取复选框的值
			if (type == "checkbox" && formElements[i].checked) {
				var value;
				if (!json[formElements[i].name]) {
					value = formElements[i].value;
				} else {
					value += "," + formElements[i].value;
				};
				json[formElements[i].name] = {
					value: value,
					ele: formElements[i]
				}
				// 获取单选框的值
			} else if (type == "radio" && formElements[i].checked) {
				json[formElements[i].name] = {
					value: formElements[i].value,
					ele: formElements[i]
				}
				// 获取除了复选框和单选框的其他值
			} else if (type != "radio" && type != "checkbox") {
				json[formElements[i].name] = {
					value: formElements[i].value,
					ele: formElements[i]
				}
			}
		}
	};
	return json;
};

// jquery中serializeArray的原理
// 序列化表格参数成json数组格式：
// [{name: 'firstname', value: 'Hello'},{name:'lastname', value: 'World'},{name: 'alias'}])
function dSerializeArray(formDom) {
	var formElements = formDom.elements;
	// 将表单的值放在数组中
	var arr = [];
	for (var i = 0, len = formElements.length; i < len; i++) {
		// 拿到表单的每个控件元素类型
		var type = formElements[i].type.toLowerCase();
		if (type != "button" && type != "submit" && type != "reset") {
			// 获取选中的复选框或者单选框的值
			if ((type == "radio" || type == "checkbox") && formElements[i].checked) {
				arr.push({ name: formElements[i].name, value: encodeURIComponent(formElements[i].value) });
				// 获取除了复选框和单选框的其他值
			} else if (type != "radio" && type != "checkbox") {
				// encodeURIComponent() 函数可把字符串作为URI组件进行编码。
				// 说明:该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * ' ( ) 。
				// 其他字符（比如 ：;/?:@&=+$,# 这些用于分隔 URI 组件的标点符号），都是由一个或多个十六进制的转义序列替换的。
				arr.push({ name: formElements[i].name, value: encodeURIComponent(formElements[i].value) });
			}
		}
	};
	return arr;
};

// jquery中serialize的原理（序列化表格参数成字符串格式：opid=123&username=wrew&password=fasf&address）
function dSerialize(formDom) {
	var formElements = formDom.elements;
	// 将表单的值放在数组中
	var params = "";
	for (var i = 0, len = formElements.length; i < len; i++) {
		// 拿到表单的每个控件元素类型
		var type = formElements[i].type.toLowerCase();
		if (type != "button" && type != "submit" && type != "reset") {
			// 获取选中的复选框或者单选框的值
			if ((type == "radio" || type == "checkbox") && formElements[i].checked) {
				params += (i > 0 ? "&" : "") + formElements[i].name + "=" + encodeURIComponent(formElements[i].value);
				// 获取除了复选框和单选框的其他值
			} else if (type != "radio" && type != "checkbox") {
				// encodeURIComponent() 函数可把字符串作为URI组件进行编码。
				// 说明:该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * ' ( ) 。
				// 其他字符（比如 ：;/?:@&=+$,# 这些用于分隔 URI 组件的标点符号），都是由一个或多个十六进制的转义序列替换的。
				params += (i > 0 ? "&" : "") + formElements[i].name + "=" + encodeURIComponent(formElements[i].value);
			}
		}
	};
	return params;
};

/**
 * 对Date的扩展，将 Date 转化为指定格式的String 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 * 可以用 1-2 个占位符 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) eg: (new
 * Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 (new
 * Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04 (new
 * Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04 (new
 * Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04 (new
 * Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18 (new
 * Date()).format("yyyy-MM-dd  hh:mm:ss") ==> 2006-7-2 08:09:04
 */
Date.prototype.format = function (fmt) {
	var o = {
		"Y+": this.getFullYear(),
		"M+": this.getMonth() + 1,
		// 月份
		"d+": this.getDate(),
		// 日
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
		// 小时
		"H+": this.getHours(),
		// 小时
		"m+": this.getMinutes(),
		// 分
		"s+": this.getSeconds(),
		// 秒
		"q+": Math.floor((this.getMonth() + 3) / 3),
		// 季度
		"S": this.getTime()
		// 毫秒
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
			.substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt
			.replace(
			RegExp.$1,
			((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f"
				: "/u5468")
				: "")
			+ week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
				: (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};

/*日期工具类*/
var wzyDate = {
	/*转换日期*/
	_transferDate: function (date) {
		if (typeof date == "string") {
			return new Date(date.replace(/-/ig, "/"));
		} else {
			return date;
		}
	},
	/*格式化日期*/
	_toString: function (date, pattern) {
		var d = this._transferDate(date);
		return d.format(pattern);
	},

	/*获取两个时间相减的时间*/
	_Date: function (date1, date2) {
		var dateTime = this._numMillSecond(date1, date2);
		return new Date(dateTime).format("yyyy-MM-dd");
	},

	//间隔年份
	_numYear: function (date1, date2) {
		var times = this._numDay(date1, date2);
		return Math.floor(times / 365);
	},

	//间隔月份
	_numMonth: function (date1, date2) {
		var times = this._numDay(date1, date2);
		return Math.floor(times / 30);
	},

	//间隔天数
	_numDay: function (date1, date2) {
		var times = this._numSecond(date1, date2);
		var hour = this._var().hour;
		var mills = this._var().mills;
		return Math.ceil(times / (mills * hour));
	},

	//间隔时
	_numHour: function (date1, date2) {
		return Math.floor(this._numMillSecond(date1, date2) / (1000 * 60 * 60));
	},

	//间隔分
	_numMinute: function (date1, date2) {
		return Math.floor(this._numMillSecond(date1, date2) / (1000 * 60));
	},

	//间隔秒数
	_numSecond: function (date1, date2) {
		return Math.floor(this._numMillSecond(date1, date2) / 1000);
	},

	//间隔毫秒
	_numMillSecond: function (date1, date2) {
		var stimes = this._getTime(this._transferDate(date1));
		var etimes = this._getTime(this._transferDate(date2));
		return etimes - stimes;
	},

	_var: function () {
		return { hour: 24, second: 60, mills: 3600, format: "yyyy-MM-dd", dateFormat: "yyyy-MM-dd HH:mm:ss" };
	},

	/*某个日期加上多少毫秒*/
	_plusMillisSeconds: function (date, millisSeconds) {
		var dateTime = this._getTime(date);
		var mintimes = millisSeconds;
		var rdate = dateTime * 1 + mintimes * 1;
		return this._format(new Date(rdate));
	},
	/*某个日期加上多少秒*/
	_plusSeconds: function (date, seconds) {
		var dateTime = this._getTime(date);
		var mintimes = seconds * 1000;
		var rdate = dateTime * 1 + mintimes * 1;
		return this._format(new Date(rdate));
	},
	/*某个日期加上多少分钟*/
	_plusMinutes: function (date, minutes) {
		var dateTime = this._getTime(date);
		var mintimes = minutes * 60 * 1000;
		var rdate = dateTime * 1 + mintimes * 1;
		return this._format(new Date(rdate));
	},
	/*某个日期加上小时数*/
	_plusHours: function (date, hours) {
		var dateTime = this._getTime(date);
		var mintimes = hours * 60 * 60 * 1000;
		var rdate = dateTime + mintimes;
		return this._format(new Date(rdate));
	},
	/*某个日期加上天数*/
	_plusDays: function (date, days) {
		var dateTime = this._getTime(date);
		var mintimes = days * 60 * 60 * 1000 * 24;
		var rdate = dateTime * 1 + mintimes * 1;
		return this._format(new Date(rdate));
	},

	/*某个日期加上多少个月,这里是按照一个月30天来计算天数的*/
	_plusMonths: function (date, months) {
		var dateTime = this._getTime(date);
		var mintimes = months * 30 * 60 * 60 * 1000 * 24;
		var rdate = dateTime + mintimes * 1;
		return this._format(new Date(rdate));
	},

	/*某个日期加上多少个年,这里是按照一个月365天来计算天数的，如果loop为true则按闰年计算*/
	_plusYears: function (date, years, isLoop) {
		var dateTime = this._getTime(date);
		var day = 365;
		if (isLoop) day = 366;
		var mintimes = years * day * 60 * 60 * 1000 * 24;
		var rdate = dateTime + mintimes;
		return this._format(new Date(rdate));
	},

	/*某个日期加上某个日期，这样的操作视乎没什么意义*/
	_plusDate: function (date1, date2) {
		var dateTime = this._getTime(date1);
		var dateTime2 = this._getTime(date2);;
		var rdate = dateTime + dateTime2;
		return this._format(new Date(rdate));
	},

	/*某个日期减去多少毫秒秒*/
	_minusMillisSeconds: function (date, millisSeconds) {
		var dateTime = this._getTime(date);
		var mintimes = millisSeconds * 1;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},
	/*某个日期减去多少秒*/
	_minusSeconds: function (date, seconds) {
		var dateTime = this._getTime(date);
		var mintimes = seconds * 1000;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},
	/*某个日期减去多少分钟*/
	_minusMinutes: function (date, minutes) {
		var dateTime = this._getTime(date);
		var mintimes = minutes * 60 * 1000;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},
	/*某个日期减去小时数*/
	_minusHours: function (date, hours) {
		var dateTime = this._getTime(date);
		var mintimes = hours * 60 * 60 * 1000;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},
	/*某个日期减去天数*/
	_minusDays: function (date, days) {
		var dateTime = this._getTime(date);
		var mintimes = days * 60 * 60 * 1000 * 24;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},

	/*某个日期减去多少个月,这里是按照一个月30天来计算天数的*/
	_minusMonths: function (date, months) {
		var dateTime = this._getTime(date);
		var mintimes = months * 30 * 60 * 60 * 1000 * 24;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},

	/*某个日期减去多少个年,这里是按照一个月365天来计算天数的*/
	_minusYears: function (date, years, isLoop) {
		var dateTime = this._getTime(date);
		var day = 365;
		if (isLoop) day = 366;
		var mintimes = years * day * 60 * 60 * 1000 * 24;
		var rdate = dateTime - mintimes;
		return this._format(new Date(rdate));
	},

	/*某个日期减去某个日期，这样的操作视乎没什么意义*/
	_minusDate: function (date1, date2) {
		var dateTime = this._getTime(date1);
		var dateTime2 = this._getTime(date2);;
		var rdate = dateTime - dateTime2;
		return this._format(new Date(rdate));
	},

	/*获取一个月有多少天*/
	_getMonthOfDay: function (date1) {
		var currentMonth = this._getFirstDayOfMonth(date1);
		var nextMonth = this._getNextDayOfMonth(date1);
		return this._numDay(currentMonth, nextMonth);
	},

	/*获取一年又多少天*/
	_getYearOfDay: function (date) {
		var firstDayYear = this._getFirstDayOfYear(date);
		var lastDayYear = this._getLastDayOfYear(date);
		return Math.ceil(this._numDay(firstDayYear, lastDayYear));
	},

	/*某个日期是当年中的第几天*/
	_getDayOfYear: function (date1) {
		return Math.ceil(this._numDay(this._getFirstDayOfYear(date1), date1));
	},

	/*某个日期是在当月中的第几天*/
	_getDayOfMonth: function (date1) {
		return Math.ceil(this._numDay(this._getFirstDayOfMonth(date1), date1));
	},

	/*获取某个日期在这一年的第几周*/
	_getDayOfYearWeek: function (date) {
		var numdays = this._getDayOfYear(date);
		return Math.ceil(numdays / 7);
	},

	/*某个日期是在当月中的星期几*/
	_getDayOfWeek: function (date1) {
		return this._getWeek(date1);
	},

	/*获取在当前日期中的时间*/
	_getHourOfDay: function (date) {
		return this._getHour(date);
	},
	_eq: function (date1, date2) {
		var stime = this._getTime(this._transferDate(date1));
		var etime = this._getTime(this._transferDate(date2));
		return stime == etime ? true : false;
	},
	/*某个日期是否晚于某个日期*/
	_after: function (date1, date2) {
		var stime = this._getTime(this._transferDate(date1));
		var etime = this._getTime(this._transferDate(date2));
		return stime < etime ? true : false;
	},

	/*某个日期是否早于某个日期*/
	_before: function (date1, date2) {
		var stime = this._getTime(this._transferDate(date1));
		var etime = this._getTime(this._transferDate(date2));
		return stime > etime ? true : false;
	},

	/*获取某年的第一天*/
	_getFirstDayOfYear: function (date) {
		var year = this._getYear(date);
		var dateString = year + "-01-01 00:00:00";
		return dateString;
	},

	/*获取某年的最后一天*/
	_getLastDayOfYear: function (date) {
		var year = this._getYear(date);
		var dateString = year + "-12-01 00:00:00";
		var endDay = this._getMonthOfDay(dateString);
		return year + "-12-" + endDay + " 23:59:59";
	},

	/*获取某月的第一天*/
	_getFirstDayOfMonth: function (date) {
		var year = this._getYear(date);
		var month = this._getMonth(date);
		var dateString = year + "-" + month + "-01 00:00:00";
		return dateString;
	},

	/*获取某月最后一天*/
	_getLastDayOfMonth: function (date) {
		var endDay = this._getMonthOfDay(date);
		var year = this._getYear(date);
		var month = this._getMonth(date);
		return year + "-" + month + "-" + endDay + " 23:59:59";
	},
	/*一天的开始时间*/
	_getFirstOfDay: function (date) {
		var year = this._getYear(date);
		var month = this._getMonth(date);
		var date = this._getDay(date);
		return year + "-" + month + "-" + date + " 00:00:00";
	},

	/*一天的结束时间*/
	_getLastOfDay: function (date) {
		var year = this._getYear(date);
		var month = this._getMonth(date);
		var date = this._getDay(date);
		return year + "-" + month + "-" + date + " 23:59:59";
	},

	/*获取下个月的第一天*/
	_getNextDayOfMonth: function (date) {
		var year = this._getYear(date);
		var month = this._getMonth(date);
		month = month * 1 + 1;
		if (month > 12) {
			year = year + 1;
			month = month - 12;
		}
		month = month > 9 ? month : "0" + month;
		var dateString = year + "-" + month + "-01 00:00:00";
		return dateString;
	},

	_getFirstOfWeek: function (date1) {
		var week = this._getWeek(date1);
		var date = this._minusDays(date1, week);
		var year = this._getYear(date);
		var month = this._getMonth(date);
		var date = this._getDay(date);
		return year + "-" + month + "-" + date + " 00:00:00";
	},

	_getLastOfWeek: function (date1) {
		var week = 6 - this._getWeek(date1);
		var date = this._minusDays(date1, week);
		var year = this._getYear(date);
		var month = this._getMonth(date);
		var date = this._getDay(date);
		return year + "-" + month + "-" + date + " 23:59:59";
	},

	_getNow: function () {
		return new Date();
	},
	_format: function (date) {
		return this._getYear(date) + "-" + this._getMonth(date) + "-" + this._getDay(date) + " " + this._getHour(date) + ":" + this._getMinute(date) + ":" + this._getSecond(date);
	},
	_getDate: function () {
		return this._getNow();
	},
	/*年*/
	_getYear: function (date) {
		return this._transferDate(date).getFullYear();
	},

	/*月*/
	_getMonth: function (date) {
		var month = this._transferDate(date).getMonth() + 1;
		return month > 9 ? month : "0" + month;
	},

	/*日*/
	_getDay: function (date) {
		var day = this._transferDate(date).getDate();
		return day > 9 ? day : "0" + day;
	},

	/*获取今天星期几,如果为0代表星期日*/
	_getWeek: function (date) {
		return this._transferDate(date).getDay();
	},

	/*时*/
	_getHour: function (date) {
		var hour = this._transferDate(date).getHours();
		return hour > 9 ? hour : "0" + hour;
	},

	/*12小时制时*/
	_getHour12: function (date) {
		var hour = this._transferDate(date).getHours();
		return hour % 12 == 0 ? 12 : hour % 12
	},

	/*分*/
	_getMinute: function (date) {
		var minutes = this._transferDate(date).getMinutes();
		return minutes > 9 ? minutes : "0" + minutes;
	},

	/*秒*/
	_getSecond: function (date) {
		var seconds = this._transferDate(date).getSeconds();
		return seconds > 9 ? seconds : "0" + seconds;
	},

	/*毫秒*/
	_getMillisecond: function (date) {
		return this._transferDate(date).getTime();
	},

	/*获取今天在当年是第几季度*/
	_getPeriod: function (date) {
		var month = this._getMonth(date) * 1;
		return Math.floor((month + 3) / 3)
	},

	/*星期*/
	_nowWeekChinies: function (date) {
		var nowWeek = this._getWeek(date);
		var day = "";
		switch (nowWeek) {
			case 0: day = "日"; break;
				break;
			case 1: day = "一"; break;
				break;
			case 2: day = "二"; break;
				break;
			case 3: day = "三"; break;
				break;
			case 4: day = "四"; break;
				break;
			case 5: day = "五"; break;
				break;
			case 6: day = "六"; break;
		}
		return day;
	},

	/*返回 1970 年 1 月 1 日至今的毫秒数。*/
	_getTime: function (date) {
		return this._transferDate(date).getTime();
	},
	//获取指定日期是当前日期的前几天
	_getTimeFormat: function (startTime) {
		var startTimeMills = this._transferDate(startTime).getTime();
		var endTimeMills = new Date().getTime();
		var diff = parseInt((endTimeMills - startTimeMills) / 1000);//秒
		var day_diff = parseInt(Math.floor(diff / 86400));//天
		var buffer = Array();
		if (day_diff < 0) {
			return "[error],时间越界...";
		} else {
			if (day_diff == 0 && diff < 60) {
				if (diff <= 0)
					diff = 1;
				buffer.push(diff + "秒前");
			} else if (day_diff == 0 && diff < 120) {
				buffer.push("1 分钟前");
			} else if (day_diff == 0 && diff < 3600) {
				buffer.push(Math.round(Math.floor(diff / 60)) + "分钟前");
			} else if (day_diff == 0 && diff < 7200) {
				buffer.push("1小时前");
			} else if (day_diff == 0 && diff < 86400) {
				buffer.push(Math.round(Math.floor(diff / 3600)) + "小时前");
			} else if (day_diff == 1) {
				buffer.push("1天前");
			} else if (day_diff < 7) {
				buffer.push(day_diff + "天前");
			} else if (day_diff < 30) {
				buffer.push(Math.round(Math.floor(day_diff / 7)) + " 星期前");
			} else if (day_diff >= 30 && day_diff <= 179) {
				buffer.push(Math.round(Math.floor(day_diff / 30)) + "月前");
			} else if (day_diff >= 180 && day_diff < 365) {
				buffer.push("半年前");
			} else if (day_diff >= 365) {
				buffer.push(Math.round(Math.floor(day_diff / 30 / 12)) + "年前");
			}
		}
		return buffer.toString();
	}
};
/*date end*/

//获取某个范围内的随机一个数，range = [min,max]
function dRandom(range) {
	//获取最大值
	var max = Math.max(range[0], range[1]);
	//获取最小值
	var min = Math.min(range[0], range[1]);
	//获取最大最小值的差
	var diff = max - min;
	//获取指定范围内的随机一个数（包括负数）
	return Math.round(Math.random() * diff) + min;
	/*
	 *例如 [1, 20]，则 diff = 19 --> 0 <= Math.round(Math.random() * diff) <= 19
	 *然后再加上最小值
	 ，即可随机生成 1 ~ 20 之间的任意数，如果使用 Math.floor() 则
	 *生成 1 ~ 19 之间的任意数，使用 Math.ceil() 则生成 2 ~ 20 之间的任意数
	 */
}

//范围随机数
function randomRange(start, end) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
};

// 启动全屏!判断各种浏览器，找到正确的方法
//element：某个要全屏的元素
function launchFullscreen(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}
// 退出全屏模式!，只能document对象调用
function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
};

// 兼容写法获取缓存,name为key值，mark==>>true，使用localStorage，反则用sessionStorage
function getSession(name, mark) {
	// 支持H5的storage
	if (window.localStorage) {
		if (mark) {
			return localStorage.getItem("wzy" + name);
		} else {
			return sessionStorage.getItem("wzy" + name);
		}
	} else {
		// cookie获取
		var arrstr = document.cookie.split("; ");
		for (var i = 0; i < arrstr.length; i++) {
			var temp = arrstr[i].split("=");
			if (temp[0] == objname) return unescape(temp[1]);
		}
	}
}
// 兼容写法设置缓存
function setSession(name, value, mark) {
	// 支持H5的storage
	if (window.localStorage) {
		if (mark) {
			localStorage.setItem("wzy" + name, value);
		} else {
			sessionStorage.setItem("wzy" + name, value);
		}
	} else {
		// cookie设置
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	}
}
// 兼容写法清除缓存
function clearSession(name, mark) {
	// 支持H5的storage
	if (window.localStorage) {
		if (mark) {
			localStorage.removeItem("wzy" + name);
		} else {
			sessionStorage.removeItem("wzy" + name);
		}
	} else {
		// cookie清除
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getcookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	}
}
// 面向对象封装cookie
var wzyCookie = {
	setCookie: function (name, value, time, option) {
		var str = name + '=' + escape(value);
		var date = new Date();
		date.setTime(date.getTime() + this.getCookieTime(time));
		str += "; expires=" + date.toGMTString();
		if (option) {
			if (option.path) str += '; path=' + option.path;
			if (option.domain) str += '; domain=' + option.domain;
			if (option.secure) str += '; true';
		}
		document.cookie = str;
	},
	getCookie: function (name) {
		var arr = document.cookie.split('; ');
		if (arr.length == 0) return '';
		for (var i = 0; i < arr.length; i++) {
			tmp = arr[i].split('=');
			if (tmp[0] == name) return unescape(tmp[1]);
		}
		return '';
	},
	delCookie: function (name) {
		this.setCookie(name, '', -1);
		var date = new Date();
		date.setTime(date.getTime() - 10000);
		document.cookie = name + "=; expire=" + date.toGMTString() + "; path=/";
	},
	getCookieTime: function (time) {
		if (time <= 0) return time;
		var str1 = time.substring(1, time.length) * 1;
		var str2 = time.substring(0, 1);
		if (str2 == "s") {
			return str1 * 1000;
		}
		else if (str2 == "m") {
			return str1 * 60 * 1000;
		}
		else if (str2 == "h") {
			return str1 * 60 * 60 * 1000;
		}
		else if (str2 == "d") {
			return str1 * 24 * 60 * 60 * 1000;
		}
	}
};

// 拿到元素距离文档顶部的距离
function getOffsetTop(el) {
	// 先拿到元素距离最近定位属性盒子的offsetTop值
	var top = el.offsetTop;
	// 再循环判断最近的盒子是否有定位属性，从而拿到该盒子的offsetTop值，最终叠加得到传入元素距离文档顶部的距离
	while (el = el.offsetParent) {
		top += el.offsetTop;
	};
	return top;
}
function getClientHeight() {
	//  兼容拿到当前可视窗口的高度
	var clientH = window.innerHeight || document.documentElement.clientHeight;
	// 	拿到滚动条的滚动距离
	var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
	return clientH + scrollT;
}

//a连接实现下载，aLink---某个a链接，filename---自定义文件名xxx.word，content---文件的内容
function downloadFile(aLink, fileName, content) {
	var blob = new Blob([content]);
	aLink.href = URL.createObjectURL(blob);
	aLink.download = fileName;
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
	aLink.dispatchEvent(evt);
};

// 对base64编码的文件流处理
function base64Change() {
	var base64 = {
		base64EncodeChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		base64DecodeChars: new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1),
		/**
		 * base64编码
		 * @param {Object} str
		 */
		base64encode: function (str) {
			var out, i, len;
			var c1, c2, c3;
			len = str.length;
			i = 0;
			out = "";
			while (i < len) {
				c1 = str.charCodeAt(i++) & 0xff;
				if (i == len) {
					out += this.base64EncodeChars.charAt(c1 >> 2);
					out += this.base64EncodeChars.charAt((c1 & 0x3) << 4);
					out += "==";
					break;
				}
				c2 = str.charCodeAt(i++);
				if (i == len) {
					out += this.base64EncodeChars.charAt(c1 >> 2);
					out += this.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
					out += this.base64EncodeChars.charAt((c2 & 0xF) << 2);
					out += "=";
					break;
				}
				c3 = str.charCodeAt(i++);
				out += this.base64EncodeChars.charAt(c1 >> 2);
				out += this.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				out += this.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
				out += this.base64EncodeChars.charAt(c3 & 0x3F);
			}
			return out;
		},
		/**
		 * base64解码
		 * @param {Object} str
		 */
		base64decode: function (str) {
			var c1, c2, c3, c4;
			var i, len, out;
			len = str.length;
			i = 0;
			out = "";
			while (i < len) {
				/* c1 */
				do {
					c1 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
				}
				while (i < len && c1 == -1);
				if (c1 == -1)
					break;
				/* c2 */
				do {
					c2 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
				}
				while (i < len && c2 == -1);
				if (c2 == -1)
					break;
				out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
				/* c3 */
				do {
					c3 = str.charCodeAt(i++) & 0xff;
					if (c3 == 61)
						return out;
					c3 = this.base64DecodeChars[c3];
				}
				while (i < len && c3 == -1);
				if (c3 == -1)
					break;
				out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
				/* c4 */
				do {
					c4 = str.charCodeAt(i++) & 0xff;
					if (c4 == 61)
						return out;
					c4 = this.base64DecodeChars[c4];
				}
				while (i < len && c4 == -1);
				if (c4 == -1)
					break;
				out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
			}
			return out;
		},
		/**
		 * utf16转utf8
		 * @param {Object} str
		 */
		utf16to8: function (str) {
			var out, i, len, c;
			out = "";
			len = str.length;
			for (i = 0; i < len; i++) {
				c = str.charCodeAt(i);
				if ((c >= 0x0001) && (c <= 0x007F)) {
					out += str.charAt(i);
				}
				else
					if (c > 0x07FF) {
						out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
						out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
						out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
					}
					else {
						out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
						out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
					}
			}
			return out;
		},
		/**
		 * utf8转utf16
		 * @param {Object} str
		 */
		utf8to16: function (str) {
			var out, i, len, c;
			var char2, char3;
			out = "";
			len = str.length;
			i = 0;
			while (i < len) {
				c = str.charCodeAt(i++);
				switch (c >> 4) {
					case 0:
					case 1:
					case 2:
					case 3:
					case 4:
					case 5:
					case 6:
					case 7:
						// 0xxxxxxx
						out += str.charAt(i - 1);
						break;
					case 12:
					case 13:
						// 110x xxxx 10xx xxxx
						char2 = str.charCodeAt(i++);
						out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
						break;
					case 14:
						// 1110 xxxx10xx xxxx10xx xxxx
						char2 = str.charCodeAt(i++);
						char3 = str.charCodeAt(i++);
						out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
						break;
				}
			}
			return out;
		}
	};
	return base64;
}

/**
 * 如果在手机端访问pc端地址，自动跳转到app地址.
 * @param {Object} url
 */
function transfterURL(url) {
	var browser = {
		versions: function () {
			var u = navigator.userAgent, app = navigator.appVersion;
			return {//移动终端浏览器版本信息
				trident: u.indexOf('Trident') > -1, //IE内核
				presto: u.indexOf('Presto') > -1, //opera内核
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
				mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
				iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
				iPad: u.indexOf('iPad') > -1, //是否iPad
				webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
			};
		}(),
		language: (navigator.browserLanguage || navigator.language).toLowerCase()
	}

	//如果你是通过手机访问pc地址，那么就会跳转到你指定的地址
	if (browser.versions.mobile || browser.versions.ios || browser.versions.android ||
		browser.versions.iPhone || browser.versions.iPad) {
		window.location.href = url;
	}
};

/*dom渲染完毕执行的回调函数类似于jquery中$(function(){})*/
function ready(b) {
	if (document.addEventListener) document.addEventListener("DOMContentLoaded", b, !1);
	else {
		var a = document.createElement("script");
		document.getElementsByTagName("head")[0].appendChild(a);
		a.defer = !0;
		a.onreadystatechange = function () {
			"complete" == a.readyState && b()
		}
	}
};

/*判断是否已经添加了某个class*/
function hasClass(obj, cls) {
	return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};
/*添加样式*/
function addClass(ele, cls) {
	//如果已经追加过了就不再添加
	if (!this.hasClass(ele, cls)) ele.className += " " + cls;
};

/*删除class*/
function removeClass(ele, cls) {
	if (hasClass(ele, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		ele.className = ele.className.replace(reg, ' ');
	}
};

/*loading提示*/
//target：为某个目标元素(id为loading的元素)添加loading效果，mark（1~11）动画样式
function loading(target, mark) {
	$(target).show().on("click", function () {
		$(this).hide();
	}).height(50);
	$.loading({ target: $(target), mark: (mark || 7) });
};

/*滚动事件封装*/
function loadScroll(callback, mark) {
	window.onload = window.onscroll = function () {
		//可视区域
		var clientHeight = window.innerHeight || document.documentElement.clientHeight;
		//整个文档的高度
		var bheight = document.body.clientHeight;
		//滚动条的距离
		var stop = document.documentElement.scrollTop || document.body.scrollTop;
		// 当到达文档底部之前开始分页请求数据，并且只有当前次请求的数据加载完毕才进行下一次请求
		if (!window.loadMark && clientHeight + stop + 3 >= bheight) {
			//加锁，注意要在回调函数中让其变成false
			window.loadMark = true;
			//执行一个异步操作,跨域的问题,需要消耗时间
			loading("#loading", (mark || 7));//mark没有传入，就用默认的动画
			callback && callback();
		}
	};
};

/**
 * 找到元素对应的索引
 * @param {Object} ele
 */
function getIndex(ele) {
	var parentObj = ele.parentElement;
	var children = parentObj.children;
	//循环的目标就是为了去排除本身
	var index = -1;
	for (var i = 0, len = children.length; i < len; i++) {
		if (children[i] == ele) {
			index = i;
			break;
		}
	}
	return index;
}


/*
ajax({
	url:请求的地址,//必须
	type:请求的类型,//非必须
	async:是否异步,//非必须
	data:请求的参数,//非必须，
	支持key1=value1&key2=value3...这种表单数据格式或者{k1:v1,k2:v3,...}对象格式
	//请求成功的回调函数
	success:function(data){
	
	}
})*/
function ajax(options) {
	var xml = null;
	//默认参数
	var defaultOpt = {
		type: "get",
		async: true
	};
	// 合并参数
	for (var key in defaultOpt) {
		if (!options[key] && ((typeof options[key]) != "boolean")) {
			options[key] = defaultOpt[key];
		};
	}
	// 获取指定格式的参数列表
	if (options.data) {
		options.data = formatParams(options.data);
	};
	// 兼容IE678
	if (window.ActiveXObject) {
		xml = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		xml = new XMLHttpRequest();
	};
	// 判断是为get请求还是post请求
	if (options.type.toLowerCase() == "get") {
		// 判断是否有请求参数
		options.data ? xml.open(options.type, options.url + "?" + options.data, true) : xml.open(options.type, options.url, options.async);
		xml.send();
	} else {
		xml.open(options.type, options.url, options.async);
		//post提交数据的时候一定要设置这行代码
		xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8'");
		options.data ? xml.send(options.data) : xml.send();
	}
	// 监听成功请求连接服务器响应的状态
	xml.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			options.success && options.success(this.responseText);
		}
	};
}
// 格式化对象参数成k1=v1&k2=v2...字符串格式
function formatParams(params) {
	var par = [];
	// 判断是否是json对象
	if ((typeof params).toLowerCase() == "object") {
		params = JSON.stringify(params);
	} else {
		// 不是json格式的数据，直接返回出去
		return params;
	};
	// 如果是json格式的数据，进行转换
	if (params.indexOf("&") == -1) {
		var json = JSON.parse(params);
		for (var key in json) {
			// encodeURIComponent()处理特殊字符
			par.push(encodeURIComponent(key) + "=" + encodeURIComponent(json[key]));
		}
		// 格式化成k1=v1&k2=v2...字符串格式
		return par.join("&");
	};
}

//如：ajax({
//  url:'params',//必须
//  method:'post',//必须
//  async:true,//必须
//  data:{username:username,password:password},//必须
//  success:function(data){
//      console.log(data);
//  }
// })
function ajax(obj) {
	var xhr = createXHR();//创建XHR对象
	//通过使用JS随机字符串解决IE浏览器第二次默认获取缓存的问题
	obj.url = obj.url + '?rand=' + Math.random();
	obj.data = params(obj.data);//通过params()将名值对转换成字符串
	//若是GET请求，则将数据加到url后面
	if (obj.method === 'get') {
		obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data : '&' + obj.data;
	}
	if (obj.async === true) {//true表示异步，false表示同步
		//使用异步调用的时候，需要触发readystatechange 事件
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {//判断对象的状态是否交互完成
				callback();//回调
			}
		};
	}
	//在使用XHR对象时，必须先调用open()方法，
	//它接受三个参数：请求类型(get、post)、请求的URL和表示是否异步。
	xhr.open(obj.method, obj.url, obj.async);
	if (obj.method === 'post') {
		//post方式需要自己设置http的请求头，来模仿表单提交。
		//放在open方法之后，send方法之前。
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(obj.data);//post方式将数据放在send()方法里
	} else {
		xhr.send(null);//get方式则填null
	}
	if (obj.async === false) {  //同步
		callback();
	}
	function callback() {
		if (xhr.status == 200) {//判断http的交互是否成功，200表示成功
			obj.success(xhr.responseText);//回调传递参数
		} else {
			console.log('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
		}
	}
}
//名值对转换为字符串
function params(data) {
	var arr = [];
	for (var i in data) {
		//特殊字符传参产生的问题可以使用encodeURIComponent()进行编码处理
		arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
	}
	return arr.join('&');
}
// 创建ajax对象
function createXHR() {
	if (window.XMLHttpRequest) {//IE7+、Firefox、Opera、Chrome 和Safari
		return new XMLHttpRequest();
	} else if (window.ActiveXObject) {//IE6 及以下
		var versions = ['MSXML2.XMLHttp', 'Microsoft.XMLHTTP'];
		for (var i = 0, len = versions.length; i < len; i++) {
			try {
				return new ActiveXObject(version[i]);
				break;
			} catch (e) {
				//跳过
			}
		}
	} else {
		throw new Error('浏览器不支持XHR对象！');
	}
}

// 数组去重
Array.prototype.unique = function () {
	// 方法一：
	// this.sort();
	// var re=[this[0]];
	// for(var i = 1; i < this.length; i++){
	// 	if( this[i] !== re[re.length-1]){
	// 		re.push(this[i]);
	// 	}
	// }
	// return re;

	// 方法二：
	// var n = []; //一个新的临时数组
	// for(var i = 0; i < this.length; i++) //遍历当前数组
	// {
	// 	//如果当前数组的第i已经保存进了临时数组，那么跳过，
	// 	//否则把当前项push到临时数组里面
	// 	if (n.indexOf(this[i]) == -1) n.push(this[i]);
	// }
	// return n;

	// 方法三:
	// var n = {},r=[]; //n为hash表，r为临时数组
	// for(var i = 0; i < this.length; i++) //遍历当前数组
	// {
	// 	if (!n[this[i]]) //如果hash表中没有当前项
	// 	{
	// 		n[this[i]] = true; //存入hash表
	// 		r.push(this[i]); //把当前数组的当前项push到临时数组里面
	// 	}
	// }
	// return r;

	// 方法四:
	//结果数组
	var n = [this[0]];
	//从第二项开始遍历
	for (var i = 1; i < this.length; i++) {
		//如果当前数组的第i项在当前数组中第一次出现的位置不是i，
		//那么表示第i项是重复的，忽略掉。否则存入结果数组
		if (this.indexOf(this[i]) == i) n.push(this[i]);
	}
	return n;
};

// 简易版的时间倒计时09:50
/*
	id：需要绑定点击进行倒计时的对象元素
	callback：回调函数的中的参数有：fail（表示在倒计时中）、over(表示倒计时结束)、timer+":"+ms（当前倒计时的时间值）
	ctimer：表示倒计时的分钟，也可以在点击元素上自定义timer属性声明倒计时的分钟
*/
var timerBack = function (id, callback, ctimer) {
	var adom = document.getElementById(id);
	adom.onclick = function () {
		// 获取点击对象自定义属性timer（为分钟）
		var timer = this.getAttribute("timer") || ctimer;
		// 以每分钟60进行递减
		var ms = 60;
		timer--;
		// 进行阻止在倒计时过程点击警告
		if (adom.mark != undefined && !adom.mark) {
			console.log(ms + "===" + timer);
			callback && callback("fail");
			return;
		}
		adom.mark = true;
		// 以过一秒的定时器进行更新时间显示
		adom.timer = setInterval(function () {
			ms--;
			// 当分钟和秒数全部变为0时，提示倒计时结束
			if (ms == 0 && timer == 0) {
				clearInterval(adom.timer);
				callback && callback("over");
				adom.mark = true;
				return;
			}

			// 当秒数变为0时，进行分钟递减
			if (ms == 0) {
				timer--;
				ms = 60;
			}
			adom.mark = false;
			callback && callback((timer > 10 ? timer : "0" + timer) + ":" + (ms > 10 ? ms : "0" + ms));
		}, 1000);
	};
}

// 监听浏览器窗口的关闭和刷新
function listenColseAndRefresh() {
	function click(e) {
		if (document.all) {
			if (event.button == 2 || event.button == 3) {
				alert("欢迎光临寒舍，有什么需要帮忙的话，请与客服联系！谢谢您的合作！！！");
				oncontextmenu = 'return false';
			}
		}
		if (document.layers) {
			if (e.which == 3) {
				oncontextmenu = 'return false';
			}
		}
	}

	if (document.layers) {
		document.captureEvents(Event.MOUSEDOWN);
	}
	document.onmousedown = click;
	document.oncontextmenu = new Function("return false;")
	document.onkeydown = document.onkeyup = document.onkeypress = function (e) {
		var ev = window.event || e;
		if (ev.keyCode == 123) {
			ev.returnValue = false;
			return (false);
		}

		if (ev.keyCode == 116) {
			if (confirm("您确定要刷新此页面吗?")) {
				window.location.href = window.location.href;
			}
		}
	};

	window.onbeforeunload = onbeforeunload_handler;
	window.onunload = onunload_handler;
	function onbeforeunload_handler() {
		var warning = "确认退出?";
		return warning;
	}

	function onunload_handler() {
		var warning = "谢谢光临";
		alert(warning);
	}
};

// 获取url指定查询参数的值
function getQuery(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	// var r = window.location.search.substr(1).match(reg);
	var r = reg.exec(window.location.search.substr(1));
	//r[2]表示第二子项的值，即是查询参数的值
	if (r != null) return unescape(r[2]); return null;
};

// 反转字符串
function revStr(str) {
	var tmpStr = "";
	var len = str.length;
	for (var i = len - 1; i >= 0; i--) {
		tmpStr += str.charAt(i);
	};
	return tmpStr;
}

// 判断是否是字符串
function isString(str) {
	if (typeof str == "string" || str.constructor == String) {
		return true;
	} else {
		return false
	}
}

// 判断是否是数组
function isArray(arr) {
	if (typeof arr == "object") {
		if (Array.isArray) {
			return Array.isArray(arr);
		} else {
			return arr instanceof Array;
		}
	}
}

/**
 * 判断是否为空
 * @param val
 * @returns {Boolean}
 */
function isEmpty(val) {
	val = $.trim(val);
	if (val == null)
		return true;
	if (val == undefined || val == 'undefined')
		return true;
	if (val == "")
		return true;
	if (val.length == 0)
		return true;
	if (!/[^(^\s*)|(\s*$)]/.test(val))
		return true;
	return false;
}

/*非空判断*/
function isNotEmpty(val) {
	return !isEmpty(val);
}

//简单混入 mixin(obj,obj1);
function mixin(obj, obj2) {
	for (var k in obj2) {
		if (obj2.hasOwnProperty(k)) {
			obj[k] = obj2[k];
		}
	}
	return obj;
};

//多对象混入mix(obj,obj1,obj2,......)
function mix(target, source) {
	var arr = [];
	var args = arr.slice.call(arguments);

	var i = 1;
	if (args.length == 1) {
		return target;
	};

	while ((source = args[i++])) {
		for (var key in source) {
			if (source.hasOwnProperty(key)) {
				target[key] = source[key];
			}
		}
	}
	return target;
};

// html特殊字符编码
function encodeHTML(a) {
	return String(a)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
};

/**
 * 设置select选中
 * @param selectId select的id值
 * @param checkValue 选中option的值
*/
function setSelectChecked(selectId, checkValue) {
	var select = document.getElementById(selectId);
	for (var i = 0; i < select.options.length; i++) {
		if (select.options[i].innerHTML == checkValue) {
			select.options[i].selected = true;
			break;
		}
	}
};

/**
*@description:冻结对象以及对象属性的方法，可以禁止该对象继续添加属性和方法
*@param:某一个需要冻结的对象
**/
var constantize = (obj) => {
	// 冻结对象
	Object.freeze(obj);
	Object.keys(obj).forEach((key, i) => {
		// 如果属性还是一个对象，就继续进行冻结
		if (typeof obj[key] === 'object') {
			constantize(obj[key]);
		}
	});
};
/**
 * @description:在各种环境下获取顶部对象的方法，支持node环境,各种浏览器环境，Web Worker
**/
// 方法一
var getGlobal_1 = (typeof window !== 'undefined'
	? window
	: (typeof process === 'object' &&
		typeof require === 'function' &&
		typeof global === 'object')
		? global
		: this);

// 方法二
var getGlobal_2 = function () {
	// 浏览器或者Web Worker环境
	if (typeof self !== 'undefined') {
		return self;
	}
	// 浏览器环境
	if (typeof window !== 'undefined') {
		return window;
	}
	// node环境
	if (typeof global !== 'undefined') {
		return global;
	}
	throw new Error('unable to locate global object');
}
