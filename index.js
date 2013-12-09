/**
 * @fileoverview 
 * @author lanmeng.bhy<lanmeng.bhy@taobao.com>
 * @module Tooltips
 **/
KISSY.add(function (S, Node, RichBase, UA, XTemplate, O, Align) {
    
    
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