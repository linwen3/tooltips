/*
combined files : 

pi/tooltips/align
pi/tooltips/index

*/
/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 22:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 
 
 component/extension/align
*/
 
/**
 * @ignore
 * Component.Extension.Align
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add('pi/tooltips/align',function (S, Node) {
 
    var win = S.Env.host,
        $ = Node.all,
        UA = S.UA;
 
 
    // http://yiminghe.iteye.com/blog/1124720
 
    /**
     * @ignore
     * 得到会导致元素显示不全的祖先元素
     */
    function getOffsetParent(element) {
        // ie 这个也不是完全可行
        /*
         <div style="width: 50px;height: 100px;overflow: hidden">
         <div style="width: 50px;height: 100px;position: relative;" id="d6">
         元素 6 高 100px 宽 50px<br/>
         </div>
         </div>
         */
        // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
        //  In other browsers it only includes elements with position absolute, relative or
        // fixed, not elements with overflow set to auto or scroll.
//        if (UA.ie && ieMode < 8) {
//            return element.offsetParent;
//        }
        // 统一的 offsetParent 方法
        var doc = element.ownerDocument,
            body = doc.body,
            parent,
            positionStyle = $(element).css('position'),
            skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute';
 
        if (!skipStatic) {
            return element.nodeName.toLowerCase() == 'html' ? null : element.parentNode;
        }
 
        for (parent = element.parentNode; parent && parent != body; parent = parent.parentNode) {
            positionStyle = $(parent).css('position');
            if (positionStyle != "static") {
                return parent;
            }
        }
        return null;
    }
 
    /**
     * @ignore
     * 获得元素的显示部分的区域
     */
    function getVisibleRectForElement(element) {
        var visibleRect = {
                left: 0,
                right: Infinity,
                top: 0,
                bottom: Infinity
            },
            el,
            scrollX,
            scrollY,
            winSize,
            doc = element.ownerDocument,
            $win = $(doc).getWindow(),
            body = doc.body,
            documentElement = doc.documentElement;
 
        // Determine the size of the visible rect by climbing the dom accounting for
        // all scrollable containers.
        for (el = element; el = getOffsetParent(el);) {
            // clientWidth is zero for inline block elements in ie.
            if ((!UA.ie || el.clientWidth != 0) &&
                // body may have overflow set on it, yet we still get the entire
                // viewport. In some browsers, el.offsetParent may be
                // document.documentElement, so check for that too.
                (el != body &&
                    el != documentElement &&
                    $(el).css('overflow') != 'visible')) {
                var pos = $(el).offset();
                // add border
                pos.left += el.clientLeft;
                pos.top += el.clientTop;
 
                visibleRect.top = Math.max(visibleRect.top, pos.top);
                visibleRect.right = Math.min(visibleRect.right,
                    // consider area without scrollBar
                    pos.left + el.clientWidth);
                visibleRect.bottom = Math.min(visibleRect.bottom,
                    pos.top + el.clientHeight);
                visibleRect.left = Math.max(visibleRect.left, pos.left);
            }
        }
 
        // Clip by window's viewport.
        scrollX = $win.scrollLeft();
        scrollY = $win.scrollTop();
        visibleRect.left = Math.max(visibleRect.left, scrollX);
        visibleRect.top = Math.max(visibleRect.top, scrollY);
        winSize = {
            width: $win.width(),
            height: $win.height()
        };
        visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
        visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
        return visibleRect.top >= 0 && visibleRect.left >= 0 &&
            visibleRect.bottom > visibleRect.top &&
            visibleRect.right > visibleRect.left ?
            visibleRect : null;
    }
 
    function getElFuturePos(elRegion, refNodeRegion, points, offset) {
        var xy,
            diff,
            p1,
            p2;
 
        xy = {
            left: elRegion.left,
            top: elRegion.top
        };
 
        p1 = getAlignOffset(refNodeRegion, points[0]);
        p2 = getAlignOffset(elRegion, points[1]);
 
        diff = [p2.left - p1.left, p2.top - p1.top];
 
        return {
            left: xy.left - diff[0] + (+offset[0]),
            top: xy.top - diff[1] + (+offset[1])
        };
    }
 
    function isFailX(elFuturePos, elRegion, visibleRect) {
        return elFuturePos.left < visibleRect.left ||
            elFuturePos.left + elRegion.width > visibleRect.right;
    }
 
    function isFailY(elFuturePos, elRegion, visibleRect) {
        return elFuturePos.top < visibleRect.top ||
            elFuturePos.top + elRegion.height > visibleRect.bottom;
    }
 
    function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
        var pos = S.clone(elFuturePos),
            size = {
                width: elRegion.width,
                height: elRegion.height
            };
 
        if (overflow.adjustX && pos.left < visibleRect.left) {
            pos.left = visibleRect.left;
        }
 
        // Left edge inside and right edge outside viewport, try to resize it.
        if (overflow['resizeWidth'] &&
            pos.left >= visibleRect.left &&
            pos.left + size.width > visibleRect.right) {
            size.width -= (pos.left + size.width) - visibleRect.right;
        }
 
        // Right edge outside viewport, try to move it.
        if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
            // 保证左边界和可视区域左边界对齐
            pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
        }
 
        // Top edge outside viewport, try to move it.
        if (overflow.adjustY && pos.top < visibleRect.top) {
            pos.top = visibleRect.top;
        }
 
        // Top edge inside and bottom edge outside viewport, try to resize it.
        if (overflow['resizeHeight'] &&
            pos.top >= visibleRect.top &&
            pos.top + size.height > visibleRect.bottom) {
            size.height -= (pos.top + size.height) - visibleRect.bottom;
        }
 
        // Bottom edge outside viewport, try to move it.
        if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
            // 保证上边界和可视区域上边界对齐
            pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
        }
 
        return S.mix(pos, size);
    }
 
 
    function flip(points, reg, map) {
        var ret = [];
        S.each(points, function (p) {
            ret.push(p.replace(reg, function (m) {
                return map[m];
            }));
        });
        return ret;
    }
 
    function flipOffset(offset, index) {
        offset[index] = -offset[index];
        return offset;
    }
 
 
    /**
     * @class KISSY.Component.Extension.Align
     * Align extension class.Align component with specified element.
     */
    function Align() {
    }
 
 
    Align.__getOffsetParent = getOffsetParent;
 
    Align.__getVisibleRectForElement = getVisibleRectForElement;
 
    Align.ATTRS =
    {
 
        /**
         * alignment config.
         * @type {Object}
         * @property align
         *
         * for example:
         *      @example
         *      {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *      }
         */
 
 
        /**
         * alignment config.
         * @cfg {Object} align
         *
         * for example:
         *      @example
         *      {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *      }
         */
 
 
        /**
         * @ignore
         */
        align: {
            value: {}
        }
    };
 
    function getRegion(node) {
        var offset, w, h,
            domNode = node[0];
        if (!S.isWindow(domNode)) {
            offset = node.offset();
            w = node.outerWidth();
            h = node.outerHeight();
        } else {
            var $win = $(domNode).getWindow();
            offset = {
                left: $win.scrollLeft(),
                top: $win.scrollTop()
            };
            w = $win.width();
            h = $win.height();
        }
        offset.width = w;
        offset.height = h;
        return offset;
    }
 
    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param region
     * @param align
     * @ignore
     */
    function getAlignOffset(region, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            w = region.width,
            h = region.height,
            x, y;
 
        x = region.left;
        y = region.top;
 
        if (V === 'c') {
            y += h / 2;
        } else if (V === 'b') {
            y += h;
        }
 
        if (H === 'c') {
            x += w / 2;
        } else if (H === 'r') {
            x += w;
        }
 
        return { left: x, top: y };
    }
 
    function beforeVisibleChange(e) {
        if (e.target == this && e.newVal) {
            realign.call(this);
        }
    }
 
    function onResize() {
        if (this.get('visible')) {
            realign.call(this);
        }
    }
 
    function realign() {
        this._onSetAlign(this.get('align'));
    }
 
    Align.prototype = {
        __bindUI: function () {
            // auto align on window resize or before el show
            var self = this;
            self.on('beforeVisibleChange', beforeVisibleChange, self);
            self.$el.getWindow().on('resize', onResize, self);
        },
 
        '_onSetAlign': function (v) {
            if (v && v.points) {
                this.align(v.node, v.points, v.offset, v.overflow);
            }
        },
 
        /*
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @ignore
         * @param {Element} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {String[]} points 对齐方式
         * @param {Number[]} [offset] 偏移
         * @chainable
         */
        align: function (refNode, points, offset, overflow) {
            refNode = Node.one(refNode || win);
            offset = offset && [].concat(offset) || [0, 0];
            overflow = overflow || {};
 
            var self = this,
                el = self.$el,
                fail = 0;
 
            // 当前节点可以被放置的显示区域
            var visibleRect = getVisibleRectForElement(el[0]);
            // 当前节点所占的区域, left/top/width/height
            var elRegion = getRegion(el);
            // 参照节点所占的区域, left/top/width/height
            var refNodeRegion = getRegion(refNode);
            // 当前节点将要被放置的位置
            var elFuturePos = getElFuturePos(elRegion,
                refNodeRegion, points, offset);
            // 当前节点将要所处的区域
            var newElRegion = S.merge(elRegion, elFuturePos);
 
            // 如果可视区域不能完全放置当前节点时允许调整
            if (visibleRect && (overflow.adjustX || overflow.adjustY)) {
 
                // 如果横向不能放下
                if (isFailX(elFuturePos, elRegion, visibleRect)) {
                    fail = 1;
                    // 对齐位置反下
                    points = flip(points, /[lr]/ig, {
                        l: "r",
                        r: "l"
                    });
                    // 偏移量也反下
                    offset = flipOffset(offset, 0);
                }
 
                // 如果纵向不能放下
                if (isFailY(elFuturePos, elRegion, visibleRect)) {
                    fail = 1;
                    // 对齐位置反下
                    points = flip(points, /[tb]/ig, {
                        t: "b",
                        b: "t"
                    });
                    // 偏移量也反下
                    offset = flipOffset(offset, 1);
                }
 
                // 如果失败，重新计算当前节点将要被放置的位置
                if (fail) {
                    elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
                    S.mix(newElRegion, elFuturePos);
                }
 
                //var newOverflowCfg = {};
 
                // 检查反下后的位置是否可以放下了
                // 如果仍然放不下只有指定了可以调整当前方向才调整
//                newOverflowCfg.adjustX = overflow.adjustX &&
//                    isFailX(elFuturePos, elRegion, visibleRect);
// 
//                newOverflowCfg.adjustY = overflow.adjustY &&
//                    isFailY(elFuturePos, elRegion, visibleRect);
// 
                // 确实要调整，甚至可能会调整高度宽度
//                if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
//                    newElRegion = adjustForViewport(elFuturePos, elRegion,
//                        visibleRect, newOverflowCfg);
//                }
            }
 
            // https://github.com/kissyteam/kissy/issues/190
            // http://localhost:8888/kissy/src/overlay/demo/other/relative_align/align.html
            // 相对于屏幕位置没变，而 left/top 变了
            // 例如 <div 'relative'><el absolute></div>
            self.set({
                "x": newElRegion.left,
                "y": newElRegion.top
            }, {
                force: 1
            });
 
            // need judge to in case set fixed with in css on height auto element
            if (newElRegion.width != elRegion.width) {
                self.set('width', el.width() + newElRegion.width - elRegion.width);
            }
 
            if (newElRegion.height != elRegion.height) {
                self.set('height', el.height() + newElRegion.height - elRegion.height);
            }
            
            self.realAlign = {
                node: refNode,
                points: points,
                offset: [newElRegion.left, newElRegion.top]
            };
            
            return self;
        },
 
        /**
         * Make current element center within node.
         * @param {undefined|String|HTMLElement|KISSY.NodeList} node
         * Same as node config of {@link KISSY.Component.Extension.Align#cfg-align}
         * @chainable
         */
        center: function (node) {
            var self = this;
            self.set('align', {
                node: node,
                points: ["cc", "cc"],
                offset: [0, 0]
            });
            return self;
        },
 
        __destructor: function () {
            if (this.$el) {
                this.$el.getWindow().detach('resize', realign, this);
            }
        }
    };
 
    return Align;
}, {
    requires: ["node"]
});
/**
 * @ignore
 *
 *  2012-04-26 yiminghe@gmail.com
 *   - 优化智能对齐算法
 *   - 慎用 resizeXX
 *
 *  2011-07-13 yiminghe@gmail.com note:
 *   - 增加智能对齐，以及大小调整选项
 **/
/**
 * @fileoverview 
 * @author lanmeng.bhy<lanmeng.bhy@taobao.com>
 * @module Tooltips
 **/
KISSY.add('pi/tooltips/index',function (S, Node, RichBase, UA, XTemplate, O, Align) {
    
    
    var $ = S.all;
    var BODY = $('body')
    
    var DOM = S.DOM;
    var O = S.Overlay;
    
    var PREFIXCLS = 'pi-';
    //var ARROW_NODE = 'J_toolTipsArrow';
    var BD_NODE = 'J_toolTipsBd';

    var ToolTips = RichBase.extend({
        initializer: function(){
            var self = this;
            self.align = new Align();
            
            self._initPop();
            self._bindEvent();
        },
        
        //初始化弹框
        _initPop: function(){
            var self = this;
            var attr = self.getAttrVals();
            var tipsNode = $(new XTemplate(self.get('tpl')).render(attr)).appendTo(BODY);    
            
            //初始化样式
            var oStyle = {};
            //oStyle['z-index'] = self.get('zIndex');
            
            if(UA.ie == 6 || self.get('fixSize')){
                oStyle['width'] = self.get('maxWidth');
                oStyle['height'] = self.get('maxHeight');
            } else {
                oStyle['max-width'] = self.get('maxWidth');
                oStyle['max-height'] = self.get('maxHeight');
            }	
            tipsNode.style('z-index', self.get('zIndex'));	
            
            //初始化弹框
            self.popup =  new O.Popup({
                srcNode: tipsNode,
                effect:{
                    effect: self.get('effect'), //popup层显示动画效果，slide是展开，也可以"fade"渐变
                    duration: self.get('duration')
                }
            });
            
            self.newAlign = attr.align;
            self.popup.align = self.align.align;
            self.popup.render();
            
            self.tipsNode = tipsNode;
            self.bdNode = self.tipsNode.one('.' + BD_NODE);
            self.bdNode.style(oStyle);	
            
            
        },
        
        //绑定事件
        _bindEvent: function(){
        
            var self = this;
            var attr = self.getAttrVals();
            
            //提示框的关闭和隐藏
            if(attr.triggerNode){  //如果有触发节点，则绑定显示隐藏事件
                
                //mouse事件
                if(attr.eventType == 'mouse'){
                    var _clearMouseHide = function(){
                        self._mouseHideLater && self._mouseHideLater.cancel();
                    };
                    
                    BODY.delegate('mouseover', attr.triggerNode, function(e){
                        _clearMouseHide();
                        self._show(e);
                    });
                    self.tipsNode.on('mouseenter', _clearMouseHide);
              
                    if(attr.outSideHide){
                        var _hide = function(){
                            _clearMouseHide(); 
                            self._mouseHideLater = S.later(function(){
                                self._hide();
                            }, 100);
                        };
                        
                        BODY.delegate('mouseout', attr.triggerNode, _hide);
                        self.tipsNode.on('mouseleave', _hide);
                    }     
                    
                }
                
                if(attr.eventType == 'click'){
                    BODY.delegate('click', attr.triggerNode, self.show, self);
                    
                    if(attr.outSideHide){
                        self.on('show', function(){
                            WIN.on('keydown', self._outSideClick, self);
                        })
                        self.on('hide', function(){
                            WIN.detach('click', self._outSideClick, self);
                        })
                    }
                }
            }
            
            self.on('afterHockingChange', self._addHocking);
            self.on('afterMaxWidthChange', self._setMaxWidth);
            self.on('afterMaxHeightChange', self._setMaxHeight);
            self.on('afterZIndexChange', self._setZIndex, self);
            
            //window.on('resize');
            
            /*
                                    S.Event.on(window,'resize',function(e){
                                            self.rePosition();
                                            self.rerender();
                                            self.renderArrow();
                                    });*/
            
        },
          
        //点击其他区域
        _outSideClick: function(e){
            var self = this;
            var target = e.target;
            
            if(!(target === self.contentNode[0] || self.contentNode.contains(target))){
                self._hide();
            }
        },
        
        _show: function(e){
            var self = this;
            var attr = self.getAttrVals();
            var triggerNode = attr.referNode || $(e.currentTarget);  
            
            if(attr.delayOut){
                self._hideLater && self._hideLater.cancel();
            }
            
            if(attr.delayIn){
                self._showLater && self._showLater.cancel();
                self._showLater = S.later(function(){
                    self.show(triggerNode);
                }, attr.delayIn);
                
                return;
            }
            self.show(triggerNode);
           
        },
        
        show: function(elem, content, maxWidth, maxHeight){
            var self = this;
             
            if(content){
                self.setContent(content);
            } 
            
            if(maxWidth){
                self.setMaxWidth(maxWidth);
            }
            if(maxHeight){
                self.setMaxHeight(maxHeight);
            }
            
            //获取最新的内容，如果有attr，取attr，没有取content
            var attr = self.getAttrVals();
            if(!content){
               content = attr.contentAttr?elem.attr(attr.contentAttr) : '';
            }
            content = content? content : attr.content;
            
            self.bdNode.html(content);
            self.setAlign(elem);
            
            self.fire('beforeShow');
            self.popup.show(); 
            self.fire('afterShow');
            
            //增加鼠标移动
            self._addHocking();
        },
        
        isShowing: function(){
            return self.popup.get('visible');
        },   
        
        _hide: function(){
            var self = this;
            var attr = self.getAttrVals();
            
            if(attr.delayIn){
                self._showLater && self._showLater.cancel();
            }
            
            if(attr.delayOut){ 
                self._hideLater && self._hideLater.cancel();
                self._hideLater = S.later(function(){
                    self.hide();
                }, attr.delayOut);
                
                return;
            }
            self.hide();
            
        },
        
        hide: function(){
            var self = this;
            
            self.fire('beforeHide');
            self.popup.hide();
            self.fire('afterHide');
            
            self._removeHocking();
        },
        
        setContent: function(o){
            this.set('content', o);
            return this;
        },
        
        setContentAttr: function(o){
            this.set('contentAttr', o);
            return this;
        },
        
        setMaxWidth: function(o){
            this.set('maxWidth', o);
            return this;
        }, 
        
        _setMaxWidth: function(){
            var self = this;
            var styleName = 'maxWidth';
            
            if(UA.ie == 6 || self.get('fixSize')){
                styleName = 'width';
            }
            
            self.bdNode.css(styleName, self.get('maxWidth'));
        },   
        
        setMaxHeight: function(o){
            this.set('maxHeight', o);
            return this;
        }, 
        
        _setMaxHeight: function(){
            var self = this;
            var styleName = 'maxHeight';
            
            if(UA.ie == 6 || self.get('fixSize')){
                styleName = 'height';
            }
            
            self.bdNode.css(styleName, self.get('maxHeight'));
        },
        
        _setZIndex: function(){
            self.contentNode.css('zIndex', self.get('zIndex'));
            return this;
        },
        
        /* 设置对齐 */
        setAlign: function(elem){
            var self = this;
            var attr = self.getAttrVals();
            var align = attr.align;
            var offset = attr.offset;
            
            
            //如果浮层随着鼠标移动，就不做边界检测了，会出现在边界晃动的情况，很麻烦
            if(attr.hocking || !attr.viewPort) {
                self.popup.align(elem, align, offset);
                return;
            }
            
                        
            
            //如果需要做边界检测则，直接使用对齐
            if(attr.viewPort){
               
                self.popup.align(elem, align, offset, {
                   adjustX:1, // 当对象不能处于可显示区域时，自动调整横坐标
                   adjustY:1 // 当对象不能处于可显示区域时，自动调整纵坐标
                });
                
                //去掉旧样式
                self.tipsNode.removeClass('pi-toolTips-' + self.newAlign[1]);
                
                self.newAlign = self.popup.realAlign.points;
                self.tipsNode.addClass('pi-toolTips-' + self.newAlign[1]);
            } 
            
            
            
            
        },
               
        /* 跟随鼠标移动 */
        setHocking: function(o){
            this.set('hocking', o);
        },
        
        _addHocking: function(){
            var self = this;
            var hocking = self.get('hocking');
            
            if(hocking && self.isShowing){
                BODY.on('mousemove', self._hocking, self);
            } 
        },
        
        _removeHocking: function(){
            var self = this;
            BODY.detach('mousemove', self._hocking, self);
        },
 
        _hocking: function(e){
           var self = this;
           var offset = self.get('offset');
           
           var pos = [e.pageX, e.pageY];
           pos[0] = pos[0] + offset[0];
           pos[1] = pos[1] + offset[1];
    
           self.popup.move(pos[0], pos[1]);
       }
        
    },{
        ATTRS: {
            
            /* 提示框的html片段，可以自定义，但是arrow和bd的钩子需要添加*/
            tpl: {
                value: '<div class="{{prefixCls}}toolTips {{prefixCls}}toolTips-{{#each align}}{{#if xindex}}{{this}}{{/if}}{{/each}}">' +
                            '{{#if arrow}}' +
		                    '<div class="{{prefixCls}}toolTips-arrow">' +
		                        '<span></span>' +
		                    '</div>' +
		                    '{{/if}}' +
		                    '<div class="{{prefixCls}}toolTips-bd">' +
		                        '<div class="{{prefixCls}}toolTips-box ks-popup-content J_toolTipsBd">{{content}}</div>' +
		                    '</div>' +
		                '</div>'
            },
            
            /* 触发提示框显示的元素，可以为空，如果为空，则仅仅创建toolTips*/
            triggerNode: {
                value: null            
            },
            
            /* 参考元素 */
            referNode: {
                value: null
            },
            
            /* 是否需要箭头 */
            arrow: {
                value: true
            },
            
            /* 触发提示框显示的事件类型， mouse/click*/
            eventType: {
                value: 'mouse'
            }, 
            
            /* 移除或者点击弹出框以为的区域，消失 */  
            outSideHide: {
                value: true
            }, 
            
            /* 提示框内显示的内容 */
            content: {
                value: ''
            },
            
            /* 显示的时候获取的attr属性 */
            contentAttr: {
                value: ''
            },
            
            /* 样式前缀 */
            prefixCls: {
                value: PREFIXCLS
            },
            
            /* 固定弹框大小，如果固定大小，则maxWidth和maxHeight为width和height*/
            fixSize: {
                value: false
            },
            
            /* 最大宽度 */
            maxWidth: {
                value: 'auto'
            },
            
            
            /* 最大高度 */
            maxHeight: {
                value: 'auto'
            },
            
            /* 对齐 */
            align: {
                value: ['bl','tl']        
            },
            
            /* 偏移*/
            offset: {
                value: [0, 0]
            },
            
            zIndex: {
                value: 10000
            },
            
            /* 是否边界检测 */
            viewPort: {
                value: true           
            },
            
            //鼠标是否跟随移动
            hocking: {
                value: false
            },
            
            //延时出现
            delayIn: {
                value: 0
            },
            
            //是否立即消失
            //value为0，标示立即消失
            //value为负数，标示不消失
            //value为整数，标示间隔一段时间消失
            delayOut: {
                value: 0
            },
            
            
            //动画效果
            effect: {
                value: ''
            },
            
            //动画时间
            duration: {
                value: 0
            }           
        }
    });
    
    return ToolTips;
    
}, {requires:['node', 'rich-base', 'ua', 'xtemplate', 'overlay', './align']});