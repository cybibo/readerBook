<ul class="annotation  clearfix">
	<li>
		<canvas class="canvas" id="canvas" width="964" height="668"></canvas>
		<input class="input-text" type="text"/>
		<input class="stamps-text" type="text" maxlength="13"/>
	</li>
	<li>
		<ul class="tools all" id="all">
			<li>
				<button id="arrow" class="arrow"></button>
				<button id="text" class="text"></button>
				<button id="rectangles" class="rectangles"></button>
				<button id="pens" class="pens"></button>
				<!--<button class="marks"></button>-->
				<button id="colors" class="colors"></button>
				<button id="widths" class="widths"></button>
			</li>
		</ul>
		<ul class="tools sub1" id="sub1">
			<li>
				<button id="rectangle" class="rectangle"></button>
				<button id="roundrect" class="roundrect"></button>
				<button id="ellipse" class="ellipse"></button>
				<button id="line" class="line"></button>
			</li>
		</ul>
		<ul class="tools sub2" id="sub2">
			<li>
				<button id="pen" class="pen"></button>
				<button id="mark" class="mark"></button>
			</li>
		</ul>
		<!--<ul class="tools sub3">
			<li>
				<button class="pen"></button>
				<button class="mark"></button>
			</li>
		</ul>-->
		<ul class="tools sub4" id="sub4">
			<li>
				<button id="pink" class="pink"></button>
				<button id="red" class="red"></button>
				<button id="orange" class="orange"></button>
				<button id="yellow" class="yellow"></button>
				<button id="green" class="green"></button>
				<button id="blue" class="blue"></button>
				<button id="black" class="black"></button>
				<button id="white" class="white"></button>
				<button id="complex" class="complex"></button>
				
			</li>
		</ul>
		<ul class="tools sub5" id="sub5">
			<li>
				<button id="linewidth2" class="lineWidth2"></button>
				<button id="linewidth5" class="lineWidth5"></button>
				<button id="linewidth10" class="lineWidth10"></button>
				<button id="linewidth10" class="lineWidth15"></button>
				<button id="linewidth20" class="lineWidth20"></button>
			</li>
		</ul>
	</li>
</ul>

<script src="app/plugins/toolAnnotation/lib/easel.js"></script>
<script src="app/plugins/toolAnnotation/lib/ShapeExtend.js"></script>
<script src="app/plugins/toolAnnotation/lib/TextExtend.js"></script>