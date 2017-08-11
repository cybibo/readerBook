<ul class="annotation  clearfix">
	<li>
		<canvas class="canvas" id="canvas" width="964" height="668"></canvas>
		<input class="input-text" type="text"/>
		<input class="stamps-text" type="text" maxlength="13"/>
	</li>
	<li>
		<ul class="tools">
			<li>
				<button class="arrow"></button>
				<button class="text"></button>
				<button class="pen"></button>
				<button class="mark"></button>
				<button class="stamps"></button>
				<button class="line"></button>
				<button class="rectangle"></button>
				<button class="roundrect"></button>
				<button class="ellipse" ></button>
				<button class="eraser"></button>
				<button  class="exit"></button>
			</li>
			<li>
				<span class="color">颜色:
					<input class="red" type="button"/>
					<input class="green" type="button"/>
					<input class="blue" type="button"/>
					<input type=color class="morecolor" pattern="#[a-f0-9]{6}" title="hexadecimal color" placeholder="#000000">
				</span>
			</li>
			<li>
				<span class="width">粗细:
					<input class="lineWidth" type="text" value="2"/>
					[1,20]</span>
			</li>
		</ul>
	</li>
</ul>

<script src="app/plugins/toolAnnotation/lib/easel.js"></script>
<script src="app/plugins/toolAnnotation/lib/ShapeExtend.js"></script>
<script src="app/plugins/toolAnnotation/lib/TextExtend.js"></script>