/*! tooltips 2013-12-06 09:59:33 */
KISSY.add("pi/tooltips/align",function(a,b){function c(a){var b,c=a.ownerDocument,d=c.body,e=q(a).css("position"),f="fixed"==e||"absolute"==e;if(!f)return"html"==a.nodeName.toLowerCase()?null:a.parentNode;for(b=a.parentNode;b&&b!=d;b=b.parentNode)if(e=q(b).css("position"),"static"!=e)return b;return null}function d(a){var b,d,e,f,g={left:0,right:1/0,top:0,bottom:1/0},h=a.ownerDocument,i=q(h).getWindow(),j=h.body,k=h.documentElement;for(b=a;b=c(b);)if((!r.ie||0!=b.clientWidth)&&b!=j&&b!=k&&"visible"!=q(b).css("overflow")){var l=q(b).offset();l.left+=b.clientLeft,l.top+=b.clientTop,g.top=Math.max(g.top,l.top),g.right=Math.min(g.right,l.left+b.clientWidth),g.bottom=Math.min(g.bottom,l.top+b.clientHeight),g.left=Math.max(g.left,l.left)}return d=i.scrollLeft(),e=i.scrollTop(),g.left=Math.max(g.left,d),g.top=Math.max(g.top,e),f={width:i.width(),height:i.height()},g.right=Math.min(g.right,d+f.width),g.bottom=Math.min(g.bottom,e+f.height),g.top>=0&&g.left>=0&&g.bottom>g.top&&g.right>g.left?g:null}function e(a,b,c,d){var e,f,g,h;return e={left:a.left,top:a.top},g=l(b,c[0]),h=l(a,c[1]),f=[h.left-g.left,h.top-g.top],{left:e.left-f[0]+ +d[0],top:e.top-f[1]+ +d[1]}}function f(a,b,c){return a.left<c.left||a.left+b.width>c.right}function g(a,b,c){return a.top<c.top||a.top+b.height>c.bottom}function h(b,c,d){var e=[];return a.each(b,function(a){e.push(a.replace(c,function(a){return d[a]}))}),e}function i(a,b){return a[b]=-a[b],a}function j(){}function k(b){var c,d,e,f=b[0];if(a.isWindow(f)){var g=q(f).getWindow();c={left:g.scrollLeft(),top:g.scrollTop()},d=g.width(),e=g.height()}else c=b.offset(),d=b.outerWidth(),e=b.outerHeight();return c.width=d,c.height=e,c}function l(a,b){var c,d,e=b.charAt(0),f=b.charAt(1),g=a.width,h=a.height;return c=a.left,d=a.top,"c"===e?d+=h/2:"b"===e&&(d+=h),"c"===f?c+=g/2:"r"===f&&(c+=g),{left:c,top:d}}function m(a){a.target==this&&a.newVal&&o.call(this)}function n(){this.get("visible")&&o.call(this)}function o(){this._onSetAlign(this.get("align"))}var p=a.Env.host,q=b.all,r=a.UA;return j.__getOffsetParent=c,j.__getVisibleRectForElement=d,j.ATTRS={align:{value:{}}},j.prototype={__bindUI:function(){var a=this;a.on("beforeVisibleChange",m,a),a.$el.getWindow().on("resize",n,a)},_onSetAlign:function(a){a&&a.points&&this.align(a.node,a.points,a.offset,a.overflow)},align:function(c,j,l,m){c=b.one(c||p),l=l&&[].concat(l)||[0,0],m=m||{};var n=this,o=n.$el,q=0,r=d(o[0]),s=k(o),t=k(c),u=e(s,t,j,l),v=a.merge(s,u);return r&&(m.adjustX||m.adjustY)&&(f(u,s,r)&&(q=1,j=h(j,/[lr]/gi,{l:"r",r:"l"}),l=i(l,0)),g(u,s,r)&&(q=1,j=h(j,/[tb]/gi,{t:"b",b:"t"}),l=i(l,1)),q&&(u=e(s,t,j,l),a.mix(v,u))),n.set({x:v.left,y:v.top},{force:1}),v.width!=s.width&&n.set("width",o.width()+v.width-s.width),v.height!=s.height&&n.set("height",o.height()+v.height-s.height),n.realAlign={node:c,points:j,offset:[v.left,v.top]},n},center:function(a){var b=this;return b.set("align",{node:a,points:["cc","cc"],offset:[0,0]}),b},__destructor:function(){this.$el&&this.$el.getWindow().detach("resize",o,this)}},j},{requires:["node"]});