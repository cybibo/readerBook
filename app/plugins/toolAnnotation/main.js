define(function(require, exports, module) {
	var PluginBase = require("pkg!pluginBase"), 
	template = require("tpl!./toolAnnotation"), 
	clickOutSide = require("lib/clickOutside"), 
	systemMode = require("pkg!systemMode");
	var CanvasSettings = Backbone.Model.extend({
		defaults : {
			strokeStyle : "red",
			lineWidth : 2,
			lineCap : "round",
			lineJoin : "round",
			rectradius : 10,
			markalpha : 0.2,
			speed : 400,
			lowerBound : 1,
			upperBound : 20,
			controller : false,
			position : 0,
			container : "",
			fill : "",
			handle : "",
			containerHeight : 0,
			handleHeight : 0,
			offset : ""
		}

	});
	var canvasSettings = new CanvasSettings();
	var tool = "pen", 
	isPaint = false, 
	isActive = false, 
	isVisible = false, 
	onStamps = false, 
	stageObjs = [], 
	penObjs = [], 
	markObjs = [], 
	currentObj, 
	currentStamps = null, 
	tempPoint, 
	lastPoint, 
	stampcenterPoint = {
		x : 0,
		y : 0
	}, nextPoint;
	var View = PluginBase.View.extend({
		id : "toolAnnotation",
		mode : "toolAnnotation",
		template : template,
		initialize : function() {
			this.render();
			this.$input = this.$el.find(".input-text");
			this.$stampstext = this.$el.find(".stamps-text");
			this.$canvas = this.$el.find(".canvas");
			this.stage = new createjs.Stage("canvas");
		},
		obEvents : {
			"system:change.mode" : "modeChange"
		},
		modeChange : function(oldMode, newMode) {

			if (newMode !== this.mode && oldMode !== this.mode) {
				return;
			}

			if (newMode === this.mode) {
				//alert("show");
				return this.show();
			}

			if (oldMode === this.mode) {
				return this.hide();
			}
		},
		show : function() {
			//alert("showing");
			this.$el.addClass("active");
			this.emit("book:disable.action");
		},
		hide : function() {
			this.$el.removeClass("active");
			systemMode.enter("reader");
			this.emit("book:enable.action");
		},
		render : function() {
			this.$el.html(this.template()).appendTo($("body"));
		},
		events : {
			"mousedown .canvas" : "penDown",
			"mousemove .canvas" : "penMove",
			"mouseup .canvas" : "penUp",
			"mouseleave .canvas" : "penLeave",
			"click .tools" : "hideText",
			"blur .input-text" : "addText",
			"blur .stamps-text" : "addStampsText",
			"click #rectangles,#pens,#marks,#colors,#widths" : "selsubTools",
			"click #arrow,#text" : "selTool0",
			"click #rectangle,#roundrect,#ellipse,#line,#pen,#mark,#pink,#red,#orange,#yellow,#green,#blue,#black,#white,#complex,#linewidth2,#linewidth5,#linewidth10,#linewidth15,#linewidth20" : "selTool",
			"click #pink,#red,#orange,#yellow,#green,#blue,#black,#white,#complex" : "setColor",
			//"change .morecolor" : "setMoreColor",
			"click #linewidth2,#linewidth5,#linewidth10,#linewidth15,#linewidth20" : "setWidth"
		},
		selsubTools : function(evt) {
			$("#all").addClass("hide");
			var id = evt.target.id;
			if (id == "rectangles") {
				$("#sub1").siblings("ul").removeClass("active");
				$("#sub1").addClass("active");
			}
			if (id == "pens") {
				$(".tools.sub2").siblings("ul").removeClass("active");
				$(".tools.sub2").addClass("active");
			}
			if (id == "colors") {
				$(".tools.sub4").siblings("ul").removeClass("active");
				$(".tools.sub4").addClass("active");
			}
			if (id == "widths") {
				$(".tools.sub5").siblings("ul").removeClass("active");
				$(".tools.sub5").addClass("active");
			}
		},
		selTool0: function(evt) {
			tool = evt.target.className;
			$("#all").find("li").find(".current").removeClass("current");
			$("#all").find("li").find(".select").removeClass("select");
			$("." + tool).addClass("current");
		},
		selTool : function(evt) {
			tool = evt.target.className;
			var id = evt.target.id;
			var sub = $("." + tool).parent().parent().attr("id");
			var $perenttools;
			$("button").siblings(".current").removeClass("current");
			$("#all").find("li").find(".current").removeClass("current");
			$("#all").find("li").find(".select").removeClass("select");
			$("." + tool).addClass("current");
			if (sub == "sub1") {
				$perenttools = document.getElementById('rectangles');
			} 
			if (sub == "sub2") {
				$perenttools = document.getElementById('pens');
			} 
			if (sub == "sub4") {
				$perenttools = document.getElementById('colors');
			} 
			if (sub == "sub5") {
				$perenttools = document.getElementById('widths');
			}
			$perenttools.className = tool + " select";
			$("." + tool).closest(".tools").removeClass("active");
			$("#all").removeClass("hide");
			evt.stopPropagation();
		},
		penDown : function() {
			console.info("penDown");
			if (isActive || onStamps || tool === "eraser") {
				return;
			}
			currentObj = null;

			//console.info("currentStamps" +currentStamps);
			this.saveStage(this.stage);

			if (tool === "text") {
				return this.setText(this.getCurPosition(this.stage), canvasSettings);
			}
			if (tool === "stamps") {
				return this.drawstamps(this.stage, this.getCurPosition(this.stage), lastPoint, lastPoint, canvasSettings);

			}
			isPaint = true;
			lastPoint = this.getCurPosition(this.stage);
			if (tool === "pen") {
				tempPoint = lastPoint;
				penObjs.push(new ShapeExtend("pen", lastPoint, lastPoint));
				this.drawPen(this.stage, penObjs[penObjs.length - 1], lastPoint, lastPoint, canvasSettings);
				this.stage.addChild(penObjs[penObjs.length - 1]);
				this.stage.update();
			}
			if (tool === "mark") {
				tempPoint = lastPoint;
				markObjs.push(new ShapeExtend("mark", lastPoint, lastPoint));
				this.drawMark(this.stage, markObjs[markObjs.length - 1], lastPoint, lastPoint, canvasSettings);
				this.stage.addChild(markObjs[markObjs.length - 1]);
				this.stage.update();
			}

		},
		penMove : function() {
			console.info("penMove");
			var penCount = penObjs.length - 1, markCount = markObjs.length - 1;

			if (!isPaint || isActive || onStamps || tool === "eraser") {
				return;
			}
			nextPoint = this.getCurPosition(this.stage);

			if (tool === "pen") {
				this.drawPen(this.stage, penObjs[penCount], tempPoint, nextPoint, canvasSettings);
				penObjs[penCount].lastPoint = this.getNewPenPosition(penObjs[penCount], nextPoint).lastPoint;
				penObjs[penCount].nextPoint = this.getNewPenPosition(penObjs[penCount], nextPoint).nextPoint;
			} else if (tool === "mark") {
				this.drawMark(this.stage, markObjs[markCount], tempPoint, nextPoint, canvasSettings);
				markObjs[markCount].lastPoint = this.getNewPenPosition(markObjs[markCount], nextPoint).lastPoint;
				markObjs[markCount].nextPoint = this.getNewPenPosition(markObjs[markCount], nextPoint).nextPoint;
			} else if (tool === "stamps") {
				return;
			} else {
				this.restoreStage(this.stage);
				var pic = this.drawPic(this.stage, tool, lastPoint, nextPoint, canvasSettings);
				pic.name = "tempObj";
			}
			tempPoint = nextPoint;
		},
		penUp : function() {
			console.info("penUp");
			if (!isPaint || isActive || tool === "eraser") {

				return;
			}

			isPaint = false;

			if (tool === "pen") {
				this.addPicEvents(this.stage, penObjs[penObjs.length - 1]);
			}
			if (tool === "mark") {
				this.addPicEvents(this.stage, markObjs[markObjs.length - 1]);
			}

			this.saveStage(this.stage);
		},
		penLeave : function() {
			isPaint = false;
		},
		getNewPenPosition : function(penObj, point) {
			var lastPointLocal = this.getPoint(penObj.lastPoint), nextPointLocal = this.getPoint(penObj.nextPoint);

			lastPointLocal.x = lastPointLocal.x > point.x ? point.x : lastPointLocal.x;
			lastPointLocal.y = lastPointLocal.y > point.y ? point.y : lastPointLocal.y;
			nextPointLocal.x = nextPointLocal.x < point.x ? point.x : nextPointLocal.x;
			nextPointLocal.y = nextPointLocal.y < point.y ? point.y : nextPointLocal.y;

			return {
				lastPoint : lastPointLocal,
				nextPoint : nextPointLocal
			};
		},
		getPoint : function(point) {
			return {
				x : point.x,
				y : point.y
			};
		},
		getCurPosition : function(stage) {
			return {
				x : stage.mouseX,
				y : stage.mouseY
			};
		},
		addText : function() {
			if (this.$input[0].value === "" && isActive) {
				return this.setText({
					x : this.stage.mouseX,
					y : this.stage.mouseY
				}, canvasSettings);
			} else if (this.$input[0].value === "" && !isActive) {
				return this.hideText();
			}
			this.drawText(this.stage, this.getTextAttrs().position, this.getTextAttrs().textStyle);
			this.hideText();
		},
		addStampsText : function() {
			if (this.$stampstext[0].value === "" && isActive) {
				console.info("setText");
				return this.setText({
					x : this.stage.mouseX,
					y : this.stage.mouseY
				}, canvasSettings);
			} else if (this.$stampstext[0].value === "" && !isActive) {
				console.info("hideText");
				return this.hideText();
			}
			this.drawStampsText(this.stage, currentStamps, this.getStampsTextAttrs().position, this.getStampsTextAttrs().textStyle);
			this.hideStampsText();
		},
		setText : function(position, canvasSettings) {
			isActive = true;
			var txtAttrs = this.createTextAttrs(position, canvasSettings);
			this.$input.show();
			this.$input[0].style.border = txtAttrs.border;
			this.$input[0].style.fontFamily = txtAttrs.fontFamily;
			this.$input[0].style.color = txtAttrs.color;
			this.$input[0].style.fontSize = txtAttrs.fontSize;
			this.$input[0].style.fontWeight = txtAttrs.fontWeight;
			this.$input[0].style.height = txtAttrs.height;
			this.$input[0].style.width = txtAttrs.width;
			this.$input[0].style.position = txtAttrs.position;
			this.$input[0].style.left = txtAttrs.left;
			this.$input[0].style.top = txtAttrs.top;
		},
		hideText : function() {
			isActive = false;
			this.$input[0].value = "";
			this.$input.hide();
		},
		hideStampsText : function() {
			//isActive = false;
			this.$stampstext[0].value = "";
			this.$stampstext.hide();
		},
		createTextAttrs : function(position, canvasSettings) {
			var fontSize = canvasSettings.get("lineWidth") + 11, height = fontSize + 4, width = height * 5, canvasLeft = this.$canvas.offset().left, canvasTop = this.$canvas.offset().top, textLeft = canvasLeft + position.x, textTop = canvasTop + position.y - this.$input.height() / 2;

			if (textLeft < canvasLeft) {
				textLeft = canvasLeft;
			}
			if (textTop < canvasTop) {
				textTop = canvasTop;
			}
			if (textLeft + width > canvasLeft + this.$canvas.width()) {
				textLeft = canvasLeft + this.$canvas.width() - width;
			}
			if (textTop + height > canvasTop + this.$canvas.height()) {
				textTop = canvasTop + this.$canvas.height() - height;
			}

			return {
				border : "1px solid #f60",
				color : canvasSettings.get("strokeStyle"),
				fontFamily : "arial",
				fontSize : fontSize,
				fontWeight : "bold",
				height : height,
				width : width,
				position : "absolute",
				left : textLeft - 256,
				top : textTop - 22
			};
		},
		getTextAttrs : function() {
			var fontSize = this.$input[0].style.fontSize.substring(0, this.$input[0].style.fontSize.indexOf("px"));

			return {
				position : {
					x : this.$input.offset().left - this.$canvas.offset().left,
					y : this.$input.offset().top - this.$canvas.offset().top
				},
				textStyle : {
					text : this.$input[0].value,
					color : this.$input[0].style.color,
					fontWeight : "bold",
					fontSize : fontSize,
					fontFamily : "arial"
				}
			};
		},
		getStampsTextAttrs : function() {
			var fontSize = this.$stampstext[0].style.fontSize.substring(0, this.$stampstext[0].style.fontSize.indexOf("px"));
			return {
				position : {
					x : this.$stampstext.offset().left - this.$canvas.offset().left,
					y : this.$stampstext.offset().top - this.$canvas.offset().top
				},
				textStyle : {
					text : this.$stampstext[0].value,
					color : this.$stampstext[0].style.color,
					fontWeight : "bold",
					fontSize : fontSize,
					fontFamily : "arial"
				}
			};
		},
		drawstamps : function(stage, position, lastPoint, nextPoint, canvasSettings) {
			isActive = true;
			function containerSC(position) {//中间圆心组件
				var incircle = new createjs.Shape();
				incircle.graphics.ss(2).s("#ff0000").f("#fff").drawCircle(position.x, position.y, 16);
				var fork = new createjs.Shape();
				fork.graphics.ss(2).s("#ff0000").mt(position.x + 6, position.y + 6).lt(position.x - 6, position.y - 6).mt(position.x - 6, position.y + 6).lt(position.x + 6, position.y - 6);
				var containerSC = new createjs.Container();
				containerSC.addChild(incircle, fork);
				return containerSC;
			}

			function containerAddrectarrow(position) {//添加尖角箭头按钮组件
				var addrectarrowbtn = new createjs.Shape();
				addrectarrowbtn.name = "addrectarrowbtn";
				addrectarrowbtn.graphics.ss(2).f("#ff0000").s("#ff0000").drawCircle(position.x - 48, position.y, 4);
				var addcross = new createjs.Shape();
				//外面圆圈添加尖角箭头添加标志开始
				addcross.name = "addcross";
				addcross.graphics.ss(2, "square").s("#fff").mt(position.x - 48, position.y - 2).lt(position.x - 48, position.y + 2).mt(position.x - 48 + 2, position.y).lt(position.x - 48 - 2, position.y);
				var containerAddrectarrow = new createjs.Container();
				containerAddrectarrow.name = "containerAddrectarrow";
				containerAddrectarrow.cursor = "default";
				containerAddrectarrow.addChild(addrectarrowbtn, addcross);
				containerAddrectarrow.rotation = 0;
				console.info("position.x:" + position.x);
				console.info("position.y:" + position.y);
				return containerAddrectarrow;
			}

			function containerAddtext(position) {//添加文字组件
				var text = new createjs.Text("a", "14px Arial", "#fff");
				//添加文字文本
				text.x = position.x + 48 + 6;
				text.y = position.y - (text.getMeasuredHeight() / 2) - 2;
				var addtextbtn = new createjs.Shape();
				var atbx1 = position.x + 48 * Math.cos(Math.PI / 12), atby1 = position.y - 48 * Math.sin(Math.PI / 12), atbx2 = position.x + 48 / Math.cos(Math.PI / 12), atby2 = position.y, atbx3 = position.x + 48 * Math.cos(Math.PI / 12), atby3 = position.y + 48 * Math.sin(Math.PI / 12), atbx4 = atbx1 + 16, atby4 = atby1, atbx5 = atbx2 + 16, atby5 = atby2, atbx6 = atbx3 + 16, atby6 = atby3;
				addtextbtn.graphics.ss(2).s("#000").f("#000").mt(atbx1, atby1).lt(atbx4, atby4).arc(atbx4, atby2, (atby6 - atby4) / 2, 1.5 * Math.PI, 0.5 * Math.PI).lt(atbx3, atby3).arcTo(atbx2, atby2, atbx1, atby1, 48);
				var containerAddtext = new createjs.Container();
				containerAddtext.name = "containerAddtext";
				containerAddtext.addChild(addtextbtn, text);
				//containerAddtext.addEventListener("click", containerAddtextclick, false);
				return containerAddtext;
			}

			function containerSO(position) {//外面圆圈添加组件
				var outcircle = new createjs.Shape();
				outcircle.name = "outcircle";
				outcircle.graphics.ss(2).s("#ff0000").f("#fff").drawCircle(position.x, position.y, 48);
				var containerSO = new createjs.Container();
				containerSO.name = "containerSO";
				containerSO.addChild(outcircle, containerAddrectarrow(position), containerAddtext(position));
				return containerSO;
			}

			function rectarrow(position) {//尖角箭头组件结束
				var rectarrow = new createjs.Shape();
				rectarrow.name = "rectarrow";
				rectarrow.rotation = 0;
				var arctox1 = position.x - 16 * Math.cos(Math.PI / 6), arctoy1 = position.y + 16 * Math.sin(Math.PI / 6), arctox2 = position.x - 16 / Math.cos(Math.PI / 6), arctoy2 = position.y, arctox3 = position.x - 16 * Math.cos(Math.PI / 6), arctoy3 = position.y - 16 * Math.sin(Math.PI / 6), arctox4 = arctox3 - 16, arctoy4 = arctoy3, arctox5 = arctox4 - 8, arctoy5 = position.y, arctox6 = arctox4, arctoy6 = arctoy1;
				rectarrow.graphics.ss(2).s("#ff0000").f("#ff0000").mt(arctox1, arctoy1).arcTo(arctox2, arctoy2, arctox3, arctoy3, 16).lt(arctox4, arctoy4).lt(arctox5, arctoy5).lt(arctox6, arctoy6).cp(arctox1, arctoy1);
				return rectarrow;
			}

			function containerST(position, canvasSettings) {//添加文本文字背景开始
				var stampstextbg = new createjs.Shape();
				var stbx1 = position.x + 16 * Math.cos(Math.PI / 6), stby1 = position.y - 16 * Math.sin(Math.PI / 6), stbx2 = position.x + 16 / Math.cos(Math.PI / 6), stby2 = position.y, stbx3 = position.x + 16 * Math.cos(Math.PI / 6), stby3 = position.y + 16 * Math.sin(Math.PI / 6), stbx4 = stbx1 + 96, stby4 = stby1, stbx6 = stbx3 + 96, stby6 = stby3;
				stampstextbg.graphics.ss(2).s("#ff0000").f("#ff0000").mt(stbx3, stby3).arcTo(stbx2, stby2, stbx1, stby1, 16).lt(stbx4, stby4).arc(stbx4, stby2, (stby2 - stby4), 1.5 * Math.PI, 0.5 * Math.PI).lt(stbx3, stby3);
				//添加文本文字背景结束
				var containerST = new createjs.Container();
				containerST.name = "containerST";
				containerST.addChild(stampstextbg);
				return containerST;
			}

			var containerSC = containerSC(position), containerSO = containerSO(position), rectarrow = rectarrow(position), containerST = containerST(position, canvasSettings);
			containerSO.visible = false;
			rectarrow.visible = false;
			containerST.visible = false;
			var containerStamps = new createjs.Container();
			containerStamps.name = "containerStamps";
			containerStamps.addChild(containerSO, containerSC, rectarrow, containerST);
			stage.enableMouseOver(10);
			containerStamps.cursor = "pointer";
			this.containerStampsaddEvents(stage, containerStamps, position);
			this.containerAddrectarrowEvents(stage, containerStamps, stampcenterPoint);
			this.containerAddtextEvents(stage, containerStamps, stampcenterPoint);
			stage.addChild(containerStamps);
			stage.update();
			return containerStamps;
		},
		containerStampsaddEvents : function(stage, container, position) {
			currentStamps = container;
			var that = this;
			var offset = {
				x : 0,
				y : 0
			};
			stampcenterPoint = {
				x : position.x,
				y : position.y
			};
			container.addEventListener("mouseover", function() {
				onStamps = true;
			});
			container.addEventListener("mouseout", function() {
				onStamps = false;
			});
			container.addEventListener("mousedown", function(event) {
				if (tool === "eraser") {
					stage.removeChild(container);
					that.saveStage(stage);
					return;
				}
				var containerST = container.getChildByName("containerST"), containerAddtext = container.getChildByName("containerSO").getChildByName("containerAddtext");
				if (containerST.isVisible()) {
					containerAddtext.visible = false;
				};
				container.getChildByName("containerSO").visible = true;
				offset = {
					x : event.currentTarget.x - event.stageX,
					y : event.currentTarget.y - event.stageY
				};
				event.preventDefault();
				event.stopPropagation();
				stage.update();
			});
			container.addEventListener("pressmove", function(evt) {

				evt.currentTarget.x = evt.stageX + offset.x;
				evt.currentTarget.y = evt.stageY + offset.y;
				//图形移动时，改变Pic对象的坐标点
				stampcenterPoint = {
					x : evt.stageX,
					y : evt.stageY
				};
				evt.stopPropagation();
				stage.update();
			});

		},
		containerAddrectarrowEvents : function(stage, container, position) {
			var containerAddrectarrow = container.getChildByName("containerSO").getChildByName("containerAddrectarrow"), rectarrow = container.getChildByName("rectarrow");
			containerAddrectarrow.addEventListener("mousedown", function(evt) {
				container.getChildByName("containerSO").getChildByName("containerAddrectarrow").getChildByName("addcross").visible = false;
				rectarrow.visible = true;
			}, false);
			containerAddrectarrow.addEventListener("pressmove", function(evt) {
				nextPoint = this.getCurPosition(this.stage);
				var dx = nextPoint.x - position.x, dy = nextPoint.y - position.y, angle = Math.atan2(dy, dx);
				angle *= 180 / Math.PI;
				if (angle < 0) {
					angle += 180;
					/*if ((0 < angle && angle < 45) || ( angle = 45)) {
					 angle = 45;
					 } else if ((45 < angle && angle < 90) || ( angle = 90)) {
					 angle = 90;
					 } else if ((90 < angle && angle < 135) || ( angle = 135)) {
					 angle = 135;
					 } else {
					 angle = 180;
					 }*/
				} else {
					angle -= 180;
					/*if ((-45 < angle && angle < 0) || ( angle = -45)) {
					 angle = -45;
					 } else if ((-90 < angle && angle < -45) || ( angle = -90)) {
					 angle = -90;
					 } else if ((-135 < angle && angle < -90) || ( angle = -135)) {
					 angle = -135;
					 } else {
					 angle = -180;
					 }*/
				}
				rectarrow.rotation = containerAddrectarrow.rotation = angle;
				containerAddrectarrow.regX = rectarrow.regX = position.x;
				containerAddrectarrow.regY = rectarrow.regY = position.y;
				containerAddrectarrow.x = rectarrow.x = position.x;
				containerAddrectarrow.y = rectarrow.y = position.y;
				evt.stopPropagation();
				stage.update();
			}.bind(this), false);
			containerAddrectarrow.addEventListener("pressup", function(evt) {
				evt.stopPropagation();
			}, false);

		},
		containerAddtextEvents : function(stage, container, position) {
			var containerAddtext = container.getChildByName("containerSO").getChildByName("containerAddtext"), containerSO = container.getChildByName("containerSO"), containerST = container.getChildByName("containerST");
			containerAddtext.addEventListener("click", function(evt) {
				var txtAttrs = this.createTextAttrs(position, canvasSettings);
				//添加文本文字开始
				this.$stampstext[0].style.border = 0;
				this.$stampstext[0].style.fontFamily = txtAttrs.fontFamily;
				this.$stampstext[0].style.color = "#fff";
				this.$stampstext[0].style.background = "#ff0000";
				this.$stampstext[0].style.fontSize = txtAttrs.fontSize;
				this.$stampstext[0].style.fontWeight = txtAttrs.fontWeight;
				this.$stampstext[0].style.height = txtAttrs.height;
				this.$stampstext[0].style.width = txtAttrs.width;
				this.$stampstext[0].style.position = txtAttrs.position;
				this.$stampstext[0].style.left = position.x + 16 * Math.cos(Math.PI / 6) + 5 + container.x;
				this.$stampstext[0].style.top = txtAttrs.top + container.y;
				this.$stampstext.show();
				containerST.visible = true;
				containerSO.visible = false;
				evt.preventDefault();
				stage.update();
			}.bind(this));
			containerAddtext.addEventListener("pressup", function(evt) {
				evt.stopPropagation();
			});
		},

		drawPic : function(stage, tool, lastPoint, nextPoint, canvasSettings) {
			switch (tool) {
				case "arrow":
					return this.drawArrow(stage, lastPoint, nextPoint, canvasSettings);
				case "line":
					return this.drawLine(stage, lastPoint, nextPoint, canvasSettings);
				case "rectangle":
					return this.drawRectangle(stage, lastPoint, nextPoint, canvasSettings);
				case "roundrect":
					return this.drawRoundRect(stage, lastPoint, nextPoint, canvasSettings);
				case "ellipse":
					return this.drawEllipse(stage, lastPoint, nextPoint, canvasSettings);
				default:
					break;
			}
		},
		drawArrow : function(stage, lastPoint, nextPoint, canvasSettings) {
			var arrow = new ShapeExtend("arrow", lastPoint, nextPoint);
			var headlen = 20, // length of head in pixels
			dx = nextPoint.x - lastPoint.x, dy = nextPoint.y - lastPoint.y, angle = Math.atan2(dy, dx), htx1 = nextPoint.x - headlen * Math.cos(angle + Math.PI / 6), hty1 = nextPoint.y - headlen * Math.sin(angle + Math.PI / 6), htx2 = nextPoint.x - headlen * Math.cos(angle + Math.PI / 12) * 0.8, hty2 = nextPoint.y - headlen * Math.sin(angle + Math.PI / 12) * 0.8, hbx1 = nextPoint.x - headlen * Math.cos(angle - Math.PI / 6), hby1 = nextPoint.y - headlen * Math.sin(angle - Math.PI / 6), hbx2 = nextPoint.x - headlen * Math.cos(angle - Math.PI / 12) * 0.8, hby2 = nextPoint.y - headlen * Math.sin(angle - Math.PI / 12) * 0.8;
			console.info("angle:" + angle);
			var angle2 = angle + Math.PI / 6;
			console.info("angle2:" + angle2);
			arrow.graphics.s(canvasSettings.get("strokeStyle")).f(canvasSettings.get("strokeStyle")).ss(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap")).mt(lastPoint.x, lastPoint.y).lt(htx2, hty2).lt(htx1, hty1).lt(nextPoint.x, nextPoint.y).lt(hbx1, hby1).lt(hbx2, hby2).cp();
			this.addPicEvents(stage, arrow);
			stage.addChild(arrow);
			stage.update();
			return arrow;
		},
		drawPen : function(stage, pen, lastPoint, nextPoint, canvasSettings) {
			pen.graphics.beginStroke(canvasSettings.get("strokeStyle")).beginFill(canvasSettings.get("strokeStyle")).setStrokeStyle(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap")).moveTo(lastPoint.x, lastPoint.y).lineTo(nextPoint.x, nextPoint.y);
			stage.update();
			return pen;
		},
		drawText : function(stage, position, textStyle) {
			var text = new TextExtend("text"), hitArea = new ShapeExtend();
			text.text = textStyle.text;
			text.color = textStyle.color;
			text.fontWeight = textStyle.fontWeight;
			text.fontSize = textStyle.fontSize;
			text.fontFamily = textStyle.fontFamily;
			text.font = text.fontWeight + " " + text.fontSize + "px " + text.fontFamily;
			text.x = position.x;
			text.y = position.y;

			text.lastPoint = this.getPoint({
				x : text.x,
				y : text.y
			});
			text.nextPoint = this.getPoint({
				x : text.x + text.getMeasuredWidth(),
				y : text.y + text.getMeasuredHeight()
			});

			hitArea.graphics.beginFill("#000").drawRect(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight());
			text.hitArea = hitArea;

			this.addPicEvents(stage, text);
			stage.addChild(text);
			stage.update();

			return text;
		},
		drawStampsText : function(stage, container, position, textStyle) {
			var stampstext = new TextExtend("text"), hitArea = new ShapeExtend();
			stampstext.text = textStyle.text;
			stampstext.color = textStyle.color;
			stampstext.fontWeight = textStyle.fontWeight;
			stampstext.fontSize = textStyle.fontSize;
			stampstext.fontFamily = textStyle.fontFamily;
			stampstext.font = stampstext.fontWeight + " " + stampstext.fontSize + "px " + stampstext.fontFamily;
			stampstext.x = position.x - container.x;
			stampstext.y = position.y - container.y;
			stampstext.lastPoint = this.getPoint({
				x : stampstext.x,
				y : stampstext.y
			});
			stampstext.nextPoint = this.getPoint({
				x : stampstext.x + stampstext.getMeasuredWidth(),
				y : stampstext.y + stampstext.getMeasuredHeight()
			});

			hitArea.graphics.beginFill("#000").drawRect(0, 0, stampstext.getMeasuredWidth(), stampstext.getMeasuredHeight());
			stampstext.hitArea = hitArea;
			container.getChildByName("containerST").addChild(stampstext);
			stage.update();
			return stampstext;
		},
		drawLine : function(stage, lastPoint, nextPoint, canvasSettings) {
			var line = new ShapeExtend("line", lastPoint, nextPoint);
			line.graphics.beginStroke(canvasSettings.get("strokeStyle")).setStrokeStyle(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap")).moveTo(lastPoint.x, lastPoint.y).lineTo(nextPoint.x, nextPoint.y);
			this.addPicEvents(stage, line);
			stage.addChild(line);
			stage.update();
			return line;
		},
		drawMark : function(stage, mark, lastPoint, nextPoint, canvasSettings) {
			mark.alpha = canvasSettings.get("markalpha");
			mark.graphics.beginStroke(canvasSettings.get("strokeStyle")).beginFill(canvasSettings.get("strokeStyle")).setStrokeStyle(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap")).moveTo(lastPoint.x, lastPoint.y).lineTo(nextPoint.x, nextPoint.y);
			mark.cache(0, 0, this.$canvas.width(), this.$canvas.height());
			stage.update();
			return mark;
		},
		drawRoundRect : function(stage, lastPoint, nextPoint, canvasSettings) {
			var position = this.getPicPosition(lastPoint, nextPoint), roundrect = new ShapeExtend("roundrect", lastPoint, nextPoint);
			roundrect.graphics.ss(canvasSettings.get("lineWidth")).s(canvasSettings.get("strokeStyle")).rr(position.x, position.y, Math.abs(lastPoint.x - nextPoint.x), Math.abs(lastPoint.y - nextPoint.y), canvasSettings.get("rectradius"));
			this.addPicEvents(stage, roundrect);
			stage.addChild(roundrect);
			stage.update();
			return roundrect;
		},
		drawRectangle : function(stage, lastPoint, nextPoint, canvasSettings) {
			var position = this.getPicPosition(lastPoint, nextPoint), rectangle = new ShapeExtend("rectangle", lastPoint, nextPoint);
			rectangle.graphics.beginStroke(canvasSettings.get("strokeStyle")).setStrokeStyle(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap"), canvasSettings.get("lineJoin")).drawRect(position.x, position.y, Math.abs(lastPoint.x - nextPoint.x), Math.abs(lastPoint.y - nextPoint.y));

			this.addPicEvents(stage, rectangle);
			stage.addChild(rectangle);
			stage.update();

			return rectangle;
		},
		drawEllipse : function(stage, lastPoint, nextPoint, canvasSettings) {
			var position = this.getPicPosition(lastPoint, nextPoint), ellipse = new ShapeExtend("ellipse", lastPoint, nextPoint);
			ellipse.graphics.beginStroke(canvasSettings.get("strokeStyle")).setStrokeStyle(canvasSettings.get("lineWidth"), canvasSettings.get("lineCap"), canvasSettings.get("lineJoin")).drawEllipse(position.x, position.y, Math.abs(lastPoint.x - nextPoint.x), Math.abs(lastPoint.y - nextPoint.y));
			this.addPicEvents(stage, ellipse);
			stage.addChild(ellipse);
			stage.update();

			return ellipse;
		},
		getPicPosition : function(lastPoint, nextPoint) {
			var position = {
				x : null,
				y : null
			};

			if ((lastPoint.x <= nextPoint.x) && (lastPoint.y <= nextPoint.y)) {
				position = this.getPoint(lastPoint);
			} else if ((lastPoint.x <= nextPoint.x) && (lastPoint.y >= nextPoint.y)) {
				position = this.getPoint({
					x : lastPoint.x,
					y : nextPoint.y
				});
			} else if ((lastPoint.x >= nextPoint.x) && (lastPoint.y <= nextPoint.y)) {
				position = this.getPoint({
					x : nextPoint.x,
					y : lastPoint.y
				});
			} else if ((lastPoint.x >= nextPoint.x) && (lastPoint.y >= nextPoint.y)) {
				position = this.getPoint({
					x : nextPoint.x,
					y : nextPoint.y
				});
			}

			return position;
		},
		addPicEvents : function(stage, Obj) {
			var that = this;
			Obj.addEventListener("mousedown", function(event) {
				if (tool === "eraser") {
					stage.removeChild(Obj);
					that.saveStage(stage);
					return;
				}

				isActive = false;
				//激活Pic时，使text输入框消失
				that.$input.blur();
				isActive = true;
				currentObj = Obj;
				that.addAnchors(that, stage, event.target);
				tempPoint = {
					x : event.stageX,
					y : event.stageY
				};
				//记录鼠标移动的上一个point
				var offset = {
					x : event.target.x - event.stageX,
					y : event.target.y - event.stageY
				};
				//Pic对象在移动过程中的偏移量

				event.addEventListener("mousemove", function(evt) {//图形移动事件
					evt.target.x = evt.stageX + offset.x;
					evt.target.y = evt.stageY + offset.y;
					//图形移动时，改变Pic对象的坐标点
					evt.target.lastPoint.x += evt.stageX - tempPoint.x;
					evt.target.lastPoint.y += evt.stageY - tempPoint.y;
					evt.target.nextPoint.x += evt.stageX - tempPoint.x;
					evt.target.nextPoint.y += evt.stageY - tempPoint.y;
					//实时地添加指示点
					that.addAnchors(that, stage, event.target);
					tempPoint = {
						x : evt.stageX,
						y : evt.stageY
					};
				});

				event.addEventListener("mouseup", function() {//鼠标放开，Pic激活状态消失
					isActive = false;
				});
			});
		},

		addAnchors : function(that, stage, Obj) {
			var anchors = that.getAnchors(that, Obj);

			that.removeAnchors(stage);
			that.addAnchorsEvents(that, stage, anchors, Obj);
			that.addAnchorsToStage(stage, anchors, Obj.picType);
		},
		getAnchors : function(that, Obj) {
			var anchors = [];

			anchors.push(that.getAnchor("lt_anchor", Obj));
			anchors.push(that.getAnchor("lb_anchor", Obj));
			anchors.push(that.getAnchor("rt_anchor", Obj));
			anchors.push(that.getAnchor("rb_anchor", Obj));

			return anchors;
		},
		getAnchor : function(name, Obj) {
			var strokeStyle = createjs.Graphics.getRGB(30, 156, 217), r_Anchor, anchor = new ShapeExtend();
			if (Obj.picType === "text" || Obj.picType === "arrow") {
				r_Anchor = 5;
			} else {
				r_Anchor = Obj.graphics._strokeStyleInstructions[0].params[1] / 2 + 5;
			}
			anchor.name = name;
			switch (name) {
				case "lt_anchor":
					if (Obj.picType === "text") {
						anchor.lastPoint = {
							x : Obj.x,
							y : Obj.y
						};
						break;
					}
					anchor.lastPoint = Obj.lastPoint;
					break;
				case "lb_anchor":
					if (Obj.picType === "text") {
						anchor.lastPoint = {
							x : Obj.x,
							y : Obj.y + Obj.getMeasuredHeight()
						};
						break;
					}
					anchor.lastPoint = {
						x : Obj.lastPoint.x,
						y : Obj.nextPoint.y
					};
					break;
				case "rt_anchor":
					if (Obj.picType === "text") {
						anchor.lastPoint = {
							x : Obj.x + Obj.getMeasuredWidth(),
							y : Obj.y
						};
						break;
					}
					anchor.lastPoint = {
						x : Obj.nextPoint.x,
						y : Obj.lastPoint.y
					};
					break;
				case "rb_anchor":
					if (Obj.picType === "text") {
						anchor.lastPoint = {
							x : Obj.x + Obj.getMeasuredWidth(),
							y : Obj.y + Obj.getMeasuredHeight()
						};
						break;
					}
					anchor.lastPoint = Obj.nextPoint;
					break;
				default:
					break;
			}
			anchor.graphics.beginStroke(strokeStyle).beginFill(strokeStyle).drawCircle(anchor.lastPoint.x, anchor.lastPoint.y, r_Anchor);
			return anchor;
		},
		addAnchorsEvents : function(that, stage, anchors, Obj) {
			if (Obj.picType === "pen" || Obj.picType === "mark") {
				return that.removeAnchors(stage);
			}
			var i, anchor;

			for (i in anchors) {
				anchor = anchors[i];

				anchor.addEventListener("mousedown", function(event) {
					isActive = true;
					currentObj = Obj;

					tempPoint = {
						x : event.stageX,
						y : event.stageY
					};
					var offset = {
						x : event.target.x - event.stageX,
						y : event.target.y - event.stageY
					};

					event.addEventListener("mousemove", function(evt) {
						var offsetPic = {
							x : evt.stageX - tempPoint.x,
							y : evt.stageY - tempPoint.y
						};
						stage.removeChild(Obj);
						Obj.name = "tempObj";
						that.restoreStage(stage);

						Obj = that.updatePicPoints(evt.target.name, Obj, offsetPic);
						Obj = that.reDrawPic(stage, Obj);
						Obj.name = "tempObj";
						that.addAnchors(that, stage, Obj);
						// 重新构造“指示点”
						anchors = that.getAnchors(that, Obj);
						that.addAnchorsEvents(that, stage, anchors, Obj);

						evt.target.x = evt.stageX + offset.x;
						//“指示点”偏移过程
						evt.target.y = evt.stageY + offset.y;
						tempPoint = {
							x : evt.stageX,
							y : evt.stageY
						};
						//保存移动前一个point
						currentObj = Obj;
						//调整图形后，保存当前激活对象为调整后的对象
					});

					event.addEventListener("mouseup", function() {
						isActive = false;
						that.saveStage(stage);
						that.addAnchorsToStage(stage, anchors, Obj.picType);
					});
				});
			}
		},
		addAnchorsToStage : function(stage, anchors, picType) {//添加“指示点”到stage
			if (picType === "arrow" || picType === "line") {
				stage.addChild(anchors[0], anchors[3]);
			} else {
				stage.addChild(anchors[0], anchors[1], anchors[2], anchors[3]);
			}
			stage.update();
		},
		updatePicPoints : function(anchorType, Obj, offset) {//根据指示点的name，分别作更新图形的坐标信息的处理
			switch (anchorType) {
				case "lt_anchor":
					if (Obj.picType === "text") {
						Obj.x += offset.x;
						Obj.y += offset.y;
						Obj.fontSize *= 1 - offset.y / Obj.getMeasuredHeight();
					} else {
						Obj.lastPoint.x += offset.x;
						Obj.lastPoint.y += offset.y;
					}
					break;
				case "lb_anchor":
					if (Obj.picType === "text") {
						Obj.x += offset.x;
						Obj.fontSize *= 1 + offset.y / Obj.getMeasuredHeight();
					} else {
						Obj.lastPoint.x += offset.x;
						Obj.nextPoint.y += offset.y;
					}
					break;
				case "rt_anchor":
					if (Obj.picType === "text") {
						Obj.y += offset.y;
						Obj.fontSize *= 1 - offset.y / Obj.getMeasuredHeight();
					} else {
						Obj.lastPoint.y += offset.y;
						Obj.nextPoint.x += offset.x;
					}
					break;
				case "rb_anchor":
					if (Obj.picType === "text") {
						Obj.fontSize *= 1 + offset.y / Obj.getMeasuredHeight();
					} else {
						Obj.nextPoint.x += offset.x;
						Obj.nextPoint.y += offset.y;
					}
					break;
				default:
					break;
			}

			if (Obj.picType === "text") {
				if (Obj.fontSize < 12) {
					Obj.fontSize = 12;
				}
			}

			return Obj;
		},
		reDrawPic : function(stage, obj) {//调整图形时,调用图形之前的属性重绘并调整大小
			var canvasSettingsLocal, textStyle;
			if (obj.picType !== "text") {
				canvasSettingsLocal = new CanvasSettings({
					strokeStyle : obj.graphics._strokeInstructions[0].params[1],
					lineWidth : obj.graphics._strokeStyleInstructions[0].params[1],
					lineCap : obj.graphics._strokeStyleInstructions[1].params[1],
					lineJoin : obj.graphics._strokeStyleInstructions[2].params[1]
				});
			}
			switch (obj.picType) {
				case "arrow":
					return this.drawArrow(stage, obj.lastPoint, obj.nextPoint, canvasSettingsLocal);
				case "line":
					return this.drawLine(stage, obj.lastPoint, obj.nextPoint, canvasSettingsLocal);
				case "roundrect":
					return this.drawRoundRect(stage, obj.lastPoint, obj.nextPoint, canvasSettingsLocal);
				case "rectangle":
					return this.drawRectangle(stage, obj.lastPoint, obj.nextPoint, canvasSettingsLocal);
				case "ellipse":
					return this.drawEllipse(stage, obj.lastPoint, obj.nextPoint, canvasSettingsLocal);
				case "text":
					textStyle = {
						text : obj.text,
						color : obj.color,
						fontWeight : obj.fontWeight,
						fontSize : obj.fontSize,
						fontFamily : obj.fontFamily
					};
					return this.drawText(stage, {
						x : obj.x,
						y : obj.y
					}, textStyle);
				default:
					break;
			}
		},
		removeAnchors : function(stage) {
			stage.removeChild(stage.getChildByName("lt_anchor"));
			stage.removeChild(stage.getChildByName("lb_anchor"));
			stage.removeChild(stage.getChildByName("rt_anchor"));
			stage.removeChild(stage.getChildByName("rb_anchor"));
			stage.update();
		},
		saveStage : function(stage) {
			stageObjs = [];
			this.removeAnchors(stage);

			var i;
			for ( i = 0; i < stage.getNumChildren(); i++) {
				var child = stage.getChildAt(i);
				child.name = "normalObj";
				stageObjs.push(child);
			}

			stage.update();
		},
		restoreStage : function(stage) {
			this.removeAnchors(stage);
			stage.removeChild(stage.getChildByName("tempObj"));
			var i;
			for (i in stageObjs) {
				stage.addChild(stageObjs[i]);
			}
			stage.update();
			stageObjs = [];
		},
		checkBoundaries : function(value) {
			if (value < canvasSettings.get("lowerBound") * 5)
				return canvasSettings.get("lowerBound") * 5;
			else if (value > canvasSettings.get("upperBound") * 5)
				return canvasSettings.get("upperBound") * 5;
			else
				return value;
		},
		animate : function(value) {
			$(canvasSettings.get("fill")).animate({
				height : value + "%"
			}, canvasSettings.get("speed"));
		},
		setWidth : function(evt) {
			var arr = evt.target.className.split(" ");
			var eNum = 2;
			if(arr[0] == "lineWidth2"){eNum = 2;}
			if(arr[0] == "lineWidth5"){eNum = 5;}
			if(arr[0] == "lineWidth10"){eNum = 10;}
			if(arr[0] == "lineWidth15"){eNum = 15;}
			if(arr[0] == "lineWidth20"){eNum = 20;}
			canvasSettings.set({
				lineWidth : eNum
			});
			if (currentObj) {
				var linewidth = eNum;
				this.changePicLineWidth(this.stage, currentObj, linewidth);
			}
		},
		changePicLineWidth : function(stage, currentObj, linewidth) {
			if (currentObj.picType === "text") {
			} else {
				if (currentObj.picType === "pen" || currentObj.picType === "mark") {
					this.changePenLineWidth(this.stage, currentObj, linewidth);
				}
				currentObj.graphics._strokeStyleInstructions[0].params[1] = linewidth;
			}
			stage.update();

		},

		changePenLineWidth : function(stage, currentObj, linewidth) {
			var graphics = new createjs.Graphics(), lengths = currentObj.graphics._instructions.length;
			for (var i = 5; i < lengths; i += 11) {
				currentObj.graphics._instructions[i].params[1] = linewidth;
			}
			if (currentObj.picType === "mark") {
				currentObj.alpha = canvasSettings.get("markalpha");
				currentObj.cache(0, 0, this.$canvas.width(), this.$canvas.height());
			}
		},
		setMoreColor : function() {
			var morecolor = $(".morecolor").val();
			if (currentObj) {
				this.changePicColor(this.stage, currentObj, morecolor);
			} else {
				canvasSettings.set({
					strokeStyle : morecolor
				});
			}
		},
		setColor : function(evt) {
			var arr = evt.target.className.split(" ");
			if (arr[0] == "complex") {
				
			} else {
				if (currentObj) {
					this.changePicColor(this.stage, currentObj, arr[0]);
				} else {
					canvasSettings.set({
						strokeStyle : arr[0]
					});
				}
			}

		},
		changePicColor : function(stage, currentObj, color) {//改变激活状态的color
			if (currentObj.picType === "text") {//说明改变的是text
				currentObj.color = color;
				stage.update();
				return;
			} else {
				currentObj.graphics._strokeInstructions[0].params[1] = color;
				if (currentObj.picType === "arrow") {
					currentObj.graphics._fillInstructions[0].params[1] = color;
				}
				if (currentObj.picType === "pen" || currentObj.picType === "mark") {
					this.changePenColor(stage, currentObj, color);
				}
			}
			stage.update();
		},

		changePenColor : function(stage, currentObj, color) {
			if (currentObj.picType === "mark") {
				currentObj.alpha = canvasSettings.get("markalpha");
			}
			var points = [], c, i, j, graphics = new createjs.Graphics();

			if (currentObj.graphics._activeInstructions.length !== 2) {
				for (c in currentObj.graphics._activeInstructions) {
					points.push({
						x : currentObj.graphics._activeInstructions[c].params[0],
						y : currentObj.graphics._activeInstructions[c].params[1]
					});
				}
				graphics.beginStroke(color).beginFill(color).setStrokeStyle(currentObj.graphics._strokeStyleInstructions[0].params[1], currentObj.graphics._strokeStyleInstructions[1].params[1], currentObj.graphics._strokeStyleInstructions[2].params[1]);

				for ( i = 0, j = 1; j < points.length; i++, j++) {
					if (graphics._activeInstructions.length > 151552) {
						return;
					}
					graphics.mt(points[i].x, points[i].y).lt(points[j].x, points[j].y);
				}
				currentObj.graphics._activeInstructions = graphics._activeInstructions;
			} else {
				for (c in currentObj.graphics._instructions) {
					points.push({
						x : currentObj.graphics._instructions[c].params[0],
						y : currentObj.graphics._instructions[c].params[1]
					});
				}

				graphics.beginStroke(color).beginFill(color).setStrokeStyle(currentObj.graphics._strokeStyleInstructions[0].params[1], currentObj.graphics._strokeStyleInstructions[1].params[1], currentObj.graphics._strokeStyleInstructions[2].params[1]);

				for ( i = 1, j = 2; j < points.length - 1; i += 11, j += 11) {
					graphics.mt(points[i].x, points[i].y).lt(points[i + 1].x, points[i + 1].y);
				}
				currentObj.graphics = graphics;
			}
			if (currentObj.picType === "mark") {
				currentObj.cache(0, 0, this.$canvas.width(), this.$canvas.height());
			}
		}
	});
	return View;
});
