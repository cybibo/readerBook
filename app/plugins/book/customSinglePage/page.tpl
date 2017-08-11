<div class="page p{{=it.num}} 
{{? it.lastRight}} last-page {{?}} 
">
    <div class="left-page" >
      <div class="left-bottom-button"></div>
      {{? !it.lastLeft }} 
        <div class="module-info">
        <span class="module-info-number">{{? it.module}}{{? it.module < 10}}MODULE 0{{=it.module}}{{??}}MODULE {{=it.module}}{{?}}{{?}}</span>
        <div class="unit-info">
          {{? it.unit}}UNIT <div class="unit-info-number">{{=it.unit}}</div>{{?}}
        </div>
        </div>
        {{? it.pages}}
        <div class="page-nav">
          {{~it.pages :value:index}}
            <div class="page-nav-button {{? (value.id == it.id) }}current{{?}}" data-page="{{=value.id}}" >{{=value.page}}</div>
          {{~}}
        </div>
        {{?}}
      {{?}} 
    </div>
    <div class="right-page">
      <div class="right-top-button"></div>
      <div class="right-bottom-button"></div>
      <div class="page-content"></div>
      {{? it.st }}
        <div class="page-cover disable"></div>
      {{?}}
    </div>
  
</div>
