/**
 * @author 王迎然(www.wangyingran.com)
 * @module cookie模块
 * @link n.js
 */
!function(window){
	/**
	 * cookie方法
	 * @property {Object}
	 */
	var cookie = {
		/**
		 * 设置cookie
		 * @param  {String} name    cookie名
		 * @param  {String} value   cookie值
		 * @param  {Object} options 设置cookie的有效期，路径，域，安全  
		 * @return 
		 */
		set: function(name, value, options){
			options = options || {}; 
			//如果值为空，删除该cookie    
			if (isNull(value)) {     
				value = '';     
				options.expires = -1;     
			}  
			var expires = '';     
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {     
				var date;     
				if (typeof options.expires == 'number') {     
					date = new Date();     
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));     
				} else {     
					date = options.expires;     
				}     
				expires = '; expires=' + date.toUTCString();     
			}     
			//设置参数
			var path = options.path ? '; path=' + (options.path) : '';     
			var domain = options.domain ? '; domain=' + (options.domain) : '';     
			var secure = options.secure ? '; secure': '';     
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join(''); 
		},
		/**
		 * 获取cookie
		 * @param  {String} name cookie名
		 * @return {String}
		 */
		get: function(name){
			var cookieValue = null,
				dck = document.cookie,
				cookieStart,cookieEnd;     
			if (dck&& dck != '') {  
				//通过indexOf()来检查这个cookie是否存在，不存在就为 -1　
				cookieStart = dck.indexOf(name + "=");
				if(cookieStart != -1){
					cookieStart += name.length + 1;
					cookieEnd = dck.indexOf(";", cookieStart);
					if(cookieEnd == -1){
						cookieEnd = dck.length;
					}
					return decodeURIComponent(dck.substring(cookieStart, cookieEnd));
				}   
			}     
			return '';
		},
		remove: function(name){
			cookie.set(name, null);
		}
	}
	/**
	 * 追加cookie模块到n命名空间上
	 * @namespace n
	 */
	n.mix(n, {
		cookie: function (name, value, options){
			if (!isUndefined(value)) {  
		        	cookie.set(name, value, options);
		    	}else{
				return cookie.get(name, value, options);
		    	}
		},
		removeCookie: function(name){
			cookie.remove(name);
		}
	});
	
}(this);

/**
 * @author johnqing
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @up: 模板拼接改为字符串拼接，提升高版本浏览器模板拼接速度
*/
!function(window){
    var NTpl = n.tpl || {},
        doc = window.document,
        vars = 'var ',
        logicInTpl = {},
        codeArr = ''.trim ?
        ['ret = "";', 'ret +=', ';', 'ret;']
        :['ret = [];', 'ret.push("', '")', 'ret.join("");'],
        keys = ('break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if'
            + ',in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with'
            // Reserved words
            + ',abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto'
            + ',implements,import,int,interface,long,native,package,private,protected,public,short'
            + ',static,super,synchronized,throws,transient,volatile'
            
            // ECMA 5 - use strict
            + ',arguments,let,yield').split(','),
        keyMap = {};
        
    for (var i = 0, len = keys.length; i < len; i ++) {
        keyMap[keys[i]] = 1;
    }

    /**
     * 编译器
     * @param str
     * @returns {Function} 返回模板拼接函数
     * @private
     */
    var _compile  = function(str){
        var openArr = str.split(NTpl.openTag),
            tmpCode = '';
            
        for (var i = 0, len = openArr.length; i < len; i ++) {
            var c = openArr[i],
                cArr = c.split(NTpl.closeTag);
            if (cArr.length == 1) {
                tmpCode += _html(cArr[0]);
            } else {
                tmpCode += _js(cArr[0]);
                tmpCode += cArr[1] ? _html(cArr[1]) : '';
            }
        }
    
        var code = vars + codeArr[0] + tmpCode + 'return ' + codeArr[3];
        return new Function('$data', '$getValue', code);
    };

    /**
     * 对外接口函数
     * @param str id
     * @param data 数据
     * @returns {*}
     */
    NTpl.tpl = function(str, data){
        var fn = (function(){
            var elem = doc.getElementById(str);
            if(elem){
                //缓存编译后的函数模板
                if(nt.cache[str]){
                    return nt.cache[str];
                }
                var html = /^(textarea|input)$/i.test(elem.nodeName) ? elem.value : elem.innerHTML;
                return nt.cache[str] = _compile(html);
            }else{
                return _compile(str);
            }
        })();
        //有数据则返回HTML字符串，没有数据则返回函数
        var result = typeof data === 'object' ? fn(data, getValue) : fn;
        fn = null;
        return result;
    };
    /**
     * 分隔符
     * @type {string}
     */
    NTpl.openTag =  NTpl.openTag || '<%';
    NTpl.closeTag = NTpl.closeTag || '%>';
    /**
     * html解析
     * @param  {String} s 模板
     * @return {String}   解析完成字符串
     */
    function _html (s) {
        s = s
        .replace(/('|"|\\)/g, '\\$1')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
        
        s = codeArr[1] + '"' + s + '"' + codeArr[2];
        
        return s + '\n';
    }
    /**
     * js解析
     * @param  {String} s 模板
     * @return {String}   解析完成字符串
     */
    function _js (s) {
        /**
         * 非js逻辑语句
         */
        if (/^=/.test(s)) {
            s = codeArr[1] + s.substring(1).replace(/[\s;]*$/, '') + codeArr[2];
        }
        dealLogic(s);        
        return s + '\n';
    }
    /**
     * 处理js逻辑语句
     * @param  {String} s 模板
     */
    function dealLogic (s) {
        s = s.replace(/\/\*.*?\*\/|'[^']*'|"[^"]*"|\.[\$\w]+/g, '');
        var sarr = s.split(/[^\$\w\d]+/);
        // console.log(s);
        for (var i = 0, len = sarr.length; i < len; i ++) {
            var logic = sarr[i];
            if (!logic || keyMap[logic] || /^\d/.test(logic)) {
                continue;
            }
            if (!logicInTpl[logic]) {
                vars += (logic + '= $getValue("' + logic + '", $data),');
                logicInTpl[logic] = 1;
            }
        }
    }
    /**
     * 数据解析
     * @param  {String} v     key
     * @param  {Object} $data 数据
     * @return {String}       value
     */
    function getValue (v, $data){
        return $data.hasOwnProperty(v) ? $data[v] : window[v];
    }
    /**
     * 命名空间
     * @type {*}
     */
    var nt = NTpl.tpl;
    /**
     * 缓存
     */
    nt.cache = {};

    n.mix(n, NTpl);
}(this);

/**
 * 动画模块
 * @author johnqing（刘卿）
 * @link n.js
 */
!function(window){
	/**
	 * Animate类
	 * @param  {Object}   elem     运动元素
	 * @param  {Object}   jsonDate 样式对象
	 * @param  {Number}   time     毫秒数
	 * @param  {Function} callback 完成后的回调
	 * @return
	 */
	var document = window.document,
		anim = {};
	var Animate = function(elem, jsonDate, time, callback, easing){
		this.elem = elem;
		this.jsonDate = jsonDate;
		this.time = time;
		this.easing = easing || 'jstwer';
		this.callback = callback;
		this.lazy = this.lazyque = 10;
		//获取唯一标识符
		this.uuid = this.getUid();
		this.f = 0;
		this.fn = elem.fn || [];
		//动画队列
		anim[this.uuid] = {};
		anim[this.uuid]['stop'] = true;
	}

	Animate.prototype = {
		/**
		 * 获取唯一id
		 * @return {String} 唯一id
		 */
		getUid: function(){
			var _this = this, 
				uuid = _this.elem.getAttribute('data-id');
			if(!n.isString(uuid)){
				uuid = n.nuid();
				_this.elem.setAttribute('data-id', uuid);
				return uuid;
			}
			return uuid;
		},
		run: function(){
			var _this = this,
				jd = _this.jsonDate,
				t = _this.time,
				que = _this.fn,
				queLen = que.length;
			que[queLen] = [];
			que[queLen]['callback'] = _this.callback;
			//循环解锁参数
			for(var i in jd){
				que[queLen].push([i, jd[i], t]);
				if(queLen == 0){
					i == 'opacity' ? _this.entrance(_this.alpha, [jd[i], t], _this.lazyque) : 
					_this.entrance(_this.execution, [i, jd[i], t], _this.lazyque);
				}
			}
			_this.elem.fn = _this.fn;
		},
		stop: function(){
			var _this = this;
			anim[_this.uuid]['stop'] = false;
			_this.fn.length = _this.elem.fn = 0;
			return _this;
		},
		entrance: function(fn, data, time){
			var root = n, _this = this;
			//fn 调用函数 data 参数 time 延迟时间
			setTimeout(function(){
				fn(data[0], data[1], data[2], root, _this);
			}, (time || 0));
		},
		/**
		 * 动画变化函数
		 * @param  {String} key 变化样式
		 * @param  {String} val 变化值
		 * @param  {Number} t   毫秒
		 * @return
		 */
		execution: function(key, val, t, root, that){
			var _this = that;
				tween = root.easing[_this.easing],
				nowTime = (new Date()).getTime(),
				duration = t || 500,
				beigin = parseFloat(_this.elem.style[key]) || 0;
			var changeValue = _this.nMath(val, beigin),
				// 单位
				un = val.match(/\d+(.+)/)[1];
			(function(){
				var t = (new Date()).getTime() - nowTime;
				if (t > duration){
					t = duration;
					_this.elem.style[key] = parseInt(tween(t, beigin, changeValue, duration)) + un;
					// 操作队列
					_this.queue(); 
					return _this;
				}
				_this.elem.style[key] = parseInt(tween(t, beigin, changeValue, duration)) + un;
				anim[_this.uuid]['stop'] && setTimeout(arguments.callee, _this.lazy);
			})();
		},
		/**
		 * 队列
		 */
		queue: function(){
			var _this = this,
				f = _this.f,
				que = _this.fn,
				lazyque = _this.lazyque;

			if (que && ++f == que[0].length){
				f = 0;// 清空计数器
				que[0].callback ? que[0].callback.apply(elem) : false;

				// 判断是否有动画在等待执行
				if (que.length > 1){
					que[0].callback = que[1].callback;
					que = _this.elem.fn || [];// 从dom对象上获取最新动画队列
					que.shift();// 清除刚执行完的动画队列
					_this.elem.fn = que;// 把新的队列更新到dom
					var am = que[0];

					// 循环播放队列动画
					for(var i = 0; i < am.length; i++){

						am[i][0] === 'opacity' ? _this.entrance(_this.alpha, [am[i][1], am[i][2]], lazyque):
						_this.entrance(_this.execution, [am[i][0], am[i][1], am[i][2]], lazyque);

					}
				}else{
					//清除队列
					que.length = 0;
					_this.elem.fn.length = 0;
				}

			}
		},
		/**
		 * 解析传入的值
		 */
		nMath: function(val, beigin){
			var numMath, re = /^([+-\\*\/]=)([-]?[\d.]+)/ ;
			if (re.test(val)){
				var reg = val.match(re);
				reg[2] = parseFloat(reg[2]);
				switch (reg[1]){
					case '+=':
						numMath = reg[2];
						break;
					case '-=':
						numMath = -reg[2];
						break;
					case '*=':
						numMath = beigin*reg[2] - beigin;
						break;
					case '/=':
						numMath = beigin/reg[2] - beigin;
						break;
				}
				return numMath;
			} 
			return parseFloat(val) - beigin;
		},
		alpha: function(val, t){
			var _this = this,
				elem = _this.elem,
				lazy = _this.lazy,
				s = (new Date()).getTime(),
				d = t || 500, b, c;
			if(document.defaultView){
				b = document.defaultView.getComputedStyle(elem,null)['opacity'] || 1,
				c = _this.nMath(val,b) * 100;
				(function(){
					var t = (new Date()).getTime() - s;
					if(t > d){
						t = d;
						elem.style['opacity'] = tween(t, (100 * b), c, d) / 100;
						_this.queue(); // 队列控制
						return _this;
					}
					elem.style['opacity'] = tween(t, (100 * b), c, d) / 100;
					anim[_this.uuid]['stop'] && setTimeout(arguments.callee, lazy);
				})();
			}else{
				b = elem.currentStyle['filter'] ? 
				(elem.currentStyle['filter'].match(/^alpha\(opacity=([\d\.]+)\)$/))[1]/100 : 1;
				c = _this.nMath(val, b) * 100;
				(function(){
					var t = (new Date()).getTime() - s;
					if (t > d){
						t = d;
						elem.style['filter']='alpha(opacity='+ tween(t, (100 * b), c, d) +')';
						_this.queue(); // 队列控制
						return _this;
					}
					elem.style['filter'] = 'alpha(opacity='+ tween(t, (100*b) , c, d) +')';
					anim[_this.uuid]['stop'] && setTimeout(arguments.callee, lazy);
				})();
			}
		}
	}
	/**
	 * 添加easing
	 * @description 后期可通过使用n.mix(n.easing,新的算子)来添加新的算子
	 * t: current time, b: begInnIng value, c: change In value, d: duration
	 */
	n.mix(n, {
		easing: {
			'jstwer': function(t, b, c, d){
				return - c * (t /= d) * (t - 2) + b;
			}
		},
		animate: function(elem, jsonDate, time, callback){
			new Animate(elem, jsonDate, time, callback).run();
		}
	});
}(this);