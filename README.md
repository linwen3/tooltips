# pi/tooltips

## 概述

    旅行提醒组件，浮层提醒，当用户触发某个元素后，在元素旁弹出提示框。


### 样式

   * 提示框带有箭头（可设置）
   * 默认宽度、高度由内容撑开（可设置，默认为max-width）
   * z-index 为10000 （可设置）

### Attibute

* tpl(String)
   
    提示框结构，需要给内容节点加上钩子J_toolTipsBd，设置提示框内容使用；

    内容框需要添加class=“ks-popup-content” （overlay会判断）

* triggerNode(String|KISSY NODE)

    触发提示款显示的元素 ，可以为空，如果为空，仅仅创建toolTips

* referNode(KISSY NODE)
    
    提示框显示位置参考元素，可以为空；如果为空，则以触发元素为参考元素
            
* arrow(Boolean)
    
    是否显示箭头，默认为true，即显示箭头

* eventType(String)
    
    触发提示框显示的事件类型，值为mouse/click，默认为mouse
    
* outSideHide(Boolean)
    
    移除或者点击弹出框以为的区域，弹出框是否消失，默认为true，即消失
    
* content(String)
    
    提示框内显示的内容
            
* contentAttr(String)
    
    从触发元素属性中获取提示框提示内容，优先级高于content
    
* prefixCls(String)
    
    提示框样式前缀，默认为‘pi-’
    
* fixSize(Boolean)
   
    是否固定弹框大小，默认为false
    
    true，则设置弹出框的width为maxWidth的值，height为maxHeight的值

    false，则设置弹出框的maxHeight为maxWidth的值，maxHeight为maxHeight的值
            
*  maxWidth(String)
    
    弹出框内容宽度（IE为width，其他为maxWidth）

* maxHeight(String)
            
    弹出框内容高度（IE为height，其他为maxHeight）

* align(Array)

    对齐方式，默认为['bl','tl']   
    
    第一个值标示参考元素的对齐点，第二个值为弹出框对应的对齐点（参考demo中元素的12个点）
            
* offset(Array)

    偏移值，浮层相对于对齐点的偏移[X, Y]，默认为[0, 0]
            
* zIndex(Number)
    
    浮层的zIndex

* viewPort(Boolean)
    
    是否边界检测，默认为true
            
* hocking(Boolean)
    
    鼠标是否跟随移动    

*  delayIn(Number)

   延时出现，单位为毫秒; delayIn为0，标示立即显示，其他为间隔一段时间显示
            
* delayOut(Number)
 
   延时消失，单位为毫秒; delayOut为0，标示立即显示，其他为间隔一段时间隐藏
            
            
* effect(String)

    动画效果，参考<a href="http://docs.kissyui.com/1.4/docs/html/api/anim/index.html" target="_blank">anim</a>
            
* duration(Number)

   动画时间，参考<a href="http://docs.kissyui.com/1.4/docs/html/api/anim/index.html" target="_blank">anim</a>
   
   
   
### Method

* show(elem[, content, maxWidth, maxHeight])
    
    显示提示框

    * elem: 触发元素，必填
    * content：显示内容，可选
    * maxWidth：宽度，可选
    * maxHeight: 高度，可选
        
* isShowing

    提示框是否处于显示，返回true或者false
        
* hide

    隐藏提示框
        
* setContent(o)
    
    设置提示框内容

    * o: 提示框内容信息

* setContentAttr(o)
    
    设置提示框内容读取的元素属性

    o: 私有属性名称
        
* setMaxWidth(o)
    
    设置宽度

    * o: 宽度
        
        
* setMaxHeight(o)
    
    设置高度

    * o: 高度
        
* setAlign(elem)

    设置对齐元素
    
    elem: 对齐元素
               
* setHocking(o)

    是否跟随鼠标移动，如果跟随鼠标移动，则不做边界检测  -- 目前有bug
    
    * o: 是否跟随
      

* 支持 afterHockingChange 、afterMaxWidthChange、afterMaxHeightChange、 afterZIndexChange
            
           
        
        
        

