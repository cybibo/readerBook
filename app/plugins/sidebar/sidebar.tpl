<div class="header">
  <span class="title-icon"></span>
  <span class="title">iSmartbook Reader</span>
  <a class="settings"></a>
</div>
<div id="sidebar-scroll-wrapper">
<div>
<div class="folder">
  <span class="btn"></span>Contents
</div>
<ul class="outline">
  {{~it :module:module_index}}
  <li class="outline-module">
    <div class="folder">
      <span class="btn"></span>Module {{=module_index+1}}
    </div>

    <ul>
      {{~module :unit:unit_index}}
      <li class="outline-unit">
        <div class="folder">
          <span class="btn"></span>Unit {{=unit_index+1}}
        </div>
        <ul>
          {{~unit.pages :page:page_index}}
          <li class="outline-page" data-page="{{=page.id}}">
            <a>{{=page.label}}</a>
          </li>
          {{~}}
        </ul>
      </li>
      {{~}}
    </ul>
  </li>
  {{~}}
</ul>
<div class="folder">
  <span class="btn"></span>Bookmarks
</div>
<ul class="bookmark"></ul>
</div>
</div>