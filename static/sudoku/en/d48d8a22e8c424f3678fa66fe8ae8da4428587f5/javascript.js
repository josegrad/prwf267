(function(){var a="sproutcore/standard_theme";if(!SC.BUNDLE_INFO){throw"SC.BUNDLE_INFO is not defined!"
}if(SC.BUNDLE_INFO[a]){return}SC.BUNDLE_INFO[a]={requires:["sproutcore/empty_theme"],styles:["/static/sproutcore/standard_theme/en/8b65428a7dcfa2226586b487bde1bf11560de2aa/stylesheet-packed.css","/static/sproutcore/standard_theme/en/8b65428a7dcfa2226586b487bde1bf11560de2aa/stylesheet.css"],scripts:["/static/sproutcore/standard_theme/en/8b65428a7dcfa2226586b487bde1bf11560de2aa/javascript-packed.js"]}
})();
/* @license
==========================================================================
SCSudoku - A SproutCore Sudoku implementation
copyright 2006-2010, M.E. Harris LLC. All rights reserved.
==========================================================================
@license */
Sudoku=SC.Application.create({NAMESPACE:"Sudoku",VERSION:"0.1.0",store:SC.Store.create().from(SC.Record.fixtures),DRAG_INPUT:"drag_input",GIVEN_STATE:"GIVEN_STATE",NOTES_STATE:"NOTES_STATE",HINTS_STATE:"HINTS_STATE",INPUT_STATE:"INPUT_STATE",HAS_VALUE_STATE:"HAS_VALUE_STATE",BOARD_WIDTH:66*9,BOARD_HEIGHT:66*9});
Sudoku.bookmarkController=SC.ArrayController.create({contentBinding:"Sudoku.sudokuController*content.bookmarks",bookmark:function(){console.log("bookmarking...");
var a=Sudoku.sudokuController.get("content");a.createBookmark()},useBookmark:function(){console.log("going back to bookmark");
var a=Sudoku.sudokuController.get("content");a.restoreBookmark()}});Sudoku.cellSelectionController=SC.ObjectController.create({content:null,change:function(){console.log("cell selection controller changed")
}.observes("content")});Sudoku.cellsController=SC.ArrayController.create({contentBinding:"Sudoku.sudokuController.cells"});
Sudoku.clockController=SC.ObjectController.create({seconds:0,paused:YES,init:function(){if(!this._timer){this._timer=SC.Timer.schedule({target:this,action:"tick",repeats:YES,interval:1000,isPaused:YES})
}},pausedDidChange:function(){this._timer.set("isPaused",this.get("paused"))}.observes("paused"),pause:function(){this._timer.set("isPaused",YES)
},go:function(){this._timer.set("isPaused",NO)},tick:function(){this.incrementProperty("seconds")
},computedTime:function(){var d=this.get("seconds");var a=Math.floor(d/3600);var c=Math.floor(d/60)%60;
var b=d%60;if(b<10){b="0%@".fmt(b)}if(c<10){c="0%@".fmt(c)}if(a<10){a="0%@".fmt(a)
}return"%@:%@:%@".fmt(a,c,b)}.property("seconds").cacheable()});Sudoku.NotesController=SC.ObjectController.create({showNotes:NO,toggle:function(){console.log("toggling show notes");
this.toggleProperty("showNotes")}});Sudoku.paneController=SC.ObjectController.create({currentView:null,showInputs:function(a,b){Sudoku.InputView.pane.setDisabled(b);
Sudoku.InputView.pane.popup(a,SC.PICKER_POINTER,[3,0,1,2,3],[9,-9,-14,14]);Sudoku.InputView.pane._cellView=a;
this.set("currentView",a)},toggleNotes:function(){this.get("currentView").toggleProperty("showNotes")
},addValue:function(c){var a=this.get("currentView"),b=a.getPath("content");if(c==""||c=="0"){b.clearNotes();
b.notifyPropertyChange("value")}else{a.getPath("content").addNote(c)}}});Sudoku.SelectedCellController=SC.ObjectController.create({selected:null});
Sudoku.showHintsController=SC.ObjectController.create({content:NO,toggle:function(){this.toggleProperty("content")
},cDidChange:function(){}.observes("content")});Sudoku.ModeController=SC.ObjectController.create({mode:null,modeDidChange:function(){console.log("mode changed [%@]".fmt(this.get("mode")))
}});Sudoku.playingController=SC.ObjectController.create({isPlaying:NO});Sudoku.sudokuController=SC.ObjectController.create({loadBoard:function(){this.set("content",Sudoku.store.find(Sudoku.Sudoku,2))
},generateNew:function(c){console.log("generating new board...");var a=Sudoku.store.createRecord(Sudoku.Sudoku,{});
DLX.generateSudoku(a,c);this.set("content",a)},verify:function(){console.log("verify");
var a=this.get("content").verify();return a},verifyProgress:function(){console.log("verifying the progress");
var a=this.get("content").verifyProgress();return a},showOne:function(){console.log("showing one...");
this.get("content").showOne(YES)},giveUp:function(){console.log("give up");this.get("content").giveUp()
},showErrors:function(){console.log("show Errors");this.get("content").showErrors()
},remainingDidChange:function(){var a=this.get("remaining");if(a===0){Sudoku.Statechart.sendEvent("verify",null,null)
}}.observes("remaining")});
/* @license
==========================================================================
SCSudoku - A SproutCore Sudoku implementation
copyright 2006-2010, M.E. Harris LLC. All rights reserved.
==========================================================================
@license */
Sudoku.Cell=SC.Object.extend({value:null,hints:null,notes:null,given:NO,incorrect:NO,hintsProp:function(){var a=this.get("hints");
if(!a){a=[SC.Object.create({hint:1}),SC.Object.create({hint:2}),SC.Object.create({hint:3}),SC.Object.create({hint:4}),SC.Object.create({hint:5}),SC.Object.create({hint:6}),SC.Object.create({hint:7}),SC.Object.create({hint:8}),SC.Object.create({hint:9})];
this.set("hints",a)}return a}.property("hints").cacheable(),hintsSize:function(){var b=this.get("hintsProp");
var a=0;if(b){b.forEach(function(c){if(c.get("hint")){a++}})}return a}.property("hints").cacheable(),notesDidChange:function(){var a=this.getPath("notes.length");
if(a===1){this.setPath("value",this.get("notes")[0].get("hint"))}else{this.setPath("value","")
}}.observes("*notes.length"),clearNotes:function(){this.set("notes",[])},addNote:function(c){var a=this.get("notes");
if(!a){a=[];this.set("notes",a)}var b=null;a.forEach(function(d){if(c==d.get("hint")){b=d
}});if(b===null){a.pushObject(SC.Object.create({hint:c}))}else{a.removeObject(b);
if(a.get("length")===0){this.notifyPropertyChange("value")}}this.notifyPropertyChange("notes")
},hasValue:function(){var b=this.get("value");var a=/^\d$/.test("%@".fmt(b));return a
}.property("value").cacheable(),hasNotes:function(){var a=this.getPath("notes.length");
if(a>0){return YES}else{return NO}}.property("*notes.length"),valuechanged:function(){this.set("incorrect",NO)
}.observes("value")});Sudoku.Sudoku=SC.Record.extend({cells:SC.Record.attr(Array),bookmarks:[],solution:null,seed:null,givens:null,answered:null,init:function(){},verify:function(){var a=this.get("solution");
var c=this.get("cells");var b=true;c.forEach(function(d,f){var e=d.get("index");var j=d.get("value");
for(var g=0;g<a.length;g++){var k=a.get(g);var h=k.assembleMetadata();if(e===h.i){if(j!=h.n){b=false
}break}}});return b},verifyProgress:function(){var a=this.get("solution");var c=this.get("cells");
var b=true;c.forEach(function(d,f){if(/^\d$/.test(d.get("value"))){var e=d.get("index");
var j=d.get("value");for(var g=0;g<a.length;g++){var k=a.get(g);var h=k.assembleMetadata();
if(e===h.i){if(j!=h.n){b=false}break}}}});return b},showOne:function(e){var b=this.get("solution"),c=this.get("cells");
for(var d=0;d<b.length;d++){var g=b.get(d);var f=g.assembleMetadata();var a=c.get(f.i);
if(!a.get("given")&&!/^\d$/.test(a.get("value"))){a.set("value",f.n);if(e){break}}}},showErrors:function(){var a=this.get("solution");
var b=this.get("cells");b.forEach(function(c,e){if(c.get("given")){return}if(/^\d$/.test(c.get("value"))){var d=c.get("index");
var h=c.get("value");for(var f=0;f<a.length;f++){var j=a.get(f);var g=j.assembleMetadata();
if(d===g.i){if(h!=g.n){c.set("incorrect",YES)}break}}}})},giveUp:function(){this.beginPropertyChanges();
this.showOne(NO);this.endPropertyChanges()},setUpCells:function(){var a=this;if(this._cells){this._cells.removeObserver("[]",this,this.valuesChanged)
}this._cells=this.get("cells");if(this._cells){this._cells.addObserver("[]",this,this.valuesChanged);
this._cells.forEach(function(b,c){if(b&&b.addObserver){b.addObserver("value",function(){a.valuesChanged(b)
});b.set("index",c)}})}this.valuesChanged()}.observes("cells"),valuesChanged:function(a){this.updateMetadata();
this.calculateHints(a)},updateMetadata:function(){var a=this.get("cells"),b=0,c=0;
if(a){a.forEach(function(d){var g=d.get("given");if(g){b++}else{var f=d.get("value"),e="%@".fmt(f);
if(e.match(/\d/)){c++}}})}this.set("givens",b);this.set("answered",c)},remaining:function(){var a=this.get("givens"),b=this.get("answered");
return 81-a-b}.property("givens","answered").cacheable(),statusObserver:function(){}.observes("status"),setCells:function(){Sudoku.Sudoku.convertSolutionToBoard(this.get("seed"),this)
}.observes("seed"),createBookmark:function(){var a=this.get("cells");var b=[];a.forEach(function(d){var c=Sudoku.Cell.create({value:d.get("value"),given:d.get("given"),index:d.get("index")});
b.push(c)});this.get("bookmarks").pushObject(b)},restoreBookmark:function(){var a=this.get("bookmarks");
if(a.length<1){return}this.set("cells",a.popObject())},print:function(){var a=this.get("cells");
var b="";a.forEach(function(c){var e=c.get("value"),d=c.get("entered");b+="SC.Object.create({value: '%@', entered: %@}),".fmt(e,d)
});console.log(b)},getRow:function(d){var b=(d-1)*9,c=this.get("cells"),e=[];for(var a=b;
a<b+9;a++){e.push(c.objectAt(a))}return e},getRowForIndex:function(a){if(a<9){return this.getRow(1)
}else{if(a>=9&&a<18){return this.getRow(2)}else{if(a>=18&&a<27){return this.getRow(3)
}else{if(a>=27&&a<36){return this.getRow(4)}else{if(a>=36&&a<45){return this.getRow(5)
}else{if(a>=45&&a<54){return this.getRow(6)}else{if(a>=54&&a<63){return this.getRow(7)
}else{if(a>=63&&a<72){return this.getRow(8)}else{if(a>=72&&a<81){return this.getRow(9)
}}}}}}}}}},getColumn:function(e){var d=this.get("cells"),f=[];var g=0;for(var b=e;
g<9;b+=9){g++;var a=d.objectAt(b);f.push(a)}return f},getColumnForIndex:function(a){return this.getColumn((a%9))
},getRegion:function(c){var e=[],b=this.get("cells"),f=[];var d=function(k,l){for(var j=0;
j<k.length;j++){var h=k.objectAt(j);if(h==l){return true}}return false};if(d([0,1,2,9,10,11,18,19,20],c)){e=[0,1,2,9,10,11,18,19,20]
}else{if(d([3,4,5,12,13,14,21,22,23],c)){e=[3,4,5,12,13,14,21,22,23]}else{if(d([6,7,8,15,16,17,24,25,26],c)){e=[6,7,8,15,16,17,24,25,26]
}else{if(d([27,28,29,36,37,38,45,46,47],c)){e=[27,28,29,36,37,38,45,46,47]}else{if(d([30,31,32,39,40,41,48,49,50],c)){e=[30,31,32,39,40,41,48,49,50]
}else{if(d([33,34,35,42,43,44,51,52,53],c)){e=[33,34,35,42,43,44,51,52,53]}else{if(d([54,55,56,63,64,65,72,73,74],c)){e=[54,55,56,63,64,65,72,73,74]
}else{if(d([57,58,59,66,67,68,75,76,77],c)){e=[57,58,59,66,67,68,75,76,77]}else{if(d([60,61,62,69,70,71,78,79,80],c)){e=[60,61,62,69,70,71,78,79,80]
}}}}}}}}}for(var a=0;a<e.length;a++){var g=e.objectAt(a);f.push(b.objectAt(g))}return f
},getRegionForIndex:function(a){},calculateHints:function(a){if(a){this.calculateLimitedHints(a)
}else{this.calculateAllHints()}},calculateLimitedHints:function(a){var f=this.getRowForIndex(a.get("index"));
var c=this.getColumnForIndex(a.get("index"));var d=this.getRegion(a.get("index"));
var b=[];b.pushObjects(f);b.pushObjects(c);b.pushObjects(d);var e="";b.forEach(function(g){e+="%@".fmt(g.get("value"))
});this.calculateHintsForSpecificCells(b)},calculateAllHints:function(){var a=this.get("cells");
if(a){this.calculateHintsForSpecificCells(a)}},calculateHintsForSpecificCells:function(b){var d=this;
var c=function(g,h){for(var f=0;f<g.length;f++){var e=g.objectAt(f);if(e==h){return true
}}return false};var a=function(f){var e=[];f.forEach(function(g){e.push(g.get("value"))
});return e};var d=this;b.forEach(function(s){var n=s.get("given");if(!n){var p=s.get("index");
var r=s.get("value"),j="%@".fmt(r);var g=d.getRowForIndex(p);var u=d.getColumnForIndex(p);
var h=d.getRegion(p);var t=a(g);var q=a(u);var e=a(h);var f=[];var l=[1,2,3,4,5,6,7,8,9];
for(var o=0;o<l.length;o++){var k=c(t,o+1);if(k){l.replace(o,1,[""])}}for(var o=0;
o<l.length;o++){var k=c(q,o+1);if(k){l.replace(o,1,[""])}}for(var o=0;o<l.length;
o++){var k=c(e,o+1);if(k){l.replace(o,1,[""])}}for(var o=0;o<l.length;o++){var m=SC.Object.create({hint:l.objectAt(o)});
f.push(m)}s.set("hints",f);s.notifyPropertyChange("hints",f);s.notifyPropertyChange("hintsProp",f);
s.notifyPropertyChange("hintsSize")}})}});SC.mixin(Sudoku.Sudoku,{convertSolutionToBoard:function(a,c){var d=[];
a.forEach(function(h,e){var f=h.assembleMetadata();var e=f.i;var g=f.n;d[e]=Sudoku.Cell.create({value:g,row:h,given:YES,index:e})
});for(var b=0;b<81;b++){if(d[b]===null||d[b]===undefined){d[b]=Sudoku.Cell.create({value:"",given:NO,notes:[]})
}}c.set("cells",d)}});Sudoku.competitivePane=SC.MenuPane.extend({hasTouchIntercept:YES,defaultResponder:Sudoku.Statechart,isEnabled:YES,itemHeight:24,items:[{title:"Generate New",subMenu:[{title:"Easy - 40 Givens",action:"generateNew40",keyEquivalent:"ctrl_shift_n"},{title:"Medium - 35 Givens",action:"generateNew35",keyEquivalent:"ctrl_shift_n"},{title:"Hard - 30 Givens",action:"generateNew30",keyEquivalent:"ctrl_shift_n"},{title:"Insane",action:"generateNew",keyEquivalent:"ctrl_shift_n"}]},{isSeparator:YES},{title:"Create Bookmark",isChecked:YES,target:"Sudoku.bookmarkController",action:"bookmark",keyEquivalent:"ctrl_shift_b"},SC.Object.create({target:"Sudoku.bookmarkController",action:"useBookmark",lengthBinding:"Sudoku.sudokuController.bookmarks.length",lengthBindingDefault:SC.Binding.oneWay(),title:function(){var a=this.get("length");
if(a===undefined){a=0}return"Go Back (%@ exist)".fmt(a)}.property("length").cacheable(),isEnabled:function(){var a=this.get("length");
if(a>0){return YES}return NO}.property("length").cacheable()}),{isSeparator:YES},SC.Object.create({title:"Verify Solution",target:"Sudoku.sudokuController",action:"verify",isEnabledBinding:SC.Binding.from("Sudoku.sudokuController*remaining").transform(function(a){if(a===0){return true
}return false}).oneWay()}),{isSeparator:YES}],layout:{width:200},contentView:SC.View.extend({layout:{width:150,height:200}})});
Sudoku.competitivePane.pane=Sudoku.competitivePane.create();Sudoku.competitivePane.anyWherePane=Sudoku.competitivePane.create();
Sudoku.InputNumberView=SC.View.extend({value:null,classNames:"sudoku-input-view",createChildViews:function(){var b=[],a;
a=this.createChildView(SC.LabelView,{classNames:"sudoku-input-value",textAlign:SC.ALIGN_CENTER,value:this.get("value")});
b.push(a);this.set("childViews",b)},mouseEntered:function(a){this.getPath("parentView.parentView").set("currentView",this);
return YES},mouseExited:function(a){return YES},mouseDown:function(a){this.$().addClass("glow");
return YES},mouseUp:function(a){this.touchEnd(a);this.$().removeClass("glow");return YES
},touchStart:function(a){this.getPath("parentView.parentView").set("currentView",this);
return YES},touchEnd:function(a){Sudoku.paneController.addValue(this.get("value"))
}});sc_require("views/input_number");Sudoku.InputView=SC.Page.design({pane:SC.PickerPane.design(SC.Animatable,{transitions:{opacity:{duration:0.5,timing:SC.Animatable.TRANSITION_CSS_EASE_IN_OUT}},acceptsFirstResponder:YES,hasTouchIntercept:YES,layout:{height:298,width:226},contentView:SC.View.design({layout:{centerX:0,centerY:0,width:204,height:272},childViews:["input1","input2","input3","input4","input5","input6","input7","input8","input9","clear","noteToggle","cancel"],input1:Sudoku.InputNumberView.design({layout:{top:0,left:0,height:66,width:66},value:1,left:null,rightBinding:"*parentView.input2",up:null,downBinding:"*parentView.input4"}),input2:Sudoku.InputNumberView.design({layout:{top:0,left:68,height:66,width:66},value:2,leftBinding:"*parentView.input1",rightBinding:"*parentView.input3",up:null,downBinding:"*parentView.input5"}),input3:Sudoku.InputNumberView.design({layout:{top:0,left:136,height:66,width:66},value:3,leftBinding:"*parentView.input2",rightBinding:"*parentView.input4",up:null,downBinding:"*parentView.input6"}),input4:Sudoku.InputNumberView.design({layout:{top:68,left:0,height:66,width:66},value:4,leftBinding:"*parentView.input3",rightBinding:"*parentView.input5",upBinding:"*parentView.input1",downBinding:"*parentView.input7"}),input5:Sudoku.InputNumberView.design({layout:{top:68,left:68,height:66,width:66},value:5,leftBinding:"*parentView.input4",rightBinding:"*parentView.input6",upBinding:"*parentView.input2",downBinding:"*parentView.input8"}),input6:Sudoku.InputNumberView.design({layout:{top:68,left:136,height:66,width:66},value:6,leftBinding:"*parentView.input5",rightBinding:"*parentView.input7",upBinding:"*parentView.input3",downBinding:"*parentView.input9"}),input7:Sudoku.InputNumberView.design({layout:{top:136,left:0,height:66,width:66},value:7,leftBinding:"*parentView.input6",rightBinding:"*parentView.input8",upBinding:"*parentView.input4",downBinding:"*parentView.noteToggle"}),input8:Sudoku.InputNumberView.design({layout:{top:136,left:68,height:66,width:66},value:8,leftBinding:"*parentView.input7",rightBinding:"*parentView.input9",upBinding:"*parentView.input5",downBinding:"*parentView.clear"}),input9:Sudoku.InputNumberView.design({layout:{top:136,left:136,height:66,width:66},value:9,leftBinding:"*parentView.input8",rightBinding:"*parentView.noteToggle",upBinding:"*parentView.input6",downBinding:"*parentView.cancel"}),noteToggle:SC.View.design({layout:{top:204,left:0,height:66,width:66},classNames:"sudoku-input-view".w(),showNotesBinding:"Sudoku.paneController*currentView.showNotes",childViews:"icon".w(),icon:SC.View.design({classNames:"notes-icon",layout:{centerX:0,centerY:0,height:40,width:40,zIndex:9}}),leftBinding:"*parentView.input9",rightBinding:"*parentView.clear",upBinding:"*parentView.input7",down:null,mouseDown:function(){this.$().addClass("glow");
return YES},mouseUp:function(){this.$().removeClass("glow");Sudoku.paneController.toggleNotes();
return YES},touchStart:function(){this.$().addClass("glow");return YES},touchEnd:function(){this.$().removeClass("glow");
Sudoku.paneController.toggleNotes();return YES},mouseEntered:function(a){console.log("mouse entered");
this.getPath("parentView.parentView").set("currentView",this);return YES}}),clear:Sudoku.InputNumberView.design({classNames:"clear-icon",value:"",layout:{top:204,left:68,height:66,width:66},leftBinding:"*parentView.noteToggle",rightBinding:"*parentView.cancel",upBinding:"*parentView.input8",down:null}),cancel:SC.View.design({layout:{top:204,left:136,height:66,width:66,zIndex:10},classNames:"sudoku-input-view",childViews:"icon".w(),icon:SC.View.design({classNames:"close-icon",layout:{centerX:0,centerY:0,height:40,width:40,zIndex:9}}),leftBinding:"*parentView.clear",right:null,upBinding:"*parentView.input9",down:null,mouseDown:function(){return YES
},mouseUp:function(){this.getPath("parentView.parentView").remove();return YES},mouseEntered:function(a){this.getPath("parentView.parentView").set("currentView",this);
return YES},touchStart:function(){return YES},touchEnd:function(){this.getPath("parentView.parentView").remove();
return YES}})}),setDisabled:function(a){if(a){var b=this;a.forEach(function(f,e){var d=f.get("hint");
var c=b.getPath("contentView.input%@".fmt(e+1));if(!/^\d$/.test("%@".fmt(d))){c.$().addClass("disabled");
c.set("isEnabled",NO);c.set("isVisible",NO)}else{}})}},popup:function(){this.set("currentView",this.getPath("pane.contentView.input1"));
this.notifyPropertyChange("currentView");this._previousView=this.getPath("pane.contentView.input1");
arguments.callee.base.apply(this,arguments)},remove:function(){this.disableAnimation();
this.adjust("opacity",1).updateStyle();this.enableAnimation();arguments.callee.base.apply(this,arguments);
var b=this.getPath("contentView.childViews");b.forEach(function(c){c.$().removeClass("disabled");
c.set("isEnabled",YES);c.set("isVisible",YES)});var a=this.get("currentView");if(a){a.$().removeClass("input-highlight")
}if(this._cellView){this._cellView.removeInputs()}},keyDown:function(a){var c=a.which,d=NO;
if(c===SC.Event.KEY_LEFT){this.goLeft();d=YES}else{if(c===SC.Event.KEY_RIGHT){this.goRight();
d=YES}else{if(c===SC.Event.KEY_UP){this.goUp();d=YES}else{if(c===SC.Event.KEY_DOWN){this.goDown();
d=YES}else{if(c===SC.Event.KEY_RETURN){var b=this.get("currentView");b.mouseDown();
d=YES}else{if(c===SC.Event.KEY_ESC){this.remove();d=YES}else{if(c>=48&&c<=57){var e=SC.PRINTABLE_KEYS[c];
if(e==0){e=""}Sudoku.paneController.addValue(e);d=YES}else{a.allowDefault()}}}}}}}return d
},keyUp:function(a){var c=a.which;if(c===SC.Event.KEY_RETURN){var b=this.get("currentView");
b.mouseUp();return YES}return YES},goLeft:function(){var a=this.get("currentView");
if(!a.left){return}this._previousView=a;this.set("currentView",a.left)},goRight:function(){var a=this.get("currentView");
if(!a.right){return}this._previousView=a;this.set("currentView",a.right)},goDown:function(){var a=this.get("currentView");
if(!a.down){return}this._previousView=a;this.set("currentView",a.down)},goUp:function(){var a=this.get("currentView");
if(!a.up){return}this._previousView=a;this.set("currentView",a.up)},mouseEntered:function(a){this.adjust("opacity",1);
return YES},mouseExited:function(a){this.adjust("opacity",0.1)},highlightCurrent:function(){var a=this.get("currentView");
if(this._previousView){this._previousView.$().removeClass("input-highlight")}this._previousView=a;
a.$().addClass("input-highlight")}.observes("currentView")})});Sudoku.InputView.pane=Sudoku.InputView.pane.create();
Sudoku.MessageView=SC.Page.design({pane:SC.SheetPane.design({layout:{height:50,width:400,centerX:0,centerY:0},contentView:SC.View.design({layout:{top:0,left:0,height:100,width:400,zIndex:10},childViews:["message"],message:SC.LabelView.design({layout:{top:0,left:0,height:90,width:300,zIndex:1100},textAlign:SC.ALIGN_CENTER,valueBinding:"Sudoku.MessageView.value",valueBindingDefault:SC.Binding.oneWay()})})}),setValue:function(a){this.set("value",a)
}});Sudoku.MessageView.pane=Sudoku.MessageView.pane.create();Sudoku.MessageView.remove=function(){setTimeout(function(){SC.RunLoop.begin();
Sudoku.MessageView.pane.remove();SC.RunLoop.end()},1000)};Sudoku.tutorPane=SC.MenuPane.extend({hasTouchIntercept:YES,defaultResponder:Sudoku.Statechart,isEnabled:YES,itemHeight:24,items:[{title:"Generate New",subMenu:[{title:"Easy - 40 Givens",action:"generateNew40",keyEquivalent:"ctrl_shift_n"},{title:"Medium - 35 Givens",action:"generateNew35",keyEquivalent:"ctrl_shift_n"},{title:"Hard - 30 Givens",action:"generateNew30",keyEquivalent:"ctrl_shift_n"},{title:"Insane",action:"generateNew",keyEquivalent:"ctrl_shift_n"}]},{isSeparator:YES},SC.Object.create({title:"Show Hints",checkboxBinding:"Sudoku.showHintsController.content",target:"Sudoku.showHintsController",action:"toggle",keyEquivalent:"ctrl_shift_h",isEnabledBinding:"Sudoku.playingController.isPlaying"}),{isSeparator:YES},SC.Object.create({title:"Uncover One",target:"Sudoku.sudokuController",action:"showOne",keyEquivalent:"ctrl_shift_o",isEnabledBinding:"Sudoku.playingController.isPlaying"}),SC.Object.create({title:"Uncover Board",target:"Sudoku.sudokuController",action:"giveUp",isEnabledBinding:"Sudoku.playingController.isPlaying"}),{isSeparator:YES},SC.Object.create({title:"Show Errors",isChecked:YES,target:"Sudoku.sudokuController",action:"showErrors",isEnabledBinding:"Sudoku.playingController.isPlaying"})],layout:{width:200},contentView:SC.View.extend({layout:{width:150,height:200}})});
Sudoku.tutorPane.pane=Sudoku.tutorPane.create();Sudoku.tutorPane.anyWherePane=Sudoku.tutorPane.create();
Sudoku.Statechart=SC.Object.create(Ki.StatechartManager,{rootState:Ki.State.design({initialSubstate:"demo",demo:Ki.State.design({enterState:function(){Sudoku.mainPage.mainPane.mask.set("isVisible",YES);
Sudoku.clockController.set("paused",YES);Sudoku.mainPage.mainPane.mask.message.set("value","");
var a=this;var b=SC.PanelPane.create({layout:{width:400,height:100,centerX:0,centerY:0},classNames:"sc-alert".w(),contentView:SC.View.extend({childViews:["message","ok"],message:SC.LabelView.design({layout:{top:8,centerX:0,height:22,width:370},escapeHTML:NO,value:'This is a demo.  You can play one game at each level. To see the product page, click <a class="normal" style: "color:blue" href="https://chrome.google.com/webstore/detail/ifaabgmcffhggbfgjknkgenljelbocin">here</a>.'}),ok:SC.ButtonView.design({layout:{bottom:10,right:10,width:80,height:22},theme:"capsule",title:"Ok",target:this,action:function(){console.log("closing demo");
this.getPath("parentView.parentView").remove();a.gotoState("play")}})})});b.append()
}}),play:Ki.State.design({initialSubstate:"tutor",competitive:Ki.State.design({enterState:function(){console.log("entering competetive");
Sudoku.ModeController.set("mode","competitive");Sudoku.mainPage.mainPane.controlsView.menu.configureForCompetitive();
Sudoku.showHintsController.get("content",NO);Sudoku.mainPage.mainPane.board.board.becomeFirstResponder()
},tutorMode:function(){console.log("entering tutor");this.gotoState("tutor")},keyDown:function(a){var b=a.which,c=NO;
console.log("competitive key down [%@]".fmt(b));return c},keyUp:function(){return NO
}}),tutor:Ki.State.design({enterState:function(){console.log("entering tutor");Sudoku.ModeController.set("mode","tutor");
Sudoku.mainPage.mainPane.mask.message.set("value","Click the Start Game button to begin.");
Sudoku.mainPage.mainPane.board.board.set("isEnabled",YES);Sudoku.mainPage.mainPane.controlsView.menu.configureForTutor();
Sudoku.mainPage.mainPane.board.board.becomeFirstResponder()},competitiveMode:function(){this.gotoState("competitive")
}}),startFinalVerification:Ki.State.design({enterState:function(){console.log("beginning final verification");
Sudoku.mainPage.mainPane.mask.set("isVisible",YES);Sudoku.clockController.set("paused",YES);
Sudoku.mainPage.mainPane.mask.message.set("value","");var a=this;var b=SC.Object.create({alertPaneDidDismiss:function(d,c){switch(c){case SC.BUTTON1_STATUS:d.remove();
a.gotoState("doFinalVerification");break;case SC.BUTTON2_STATUS:d.remove();Sudoku.clockController.set("paused",NO);
Sudoku.mainPage.mainPane.mask.set("isVisible",NO);break}}});SC.AlertPane.info("If you are done, click Yes.  If you want to review your solution, click No, and click the verify button when done.","","","Yes","No","",b).append()
}}),doFinalVerification:Ki.State.design({enterState:function(){console.log("doing final verification");
var a=Sudoku.sudokuController.verify();var c="Your solution is correct! You can review the board.  Generate a new game when ready.";
if(!a){c="You have some errors....You can review the board.  Create a new game when ready."
}var b=this;var d=SC.Object.create({alertPaneDidDismiss:function(f,e){switch(e){case SC.BUTTON1_STATUS:f.remove();
b.gotoState("boardLocked");break}}});SC.AlertPane.info(c,"","","Ok","","",d).append()
}}),boardLocked:Ki.State.design({enterState:function(){console.log("locking board state");
Sudoku.sudokuController.showErrors();Sudoku.playingController.set("isPlaying",NO);
Sudoku.mainPage.mainPane.board.board.set("isEnabled",NO);Sudoku.mainPage.mainPane.mask.set("isVisible",NO)
}}),generatingNew:Ki.State.design({enterState:function(){console.log("entering generate new state");
Sudoku.mainPage.mainPane.mask.set("isVisible",YES);Sudoku.clockController.set("paused",YES);
Sudoku.mainPage.mainPane.mask.message.set("value","");var b=Sudoku.Statechart._givens;
var a=this;var c=SC.Object.create({alertPaneDidDismiss:function(e,d){switch(d){case SC.BUTTON1_STATUS:Sudoku.showHintsController.set("content",NO);
Sudoku.clockController.set("seconds",0);Sudoku.clockController.set("paused",YES);
Sudoku.playingController.set("isPlaying",NO);Sudoku.mainPage.mainPane.mask.set("isVisible",YES);
Sudoku.mainPage.mainPane.mask.message.set("value","Click the Start Game button to begin.");
Sudoku.mainPage.mainPane.controlsView.startpause.set("title","Start");Sudoku.sudokuController.generateNew(b);
a.gotoState("tutor");break;case SC.BUTTON2_STATUS:Sudoku.mainPage.mainPane.mask.set("isVisible",NO);
Sudoku.clockController.set("paused",NO);break}}});SC.AlertPane.plain("Game progress will be lost forever (and ever), are you sure you want to continue?","","","Yeah!","Nope","",c).append()
}}),enterState:function(){console.log("entering readyState");Sudoku.mainPage.mainPane.board.becomeFirstResponder()
},verifyProgress:function(){console.log("state chart verify progress");var a=Sudoku.sudokuController.verifyProgress();
var b="Good So Far!!";if(!a){b="Houston we have a problem..."}var c=SC.Object.create({alertPaneDidDismiss:function(e,d){switch(d){case SC.BUTTON1_STATUS:e.remove();
break}}});SC.AlertPane.info(b,"","","Ok","","",c).append()},verify:function(){console.log("state chart verify solution");
this.gotoState("startFinalVerification")},toggleTimer:function(){console.log("toggling timer");
var a=Sudoku.clockController.get("paused");if(a){Sudoku.clockController.toggleProperty("paused");
Sudoku.playingController.set("isPlaying",YES);Sudoku.mainPage.mainPane.controlsView.startpause.set("title","Pause Game");
Sudoku.mainPage.mainPane.mask.set("isVisible",NO);Sudoku.mainPage.mainPane.board.board.becomeFirstResponder()
}else{Sudoku.clockController.toggleProperty("paused");Sudoku.playingController.set("isPlaying",NO);
Sudoku.mainPage.mainPane.controlsView.startpause.set("title","Resume Game");Sudoku.mainPage.mainPane.mask.message.set("value","Game Paused. Click Resume Game to continue.");
Sudoku.mainPage.mainPane.mask.set("isVisible",YES);Sudoku.mainPage.mainPane.becomeFirstResponder()
}},showOptionsMenu:function(a){console.log("show options menu %@".fmt(a));this.gotoState("showOptionsState")
},generateNew40:function(){console.log("generate new 40");Sudoku.Statechart._givens=40;
this.gotoState("generatingNew")},generateNew35:function(){Sudoku.Statechart._givens=35;
console.log("generate new 35");this.gotoState("generatingNew")},generateNew30:function(){Sudoku.Statechart._givens=30;
console.log("generate new 20");this.gotoState("generatingNew")},generateNew:function(){Sudoku.Statechart._givens=null;
console.log("generate new");this.gotoState("generatingNew")}}),keyDown:function(a){var b=a.which,c=NO;
console.log("key down [%@]".fmt(b));return c},enterState:function(){console.log("entering rootState")
},exitState:function(){console.log("exiting readyState")}})});Sudoku.Statechart._givens=40;
function DLXNode(a){this.left=this;this.right=this;this.up=this;this.down=this;this.head=a;
this.metadata=null;this.rowIndex=null}DLXNode.prototype.rowContains=function(d){if(d===this){return true
}var c=0;var b=false;for(var a=this.right;a!==this;a=a.right){if(d===a){b=true;break
}c++;if(c>10){console.log("EMERGENCY BREAK");break}}return b};DLXNode.prototype.rowSize=function(){var a=1;
for(var b=this.right;b!==this;b=b.right){a++}return a};DLXNode.prototype.putMetadataOnRow=function(b){this.metadata=b;
for(var a=this.right;a!==this;a=a.right){a.metadata=b}};DLXNode.prototype.print=function(){var b="%@ ".fmt(this.head.name);
for(var a=this.right;a!=this;a=a.right){b+="%@ ".fmt(a.head.name)}console.log("constraint [%@]".fmt(b))
};DLXNode.prototype.assembleMetadata=function(){var a={};var e=this.head.metadata;
if(e&&e.r){a.r=e.r}if(e&&e.c){a.c=e.c}if(e&&e.n){a.n=e.n}if(e&&e.i){a.i=e.i}a.rowIndex=this.rowIndex;
for(var d=this.right;d!==this;d=d.right){e=d.head.metadata;if(e&&e.r){a.r=e.r}if(e&&e.c){a.c=e.c
}if(e&&e.n){a.n=e.n}if(e&&e.i){a.i=e.i}}var f=a.r;var g=a.c;var b;if(f==1&&g==1){b=0
}else{if(f==1&&g==2){b=1}else{if(f==1&&g==3){b=2}else{if(f==1&&g==4){b=3}else{if(f==1&&g==5){b=4
}else{if(f==1&&g==6){b=5}else{if(f==1&&g==7){b=6}else{if(f==1&&g==8){b=7}else{if(f==1&&g==9){b=8
}else{if(f==2&&g==1){b=9}else{if(f==2&&g==2){b=10}else{if(f==2&&g==3){b=11}else{if(f==2&&g==4){b=12
}else{if(f==2&&g==5){b=13}else{if(f==2&&g==6){b=14}else{if(f==2&&g==7){b=15}else{if(f==2&&g==8){b=16
}else{if(f==2&&g==9){b=17}else{if(f==3&&g==1){b=18}else{if(f==3&&g==2){b=19}else{if(f==3&&g==3){b=20
}else{if(f==3&&g==4){b=21}else{if(f==3&&g==5){b=22}else{if(f==3&&g==6){b=23}else{if(f==3&&g==7){b=24
}else{if(f==3&&g==8){b=25}else{if(f==3&&g==9){b=26}else{if(f==4&&g==1){b=27}else{if(f==4&&g==2){b=28
}else{if(f==4&&g==3){b=29}else{if(f==4&&g==4){b=30}else{if(f==4&&g==5){b=31}else{if(f==4&&g==6){b=32
}else{if(f==4&&g==7){b=33}else{if(f==4&&g==8){b=34}else{if(f==4&&g==9){b=35}else{if(f==5&&g==1){b=36
}else{if(f==5&&g==2){b=37}else{if(f==5&&g==3){b=38}else{if(f==5&&g==4){b=39}else{if(f==5&&g==5){b=40
}else{if(f==5&&g==6){b=41}else{if(f==5&&g==7){b=42}else{if(f==5&&g==8){b=43}else{if(f==5&&g==9){b=44
}else{if(f==6&&g==1){b=45}else{if(f==6&&g==2){b=46}else{if(f==6&&g==3){b=47}else{if(f==6&&g==4){b=48
}else{if(f==6&&g==5){b=49}else{if(f==6&&g==6){b=50}else{if(f==6&&g==7){b=51}else{if(f==6&&g==8){b=52
}else{if(f==6&&g==9){b=53}else{if(f==7&&g==1){b=54}else{if(f==7&&g==2){b=55}else{if(f==7&&g==3){b=56
}else{if(f==7&&g==4){b=57}else{if(f==7&&g==5){b=58}else{if(f==7&&g==6){b=59}else{if(f==7&&g==7){b=60
}else{if(f==7&&g==8){b=61}else{if(f==7&&g==9){b=62}else{if(f==8&&g==1){b=63}else{if(f==8&&g==2){b=64
}else{if(f==8&&g==3){b=65}else{if(f==8&&g==4){b=66}else{if(f==8&&g==5){b=67}else{if(f==8&&g==6){b=68
}else{if(f==8&&g==7){b=69}else{if(f==8&&g==8){b=70}else{if(f==8&&g==9){b=71}else{if(f==9&&g==1){b=72
}else{if(f==9&&g==2){b=73}else{if(f==9&&g==3){b=74}else{if(f==9&&g==4){b=75}else{if(f==9&&g==5){b=76
}else{if(f==9&&g==6){b=77}else{if(f==9&&g==7){b=78}else{if(f==9&&g==8){b=79}else{if(f==9&&g==9){b=80
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}a.i=b;
return a};sc_require("system/dlx_node");function DLXColumnNode(a){DLXNode.call(this);
this.size=0;this.name=a;this.covered=false}DLXColumnNode.prototype=new DLXNode(null);
DLXColumnNode.prototype.constructor=DLXColumnNode;DLXColumnNode.prototype.addContentNode=function(c,a){var b=new DLXNode(a);
if(c!==null){b.left=c;b.right=c.right;b.left.right=b;b.right.left=b}else{b.left=b;
b.right=b;this.rows.push(b)}a.size++;b.down=a;b.up=a.up;b.up.down=b;b.down.up=b;return b
};DLXColumnNode.prototype.calculateSize=function(){var a=0;for(var b=this.down;b!==this;
b=b.down){a++}this.size=a};DLXColumnNode.prototype.calculateSize=function(){var a=0;
for(var b=this.down;b!==this;b=b.down){a++}this.size,a};sc_require("system/dlx_node");
sc_require("system/dlx_column_node");function DLXRootNode(){DLXColumnNode.call(this);
this.columns=[];this.rows=[]}DLXRootNode.prototype=new DLXColumnNode(null);DLXRootNode.prototype.constructor=DLXRootNode;
DLXRootNode.prototype.addColumnNode=function(a,b){var c=new DLXColumnNode(a);c.metadata=b;
c.right=this;c.left=this.left;c.right.left=c;c.left.right=c;c.up=c;c.down=c;this.columns.push(c);
return c};DLXRootNode.prototype.addRowByColumnIndexes=function(c,d){var a=null;var b=[];
c.forEach(function(f){var e=this.columns.objectAt(f);if(!e){throw ("column is null when adding row...")
}a=this.addContentNode(a,e);a.rowIndex=d;b.push(a)},this);return b};DLXRootNode.prototype.getColumnLowestSize=function(){var a=this.right;
var b=this.right.size;for(var d=this.right;d!==this;d=d.right){if(d.size>0&&d.size<b){b=d.size;
a=d;if(b===1||b===0){break}}}return a};DLXRootNode.prototype.verify=function(){var b=0;
var c=[];for(var a=this.right;a!==this;a=a.right){b++;if(a.size!=9){c.push(a.size)
}}if(b!==324||c.length!==0){throw ("matrix fucked: [%@] [%@] [%@]".fmt(b,c.length,c))
}};DLXRootNode.prototype.print=function(){var b=0;var c=[];for(var a=this.right;a!==this;
a=a.right){b++;if(a.size!=9){c.push(a.size)}}console.log("matrix data: [%@] [%@] [%@]".fmt(b,c.length,c))
};sc_require("system/dlx_node");sc_require("system/dlx_column_node");sc_require("system/dlx_root_node");
function DLX(){}DLX.generateSudoku=function(j,a){var q=DLX.initiateDancingLinks();
var r=[];var e=[];if(a===40){e=[1,8,7,6,3,4,2,9,5]}else{if(a===35){e=[8,9,3,6,1,2,5,4,7]
}else{if(a===30){e=[2,6,9,4,5,3,7,1,8]}else{e=[4,3,2,8,9,7,6,1,5]}}}console.log("random seed [%@]".fmt(e));
var m=q.rows;var o=[];e.forEach(function(F,D){for(var z=0;z<m.length;z++){var E=m[z];
var C=E.assembleMetadata();if(C.n===F&&C.i===D){var B=E.head;DLX.cover(B);o.push(E);
for(var A=E.right;A!=E;A=A.right){DLX.cover(A.head)}break}}});var f=new Date();DLX.startDancing(q,o,0,r,1);
var x=new Date();var c=(x.valueOf()-f.valueOf())/1000;console.log("GENERATED INITIAL BOARD IN [%@]".fmt(c));
DLX.uncoverInitialConstraints(o);q.verify();o=r[0];if(o===null||o.length!==81){throw ("FAILED TO GENERATE INITIAL PUZZLE")
}var p=[34,18,14,10,27,3,63,38,73,9,11,67,75,52,5,21,45,53,76,57,28,30,35,65,79,31,6,32,16,40,60,55,1,49,22,24,20,59,62,50,25,69,26,17,23,0,44,54,48,78,51,68,70,39,15,7,19,37,36,29,13,4,72,74,56,42,46,80,41,77,33,12,61,66,43,71,2,58,64,47,8];
var v=o;var n=[],k=[];for(var s=0;s<p.length;s++){if(o.length===a){break}var y=p[s];
var u=DLX.removeFromSolutionByIndex(o,y);k=[];DLX.coverInitialConstraints(o);var l=new Date();
DLX.startDancing(q,DLX.copyArray(o),0,k,2);var t=new Date();var h=(t.valueOf()-l.valueOf())/1000;
n.push(h);if(k.length===1){v=DLX.copyArray(o);DLX.uncoverInitialConstraints(o)}else{if(k.length===0){throw ("board somehow had no solutions")
}else{DLX.uncoverInitialConstraints(o);DLX.addBackToSolutinByIndex(o,u)}}}var w=DLX.initiateDancingLinks();
k=[];DLX.coverConstraintsForSolution(v,w);DLX.startDancing(w,DLX.copyArray(v),0,k,2);
var d=new Date();console.log("final verification, board has [%@] solutions".fmt(k.length));
console.log("board has [%@] cells".fmt(v.length));var g=(d.valueOf()-f.valueOf())/1000;
console.log("TIME TAKEN [%@]".fmt(g));var b=0;n.forEach(function(i){b+=i});console.log("Total Time  in DLX [%@]".fmt(b));
if(k.length>1){throw ("final board had more than 1 solution :(")}j.set("seed",v);
j.set("solution",k.objectAt(0))};DLX.startDancing=function(j,h,d,i,a){d++;if(h&&h.length>81){throw ("Solution has more than 81 rows....")
}if(j.right===j){var b=[];h.forEach(function(m){b.push(m)});i.push(b);var g=i.length;
return g>=a?false:true}else{if(h===null){h=[]}var e=j.getColumnLowestSize();DLX.cover(e,d);
var f=true;for(var l=e.down;l!==e;l=l.down){h.push(l);for(var k=l.right;k!=l;k=k.right){DLX.cover(k.head,d)
}if(f){f=DLX.startDancing(j,h,d,i,a)}for(var c=l.left;c!=l;c=c.left){DLX.uncover(c.head,d)
}h.pop()}DLX.uncover(e,d);return f}};DLX.cover=function(b){b.right.left=b.left;b.left.right=b.right;
for(var c=b.down;c!==b;c=c.down){for(var a=c.right;a!=c;a=a.right){a.up.down=a.down;
a.down.up=a.up;a.head.size--;if(a.head.size<0){throw ("head size < 0 :(")}}}};DLX.uncover=function(a,b){for(var d=a.up;
d!==a;d=d.up){for(var c=d.left;c!=d;c=c.left){c.up.down=c;c.down.up=c;c.head.size++;
if(c.head.size>9){throw ("head size > 9 :( [%@] size[%@] depth[%@]".fmt(c.head.name,c.head.size,b))
}}}a.right.left=a;a.left.right=a};DLX.removeFromSolutionByIndex=function(a,b){var e=null;
for(var d=0;d<a.length;d++){e=a.objectAt(d);var c=e.assembleMetadata();if(c.i===b){a.removeAt(d);
e.wasAt=d;break}}return e};DLX.addBackToSolutinByIndex=function(a,b){a.insertAt(b.wasAt,b)
};DLX.coverInitialConstraints=function(a){a.forEach(function(c){DLX.cover(c.head);
for(var b=c.right;b!=c;b=b.right){DLX.cover(b.head)}})};DLX.coverConstraintsForSolution=function(a,b){var c=b.rows;
a.forEach(function(h){var f=h.assembleMetadata();var i=f.rowIndex;var e=c[i];var g=e.head;
DLX.cover(g);for(var d=e.right;d!=e;d=d.right){DLX.cover(d.head)}})};DLX.uncoverInitialConstraints=function(a){for(var b=a.length-1;
b>=0;b--){var d=a[b];for(var c=d.left;c!=d;c=c.left){DLX.uncover(c.head)}DLX.uncover(d.head)
}};DLX.coverConstraintsForSolution=function(a,b){var c=b.rows;a.forEach(function(h){var f=h.assembleMetadata();
var i=f.rowIndex;var e=c[i];var g=e.head;DLX.cover(g);for(var d=e.right;d!=e;d=d.right){DLX.cover(d.head)
}})};DLX.copyArray=function(a){var b=[];a.forEach(function(c){b.push(c)});return b
};DLX.shuffle=function(d){for(var b,a,c=d.length;c;b=parseInt(Math.random()*c),a=d[--c],d[c]=d[b],d[b]=a){}return d
};DLX.initiateDancingLinks=function(){var a=new DLXRootNode();a.addColumnNode("OneNumberInR1C1",{r:1,c:1,rowIndex:0});
a.addColumnNode("OneNumberInR1C2",{r:1,c:2,rowIndex:1});a.addColumnNode("OneNumberInR1C3",{r:1,c:3,rowIndex:2});
a.addColumnNode("OneNumberInR1C4",{r:1,c:4,rowIndex:3});a.addColumnNode("OneNumberInR1C5",{r:1,c:5,rowIndex:4});
a.addColumnNode("OneNumberInR1C6",{r:1,c:6,rowIndex:5});a.addColumnNode("OneNumberInR1C7",{r:1,c:7,rowIndex:6});
a.addColumnNode("OneNumberInR1C8",{r:1,c:8,rowIndex:7});a.addColumnNode("OneNumberInR1C9",{r:1,c:9,rowIndex:8});
a.addColumnNode("OneNumberInR2C1",{r:2,c:1,rowIndex:9});a.addColumnNode("OneNumberInR2C2",{r:2,c:2,rowIndex:10});
a.addColumnNode("OneNumberInR2C3",{r:2,c:3,rowIndex:11});a.addColumnNode("OneNumberInR2C4",{r:2,c:4,rowIndex:12});
a.addColumnNode("OneNumberInR2C5",{r:2,c:5,rowIndex:13});a.addColumnNode("OneNumberInR2C6",{r:2,c:6,rowIndex:14});
a.addColumnNode("OneNumberInR2C7",{r:2,c:7,rowIndex:15});a.addColumnNode("OneNumberInR2C8",{r:2,c:8,rowIndex:16});
a.addColumnNode("OneNumberInR2C9",{r:2,c:9,rowIndex:17});a.addColumnNode("OneNumberInR3C1",{r:3,c:1,rowIndex:18});
a.addColumnNode("OneNumberInR3C2",{r:3,c:2,rowIndex:19});a.addColumnNode("OneNumberInR3C3",{r:3,c:3,rowIndex:20});
a.addColumnNode("OneNumberInR3C4",{r:3,c:4,rowIndex:21});a.addColumnNode("OneNumberInR3C5",{r:3,c:5,rowIndex:22});
a.addColumnNode("OneNumberInR3C6",{r:3,c:6,rowIndex:23});a.addColumnNode("OneNumberInR3C7",{r:3,c:7,rowIndex:24});
a.addColumnNode("OneNumberInR3C8",{r:3,c:8,rowIndex:25});a.addColumnNode("OneNumberInR3C9",{r:3,c:9,rowIndex:26});
a.addColumnNode("OneNumberInR4C1",{r:4,c:1,rowIndex:27});a.addColumnNode("OneNumberInR4C2",{r:4,c:2,rowIndex:28});
a.addColumnNode("OneNumberInR4C3",{r:4,c:3,rowIndex:29});a.addColumnNode("OneNumberInR4C4",{r:4,c:4,rowIndex:30});
a.addColumnNode("OneNumberInR4C5",{r:4,c:5,rowIndex:31});a.addColumnNode("OneNumberInR4C6",{r:4,c:6,rowIndex:32});
a.addColumnNode("OneNumberInR4C7",{r:4,c:7,rowIndex:33});a.addColumnNode("OneNumberInR4C8",{r:4,c:8,rowIndex:34});
a.addColumnNode("OneNumberInR4C9",{r:4,c:9,rowIndex:35});a.addColumnNode("OneNumberInR5C1",{r:5,c:1,rowIndex:36});
a.addColumnNode("OneNumberInR5C2",{r:5,c:2,rowIndex:37});a.addColumnNode("OneNumberInR5C3",{r:5,c:3,rowIndex:38});
a.addColumnNode("OneNumberInR5C4",{r:5,c:4,rowIndex:39});a.addColumnNode("OneNumberInR5C5",{r:5,c:5,rowIndex:40});
a.addColumnNode("OneNumberInR5C6",{r:5,c:6,rowIndex:41});a.addColumnNode("OneNumberInR5C7",{r:5,c:7,rowIndex:42});
a.addColumnNode("OneNumberInR5C8",{r:5,c:8,rowIndex:43});a.addColumnNode("OneNumberInR5C9",{r:5,c:9,rowIndex:44});
a.addColumnNode("OneNumberInR6C1",{r:6,c:1,rowIndex:45});a.addColumnNode("OneNumberInR6C2",{r:6,c:2,rowIndex:46});
a.addColumnNode("OneNumberInR6C3",{r:6,c:3,rowIndex:47});a.addColumnNode("OneNumberInR6C4",{r:6,c:4,rowIndex:48});
a.addColumnNode("OneNumberInR6C5",{r:6,c:5,rowIndex:49});a.addColumnNode("OneNumberInR6C6",{r:6,c:6,rowIndex:50});
a.addColumnNode("OneNumberInR6C7",{r:6,c:7,rowIndex:51});a.addColumnNode("OneNumberInR6C8",{r:6,c:8,rowIndex:52});
a.addColumnNode("OneNumberInR6C9",{r:6,c:9,rowIndex:53});a.addColumnNode("OneNumberInR7C1",{r:7,c:1,rowIndex:54});
a.addColumnNode("OneNumberInR7C2",{r:7,c:2,rowIndex:55});a.addColumnNode("OneNumberInR7C3",{r:7,c:3,rowIndex:56});
a.addColumnNode("OneNumberInR7C4",{r:7,c:4,rowIndex:57});a.addColumnNode("OneNumberInR7C5",{r:7,c:5,rowIndex:58});
a.addColumnNode("OneNumberInR7C6",{r:7,c:6,rowIndex:59});a.addColumnNode("OneNumberInR7C7",{r:7,c:7,rowIndex:60});
a.addColumnNode("OneNumberInR7C8",{r:7,c:8,rowIndex:61});a.addColumnNode("OneNumberInR7C9",{r:7,c:9,rowIndex:62});
a.addColumnNode("OneNumberInR8C1",{r:8,c:1,rowIndex:63});a.addColumnNode("OneNumberInR8C2",{r:8,c:2,rowIndex:64});
a.addColumnNode("OneNumberInR8C3",{r:8,c:3,rowIndex:65});a.addColumnNode("OneNumberInR8C4",{r:8,c:4,rowIndex:66});
a.addColumnNode("OneNumberInR8C5",{r:8,c:5,rowIndex:67});a.addColumnNode("OneNumberInR8C6",{r:8,c:6,rowIndex:68});
a.addColumnNode("OneNumberInR8C7",{r:8,c:7,rowIndex:69});a.addColumnNode("OneNumberInR8C8",{r:8,c:8,rowIndex:70});
a.addColumnNode("OneNumberInR8C9",{r:8,c:9,rowIndex:71});a.addColumnNode("OneNumberInR9C1",{r:9,c:1,rowIndex:72});
a.addColumnNode("OneNumberInR9C2",{r:9,c:2,rowIndex:73});a.addColumnNode("OneNumberInR9C3",{r:9,c:3,rowIndex:74});
a.addColumnNode("OneNumberInR9C4",{r:9,c:4,rowIndex:75});a.addColumnNode("OneNumberInR9C5",{r:9,c:5,rowIndex:76});
a.addColumnNode("OneNumberInR9C6",{r:9,c:6,rowIndex:77});a.addColumnNode("OneNumberInR9C7",{r:9,c:7,rowIndex:78});
a.addColumnNode("OneNumberInR9C8",{r:9,c:8,rowIndex:79});a.addColumnNode("OneNumberInR9C9",{r:9,c:9,rowIndex:80});
a.addColumnNode("TheNumber1InR1",{n:1,r:1,rowIndex:81});a.addColumnNode("TheNumber2InR1",{n:2,r:1,rowIndex:82});
a.addColumnNode("TheNumber3InR1",{n:3,r:1,rowIndex:83});a.addColumnNode("TheNumber4InR1",{n:4,r:1,rowIndex:84});
a.addColumnNode("TheNumber5InR1",{n:5,r:1,rowIndex:85});a.addColumnNode("TheNumber6InR1",{n:6,r:1,rowIndex:86});
a.addColumnNode("TheNumber7InR1",{n:7,r:1,rowIndex:87});a.addColumnNode("TheNumber8InR1",{n:8,r:1,rowIndex:88});
a.addColumnNode("TheNumber9InR1",{n:9,r:1,rowIndex:89});a.addColumnNode("TheNumber1InR2",{n:1,r:2,rowIndex:90});
a.addColumnNode("TheNumber2InR2",{n:2,r:2,rowIndex:91});a.addColumnNode("TheNumber3InR2",{n:3,r:2,rowIndex:92});
a.addColumnNode("TheNumber4InR2",{n:4,r:2,rowIndex:93});a.addColumnNode("TheNumber5InR2",{n:5,r:2,rowIndex:94});
a.addColumnNode("TheNumber6InR2",{n:6,r:2,rowIndex:95});a.addColumnNode("TheNumber7InR2",{n:7,r:2,rowIndex:96});
a.addColumnNode("TheNumber8InR2",{n:8,r:2,rowIndex:97});a.addColumnNode("TheNumber9InR2",{n:9,r:2,rowIndex:98});
a.addColumnNode("TheNumber1InR3",{n:1,r:3,rowIndex:99});a.addColumnNode("TheNumber2InR3",{n:2,r:3,rowIndex:100});
a.addColumnNode("TheNumber3InR3",{n:3,r:3,rowIndex:101});a.addColumnNode("TheNumber4InR3",{n:4,r:3,rowIndex:102});
a.addColumnNode("TheNumber5InR3",{n:5,r:3,rowIndex:103});a.addColumnNode("TheNumber6InR3",{n:6,r:3,rowIndex:104});
a.addColumnNode("TheNumber7InR3",{n:7,r:3,rowIndex:105});a.addColumnNode("TheNumber8InR3",{n:8,r:3,rowIndex:106});
a.addColumnNode("TheNumber9InR3",{n:9,r:3,rowIndex:107});a.addColumnNode("TheNumber1InR4",{n:1,r:4,rowIndex:108});
a.addColumnNode("TheNumber2InR4",{n:2,r:4,rowIndex:109});a.addColumnNode("TheNumber3InR4",{n:3,r:4,rowIndex:110});
a.addColumnNode("TheNumber4InR4",{n:4,r:4,rowIndex:111});a.addColumnNode("TheNumber5InR4",{n:5,r:4,rowIndex:112});
a.addColumnNode("TheNumber6InR4",{n:6,r:4,rowIndex:113});a.addColumnNode("TheNumber7InR4",{n:7,r:4,rowIndex:114});
a.addColumnNode("TheNumber8InR4",{n:8,r:4,rowIndex:115});a.addColumnNode("TheNumber9InR4",{n:9,r:4,rowIndex:116});
a.addColumnNode("TheNumber1InR5",{n:1,r:5,rowIndex:117});a.addColumnNode("TheNumber2InR5",{n:2,r:5,rowIndex:118});
a.addColumnNode("TheNumber3InR5",{n:3,r:5,rowIndex:119});a.addColumnNode("TheNumber4InR5",{n:4,r:5,rowIndex:120});
a.addColumnNode("TheNumber5InR5",{n:5,r:5,rowIndex:121});a.addColumnNode("TheNumber6InR5",{n:6,r:5,rowIndex:122});
a.addColumnNode("TheNumber7InR5",{n:7,r:5,rowIndex:123});a.addColumnNode("TheNumber8InR5",{n:8,r:5,rowIndex:124});
a.addColumnNode("TheNumber9InR5",{n:9,r:5,rowIndex:125});a.addColumnNode("TheNumber1InR6",{n:1,r:6,rowIndex:126});
a.addColumnNode("TheNumber2InR6",{n:2,r:6,rowIndex:127});a.addColumnNode("TheNumber3InR6",{n:3,r:6,rowIndex:128});
a.addColumnNode("TheNumber4InR6",{n:4,r:6,rowIndex:129});a.addColumnNode("TheNumber5InR6",{n:5,r:6,rowIndex:130});
a.addColumnNode("TheNumber6InR6",{n:6,r:6,rowIndex:131});a.addColumnNode("TheNumber7InR6",{n:7,r:6,rowIndex:132});
a.addColumnNode("TheNumber8InR6",{n:8,r:6,rowIndex:133});a.addColumnNode("TheNumber9InR6",{n:9,r:6,rowIndex:134});
a.addColumnNode("TheNumber1InR7",{n:1,r:7,rowIndex:135});a.addColumnNode("TheNumber2InR7",{n:2,r:7,rowIndex:136});
a.addColumnNode("TheNumber3InR7",{n:3,r:7,rowIndex:137});a.addColumnNode("TheNumber4InR7",{n:4,r:7,rowIndex:138});
a.addColumnNode("TheNumber5InR7",{n:5,r:7,rowIndex:139});a.addColumnNode("TheNumber6InR7",{n:6,r:7,rowIndex:140});
a.addColumnNode("TheNumber7InR7",{n:7,r:7,rowIndex:141});a.addColumnNode("TheNumber8InR7",{n:8,r:7,rowIndex:142});
a.addColumnNode("TheNumber9InR7",{n:9,r:7,rowIndex:143});a.addColumnNode("TheNumber1InR8",{n:1,r:8,rowIndex:144});
a.addColumnNode("TheNumber2InR8",{n:2,r:8,rowIndex:145});a.addColumnNode("TheNumber3InR8",{n:3,r:8,rowIndex:146});
a.addColumnNode("TheNumber4InR8",{n:4,r:8,rowIndex:147});a.addColumnNode("TheNumber5InR8",{n:5,r:8,rowIndex:148});
a.addColumnNode("TheNumber6InR8",{n:6,r:8,rowIndex:149});a.addColumnNode("TheNumber7InR8",{n:7,r:8,rowIndex:150});
a.addColumnNode("TheNumber8InR8",{n:8,r:8,rowIndex:151});a.addColumnNode("TheNumber9InR8",{n:9,r:8,rowIndex:152});
a.addColumnNode("TheNumber1InR9",{n:1,r:9,rowIndex:153});a.addColumnNode("TheNumber2InR9",{n:2,r:9,rowIndex:154});
a.addColumnNode("TheNumber3InR9",{n:3,r:9,rowIndex:155});a.addColumnNode("TheNumber4InR9",{n:4,r:9,rowIndex:156});
a.addColumnNode("TheNumber5InR9",{n:5,r:9,rowIndex:157});a.addColumnNode("TheNumber6InR9",{n:6,r:9,rowIndex:158});
a.addColumnNode("TheNumber7InR9",{n:7,r:9,rowIndex:159});a.addColumnNode("TheNumber8InR9",{n:8,r:9,rowIndex:160});
a.addColumnNode("TheNumber9InR9",{n:9,r:9,rowIndex:161});a.addColumnNode("TheNumber1InC1",{n:1,c:1,rowIndex:162});
a.addColumnNode("TheNumber2InC1",{n:2,c:1,rowIndex:163});a.addColumnNode("TheNumber3InC1",{n:3,c:1,rowIndex:164});
a.addColumnNode("TheNumber4InC1",{n:4,c:1,rowIndex:165});a.addColumnNode("TheNumber5InC1",{n:5,c:1,rowIndex:166});
a.addColumnNode("TheNumber6InC1",{n:6,c:1,rowIndex:167});a.addColumnNode("TheNumber7InC1",{n:7,c:1,rowIndex:168});
a.addColumnNode("TheNumber8InC1",{n:8,c:1,rowIndex:169});a.addColumnNode("TheNumber9InC1",{n:9,c:1,rowIndex:170});
a.addColumnNode("TheNumber1InC2",{n:1,c:2,rowIndex:171});a.addColumnNode("TheNumber2InC2",{n:2,c:2,rowIndex:172});
a.addColumnNode("TheNumber3InC2",{n:3,c:2,rowIndex:173});a.addColumnNode("TheNumber4InC2",{n:4,c:2,rowIndex:174});
a.addColumnNode("TheNumber5InC2",{n:5,c:2,rowIndex:175});a.addColumnNode("TheNumber6InC2",{n:6,c:2,rowIndex:176});
a.addColumnNode("TheNumber7InC2",{n:7,c:2,rowIndex:177});a.addColumnNode("TheNumber8InC2",{n:8,c:2,rowIndex:178});
a.addColumnNode("TheNumber9InC2",{n:9,c:2,rowIndex:179});a.addColumnNode("TheNumber1InC3",{n:1,c:3,rowIndex:180});
a.addColumnNode("TheNumber2InC3",{n:2,c:3,rowIndex:181});a.addColumnNode("TheNumber3InC3",{n:3,c:3,rowIndex:182});
a.addColumnNode("TheNumber4InC3",{n:4,c:3,rowIndex:183});a.addColumnNode("TheNumber5InC3",{n:5,c:3,rowIndex:184});
a.addColumnNode("TheNumber6InC3",{n:6,c:3,rowIndex:185});a.addColumnNode("TheNumber7InC3",{n:7,c:3,rowIndex:186});
a.addColumnNode("TheNumber8InC3",{n:8,c:3,rowIndex:187});a.addColumnNode("TheNumber9InC3",{n:9,c:3,rowIndex:188});
a.addColumnNode("TheNumber1InC4",{n:1,c:4,rowIndex:189});a.addColumnNode("TheNumber2InC4",{n:2,c:4,rowIndex:190});
a.addColumnNode("TheNumber3InC4",{n:3,c:4,rowIndex:191});a.addColumnNode("TheNumber4InC4",{n:4,c:4,rowIndex:192});
a.addColumnNode("TheNumber5InC4",{n:5,c:4,rowIndex:193});a.addColumnNode("TheNumber6InC4",{n:6,c:4,rowIndex:194});
a.addColumnNode("TheNumber7InC4",{n:7,c:4,rowIndex:195});a.addColumnNode("TheNumber8InC4",{n:8,c:4,rowIndex:196});
a.addColumnNode("TheNumber9InC4",{n:9,c:4,rowIndex:197});a.addColumnNode("TheNumber1InC5",{n:1,c:5,rowIndex:198});
a.addColumnNode("TheNumber2InC5",{n:2,c:5,rowIndex:199});a.addColumnNode("TheNumber3InC5",{n:3,c:5,rowIndex:200});
a.addColumnNode("TheNumber4InC5",{n:4,c:5,rowIndex:201});a.addColumnNode("TheNumber5InC5",{n:5,c:5,rowIndex:202});
a.addColumnNode("TheNumber6InC5",{n:6,c:5,rowIndex:203});a.addColumnNode("TheNumber7InC5",{n:7,c:5,rowIndex:204});
a.addColumnNode("TheNumber8InC5",{n:8,c:5,rowIndex:205});a.addColumnNode("TheNumber9InC5",{n:9,c:5,rowIndex:206});
a.addColumnNode("TheNumber1InC6",{n:1,c:6,rowIndex:207});a.addColumnNode("TheNumber2InC6",{n:2,c:6,rowIndex:208});
a.addColumnNode("TheNumber3InC6",{n:3,c:6,rowIndex:209});a.addColumnNode("TheNumber4InC6",{n:4,c:6,rowIndex:210});
a.addColumnNode("TheNumber5InC6",{n:5,c:6,rowIndex:211});a.addColumnNode("TheNumber6InC6",{n:6,c:6,rowIndex:212});
a.addColumnNode("TheNumber7InC6",{n:7,c:6,rowIndex:213});a.addColumnNode("TheNumber8InC6",{n:8,c:6,rowIndex:214});
a.addColumnNode("TheNumber9InC6",{n:9,c:6,rowIndex:215});a.addColumnNode("TheNumber1InC7",{n:1,c:7,rowIndex:216});
a.addColumnNode("TheNumber2InC7",{n:2,c:7,rowIndex:217});a.addColumnNode("TheNumber3InC7",{n:3,c:7,rowIndex:218});
a.addColumnNode("TheNumber4InC7",{n:4,c:7,rowIndex:219});a.addColumnNode("TheNumber5InC7",{n:5,c:7,rowIndex:220});
a.addColumnNode("TheNumber6InC7",{n:6,c:7,rowIndex:221});a.addColumnNode("TheNumber7InC7",{n:7,c:7,rowIndex:222});
a.addColumnNode("TheNumber8InC7",{n:8,c:7,rowIndex:223});a.addColumnNode("TheNumber9InC7",{n:9,c:7,rowIndex:224});
a.addColumnNode("TheNumber1InC8",{n:1,c:8,rowIndex:225});a.addColumnNode("TheNumber2InC8",{n:2,c:8,rowIndex:226});
a.addColumnNode("TheNumber3InC8",{n:3,c:8,rowIndex:227});a.addColumnNode("TheNumber4InC8",{n:4,c:8,rowIndex:228});
a.addColumnNode("TheNumber5InC8",{n:5,c:8,rowIndex:229});a.addColumnNode("TheNumber6InC8",{n:6,c:8,rowIndex:230});
a.addColumnNode("TheNumber7InC8",{n:7,c:8,rowIndex:231});a.addColumnNode("TheNumber8InC8",{n:8,c:8,rowIndex:232});
a.addColumnNode("TheNumber9InC8",{n:9,c:8,rowIndex:233});a.addColumnNode("TheNumber1InC9",{n:1,c:9,rowIndex:234});
a.addColumnNode("TheNumber2InC9",{n:2,c:9,rowIndex:235});a.addColumnNode("TheNumber3InC9",{n:3,c:9,rowIndex:236});
a.addColumnNode("TheNumber4InC9",{n:4,c:9,rowIndex:237});a.addColumnNode("TheNumber5InC9",{n:5,c:9,rowIndex:238});
a.addColumnNode("TheNumber6InC9",{n:6,c:9,rowIndex:239});a.addColumnNode("TheNumber7InC9",{n:7,c:9,rowIndex:240});
a.addColumnNode("TheNumber8InC9",{n:8,c:9,rowIndex:241});a.addColumnNode("TheNumber9InC9",{n:9,c:9,rowIndex:242});
a.addColumnNode("TheNumber1InRegion1");a.addColumnNode("TheNumber2InRegion1");a.addColumnNode("TheNumber3InRegion1");
a.addColumnNode("TheNumber4InRegion1");a.addColumnNode("TheNumber5InRegion1");a.addColumnNode("TheNumber6InRegion1");
a.addColumnNode("TheNumber7InRegion1");a.addColumnNode("TheNumber8InRegion1");a.addColumnNode("TheNumber9InRegion1");
a.addColumnNode("TheNumber1InRegion2");a.addColumnNode("TheNumber2InRegion2");a.addColumnNode("TheNumber3InRegion2");
a.addColumnNode("TheNumber4InRegion2");a.addColumnNode("TheNumber5InRegion2");a.addColumnNode("TheNumber6InRegion2");
a.addColumnNode("TheNumber7InRegion2");a.addColumnNode("TheNumber8InRegion2");a.addColumnNode("TheNumber9InRegion2");
a.addColumnNode("TheNumber1InRegion3");a.addColumnNode("TheNumber2InRegion3");a.addColumnNode("TheNumber3InRegion3");
a.addColumnNode("TheNumber4InRegion3");a.addColumnNode("TheNumber5InRegion3");a.addColumnNode("TheNumber6InRegion3");
a.addColumnNode("TheNumber7InRegion3");a.addColumnNode("TheNumber8InRegion3");a.addColumnNode("TheNumber9InRegion3");
a.addColumnNode("TheNumber1InRegion4");a.addColumnNode("TheNumber2InRegion4");a.addColumnNode("TheNumber3InRegion4");
a.addColumnNode("TheNumber4InRegion4");a.addColumnNode("TheNumber5InRegion4");a.addColumnNode("TheNumber6InRegion4");
a.addColumnNode("TheNumber7InRegion4");a.addColumnNode("TheNumber8InRegion4");a.addColumnNode("TheNumber9InRegion4");
a.addColumnNode("TheNumber1InRegion5");a.addColumnNode("TheNumber2InRegion5");a.addColumnNode("TheNumber3InRegion5");
a.addColumnNode("TheNumber4InRegion5");a.addColumnNode("TheNumber5InRegion5");a.addColumnNode("TheNumber6InRegion5");
a.addColumnNode("TheNumber7InRegion5");a.addColumnNode("TheNumber8InRegion5");a.addColumnNode("TheNumber9InRegion5");
a.addColumnNode("TheNumber1InRegion6");a.addColumnNode("TheNumber2InRegion6");a.addColumnNode("TheNumber3InRegion6");
a.addColumnNode("TheNumber4InRegion6");a.addColumnNode("TheNumber5InRegion6");a.addColumnNode("TheNumber6InRegion6");
a.addColumnNode("TheNumber7InRegion6");a.addColumnNode("TheNumber8InRegion6");a.addColumnNode("TheNumber9InRegion6");
a.addColumnNode("TheNumber1InRegion7");a.addColumnNode("TheNumber2InRegion7");a.addColumnNode("TheNumber3InRegion7");
a.addColumnNode("TheNumber4InRegion7");a.addColumnNode("TheNumber5InRegion7");a.addColumnNode("TheNumber6InRegion7");
a.addColumnNode("TheNumber7InRegion7");a.addColumnNode("TheNumber8InRegion7");a.addColumnNode("TheNumber9InRegion7");
a.addColumnNode("TheNumber1InRegion8");a.addColumnNode("TheNumber2InRegion8");a.addColumnNode("TheNumber3InRegion8");
a.addColumnNode("TheNumber4InRegion8");a.addColumnNode("TheNumber5InRegion8");a.addColumnNode("TheNumber6InRegion8");
a.addColumnNode("TheNumber7InRegion8");a.addColumnNode("TheNumber8InRegion8");a.addColumnNode("TheNumber9InRegion8");
a.addColumnNode("TheNumber1InRegion9");a.addColumnNode("TheNumber2InRegion9");a.addColumnNode("TheNumber3InRegion9");
a.addColumnNode("TheNumber4InRegion9");a.addColumnNode("TheNumber5InRegion9");a.addColumnNode("TheNumber6InRegion9");
a.addColumnNode("TheNumber7InRegion9");a.addColumnNode("TheNumber8InRegion9");a.addColumnNode("TheNumber9InRegion9");
a.addRowByColumnIndexes([0,81,162,243],0);a.addRowByColumnIndexes([0,82,163,244],1);
a.addRowByColumnIndexes([0,83,164,245],2);a.addRowByColumnIndexes([0,84,165,246],3);
a.addRowByColumnIndexes([0,85,166,247],4);a.addRowByColumnIndexes([0,86,167,248],5);
a.addRowByColumnIndexes([0,87,168,249],6);a.addRowByColumnIndexes([0,88,169,250],7);
a.addRowByColumnIndexes([0,89,170,251],8);a.addRowByColumnIndexes([1,81,171,243],9);
a.addRowByColumnIndexes([1,82,172,244],10);a.addRowByColumnIndexes([1,83,173,245],11);
a.addRowByColumnIndexes([1,84,174,246],12);a.addRowByColumnIndexes([1,85,175,247],13);
a.addRowByColumnIndexes([1,86,176,248],14);a.addRowByColumnIndexes([1,87,177,249],15);
a.addRowByColumnIndexes([1,88,178,250],16);a.addRowByColumnIndexes([1,89,179,251],17);
a.addRowByColumnIndexes([2,81,180,243],18);a.addRowByColumnIndexes([2,82,181,244],19);
a.addRowByColumnIndexes([2,83,182,245],20);a.addRowByColumnIndexes([2,84,183,246],21);
a.addRowByColumnIndexes([2,85,184,247],22);a.addRowByColumnIndexes([2,86,185,248],23);
a.addRowByColumnIndexes([2,87,186,249],24);a.addRowByColumnIndexes([2,88,187,250],25);
a.addRowByColumnIndexes([2,89,188,251],26);a.addRowByColumnIndexes([3,81,189,252],27);
a.addRowByColumnIndexes([3,82,190,253],28);a.addRowByColumnIndexes([3,83,191,254],29);
a.addRowByColumnIndexes([3,84,192,255],30);a.addRowByColumnIndexes([3,85,193,256],31);
a.addRowByColumnIndexes([3,86,194,257],32);a.addRowByColumnIndexes([3,87,195,258],33);
a.addRowByColumnIndexes([3,88,196,259],34);a.addRowByColumnIndexes([3,89,197,260],35);
a.addRowByColumnIndexes([4,81,198,252],36);a.addRowByColumnIndexes([4,82,199,253],37);
a.addRowByColumnIndexes([4,83,200,254],38);a.addRowByColumnIndexes([4,84,201,255],39);
a.addRowByColumnIndexes([4,85,202,256],40);a.addRowByColumnIndexes([4,86,203,257],41);
a.addRowByColumnIndexes([4,87,204,258],42);a.addRowByColumnIndexes([4,88,205,259],43);
a.addRowByColumnIndexes([4,89,206,260],44);a.addRowByColumnIndexes([5,81,207,252],45);
a.addRowByColumnIndexes([5,82,208,253],46);a.addRowByColumnIndexes([5,83,209,254],47);
a.addRowByColumnIndexes([5,84,210,255],48);a.addRowByColumnIndexes([5,85,211,256],49);
a.addRowByColumnIndexes([5,86,212,257],50);a.addRowByColumnIndexes([5,87,213,258],51);
a.addRowByColumnIndexes([5,88,214,259],52);a.addRowByColumnIndexes([5,89,215,260],53);
a.addRowByColumnIndexes([6,81,216,261],54);a.addRowByColumnIndexes([6,82,217,262],55);
a.addRowByColumnIndexes([6,83,218,263],56);a.addRowByColumnIndexes([6,84,219,264],57);
a.addRowByColumnIndexes([6,85,220,265],58);a.addRowByColumnIndexes([6,86,221,266],59);
a.addRowByColumnIndexes([6,87,222,267],60);a.addRowByColumnIndexes([6,88,223,268],61);
a.addRowByColumnIndexes([6,89,224,269],62);a.addRowByColumnIndexes([7,81,225,261],63);
a.addRowByColumnIndexes([7,82,226,262],64);a.addRowByColumnIndexes([7,83,227,263],65);
a.addRowByColumnIndexes([7,84,228,264],66);a.addRowByColumnIndexes([7,85,229,265],67);
a.addRowByColumnIndexes([7,86,230,266],68);a.addRowByColumnIndexes([7,87,231,267],69);
a.addRowByColumnIndexes([7,88,232,268],70);a.addRowByColumnIndexes([7,89,233,269],71);
a.addRowByColumnIndexes([8,81,234,261],72);a.addRowByColumnIndexes([8,82,235,262],73);
a.addRowByColumnIndexes([8,83,236,263],74);a.addRowByColumnIndexes([8,84,237,264],75);
a.addRowByColumnIndexes([8,85,238,265],76);a.addRowByColumnIndexes([8,86,239,266],77);
a.addRowByColumnIndexes([8,87,240,267],78);a.addRowByColumnIndexes([8,88,241,268],79);
a.addRowByColumnIndexes([8,89,242,269],80);a.addRowByColumnIndexes([9,90,162,243],81);
a.addRowByColumnIndexes([9,91,163,244],82);a.addRowByColumnIndexes([9,92,164,245],83);
a.addRowByColumnIndexes([9,93,165,246],84);a.addRowByColumnIndexes([9,94,166,247],85);
a.addRowByColumnIndexes([9,95,167,248],86);a.addRowByColumnIndexes([9,96,168,249],87);
a.addRowByColumnIndexes([9,97,169,250],88);a.addRowByColumnIndexes([9,98,170,251],89);
a.addRowByColumnIndexes([10,90,171,243],90);a.addRowByColumnIndexes([10,91,172,244],91);
a.addRowByColumnIndexes([10,92,173,245],92);a.addRowByColumnIndexes([10,93,174,246],93);
a.addRowByColumnIndexes([10,94,175,247],94);a.addRowByColumnIndexes([10,95,176,248],95);
a.addRowByColumnIndexes([10,96,177,249],96);a.addRowByColumnIndexes([10,97,178,250],97);
a.addRowByColumnIndexes([10,98,179,251],98);a.addRowByColumnIndexes([11,90,180,243],99);
a.addRowByColumnIndexes([11,91,181,244],100);a.addRowByColumnIndexes([11,92,182,245],101);
a.addRowByColumnIndexes([11,93,183,246],102);a.addRowByColumnIndexes([11,94,184,247],103);
a.addRowByColumnIndexes([11,95,185,248],104);a.addRowByColumnIndexes([11,96,186,249],105);
a.addRowByColumnIndexes([11,97,187,250],106);a.addRowByColumnIndexes([11,98,188,251],107);
a.addRowByColumnIndexes([12,90,189,252],108);a.addRowByColumnIndexes([12,91,190,253],109);
a.addRowByColumnIndexes([12,92,191,254],110);a.addRowByColumnIndexes([12,93,192,255],111);
a.addRowByColumnIndexes([12,94,193,256],112);a.addRowByColumnIndexes([12,95,194,257],113);
a.addRowByColumnIndexes([12,96,195,258],114);a.addRowByColumnIndexes([12,97,196,259],115);
a.addRowByColumnIndexes([12,98,197,260],116);a.addRowByColumnIndexes([13,90,198,252],117);
a.addRowByColumnIndexes([13,91,199,253],118);a.addRowByColumnIndexes([13,92,200,254],119);
a.addRowByColumnIndexes([13,93,201,255],120);a.addRowByColumnIndexes([13,94,202,256],121);
a.addRowByColumnIndexes([13,95,203,257],122);a.addRowByColumnIndexes([13,96,204,258],123);
a.addRowByColumnIndexes([13,97,205,259],124);a.addRowByColumnIndexes([13,98,206,260],125);
a.addRowByColumnIndexes([14,90,207,252],126);a.addRowByColumnIndexes([14,91,208,253],127);
a.addRowByColumnIndexes([14,92,209,254],128);a.addRowByColumnIndexes([14,93,210,255],129);
a.addRowByColumnIndexes([14,94,211,256],130);a.addRowByColumnIndexes([14,95,212,257],131);
a.addRowByColumnIndexes([14,96,213,258],132);a.addRowByColumnIndexes([14,97,214,259],133);
a.addRowByColumnIndexes([14,98,215,260],134);a.addRowByColumnIndexes([15,90,216,261],135);
a.addRowByColumnIndexes([15,91,217,262],136);a.addRowByColumnIndexes([15,92,218,263],137);
a.addRowByColumnIndexes([15,93,219,264],138);a.addRowByColumnIndexes([15,94,220,265],139);
a.addRowByColumnIndexes([15,95,221,266],140);a.addRowByColumnIndexes([15,96,222,267],141);
a.addRowByColumnIndexes([15,97,223,268],142);a.addRowByColumnIndexes([15,98,224,269],143);
a.addRowByColumnIndexes([16,90,225,261],144);a.addRowByColumnIndexes([16,91,226,262],145);
a.addRowByColumnIndexes([16,92,227,263],146);a.addRowByColumnIndexes([16,93,228,264],147);
a.addRowByColumnIndexes([16,94,229,265],148);a.addRowByColumnIndexes([16,95,230,266],149);
a.addRowByColumnIndexes([16,96,231,267],150);a.addRowByColumnIndexes([16,97,232,268],151);
a.addRowByColumnIndexes([16,98,233,269],152);a.addRowByColumnIndexes([17,90,234,261],153);
a.addRowByColumnIndexes([17,91,235,262],154);a.addRowByColumnIndexes([17,92,236,263],155);
a.addRowByColumnIndexes([17,93,237,264],156);a.addRowByColumnIndexes([17,94,238,265],157);
a.addRowByColumnIndexes([17,95,239,266],158);a.addRowByColumnIndexes([17,96,240,267],159);
a.addRowByColumnIndexes([17,97,241,268],160);a.addRowByColumnIndexes([17,98,242,269],161);
a.addRowByColumnIndexes([18,99,162,243],162);a.addRowByColumnIndexes([18,100,163,244],163);
a.addRowByColumnIndexes([18,101,164,245],164);a.addRowByColumnIndexes([18,102,165,246],165);
a.addRowByColumnIndexes([18,103,166,247],166);a.addRowByColumnIndexes([18,104,167,248],167);
a.addRowByColumnIndexes([18,105,168,249],168);a.addRowByColumnIndexes([18,106,169,250],169);
a.addRowByColumnIndexes([18,107,170,251],170);a.addRowByColumnIndexes([19,99,171,243],171);
a.addRowByColumnIndexes([19,100,172,244],172);a.addRowByColumnIndexes([19,101,173,245],173);
a.addRowByColumnIndexes([19,102,174,246],174);a.addRowByColumnIndexes([19,103,175,247],175);
a.addRowByColumnIndexes([19,104,176,248],176);a.addRowByColumnIndexes([19,105,177,249],177);
a.addRowByColumnIndexes([19,106,178,250],178);a.addRowByColumnIndexes([19,107,179,251],179);
a.addRowByColumnIndexes([20,99,180,243],180);a.addRowByColumnIndexes([20,100,181,244],181);
a.addRowByColumnIndexes([20,101,182,245],182);a.addRowByColumnIndexes([20,102,183,246],183);
a.addRowByColumnIndexes([20,103,184,247],184);a.addRowByColumnIndexes([20,104,185,248],185);
a.addRowByColumnIndexes([20,105,186,249],186);a.addRowByColumnIndexes([20,106,187,250],187);
a.addRowByColumnIndexes([20,107,188,251],188);a.addRowByColumnIndexes([21,99,189,252],189);
a.addRowByColumnIndexes([21,100,190,253],190);a.addRowByColumnIndexes([21,101,191,254],191);
a.addRowByColumnIndexes([21,102,192,255],192);a.addRowByColumnIndexes([21,103,193,256],193);
a.addRowByColumnIndexes([21,104,194,257],194);a.addRowByColumnIndexes([21,105,195,258],195);
a.addRowByColumnIndexes([21,106,196,259],196);a.addRowByColumnIndexes([21,107,197,260],197);
a.addRowByColumnIndexes([22,99,198,252],198);a.addRowByColumnIndexes([22,100,199,253],199);
a.addRowByColumnIndexes([22,101,200,254],200);a.addRowByColumnIndexes([22,102,201,255],201);
a.addRowByColumnIndexes([22,103,202,256],202);a.addRowByColumnIndexes([22,104,203,257],203);
a.addRowByColumnIndexes([22,105,204,258],204);a.addRowByColumnIndexes([22,106,205,259],205);
a.addRowByColumnIndexes([22,107,206,260],206);a.addRowByColumnIndexes([23,99,207,252],207);
a.addRowByColumnIndexes([23,100,208,253],208);a.addRowByColumnIndexes([23,101,209,254],209);
a.addRowByColumnIndexes([23,102,210,255],210);a.addRowByColumnIndexes([23,103,211,256],211);
a.addRowByColumnIndexes([23,104,212,257],212);a.addRowByColumnIndexes([23,105,213,258],213);
a.addRowByColumnIndexes([23,106,214,259],214);a.addRowByColumnIndexes([23,107,215,260],215);
a.addRowByColumnIndexes([24,99,216,261],216);a.addRowByColumnIndexes([24,100,217,262],217);
a.addRowByColumnIndexes([24,101,218,263],218);a.addRowByColumnIndexes([24,102,219,264],219);
a.addRowByColumnIndexes([24,103,220,265],220);a.addRowByColumnIndexes([24,104,221,266],221);
a.addRowByColumnIndexes([24,105,222,267],222);a.addRowByColumnIndexes([24,106,223,268],223);
a.addRowByColumnIndexes([24,107,224,269],224);a.addRowByColumnIndexes([25,99,225,261],225);
a.addRowByColumnIndexes([25,100,226,262],226);a.addRowByColumnIndexes([25,101,227,263],227);
a.addRowByColumnIndexes([25,102,228,264],228);a.addRowByColumnIndexes([25,103,229,265],229);
a.addRowByColumnIndexes([25,104,230,266],230);a.addRowByColumnIndexes([25,105,231,267],231);
a.addRowByColumnIndexes([25,106,232,268],232);a.addRowByColumnIndexes([25,107,233,269],233);
a.addRowByColumnIndexes([26,99,234,261],234);a.addRowByColumnIndexes([26,100,235,262],235);
a.addRowByColumnIndexes([26,101,236,263],236);a.addRowByColumnIndexes([26,102,237,264],237);
a.addRowByColumnIndexes([26,103,238,265],238);a.addRowByColumnIndexes([26,104,239,266],239);
a.addRowByColumnIndexes([26,105,240,267],240);a.addRowByColumnIndexes([26,106,241,268],241);
a.addRowByColumnIndexes([26,107,242,269],242);a.addRowByColumnIndexes([27,108,162,270],243);
a.addRowByColumnIndexes([27,109,163,271],244);a.addRowByColumnIndexes([27,110,164,272],245);
a.addRowByColumnIndexes([27,111,165,273],246);a.addRowByColumnIndexes([27,112,166,274],247);
a.addRowByColumnIndexes([27,113,167,275],248);a.addRowByColumnIndexes([27,114,168,276],249);
a.addRowByColumnIndexes([27,115,169,277],250);a.addRowByColumnIndexes([27,116,170,278],251);
a.addRowByColumnIndexes([28,108,171,270],252);a.addRowByColumnIndexes([28,109,172,271],253);
a.addRowByColumnIndexes([28,110,173,272],254);a.addRowByColumnIndexes([28,111,174,273],255);
a.addRowByColumnIndexes([28,112,175,274],256);a.addRowByColumnIndexes([28,113,176,275],257);
a.addRowByColumnIndexes([28,114,177,276],258);a.addRowByColumnIndexes([28,115,178,277],259);
a.addRowByColumnIndexes([28,116,179,278],260);a.addRowByColumnIndexes([29,108,180,270],261);
a.addRowByColumnIndexes([29,109,181,271],262);a.addRowByColumnIndexes([29,110,182,272],263);
a.addRowByColumnIndexes([29,111,183,273],264);a.addRowByColumnIndexes([29,112,184,274],265);
a.addRowByColumnIndexes([29,113,185,275],266);a.addRowByColumnIndexes([29,114,186,276],267);
a.addRowByColumnIndexes([29,115,187,277],268);a.addRowByColumnIndexes([29,116,188,278],269);
a.addRowByColumnIndexes([30,108,189,279],270);a.addRowByColumnIndexes([30,109,190,280],271);
a.addRowByColumnIndexes([30,110,191,281],272);a.addRowByColumnIndexes([30,111,192,282],273);
a.addRowByColumnIndexes([30,112,193,283],274);a.addRowByColumnIndexes([30,113,194,284],275);
a.addRowByColumnIndexes([30,114,195,285],276);a.addRowByColumnIndexes([30,115,196,286],277);
a.addRowByColumnIndexes([30,116,197,287],278);a.addRowByColumnIndexes([31,108,198,279],279);
a.addRowByColumnIndexes([31,109,199,280],280);a.addRowByColumnIndexes([31,110,200,281],281);
a.addRowByColumnIndexes([31,111,201,282],282);a.addRowByColumnIndexes([31,112,202,283],283);
a.addRowByColumnIndexes([31,113,203,284],284);a.addRowByColumnIndexes([31,114,204,285],285);
a.addRowByColumnIndexes([31,115,205,286],286);a.addRowByColumnIndexes([31,116,206,287],287);
a.addRowByColumnIndexes([32,108,207,279],288);a.addRowByColumnIndexes([32,109,208,280],289);
a.addRowByColumnIndexes([32,110,209,281],290);a.addRowByColumnIndexes([32,111,210,282],291);
a.addRowByColumnIndexes([32,112,211,283],292);a.addRowByColumnIndexes([32,113,212,284],293);
a.addRowByColumnIndexes([32,114,213,285],294);a.addRowByColumnIndexes([32,115,214,286],295);
a.addRowByColumnIndexes([32,116,215,287],296);a.addRowByColumnIndexes([33,108,216,288],297);
a.addRowByColumnIndexes([33,109,217,289],298);a.addRowByColumnIndexes([33,110,218,290],299);
a.addRowByColumnIndexes([33,111,219,291],300);a.addRowByColumnIndexes([33,112,220,292],301);
a.addRowByColumnIndexes([33,113,221,293],302);a.addRowByColumnIndexes([33,114,222,294],303);
a.addRowByColumnIndexes([33,115,223,295],304);a.addRowByColumnIndexes([33,116,224,296],305);
a.addRowByColumnIndexes([34,108,225,288],306);a.addRowByColumnIndexes([34,109,226,289],307);
a.addRowByColumnIndexes([34,110,227,290],308);a.addRowByColumnIndexes([34,111,228,291],309);
a.addRowByColumnIndexes([34,112,229,292],310);a.addRowByColumnIndexes([34,113,230,293],311);
a.addRowByColumnIndexes([34,114,231,294],312);a.addRowByColumnIndexes([34,115,232,295],313);
a.addRowByColumnIndexes([34,116,233,296],314);a.addRowByColumnIndexes([35,108,234,288],315);
a.addRowByColumnIndexes([35,109,235,289],316);a.addRowByColumnIndexes([35,110,236,290],317);
a.addRowByColumnIndexes([35,111,237,291],318);a.addRowByColumnIndexes([35,112,238,292],319);
a.addRowByColumnIndexes([35,113,239,293],320);a.addRowByColumnIndexes([35,114,240,294],321);
a.addRowByColumnIndexes([35,115,241,295],322);a.addRowByColumnIndexes([35,116,242,296],323);
a.addRowByColumnIndexes([36,117,162,270],324);a.addRowByColumnIndexes([36,118,163,271],325);
a.addRowByColumnIndexes([36,119,164,272],326);a.addRowByColumnIndexes([36,120,165,273],327);
a.addRowByColumnIndexes([36,121,166,274],328);a.addRowByColumnIndexes([36,122,167,275],329);
a.addRowByColumnIndexes([36,123,168,276],330);a.addRowByColumnIndexes([36,124,169,277],331);
a.addRowByColumnIndexes([36,125,170,278],332);a.addRowByColumnIndexes([37,117,171,270],333);
a.addRowByColumnIndexes([37,118,172,271],334);a.addRowByColumnIndexes([37,119,173,272],335);
a.addRowByColumnIndexes([37,120,174,273],336);a.addRowByColumnIndexes([37,121,175,274],337);
a.addRowByColumnIndexes([37,122,176,275],338);a.addRowByColumnIndexes([37,123,177,276],339);
a.addRowByColumnIndexes([37,124,178,277],340);a.addRowByColumnIndexes([37,125,179,278],341);
a.addRowByColumnIndexes([38,117,180,270],342);a.addRowByColumnIndexes([38,118,181,271],343);
a.addRowByColumnIndexes([38,119,182,272],344);a.addRowByColumnIndexes([38,120,183,273],345);
a.addRowByColumnIndexes([38,121,184,274],346);a.addRowByColumnIndexes([38,122,185,275],347);
a.addRowByColumnIndexes([38,123,186,276],348);a.addRowByColumnIndexes([38,124,187,277],349);
a.addRowByColumnIndexes([38,125,188,278],350);a.addRowByColumnIndexes([39,117,189,279],351);
a.addRowByColumnIndexes([39,118,190,280],352);a.addRowByColumnIndexes([39,119,191,281],353);
a.addRowByColumnIndexes([39,120,192,282],354);a.addRowByColumnIndexes([39,121,193,283],355);
a.addRowByColumnIndexes([39,122,194,284],356);a.addRowByColumnIndexes([39,123,195,285],357);
a.addRowByColumnIndexes([39,124,196,286],358);a.addRowByColumnIndexes([39,125,197,287],359);
a.addRowByColumnIndexes([40,117,198,279],360);a.addRowByColumnIndexes([40,118,199,280],361);
a.addRowByColumnIndexes([40,119,200,281],362);a.addRowByColumnIndexes([40,120,201,282],363);
a.addRowByColumnIndexes([40,121,202,283],364);a.addRowByColumnIndexes([40,122,203,284],365);
a.addRowByColumnIndexes([40,123,204,285],366);a.addRowByColumnIndexes([40,124,205,286],367);
a.addRowByColumnIndexes([40,125,206,287],368);a.addRowByColumnIndexes([41,117,207,279],369);
a.addRowByColumnIndexes([41,118,208,280],370);a.addRowByColumnIndexes([41,119,209,281],371);
a.addRowByColumnIndexes([41,120,210,282],372);a.addRowByColumnIndexes([41,121,211,283],373);
a.addRowByColumnIndexes([41,122,212,284],374);a.addRowByColumnIndexes([41,123,213,285],375);
a.addRowByColumnIndexes([41,124,214,286],376);a.addRowByColumnIndexes([41,125,215,287],377);
a.addRowByColumnIndexes([42,117,216,288],378);a.addRowByColumnIndexes([42,118,217,289],379);
a.addRowByColumnIndexes([42,119,218,290],380);a.addRowByColumnIndexes([42,120,219,291],381);
a.addRowByColumnIndexes([42,121,220,292],382);a.addRowByColumnIndexes([42,122,221,293],383);
a.addRowByColumnIndexes([42,123,222,294],384);a.addRowByColumnIndexes([42,124,223,295],385);
a.addRowByColumnIndexes([42,125,224,296],386);a.addRowByColumnIndexes([43,117,225,288],387);
a.addRowByColumnIndexes([43,118,226,289],388);a.addRowByColumnIndexes([43,119,227,290],389);
a.addRowByColumnIndexes([43,120,228,291],390);a.addRowByColumnIndexes([43,121,229,292],391);
a.addRowByColumnIndexes([43,122,230,293],392);a.addRowByColumnIndexes([43,123,231,294],393);
a.addRowByColumnIndexes([43,124,232,295],394);a.addRowByColumnIndexes([43,125,233,296],395);
a.addRowByColumnIndexes([44,117,234,288],396);a.addRowByColumnIndexes([44,118,235,289],397);
a.addRowByColumnIndexes([44,119,236,290],398);a.addRowByColumnIndexes([44,120,237,291],399);
a.addRowByColumnIndexes([44,121,238,292],400);a.addRowByColumnIndexes([44,122,239,293],401);
a.addRowByColumnIndexes([44,123,240,294],402);a.addRowByColumnIndexes([44,124,241,295],403);
a.addRowByColumnIndexes([44,125,242,296],404);a.addRowByColumnIndexes([45,126,162,270],405);
a.addRowByColumnIndexes([45,127,163,271],406);a.addRowByColumnIndexes([45,128,164,272],407);
a.addRowByColumnIndexes([45,129,165,273],408);a.addRowByColumnIndexes([45,130,166,274],409);
a.addRowByColumnIndexes([45,131,167,275],410);a.addRowByColumnIndexes([45,132,168,276],411);
a.addRowByColumnIndexes([45,133,169,277],412);a.addRowByColumnIndexes([45,134,170,278],413);
a.addRowByColumnIndexes([46,126,171,270],414);a.addRowByColumnIndexes([46,127,172,271],415);
a.addRowByColumnIndexes([46,128,173,272],416);a.addRowByColumnIndexes([46,129,174,273],417);
a.addRowByColumnIndexes([46,130,175,274],418);a.addRowByColumnIndexes([46,131,176,275],419);
a.addRowByColumnIndexes([46,132,177,276],420);a.addRowByColumnIndexes([46,133,178,277],421);
a.addRowByColumnIndexes([46,134,179,278],422);a.addRowByColumnIndexes([47,126,180,270],423);
a.addRowByColumnIndexes([47,127,181,271],424);a.addRowByColumnIndexes([47,128,182,272],425);
a.addRowByColumnIndexes([47,129,183,273],426);a.addRowByColumnIndexes([47,130,184,274],427);
a.addRowByColumnIndexes([47,131,185,275],428);a.addRowByColumnIndexes([47,132,186,276],429);
a.addRowByColumnIndexes([47,133,187,277],430);a.addRowByColumnIndexes([47,134,188,278],431);
a.addRowByColumnIndexes([48,126,189,279],432);a.addRowByColumnIndexes([48,127,190,280],433);
a.addRowByColumnIndexes([48,128,191,281],434);a.addRowByColumnIndexes([48,129,192,282],435);
a.addRowByColumnIndexes([48,130,193,283],436);a.addRowByColumnIndexes([48,131,194,284],437);
a.addRowByColumnIndexes([48,132,195,285],438);a.addRowByColumnIndexes([48,133,196,286],439);
a.addRowByColumnIndexes([48,134,197,287],440);a.addRowByColumnIndexes([49,126,198,279],441);
a.addRowByColumnIndexes([49,127,199,280],442);a.addRowByColumnIndexes([49,128,200,281],443);
a.addRowByColumnIndexes([49,129,201,282],444);a.addRowByColumnIndexes([49,130,202,283],445);
a.addRowByColumnIndexes([49,131,203,284],446);a.addRowByColumnIndexes([49,132,204,285],447);
a.addRowByColumnIndexes([49,133,205,286],448);a.addRowByColumnIndexes([49,134,206,287],449);
a.addRowByColumnIndexes([50,126,207,279],450);a.addRowByColumnIndexes([50,127,208,280],451);
a.addRowByColumnIndexes([50,128,209,281],452);a.addRowByColumnIndexes([50,129,210,282],453);
a.addRowByColumnIndexes([50,130,211,283],454);a.addRowByColumnIndexes([50,131,212,284],455);
a.addRowByColumnIndexes([50,132,213,285],456);a.addRowByColumnIndexes([50,133,214,286],457);
a.addRowByColumnIndexes([50,134,215,287],458);a.addRowByColumnIndexes([51,126,216,288],459);
a.addRowByColumnIndexes([51,127,217,289],460);a.addRowByColumnIndexes([51,128,218,290],461);
a.addRowByColumnIndexes([51,129,219,291],462);a.addRowByColumnIndexes([51,130,220,292],463);
a.addRowByColumnIndexes([51,131,221,293],464);a.addRowByColumnIndexes([51,132,222,294],465);
a.addRowByColumnIndexes([51,133,223,295],466);a.addRowByColumnIndexes([51,134,224,296],467);
a.addRowByColumnIndexes([52,126,225,288],468);a.addRowByColumnIndexes([52,127,226,289],469);
a.addRowByColumnIndexes([52,128,227,290],470);a.addRowByColumnIndexes([52,129,228,291],471);
a.addRowByColumnIndexes([52,130,229,292],472);a.addRowByColumnIndexes([52,131,230,293],473);
a.addRowByColumnIndexes([52,132,231,294],474);a.addRowByColumnIndexes([52,133,232,295],475);
a.addRowByColumnIndexes([52,134,233,296],476);a.addRowByColumnIndexes([53,126,234,288],477);
a.addRowByColumnIndexes([53,127,235,289],478);a.addRowByColumnIndexes([53,128,236,290],479);
a.addRowByColumnIndexes([53,129,237,291],480);a.addRowByColumnIndexes([53,130,238,292],481);
a.addRowByColumnIndexes([53,131,239,293],482);a.addRowByColumnIndexes([53,132,240,294],483);
a.addRowByColumnIndexes([53,133,241,295],484);a.addRowByColumnIndexes([53,134,242,296],485);
a.addRowByColumnIndexes([54,135,162,297],486);a.addRowByColumnIndexes([54,136,163,298],487);
a.addRowByColumnIndexes([54,137,164,299],488);a.addRowByColumnIndexes([54,138,165,300],489);
a.addRowByColumnIndexes([54,139,166,301],490);a.addRowByColumnIndexes([54,140,167,302],491);
a.addRowByColumnIndexes([54,141,168,303],492);a.addRowByColumnIndexes([54,142,169,304],493);
a.addRowByColumnIndexes([54,143,170,305],494);a.addRowByColumnIndexes([55,135,171,297],495);
a.addRowByColumnIndexes([55,136,172,298],496);a.addRowByColumnIndexes([55,137,173,299],497);
a.addRowByColumnIndexes([55,138,174,300],498);a.addRowByColumnIndexes([55,139,175,301],499);
a.addRowByColumnIndexes([55,140,176,302],500);a.addRowByColumnIndexes([55,141,177,303],501);
a.addRowByColumnIndexes([55,142,178,304],502);a.addRowByColumnIndexes([55,143,179,305],503);
a.addRowByColumnIndexes([56,135,180,297],504);a.addRowByColumnIndexes([56,136,181,298],505);
a.addRowByColumnIndexes([56,137,182,299],506);a.addRowByColumnIndexes([56,138,183,300],507);
a.addRowByColumnIndexes([56,139,184,301],508);a.addRowByColumnIndexes([56,140,185,302],509);
a.addRowByColumnIndexes([56,141,186,303],510);a.addRowByColumnIndexes([56,142,187,304],511);
a.addRowByColumnIndexes([56,143,188,305],512);a.addRowByColumnIndexes([57,135,189,306],513);
a.addRowByColumnIndexes([57,136,190,307],514);a.addRowByColumnIndexes([57,137,191,308],515);
a.addRowByColumnIndexes([57,138,192,309],516);a.addRowByColumnIndexes([57,139,193,310],517);
a.addRowByColumnIndexes([57,140,194,311],518);a.addRowByColumnIndexes([57,141,195,312],519);
a.addRowByColumnIndexes([57,142,196,313],520);a.addRowByColumnIndexes([57,143,197,314],521);
a.addRowByColumnIndexes([58,135,198,306],522);a.addRowByColumnIndexes([58,136,199,307],523);
a.addRowByColumnIndexes([58,137,200,308],524);a.addRowByColumnIndexes([58,138,201,309],525);
a.addRowByColumnIndexes([58,139,202,310],526);a.addRowByColumnIndexes([58,140,203,311],527);
a.addRowByColumnIndexes([58,141,204,312],528);a.addRowByColumnIndexes([58,142,205,313],529);
a.addRowByColumnIndexes([58,143,206,314],530);a.addRowByColumnIndexes([59,135,207,306],531);
a.addRowByColumnIndexes([59,136,208,307],532);a.addRowByColumnIndexes([59,137,209,308],533);
a.addRowByColumnIndexes([59,138,210,309],534);a.addRowByColumnIndexes([59,139,211,310],535);
a.addRowByColumnIndexes([59,140,212,311],536);a.addRowByColumnIndexes([59,141,213,312],537);
a.addRowByColumnIndexes([59,142,214,313],538);a.addRowByColumnIndexes([59,143,215,314],539);
a.addRowByColumnIndexes([60,135,216,315],540);a.addRowByColumnIndexes([60,136,217,316],541);
a.addRowByColumnIndexes([60,137,218,317],542);a.addRowByColumnIndexes([60,138,219,318],543);
a.addRowByColumnIndexes([60,139,220,319],544);a.addRowByColumnIndexes([60,140,221,320],545);
a.addRowByColumnIndexes([60,141,222,321],546);a.addRowByColumnIndexes([60,142,223,322],547);
a.addRowByColumnIndexes([60,143,224,323],548);a.addRowByColumnIndexes([61,135,225,315],549);
a.addRowByColumnIndexes([61,136,226,316],550);a.addRowByColumnIndexes([61,137,227,317],551);
a.addRowByColumnIndexes([61,138,228,318],552);a.addRowByColumnIndexes([61,139,229,319],553);
a.addRowByColumnIndexes([61,140,230,320],554);a.addRowByColumnIndexes([61,141,231,321],555);
a.addRowByColumnIndexes([61,142,232,322],556);a.addRowByColumnIndexes([61,143,233,323],557);
a.addRowByColumnIndexes([62,135,234,315],558);a.addRowByColumnIndexes([62,136,235,316],559);
a.addRowByColumnIndexes([62,137,236,317],560);a.addRowByColumnIndexes([62,138,237,318],561);
a.addRowByColumnIndexes([62,139,238,319],562);a.addRowByColumnIndexes([62,140,239,320],563);
a.addRowByColumnIndexes([62,141,240,321],564);a.addRowByColumnIndexes([62,142,241,322],565);
a.addRowByColumnIndexes([62,143,242,323],566);a.addRowByColumnIndexes([63,144,162,297],567);
a.addRowByColumnIndexes([63,145,163,298],568);a.addRowByColumnIndexes([63,146,164,299],569);
a.addRowByColumnIndexes([63,147,165,300],570);a.addRowByColumnIndexes([63,148,166,301],571);
a.addRowByColumnIndexes([63,149,167,302],572);a.addRowByColumnIndexes([63,150,168,303],573);
a.addRowByColumnIndexes([63,151,169,304],574);a.addRowByColumnIndexes([63,152,170,305],575);
a.addRowByColumnIndexes([64,144,171,297],576);a.addRowByColumnIndexes([64,145,172,298],577);
a.addRowByColumnIndexes([64,146,173,299],578);a.addRowByColumnIndexes([64,147,174,300],579);
a.addRowByColumnIndexes([64,148,175,301],580);a.addRowByColumnIndexes([64,149,176,302],581);
a.addRowByColumnIndexes([64,150,177,303],582);a.addRowByColumnIndexes([64,151,178,304],583);
a.addRowByColumnIndexes([64,152,179,305],584);a.addRowByColumnIndexes([65,144,180,297],585);
a.addRowByColumnIndexes([65,145,181,298],586);a.addRowByColumnIndexes([65,146,182,299],587);
a.addRowByColumnIndexes([65,147,183,300],588);a.addRowByColumnIndexes([65,148,184,301],589);
a.addRowByColumnIndexes([65,149,185,302],590);a.addRowByColumnIndexes([65,150,186,303],591);
a.addRowByColumnIndexes([65,151,187,304],592);a.addRowByColumnIndexes([65,152,188,305],593);
a.addRowByColumnIndexes([66,144,189,306],594);a.addRowByColumnIndexes([66,145,190,307],595);
a.addRowByColumnIndexes([66,146,191,308],596);a.addRowByColumnIndexes([66,147,192,309],597);
a.addRowByColumnIndexes([66,148,193,310],598);a.addRowByColumnIndexes([66,149,194,311],599);
a.addRowByColumnIndexes([66,150,195,312],600);a.addRowByColumnIndexes([66,151,196,313],601);
a.addRowByColumnIndexes([66,152,197,314],602);a.addRowByColumnIndexes([67,144,198,306],603);
a.addRowByColumnIndexes([67,145,199,307],604);a.addRowByColumnIndexes([67,146,200,308],605);
a.addRowByColumnIndexes([67,147,201,309],606);a.addRowByColumnIndexes([67,148,202,310],607);
a.addRowByColumnIndexes([67,149,203,311],608);a.addRowByColumnIndexes([67,150,204,312],609);
a.addRowByColumnIndexes([67,151,205,313],610);a.addRowByColumnIndexes([67,152,206,314],611);
a.addRowByColumnIndexes([68,144,207,306],612);a.addRowByColumnIndexes([68,145,208,307],613);
a.addRowByColumnIndexes([68,146,209,308],614);a.addRowByColumnIndexes([68,147,210,309],615);
a.addRowByColumnIndexes([68,148,211,310],616);a.addRowByColumnIndexes([68,149,212,311],617);
a.addRowByColumnIndexes([68,150,213,312],618);a.addRowByColumnIndexes([68,151,214,313],619);
a.addRowByColumnIndexes([68,152,215,314],620);a.addRowByColumnIndexes([69,144,216,315],621);
a.addRowByColumnIndexes([69,145,217,316],622);a.addRowByColumnIndexes([69,146,218,317],623);
a.addRowByColumnIndexes([69,147,219,318],624);a.addRowByColumnIndexes([69,148,220,319],625);
a.addRowByColumnIndexes([69,149,221,320],626);a.addRowByColumnIndexes([69,150,222,321],627);
a.addRowByColumnIndexes([69,151,223,322],628);a.addRowByColumnIndexes([69,152,224,323],629);
a.addRowByColumnIndexes([70,144,225,315],630);a.addRowByColumnIndexes([70,145,226,316],631);
a.addRowByColumnIndexes([70,146,227,317],632);a.addRowByColumnIndexes([70,147,228,318],633);
a.addRowByColumnIndexes([70,148,229,319],634);a.addRowByColumnIndexes([70,149,230,320],635);
a.addRowByColumnIndexes([70,150,231,321],636);a.addRowByColumnIndexes([70,151,232,322],637);
a.addRowByColumnIndexes([70,152,233,323],638);a.addRowByColumnIndexes([71,144,234,315],639);
a.addRowByColumnIndexes([71,145,235,316],640);a.addRowByColumnIndexes([71,146,236,317],641);
a.addRowByColumnIndexes([71,147,237,318],642);a.addRowByColumnIndexes([71,148,238,319],643);
a.addRowByColumnIndexes([71,149,239,320],644);a.addRowByColumnIndexes([71,150,240,321],645);
a.addRowByColumnIndexes([71,151,241,322],646);a.addRowByColumnIndexes([71,152,242,323],647);
a.addRowByColumnIndexes([72,153,162,297],648);a.addRowByColumnIndexes([72,154,163,298],649);
a.addRowByColumnIndexes([72,155,164,299],650);a.addRowByColumnIndexes([72,156,165,300],651);
a.addRowByColumnIndexes([72,157,166,301],652);a.addRowByColumnIndexes([72,158,167,302],653);
a.addRowByColumnIndexes([72,159,168,303],654);a.addRowByColumnIndexes([72,160,169,304],655);
a.addRowByColumnIndexes([72,161,170,305],656);a.addRowByColumnIndexes([73,153,171,297],657);
a.addRowByColumnIndexes([73,154,172,298],658);a.addRowByColumnIndexes([73,155,173,299],659);
a.addRowByColumnIndexes([73,156,174,300],660);a.addRowByColumnIndexes([73,157,175,301],661);
a.addRowByColumnIndexes([73,158,176,302],662);a.addRowByColumnIndexes([73,159,177,303],663);
a.addRowByColumnIndexes([73,160,178,304],664);a.addRowByColumnIndexes([73,161,179,305],665);
a.addRowByColumnIndexes([74,153,180,297],666);a.addRowByColumnIndexes([74,154,181,298],667);
a.addRowByColumnIndexes([74,155,182,299],668);a.addRowByColumnIndexes([74,156,183,300],669);
a.addRowByColumnIndexes([74,157,184,301],670);a.addRowByColumnIndexes([74,158,185,302],671);
a.addRowByColumnIndexes([74,159,186,303],672);a.addRowByColumnIndexes([74,160,187,304],673);
a.addRowByColumnIndexes([74,161,188,305],674);a.addRowByColumnIndexes([75,153,189,306],675);
a.addRowByColumnIndexes([75,154,190,307],676);a.addRowByColumnIndexes([75,155,191,308],677);
a.addRowByColumnIndexes([75,156,192,309],678);a.addRowByColumnIndexes([75,157,193,310],679);
a.addRowByColumnIndexes([75,158,194,311],680);a.addRowByColumnIndexes([75,159,195,312],681);
a.addRowByColumnIndexes([75,160,196,313],682);a.addRowByColumnIndexes([75,161,197,314],683);
a.addRowByColumnIndexes([76,153,198,306],684);a.addRowByColumnIndexes([76,154,199,307],685);
a.addRowByColumnIndexes([76,155,200,308],686);a.addRowByColumnIndexes([76,156,201,309],687);
a.addRowByColumnIndexes([76,157,202,310],688);a.addRowByColumnIndexes([76,158,203,311],689);
a.addRowByColumnIndexes([76,159,204,312],690);a.addRowByColumnIndexes([76,160,205,313],691);
a.addRowByColumnIndexes([76,161,206,314],692);a.addRowByColumnIndexes([77,153,207,306],693);
a.addRowByColumnIndexes([77,154,208,307],694);a.addRowByColumnIndexes([77,155,209,308],695);
a.addRowByColumnIndexes([77,156,210,309],696);a.addRowByColumnIndexes([77,157,211,310],697);
a.addRowByColumnIndexes([77,158,212,311],698);a.addRowByColumnIndexes([77,159,213,312],699);
a.addRowByColumnIndexes([77,160,214,313],700);a.addRowByColumnIndexes([77,161,215,314],701);
a.addRowByColumnIndexes([78,153,216,315],702);a.addRowByColumnIndexes([78,154,217,316],703);
a.addRowByColumnIndexes([78,155,218,317],704);a.addRowByColumnIndexes([78,156,219,318],705);
a.addRowByColumnIndexes([78,157,220,319],706);a.addRowByColumnIndexes([78,158,221,320],707);
a.addRowByColumnIndexes([78,159,222,321],708);a.addRowByColumnIndexes([78,160,223,322],709);
a.addRowByColumnIndexes([78,161,224,323],710);a.addRowByColumnIndexes([79,153,225,315],711);
a.addRowByColumnIndexes([79,154,226,316],712);a.addRowByColumnIndexes([79,155,227,317],713);
a.addRowByColumnIndexes([79,156,228,318],714);a.addRowByColumnIndexes([79,157,229,319],715);
a.addRowByColumnIndexes([79,158,230,320],716);a.addRowByColumnIndexes([79,159,231,321],717);
a.addRowByColumnIndexes([79,160,232,322],718);a.addRowByColumnIndexes([79,161,233,323],719);
a.addRowByColumnIndexes([80,153,234,315],720);a.addRowByColumnIndexes([80,154,235,316],721);
a.addRowByColumnIndexes([80,155,236,317],722);a.addRowByColumnIndexes([80,156,237,318],723);
a.addRowByColumnIndexes([80,157,238,319],724);a.addRowByColumnIndexes([80,158,239,320],725);
a.addRowByColumnIndexes([80,159,240,321],726);a.addRowByColumnIndexes([80,160,241,322],727);
a.addRowByColumnIndexes([80,161,242,323],728);return a};Sudoku.BoardView=SC.View.extend({acceptsFirstResponder:YES,className:"board",content:null,numberOfRows:null,numberOfColumns:null,currentSelection:-1,selection:null,csDidChange:function(){}.observes("currentSelection"),rerender:function(){this.removeAllChildren();
var e=this.get("content"),f=this.get("frame"),j=this.get("numberOfRows"),a=this.get("numberOfColumns"),c=this.get("exampleView"),g,b;
var i=this,h=0,d=-1;e.forEach(function(p,n){var l=i.get("cellHeight"),o=i.get("cellWidth");
if(n>0&&n%a===0){h++}d=(d+1)%a;var r=(n%9)*o,q=h*l;if(d>2){r=r+3}if(d>5){r=r+3}var k=0;
if(h===3||h===6){k=-2}b={top:q,left:r,height:i.get("cellHeight")+k,width:i.get("cellWidth")};
var m="";if(h===0){m+=" top"}if(d===8){m+=" right"}if(d%3===2){m+=" thick-right"}if(h%3===0){m+=" thick-top"
}g=c.create({boardClasses:m,content:e.objectAt(n),layout:b});i.appendChild(g)})},keyDown:function(a){var b=a.which,d=NO,c=this.get("isEnabled");
if(!c){return NO}if(b===SC.Event.KEY_LEFT){this.goLeft();d=YES}else{if(b===SC.Event.KEY_RIGHT){this.goRight();
d=YES}else{if(b===SC.Event.KEY_UP){this.goUp();d=YES}else{if(b===SC.Event.KEY_DOWN){this.goDown();
d=YES}}}}return d},mouseDown:function(a){return NO},mouseUp:function(a){var c=this.get("isEnabled");
if(!c){return NO}if(a.which===3){return YES}var d=this.get("childViews"),b=d.indexOf(a.cellView);
if(b){this.set("currentSelection",b)}return YES},keyUp:function(){return YES},goLeft:function(){var b=this.get("isEnabled");
if(!b){return NO}var a=this.get("currentSelection");if(a===0){return}this._previousSelection=a;
this.decrementProperty("currentSelection")},goRight:function(){var b=this.get("isEnabled");
if(!b){return NO}var a=this.get("currentSelection");if(a===this.getPath("content.length")-1){return
}this._previousSelection=a;this.incrementProperty("currentSelection")},goUp:function(){var b=this.get("isEnabled");
if(!b){return NO}var a=this.get("currentSelection"),c=this.get("numberOfColumns");
if(a-c<0){return}this._previousSelection=a;this.decrementProperty("currentSelection",c)
},goDown:function(){var b=this.get("isEnabled");if(!b){return NO}var a=this.get("currentSelection"),c=this.get("numberOfColumns");
if(a+c>this.getPath("content.length")-1){return}this._previousSelection=a;this.incrementProperty("currentSelection",c)
},highlightSelection:function(){var b=this.get("currentSelection"),c=this.get("childViews");
var a=c.objectAt(b);if(a){a.becomeFirstResponder()}}.observes("currentSelection"),update:function(){this.rerender()
}.observes("*content.[]"),cellWidth:function(){var b=this.get("frame"),a=this.get("numberOfColumns");
return Math.floor(b.width/a)}.property("*frame","*frame.width").cacheable(),cellHeight:function(){var b=this.get("frame"),a=this.get("numberOfRows");
return Math.floor(b.width/a)}.property("*frame","*frame.width").cacheable()});Sudoku.CellView=SC.View.extend(SC.ContentDisplay,{isContextMenuEnabled:NO,content:null,showHints:NO,acceptsFirstResponder:YES,showHintsBinding:"Sudoku.showHintsController*content",showHintsBindingDefault:SC.Binding.oneWay(),showNotes:NO,contentDisplayProperties:["value","hintsProp","notes","incorrect"],displayProperties:["state","boardClasses"],wantsAcceleratedLayer:YES,state:Sudoku.INPUT_STATE,selected:NO,boardClasses:"",render:function(a,g){var i=this.getPath("content.given"),f=this.getPath("content.index"),r=this.getPath("content.value"),q=this.get("showNotes"),c="%@".fmt(r),e=this.get("state"),n=this.get("isFirstResponder"),h=this.getPath("content.notes.length"),k=this.get("boardClasses");
a=a.addClass(k);if(n){a=a.addClass("board-highlight")}if(e===Sudoku.GIVEN_STATE){a=a.addClass("sudoku-cell");
a=a.begin("div").addClass("sudoku-given").push(r).end()}else{if(e===Sudoku.HAS_VALUE_STATE&&!q){var j=this.get("frame");
var m=this.getPath("content.incorrect");var d=j.width-20;var o="sudoku-cell";if(m){o+=" incorrect"
}a=a.addClass(o);if(n){var p="position:absolute; height:20px; width:20px; left:%@px;".fmt(d);
a=a.begin("div").addClass("sudoku-delete").attr("style",p).attr("id","%@-%@".fmt(SC.guidFor(this),r)).end();
p="position:absolute; height:20px; width:20px; left:%@px;".fmt(0);a=a.begin("div").addClass("notes-icon-small").attr("style",p).end()
}a=a.begin("div").addClass("sudoku-value").push(r).end()}else{if(e===Sudoku.INPUT_STATE){a=a.addClass("sudoku-cell");
a=a.begin("div").addClass("sudoku-value").push(r).end()}else{if(e===Sudoku.HINTS_STATE){a=a.addClass("sudoku-hints");
a=this._renderAvailable(a,"content.hintsProp","content.hintsSize",YES)}else{if(e=Sudoku.NOTES_STATE){a=a.addClass("sudoku-notes");
a=this._renderAvailable(a,"content.notes","content.notes.length",NO);if(h===1&&n){var b=this.getPath("content.notes").objectAt(0).get("hint");
var l=b==1?20:0;var p="position:absolute; height:20px; width:20px; left:%@px;top:%@px".fmt(0,l);
a=a.begin("div").addClass("notes-icon-small").attr("style",p).end()}}else{}}}}}arguments.callee.base.apply(this,arguments)
},_renderAvailable:function(a,c,r,d){var g=this.get("frame");var m=this.getPath(c);
var s=Math.floor(g.height/3);var l=Math.floor(g.width/3);var e=this.getPath(r);var o="sc-view available";
if(d&&e===1){o+=" pulse"}else{if(d&&e===0){o+=" flash"}}a=a.addClass("sc-view sudoku-cell");
a=a.begin("div").addClass(o).attr("style","position:absolute;top:1px;left:1px;width:%@px;height:%@px;".fmt(g.width,g.height));
if(m){for(var p=0;p<9;p++){var f=m.objectAt(p),t="",h=null,n=-1;if(f){h=f.get("hint");
n=h-1}else{n=p}var k=0;if(n>2&&n<=5){k+=s}else{if(n>5){k+=s*2}}var b=(n%3)*l;var q="position:absolute; height:%@px;width:%@px;top:%@px;left:%@px;".fmt(s,l,k,b);
a=a.begin("div").addClass("hint singleSize").attr("style",q).attr("id","%@-%@".fmt(SC.guidFor(this),n+1)).push(h).end()
}}a=a.end();return a},modeChanged:function(){var g=this.getPath("content.given"),c=this.getPath("content.hasValue"),e=this.get("showHints"),b=this.get("showNotes"),a=this.getPath("content.hasNotes"),f=this.getPath("content.notes.length");
var d=this.getPath("parentView.isEnabled");if(!d){return NO}if(g){this.set("state",Sudoku.GIVEN_STATE)
}else{if((b&&!e)||(a&&f>1)){this.set("state",Sudoku.NOTES_STATE)}else{if(c&&!b){this.set("state",Sudoku.HAS_VALUE_STATE)
}else{if(!c&&!e&&!b){this.set("state",Sudoku.INPUT_STATE)}else{if(e){this.set("state",Sudoku.HINTS_STATE)
}else{console.log("setting state to unknown")}}}}}this.notifyPropertyChange("state")
}.observes("*content.given","*content.value","*content.hasNotes",".showHints",".showNotes"),didCreateLayer:function(){this.modeChanged()
},contextMenu:function(a){this.handleRightClick(a);return arguments.callee.base.apply(this,arguments)
},mouseEntered:function(a){this.getPath("parentView").set("currentSelection",this.getPath("content.index"));
return YES},mouseMoved:function(a){if(SC.$(a.target).hasClass("notes-icon-small")){SC.$(a.target).addClass("notes-icon-small-over")
}else{if(SC.$(a.target).hasClass("sudoku-delete")){SC.$(a.target).addClass("sudoku-delete-over")
}else{this.$(".sudoku-delete-over").removeClass("sudoku-delete-over");this.$(".notes-icon-small-over").removeClass("notes-icon-small-over")
}}return YES},mouseExited:function(a){return YES},mouseDown:function(a){if(a.which===3){return NO
}return this.handleClickTouchDown(a)},mouseUp:function(a){return this.handleClickTouchUp(a)
},touchStart:function(a){return this.handleClickTouchDown(a)},touchEnd:function(a){return this.handleClickTouchUp(a)
},handleRightClick:function(a){var b=this.getPath("parentView.isEnabled");if(!b){return NO
}var c=Sudoku.ModeController.get("mode");Sudoku.competitivePane.pane.remove();if(c==="tutor"){Sudoku.tutorPane.anyWherePane.popup(this,SC.PICKER_POINTER,[3,0,1,2,3],[9,-9,-14,14])
}else{Sudoku.competitivePane.anyWherePane.popup(this,SC.PICKER_POINTER,[3,0,1,2,3],[9,-9,-14,14])
}return NO},handleClickTouchUp:function(a){var b=this.get("state");if(b===Sudoku.HAS_VALUE_STATE){if(SC.$(a.target).hasClass("sudoku-delete")){this.setPath("content.value","");
this.get("content").clearNotes();SC.$(a.target).removeClass("sudoku-delete-over");
return YES}else{if(SC.$(a.target).hasClass("notes-icon-small")){this.toggleProperty("showNotes");
return YES}}}else{if(b===Sudoku.NOTES_STATE){if(SC.$(a.target).hasClass("notes-icon-small")){this.toggleProperty("showNotes");
return YES}}}return NO},handleClickTouchDown:function(a){var c=this.get("state");
var b=this.getPath("parentView.isEnabled");if(!b){return NO}if(c===Sudoku.GIVEN_STATE){return YES
}else{if(c===Sudoku.HAS_VALUE_STATE){if(SC.$(a.target).hasClass("sudoku-delete")){SC.$(a.target).addClass("sudoku-delete-over");
return YES}else{if(SC.$(a.target).hasClass("notes-icon-small")){return YES}}this.showInputs();
return YES}else{if(c===Sudoku.NOTES_STATE){if(SC.$(a.target).hasClass("notes-icon-small")){return YES
}}else{if(c===Sudoku.HINTS_STATE){return this._handleClickHintsState(a)}}}}this.showInputs();
return YES},_handleClickHintsState:function(a){var b=this.getPath("parentView.isEnabled");
if(!b){return NO}if(SC.platform.touch){this.showInputs(this.getPath("content.hintsProp"));
return YES}else{var c=a.target.innerHTML;if(c===null){c=a.target.textContent}c="%@".fmt(c);
if(/^\d$/.test(c)){this.setPath("content.value",c);return YES}return NO}},keyDown:function(a){var b=a.which,f=NO;
var c=this.getPath("parentView.isEnabled");if(!c){return NO}if(b===SC.Event.KEY_RETURN){f=YES
}else{if(b>=48&&b<=57){var e=this.get("state");if(e===Sudoku.GIVEN_STATE){return YES
}var g=SC.PRINTABLE_KEYS[b];if(g==0){var d=this.getPath("content");d.clearNotes();
d.notifyPropertyChange("value")}else{this.getPath("content").addNote(g)}f=YES}else{if(b===110){var g=SC.PRINTABLE_KEYS[b],e=this.get("state");
console.log("val [%@]".fmt(g));this.toggleProperty("showNotes")}else{a.allowDefault()
}}}return f},keyUp:function(a){var b=a.which,d=NO;var c=this.getPath("parentView.isEnabled");
if(!c){return NO}if(b===SC.Event.KEY_RETURN){this.showInputs();d=YES}return YES},notesSizeObserver:function(){var c=this.getPath("content.notes.length"),a=this.get("showNotes"),b=this.getPath("content.value");
if(c===1&&!a){this.set("state",Sudoku.HAS_VALUE_STATE)}else{if(c===1&&a){this.set("state",Sudoku.NOTES_STATE)
}else{if(c===0){this.set("state",Sudoku.INPUT_STATE)}else{this.set("state",Sudoku.NOTES_STATE)
}}}}.observes("*content.notes.length"),showInputs:function(a){this.becomeFirstResponder();
if(this.getPath("content.given")){return}this._input=Sudoku.paneController.showInputs(this,a);
this.hasInputs();return YES},hasInputs:function(){this.$().addClass("has-inputs")
},removeInputs:function(){this.$().removeClass("has-inputs")}});Sudoku.ClockView=SC.View.extend({classNames:"sudoku-timer".w(),childViews:"label".w(),label:SC.LabelView.design({layout:{top:0,left:0,width:80,height:24},valueBinding:"*parentView.value",valueBindingDefault:SC.Binding.oneWay()})});
Sudoku.horizontalInputView=SC.View.extend({classNames:"horizontal-bar",createChildViews:function(){var a,b=[];
a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2,top:2,height:72,width:72},value:1});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72,top:2,height:72,width:72},value:2});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*2,top:2,height:72,width:72},value:3});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*3,top:2,height:72,width:72},value:4});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*4,top:2,height:72,width:72},value:5});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*5,top:2,height:72,width:72},value:6});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*6,top:2,height:72,width:72},value:7});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*7,top:2,height:72,width:72},value:8});
b.push(a);a=this.createChildView(Sudoku.InputNumberView,{layout:{left:2+72*8,top:2,height:72,width:72},value:9});
b.push(a);this.set("childViews",b)}});Sudoku.mainPage=SC.Page.design({mainPane:SC.MainPane.design({defaultResponder:Sudoku.Statechart,hasTouchIntercept:YES,isKeyPane:YES,childViews:"boardShadow controlsView board disclaimer mask".w(),boardShadow:SC.View.design({classNames:"board-shadow",layout:{centerX:0,centerY:4,width:Sudoku.BOARD_WIDTH+26,height:Sudoku.BOARD_HEIGHT+72}}),disclaimer:SC.LabelView.design({classNames:"disclaimer",layout:{centerY:(Sudoku.BOARD_HEIGHT+112)/2,centerX:0,width:Sudoku.BOARD_WIDTH,height:18},value:'Powered by <a target="_blank" href="http://www.sproutcore.com/">SproutCore</a>',textAlign:SC.ALIGN_MIDDLE,escapeHTML:NO}),controlsView:SC.View.design({classNames:"sudoku-controls",layout:{centerX:0,centerY:-306,width:Sudoku.BOARD_WIDTH+26,height:58},childViews:"startpause divider1 clockicon clock divider2 menuicon menu divider3 answered remaining divider4 verify".w(),startpause:SC.ButtonView.design({classNames:"start-button",layout:{centerY:4,left:44,height:25,width:120},title:"Start Game",action:"toggleTimer"}),divider1:SC.View.design({classNames:"nav-divider",layout:{centerY:4,left:178,height:26,width:1}}),clockicon:SC.View.design({classNames:"timer-icon",layout:{left:190,centerY:4,width:17,height:17}}),clock:Sudoku.ClockView.design({layout:{left:212,width:80,top:0,bottom:0},valueBinding:"Sudoku.clockController.computedTime",valueBindingDefault:SC.Binding.oneWay()}),divider2:SC.View.design({classNames:"nav-divider",layout:{centerY:4,left:280,height:26,width:1}}),menuicon:SC.View.design({classNames:"options-icon",layout:{left:292,centerY:4,width:17,height:17}}),menu:SC.PopupButtonView.design({layout:{left:290,centerY:5,width:100,height:25},title:"Options",theme:"square",menu:Sudoku.competitivePane.pane,configureForCompetitive:function(){this.set("menu",Sudoku.competitivePane.pane)
},configureForTutor:function(){this.set("menu",Sudoku.tutorPane.pane)}}),divider3:SC.View.design({classNames:"nav-divider",layout:{centerY:4,left:382,height:26,width:1}}),answered:SC.LabelView.design({classNames:"stat",layout:{left:394,top:14,width:75,height:24},answeredBinding:"Sudoku.sudokuController*answered",answeredBindingDefault:SC.Binding.oneWay(),value:function(){return"Complete: %@".fmt(this.get("answered"))
}.property("answered")}),remaining:SC.LabelView.design({classNames:"stat",layout:{left:394,top:30,width:100,height:24},remainingBinding:"Sudoku.sudokuController*remaining",remainingindingDefault:SC.Binding.oneWay(),value:function(){return"Remaining: %@".fmt(this.get("remaining"))
}.property("remaining")}),divider4:SC.View.design({classNames:"nav-divider",layout:{centerY:4,left:481,height:26,width:1}}),verify:SC.ButtonView.design({classNames:"start-button",layout:{centerY:5,left:439,height:25,width:100},title:"Verify",action:"verify",isEnabledBinding:SC.Binding.from("Sudoku.sudokuController*remaining").transform(function(a){if(a===0){return true
}return false}).oneWay()})}),board:SC.View.design({classNames:"sudoku-board",layout:{centerX:-1,centerY:29,width:Sudoku.BOARD_WIDTH+24,height:Sudoku.BOARD_HEIGHT+20},childViews:"pages board shred".w(),pages:SC.View.design({classNames:"pages-beneath",layout:{centerX:1,bottom:11,width:Sudoku.BOARD_WIDTH+4,height:11}}),board:Sudoku.BoardView.design({classNames:"play-area",contentBinding:"Sudoku.cellsController*arrangedObjects",contentBindingDefault:SC.Binding.oneWay(),selectionBinding:"Sudoku.cellSelectionController",layout:{centerX:0,top:0,width:Sudoku.BOARD_WIDTH+4,height:Sudoku.BOARD_HEIGHT},numberOfRows:9,numberOfColumns:9,exampleView:Sudoku.CellView.design({})}),shred:SC.View.design({classNames:"page-shred",layout:{centerX:1,top:0,width:598,height:10}})}),mask:SC.View.design({layout:{centerX:0,centerY:20,width:Sudoku.BOARD_WIDTH+4,height:Sudoku.BOARD_HEIGHT},classNames:"sudoku-mask".w(),isVisible:YES,childViews:"message".w(),message:SC.LabelView.design({classNames:"sudoku-mask-message".w(),layout:{centerX:0,centerY:-100,height:30,width:580},textAlign:SC.ALIGN_CENTER,value:"Click the Start Game button to begin."})})})});
Sudoku.main=function main(){Sudoku.getPath("mainPage.mainPane").append();Sudoku.Statechart.initStatechart();
Sudoku.sudokuController.generateNew(40)};function main(){Sudoku.main()};