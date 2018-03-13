//简单混入 mixin(obj,obj1);
function mixin(obj,obj2){
	for(var k in obj2){
		if(obj2.hasOwnProperty(k)){
			obj[k] = obj2[k];
		}
	}
	return obj;
};

//多对象深混入mix(obj,obj1,obj2,......)
function mix(target,source){
	var arr = [];
	var args = arr.slice.call(arguments);
	
	var i = 1;
	if(args.length==1){
		return target;
	};

	while((source = args[i++])){
		for(var key in source){
			if(source.hasOwnProperty(key)){
				target[key] = source[key];
			}
		}
	}
	return target;
};
exports.mix = mix;
exports.mixin = mixin;