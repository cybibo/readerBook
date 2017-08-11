<div class="toc-status-bar">
  <div class="page-number">
    Current Page: <span class="current-page"></span> / <span class="total">{{=it.toc.length}}</span>
  </div>
  <div class="page-jumper">
    Go to Page <input type="text"> of <span class="total">{{=it.toc.length}}</span> <span class="go"></span>
  </div>
</div>
<div class="iscroll-wrapper">
  <div class="toc-content" style="width:{{=it.width}}px;">
    {{~it.toc :value:index}}
    <div class="toc-page"  data-page="{{=value.id}}">
      {{? it.toc}}
        <div class="toc-preview">
          <img src="{{=it.fullPath}}/{{=value.preview}}" />
        </div>
      {{?}}
      <!--span class="toc-label">{{=value.label}}</span>-->
    </div>
    {{~}}
  </div>
</div>