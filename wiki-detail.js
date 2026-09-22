(function(){
  var WIKI_ITEMS=[
    {name:'叠加介绍', icon:'icons/item_00234.png',                src:'char_13.html'},
    {name:'羽翼介绍', icon:'icons/item_00318.png',                src:'char_2.html'},
    {name:'坐骑介绍', icon:'icons/item_00340.png',                src:'char_3.html'},
    {name:'变身卡介绍',icon:'icons/achievement_0027.png',         src:'char_4.html'},
    {name:'法宝介绍', icon:'icons/item_00342.png',                src:'char_5.html'},
    {name:'装备介绍', icon:'icons/item_00347.png',                src:'char_7.html'},
    {name:'技能介绍', icon:'icons/book_skill.png',                src:'char_8.html'},
    {name:'光华介绍', icon:'icons/item_gh016.png',                src:'char_10.html'},
    {name:'神兵介绍', icon:'icons/arms_fx01_Weapon12.png',        src:'char_11.html'},
    {name:'宠物部分', icon:'art/nav_xianlv.webp',                 src:'pet.html'},
    {name:'仙侣部分', icon:'art/nav_pet.webp',                    src:'companion.html'},
    {name:'家园部分', icon:'art/nav_home.webp',                   src:'home.html'},
    {name:'子女部分', icon:'art/nav_children.webp',               src:'children.html'},
    {name:'便捷功能', icon:'art/convenient/智能战斗.webp',         src:'conv_1.html'}
  ];
  var WIKI_CHAPTERS={
    'char_13.html':['头像叠加','头衔叠加','称谓叠加'],
    'char_2.html':['系统介绍','灵护介绍','灵护技能','点化介绍','升级消耗','升阶消耗','技能介绍'],
    'char_3.html':['系统介绍','坐骑进阶','坐骑星命','坐骑守护','坐骑染色'],
    'char_4.html':['系统介绍','百变精气','系别克制','变身抽取','变身分解','变身卡图鉴'],
    'char_5.html':['系统介绍','成长介绍','星级介绍','套装介绍','龙晶介绍','灵器介绍','灵器特技'],
    'char_7.html':['打造介绍','启灵介绍','套装效果','洗魂介绍','附魂介绍','特效介绍'],
    'char_8.html':['修炼技能','生活技能','帮派技能'],
    'char_10.html':['系统介绍','基础光华介绍'],
    'char_11.html':['系统介绍','灵石介绍','灵石等级限制','灵石转换说明','成长属性介绍','灵石等级换算比例','各阶所需 1 级灵石数量'],
    'pet.html':[{label:'宠物图鉴',kids:[{label:'神兽',cat:'shenshou'},{label:'魔兽',cat:'moshou'},{label:'变异',cat:'bianyi'}]},'宠物返生','宠物化生','碎片转换','宠物分解','宠物觉醒','宠物继承','宠物印记','宠物飞升','宠物星灵','宠物灵宝','宠物装备','装备重铸','宠物内丹','宠物护佑','护佑技能','终极技能'],
    'companion.html':[{label:'仙侣图鉴',kids:[{label:'全部仙侣',cat:'ALL'},{label:'B级',cat:'B'},{label:'A级',cat:'A'},{label:'S级',cat:'S'},{label:'SS级',cat:'SS'}]},'仙侣寻缘','仙侣升星','仙侣神器','仙侣巡逻','仙侣结交','仙侣洞府','仙侣元神'],
    'home.html':['系统介绍','房屋等级评分','风水值详情','风格家具评分','房屋统计'],
    'children.html':['系统介绍','子女印记','子女守护','子女性格','子女门派技能','门派技能提升','子女装备提升','装备升阶消耗','子女装备属性重置','子女成长','子女资质','子女开格','子女秘籍'],
    'conv_1.html':['智能战斗','智能组队','智能理包','门派转换','性别重生','调整速度']
  };
  var menuCard=null;
  var menuOpen=false;
  var menuLocked=false;
  var menuLockY=0;
  var pendingFocus=null;
  var htmlCache=Object.create(null);
  var htmlWait=Object.create(null);
  var wikiPages=Object.create(null);
  var activeFile=null;
  var loadToken=0;
  var wikiBound=false;
  var stage=null;

  function currentFile(){
    var path=location.pathname.split('/').pop()||'';
    try{path=decodeURIComponent(path)}catch(e){}
    if(path&&isWikiFile(path))return path;
    if(path&&isWikiFile(path+'.html'))return path+'.html';
    return path;
  }
  function fileFromHref(href){
    try{
      return decodeURIComponent(new URL(href,location.href).pathname.split('/').pop()||'')
    }catch(e){
      return String(href||'').split('?')[0].split('#')[0].split('/').pop()
    }
  }
  function isWikiFile(file){
    return WIKI_ITEMS.some(function(item){return item.src===file})
  }
  function isFlatFile(file){
    return WIKI_ITEMS.some(function(item){return item.src===(file||currentFile()) && item.flat})
  }
  function applyFlatMode(on){
    document.body.classList.toggle('wiki-flat', !!on);
    if(!on)return;
    Array.from(document.querySelectorAll('.wiki-tabs,.wtab-bar')).forEach(function(el){el.remove()});
    Array.from(document.querySelectorAll('.section,.info-section,.content-card,.wiki-tab-panel')).forEach(function(el){el.hidden=false});
  }
  function textOf(element){
    return element.textContent.replace(/\s+/g,' ').trim().replace(/[：:]+$/,'').replace(/^[^\u4e00-\u9fffA-Za-z0-9]+/,'')||'总览'
  }
  function makePanel(element,label){
    element.classList.add('wiki-tab-panel');
    element.dataset.wikiLabel=label;
    return element
  }
  function headingLabel(section){
    var custom=section.getAttribute('data-wiki-label');
    if(custom) return custom;
    var heading=section.querySelector('.hs-toggle-header span,.section-title,.purple-header,h2,.info-section h2');
    return heading?textOf(heading):'总览'
  }
  function currentTabLabel(){
    try{return decodeURIComponent((location.hash||'').replace(/^#/,'')).trim()}catch(e){return ''}
  }
  function setTabHash(label){
    if(!label)return;
    var next='#'+encodeURIComponent(label);
    var cur=location.hash||'';
    if(cur===next||cur==='#'+label)return;
    try{history.replaceState(history.state||{},'',location.pathname+location.search+next)}catch(e){}
  }
  var tabHashBound=false;
  function bindTabHash(){
    if(tabHashBound)return;
    tabHashBound=true;
    window.addEventListener('hashchange',function(){
      var label=currentTabLabel();
      if(!label)return;
      var tabs=document.querySelector('.wiki-tabs');
      if(!tabs)return;
      var btn=Array.from(tabs.querySelectorAll('.wiki-tab,.wtab')).find(function(el){return tabLabelOf(el)===label});
      if(btn && !btn.classList.contains('is-active') && !btn.classList.contains('active')) btn.click();
    });
  }
  function openCollapsibles(scope){
    Array.from(scope.querySelectorAll('.hs-collapsible')).forEach(function(panel){panel.classList.add('open')});
    Array.from(scope.querySelectorAll('.hs-expand-btn')).forEach(function(btn){btn.remove()});
  }
  function makeHeadingPanels(scope,headings){
    headings.forEach(function(heading,index){
      var panel=document.createElement('section');
      panel.className='wiki-tab-panel';
      panel.dataset.wikiLabel=textOf(heading);
      heading.parentNode.insertBefore(panel,heading);
      var node=heading;
      while(node&&node!==headings[index+1]&&!node.classList.contains('footer')){
        var next=node.nextElementSibling;
        panel.appendChild(node);
        node=next
      }
    });
    return Array.from(scope.querySelectorAll(':scope > .wiki-tab-panel'))
  }
  function enableMouseDragScroll(tabs){
    var startX=0,startScroll=0,dragging=false,armed=false,pointerId=null;
    tabs.addEventListener('pointerdown',function(event){
      if(event.pointerType==='touch'||event.button!==0)return;
      armed=true;dragging=false;pointerId=event.pointerId;
      startX=event.clientX;startScroll=tabs.scrollLeft;
    });
    tabs.addEventListener('pointermove',function(event){
      if(!armed||event.pointerId!==pointerId)return;
      var delta=event.clientX-startX;
      if(!dragging&&Math.abs(delta)<8)return;
      if(!dragging){
        dragging=true;
        tabs.classList.add('is-dragging');
        try{tabs.setPointerCapture(event.pointerId)}catch(e){}
      }
      tabs.scrollLeft=startScroll-delta;
      event.preventDefault();
    });
    function finish(event){
      if(event.pointerId!==pointerId)return;
      if(tabs.hasPointerCapture(event.pointerId)){
        try{tabs.releasePointerCapture(event.pointerId)}catch(e){}
      }
      tabs.classList.remove('is-dragging');
      armed=false;pointerId=null;
      if(dragging){
        dragging=false;
        event.preventDefault();
        event.stopPropagation();
      }
    }
    tabs.addEventListener('pointerup',finish);
    tabs.addEventListener('pointercancel',finish);
    tabs.addEventListener('click',function(event){
      if(!dragging)return;
      event.preventDefault();
      event.stopPropagation();
    },true);
  }
  function markTabBar(bar,activeTab){
    Array.from(bar.querySelectorAll('.wtab,.wiki-tab')).forEach(function(tab){
      var on=tab===activeTab;
      tab.classList.toggle('active',on);
      tab.classList.toggle('is-active',on);
      tab.setAttribute('aria-selected',on?'true':'false');
    });
  }
  function tidyWikiLayout(scope){
    scope=scope||document;
    Array.from(scope.querySelectorAll('.wrap,.page-shell')).forEach(function(wrap){
      var title=wrap.querySelector('.page-title');
      var bar=wrap.querySelector('.wtab-bar,.wiki-tabs');
      var notice=wrap.querySelector(':scope > .notice-box');
      var after=notice||title;
      if(after&&bar&&after.nextElementSibling!==bar)after.insertAdjacentElement('afterend',bar);
      Array.from(wrap.children).forEach(function(el){
        if(el===title||el===bar)return;
        if(el.classList&&el.classList.contains('back-btn'))return;
        if(el.classList&&el.classList.contains('section')&&!el.querySelector('.hs-collapsible,.hs-toggle-header,.content-card,.info-section,p,ul,ol,table,img,video,.doc-text,.doc-img,.note,.data-table,.table-wrap,.hs-media')){
          if(!el.textContent.replace(/\s+/g,''))el.remove();
        }
      });
    });
    Array.from(scope.querySelectorAll('.wtab-bar,.wiki-tabs')).forEach(function(bar){
      var holder=bar.parentNode;
      if(!holder)return;
      holder.classList.add('wiki-tab-stack');
      Array.from(holder.children).forEach(function(el){
        if(el===bar)return;
        if(el.classList&&(el.classList.contains('page-title')||el.classList.contains('notice-box')||el.classList.contains('back-btn')))return;
        el.classList.add('wiki-tab-panel');
      });
    });
  }
  function tabLabelOf(tab){
    return (tab.textContent||'').replace(/\s+/g,' ').trim();
  }
  function openHashedTab(bar){
    var label=currentTabLabel();
    if(!label||!bar)return;
    var btn=Array.from(bar.querySelectorAll('.wtab,.wiki-tab')).find(function(el){
      return tabLabelOf(el)===label;
    });
    if(!btn)return;
    if(!btn.classList.contains('active') && !btn.classList.contains('is-active')) btn.click();
  }
  function adoptExistingTabs(){
    var bar=document.querySelector('.wtab-bar');
    if(!bar)return false;
    bar.classList.add('wiki-tabs');
    bar.setAttribute('aria-label','页面分栏');
    Array.from(bar.querySelectorAll('.wtab')).forEach(function(tab){
      tab.classList.add('wiki-tab');
    });
    markTabBar(bar,bar.querySelector('.wtab.active,.wiki-tab.is-active')||bar.querySelector('.wtab,.wiki-tab'));
    bar.addEventListener('click',function(event){
      var tab=event.target.closest&&event.target.closest('.wtab,.wiki-tab');
      if(!tab||!bar.contains(tab))return;
      markTabBar(bar,tab);
      setTabHash(tabLabelOf(tab));
    });
    openCollapsibles(document);
    enableMouseDragScroll(bar);
    tidyWikiLayout(document);
    bindTabHash();
    openHashedTab(bar);
    return true
  }
  function setupTabs(){
    if(isFlatFile()){applyFlatMode(true);return}
    applyFlatMode(false);
    if(document.querySelector('.wiki-tabs'))return;
    if(adoptExistingTabs())return;
    var scope=document.querySelector('.wrap,.page-shell');if(!scope)return;
    var panels=[];
    var cards=Array.from(scope.querySelectorAll(':scope > .content-card'));
    if(cards.length){
      panels=cards.map(function(card){
        var heading=card.querySelector('.section-title');
        return makePanel(card,heading?textOf(heading):'教程')
      })
    }else{
      var sections=Array.from(scope.querySelectorAll(':scope > .section'));
      if(sections.length){
        openCollapsibles(scope);
        panels=sections.map(function(section){return makePanel(section,headingLabel(section))})
      }else{
        var infoSections=Array.from(scope.querySelectorAll(':scope > .info-section'));
        if(infoSections.length){
          panels=infoSections.map(function(section){return makePanel(section,headingLabel(section))})
        }else{
          var headings=Array.from(scope.querySelectorAll(':scope > .purple-header,:scope > .blue-header'));
          if(headings.length)panels=makeHeadingPanels(scope,headings)
        }
      }
    }
    if(!panels.length){
      var main=scope.querySelector('.mindmap-container,.empty-content,main');
      if(main)panels=[makePanel(main,'总览')]
    }
    if(panels.length<2)return;
    var tabs=document.createElement('nav');
    tabs.className='wiki-tabs';
    tabs.setAttribute('aria-label','页面分栏');
    panels.forEach(function(panel,index){
      var tab=document.createElement('button');
      tab.type='button';
      tab.className='wiki-tab'+(index===0?' is-active':'');
      tab.textContent=panel.dataset.wikiLabel;
      tab.setAttribute('aria-selected',index===0?'true':'false');
      tab.addEventListener('click',function(){
        panels.forEach(function(item,itemIndex){
          var on=itemIndex===index;
          item.hidden=!on;
          tabs.children[itemIndex].classList.toggle('is-active',on);
          tabs.children[itemIndex].setAttribute('aria-selected',on?'true':'false');
        });
        setTabHash(panel.dataset.wikiLabel);
        window.scrollTo({top:0,behavior:'smooth'})
      });
      tabs.appendChild(tab);
      panel.hidden=index!==0
    });
    var want=currentTabLabel();
    var start=0;
    if(want){
      panels.forEach(function(item,itemIndex){
        if(item.dataset.wikiLabel===want) start=itemIndex;
      });
    }
    if(start){
      panels.forEach(function(item,itemIndex){
        var on=itemIndex===start;
        item.hidden=!on;
        tabs.children[itemIndex].classList.toggle('is-active',on);
        tabs.children[itemIndex].setAttribute('aria-selected',on?'true':'false');
      });
    }
    var title=scope.querySelector('.page-title');
    var notice=scope.querySelector(':scope > .notice-box');
    (notice||title||scope.firstElementChild).insertAdjacentElement('afterend',tabs);
    enableMouseDragScroll(tabs);
    bindTabHash();
    tidyWikiLayout(document);
  }
  function persistHeadEl(el){
    if(el.id==='wiki-nosb')return true;
    var href=el.getAttribute('href')||'';
    return href.indexOf('wiki-detail.css')!==-1
  }
  function setDesc(text){
    var meta=document.querySelector('meta[name="description"]');
    if(meta&&text!=null)meta.setAttribute('content',text)
  }
  function enableStyles(file){
    Array.from(document.head.querySelectorAll('[data-wiki-page]')).forEach(function(el){
      el.disabled=!file||el.getAttribute('data-wiki-page')!==file
    });
  }
  function tagCurrentStyles(file){
    Array.from(document.head.querySelectorAll('style,link[rel="stylesheet"]')).forEach(function(el){
      if(persistHeadEl(el)||el.hasAttribute('data-wiki-page'))return;
      el.setAttribute('data-wiki-page',file)
    });
  }
  function parkActive(){
    if(!activeFile||!stage)return;
    var page=wikiPages[activeFile]||(wikiPages[activeFile]={});
    if(page.parked)return;
    var fragment=document.createDocumentFragment();
    while(stage.firstChild)fragment.appendChild(stage.firstChild);
    page.fragment=fragment;
    page.title=document.title;
    page.description=(document.querySelector('meta[name="description"]')||{}).content||'';
    page.bodyClass=document.body.className;
    page.ready=true;
    page.parked=true;
    enableStyles('')
  }
  function restorePage(file){
    var page=wikiPages[file];
    if(!page||!page.fragment)return false;
    document.title=page.title||document.title;
    setDesc(page.description);
    document.body.className=page.bodyClass||'';
    document.body.classList.add('wiki-detail-page','wiki-has-menu');
    document.body.classList.remove('has-wiki-rail');
    applyFlatMode(isFlatFile(file));
    enableStyles(file);
    stage.appendChild(page.fragment);
    page.parked=false;
    activeFile=file;
    return true
  }
  function runPageScripts(nodes){
    nodes.forEach(function(old){
      var src=old.getAttribute('src')||'';
      if(/wiki-detail\.js/.test(src))return;
      var code=old.textContent||'';
      if(/禁止复制/.test(code))return;
      if(/embedded/.test(code)&&/back-btn/.test(code))return;
      var script=document.createElement('script');
      Array.from(old.attributes).forEach(function(attr){script.setAttribute(attr.name,attr.value)});
      if(!src)script.textContent=code;
      document.body.appendChild(script);
      if(!src&&script.parentNode)script.parentNode.removeChild(script)
    });
  }
  function mountFromHtml(html,file){
    var doc=new DOMParser().parseFromString(html,'text/html');
    document.title=doc.title;
    var desc=doc.querySelector('meta[name="description"]');
    if(desc)setDesc(desc.getAttribute('content'));
    document.body.className=doc.body.className||'';
    document.body.classList.add('wiki-detail-page','wiki-has-menu');
    document.body.classList.remove('has-wiki-rail');
    applyFlatMode(isFlatFile(file));
    var anchor=document.querySelector('link[href="wiki-detail.css"]')||document.getElementById('wiki-nosb');
    Array.from(doc.head.querySelectorAll('style,link[rel="stylesheet"]')).forEach(function(el){
      if(persistHeadEl(el))return;
      var clone=el.cloneNode(true);
      clone.setAttribute('data-wiki-page',file);
      if(anchor)document.head.insertBefore(clone,anchor);
      else document.head.appendChild(clone)
    });
    enableStyles(file);
    while(stage.firstChild)stage.removeChild(stage.firstChild);
    var scripts=[];
    Array.from(doc.body.childNodes).forEach(function(node){
      if(node.nodeType===1){
        if(node.classList.contains('wiki-side-rail')||node.classList.contains('wiki-bottom-nav'))return;
        if(node.classList.contains('site-watermark'))return;
        if(node.id==='wiki-stage')return;
        if(node.tagName==='SCRIPT'){scripts.push(node);return}
      }
      stage.appendChild(document.importNode(node,true))
    });
    runPageScripts(scripts);
    setupTabs();
    tidyWikiLayout(document);
    ensureWatermark();
    wikiPages[file]={ready:true,parked:false,title:document.title};
    activeFile=file
  }
  function ensureHtml(file){
    if(htmlCache[file])return Promise.resolve(htmlCache[file]);
    if(htmlWait[file])return htmlWait[file];
    htmlWait[file]=fetch(file,{credentials:'same-origin'}).then(function(res){
      if(!res.ok)throw new Error('fail');
      return res.text()
    }).then(function(text){
      htmlCache[file]=text;
      delete htmlWait[file];
      return text
    },function(err){
      delete htmlWait[file];
      throw err
    });
    return htmlWait[file]
  }
  function switchTo(file){
    if(file===activeFile)return;
    if(wikiPages[file]&&wikiPages[file].ready){
      parkActive();
      restorePage(file);
      window.scrollTo(0,0);
      return
    }
    var token=++loadToken;
    ensureHtml(file).then(function(html){
      if(token!==loadToken)return;
      parkActive();
      mountFromHtml(html,file);
      window.scrollTo(0,0)
    }).catch(function(){
      if(token!==loadToken)return;
      hardOpen(file,'','')
    })
  }
  function navigateWiki(file,push){
    if(!isWikiFile(file)||file===activeFile)return;
    updateRailActive(file);
    if(push){
      try{history.pushState({wiki:file},'',file)}catch(e){}
    }
    switchTo(file)
  }
  function prefetchWiki(file){
    if(!isWikiFile(file)||file===activeFile||htmlCache[file]||htmlWait[file])return;
    ensureHtml(file)
  }
  function updateRailActive(file){
    Array.from(document.querySelectorAll('.wiki-side-btn')).forEach(function(link){
      link.classList.toggle('is-active',fileFromHref(link.getAttribute('href'))===file)
    });
  }
  function wrapStage(){
    stage=document.getElementById('wiki-stage');
    if(!stage){
      stage=document.createElement('div');
      stage.id='wiki-stage'
    }
    var mark=document.querySelector('.site-watermark');
    Array.from(document.body.children).forEach(function(el){
      if(el===mark||el===stage)return;
      if(el.classList&&(el.classList.contains('wiki-side-rail')||el.classList.contains('wiki-bottom-nav')))return;
      stage.appendChild(el)
    });
    if(mark&&mark.nextSibling)document.body.insertBefore(stage,mark.nextSibling);
    else document.body.appendChild(stage)
  }
  function chapterLabel(chapter){
    return typeof chapter==='string'?chapter:(chapter&&chapter.label)||''
  }
  function wikiHref(file,label){
    return label?file+'#'+encodeURIComponent(label):file
  }
  function buildMenuCard(){
    if(menuCard)return menuCard;
    var card=document.createElement('div');
    card.id='wiki-menu-card';
    card.className='wiki-menu-card';
    card.setAttribute('role','dialog');
    card.setAttribute('aria-label','百科目录');
    card.setAttribute('aria-hidden','true');
    var html=WIKI_ITEMS.map(function(item){
      var chapters=WIKI_CHAPTERS[item.src]||[];
      var links=chapters.map(function(chapter){
        var label=chapterLabel(chapter);
        var kids=chapter&&chapter.kids;
        if(!kids){
          return '<a href="'+wikiHref(item.src,label)+'" data-wiki-file="'+item.src+'" data-wiki-label="'+label+'">'+label+'</a>'
        }
        var kidHtml=kids.map(function(kid){
          return '<a class="wiki-menu-kid" href="'+wikiHref(item.src,label)+'" data-wiki-file="'+item.src+'" data-wiki-label="'+label+'" data-wiki-cat="'+kid.cat+'">'+kid.label+'</a>'
        }).join('');
        return '<span class="wiki-menu-group"><a href="'+wikiHref(item.src,label)+'" data-wiki-file="'+item.src+'" data-wiki-label="'+label+'">'+label+'</a><span class="wiki-menu-kids">'+kidHtml+'</span></span>'
      }).join('');
      return '<section class="wiki-menu-block" data-file="'+item.src+'"><a class="wiki-menu-head" href="'+item.src+'" data-wiki-file="'+item.src+'"><img src="'+item.icon+'" alt="" draggable="false"><span>'+item.name+'</span></a><div class="wiki-menu-links">'+links+'</div></section>'
    }).join('');
    card.innerHTML=html;
    document.documentElement.appendChild(card);
    card.addEventListener('click',function(event){
      var link=event.target.closest&&event.target.closest('a[data-wiki-file]');
      if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      var file=link.getAttribute('data-wiki-file');
      if(!isWikiFile(file))return;
      var label=link.getAttribute('data-wiki-label')||'';
      var cat=link.getAttribute('data-wiki-cat')||'';
      event.preventDefault();
      if(file===activeFile){
        openChapter(file,label,cat);
        return;
      }
      hardOpen(file,label,cat);
    });
    card.addEventListener('pointerenter',function(event){
      var link=event.target.closest&&event.target.closest('a[data-wiki-file]');
      if(!link)return;
      prefetchWiki(link.getAttribute('data-wiki-file'));
    },true);
    menuCard=card;
    return card
  }
  function syncMenuState(file){
    if(!menuCard)return;
    file=file||currentFile();
    var label=currentTabLabel();
    var activeCat='';
    var catBtn=document.querySelector('.ency-side-btn.active');
    if(catBtn) activeCat=catBtn.getAttribute('data-cat')||'';
    Array.from(menuCard.querySelectorAll('.wiki-menu-block')).forEach(function(block){
      block.classList.toggle('is-current',block.getAttribute('data-file')===file);
    });
    Array.from(menuCard.querySelectorAll('a[data-wiki-file]')).forEach(function(link){
      if(link.classList.contains('wiki-menu-head')){
        link.classList.toggle('is-on',false);
        return
      }
      var same=link.getAttribute('data-wiki-file')===file;
      var lab=link.getAttribute('data-wiki-label')||'';
      var cat=link.getAttribute('data-wiki-cat')||'';
      var on=same&&!!lab&&lab===label&&(cat?cat===activeCat:!link.classList.contains('wiki-menu-kid'));
      link.classList.toggle('is-on',on);
    });
  }
  function currentTitle(){
    return document.querySelector('#wiki-stage .page-title.wiki-title-art')||document.querySelector('.page-title.wiki-title-art')
  }
  function syncTitleA11y(){
    var title=currentTitle();
    if(!title)return;
    var on=isWikiFile(currentFile());
    if(!on){
      title.removeAttribute('role');
      title.removeAttribute('aria-expanded');
      title.removeAttribute('aria-controls');
      return
    }
    title.setAttribute('role','button');
    title.tabIndex=0;
    title.setAttribute('aria-expanded',menuOpen?'true':'false');
    title.setAttribute('aria-controls','wiki-menu-card');
    var name=((title.querySelector('h1')||{}).textContent||'百科').replace(/\s+/g,' ').trim();
    title.setAttribute('aria-label',name+'，点击展开或收起百科目录');
    if(!title.querySelector('.wiki-title-hint')){
      var hint=document.createElement('p');
      hint.className='wiki-title-hint';
      hint.textContent='点击上方图片可自由切换其他介绍';
      title.appendChild(hint);
    }
  }
  function placeMenu(){
    if(!menuCard)return;
    var title=currentTitle();
    var wrap=title&&title.closest('.wrap,.page-shell');
    if(!title||!wrap)return;
    var tr=title.getBoundingClientRect();
    var wr=wrap.getBoundingClientRect();
    if(!menuLocked&&(tr.bottom<8||tr.top>window.innerHeight-8)){
      closeMenu(true);
      return
    }
    var side=16;
    var top=Math.round(tr.bottom+8);
    var bottomGap=76;
    var left=Math.round(wr.left+side);
    var width=Math.round(wr.width-side*2);
    if(left<8)left=8;
    if(left+width>window.innerWidth-8)width=window.innerWidth-8-left;
    menuCard.style.left=left+'px';
    menuCard.style.width=Math.max(160,width)+'px';
    menuCard.style.top=top+'px';
    menuCard.style.maxHeight=Math.max(96,Math.round(window.innerHeight-top-bottomGap))+'px';
  }
  function lockPageScroll(){
    if(menuLocked)return;
    menuLockY=window.scrollY||document.documentElement.scrollTop||0;
    var gap=window.innerWidth-document.documentElement.clientWidth;
    document.documentElement.classList.add('wiki-menu-lock');
    document.body.style.top=(-menuLockY)+'px';
    if(gap>0)document.body.style.paddingRight=gap+'px';
    menuLocked=true;
  }
  function unlockPageScroll(){
    if(!menuLocked)return;
    var y=menuLockY;
    menuLocked=false;
    document.documentElement.classList.remove('wiki-menu-lock');
    document.body.style.top='';
    document.body.style.paddingRight='';
    var root=document.documentElement;
    var prev=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';
    window.scrollTo(0,y);
    root.style.scrollBehavior=prev;
  }
  function openMenu(){
    if(!isWikiFile(currentFile())||!currentTitle())return;
    buildMenuCard();
    menuOpen=true;
    lockPageScroll();
    syncMenuState();
    placeMenu();
    menuCard.setAttribute('aria-hidden','false');
    syncTitleA11y();
    requestAnimationFrame(function(){
      if(!menuOpen||!menuCard)return;
      menuCard.classList.add('is-open');
      var current=menuCard.querySelector('.wiki-menu-block.is-current');
      if(current) menuCard.scrollTop=Math.max(0,current.offsetTop-8);
    });
  }
  function closeMenu(immediate){
    var wasOpen=menuOpen;
    menuOpen=false;
    unlockPageScroll();
    if(!menuCard||!wasOpen)return;
    menuCard.classList.remove('is-open');
    menuCard.setAttribute('aria-hidden','true');
    syncTitleA11y();
    if(immediate) menuCard.style.maxHeight='0px';
  }
  function toggleMenu(){
    if(menuOpen) closeMenu();
    else openMenu();
  }
  function hardOpen(file,label,cat){
    var last=location.pathname.split('/').pop()||'';
    var clean=last!==''&&!/\.html$/i.test(last);
    var target=clean?file.replace(/\.html$/i,''):file;
    var url=new URL(wikiHref(target,label),location.href);
    if(cat) url.searchParams.set('cat',cat);
    location.assign(url.href);
  }
  function applyCatQuery(){
    var cat='';
    try{cat=new URLSearchParams(location.search).get('cat')||''}catch(e){return}
    if(!cat)return;
    var side=Array.from(document.querySelectorAll('.ency-side-btn')).find(function(btn){
      return btn.getAttribute('data-cat')===cat
    });
    if(side&&!side.classList.contains('active')) side.click();
  }
  function openChapter(file,label,cat){
    closeMenu();
    if(!isWikiFile(file))return;
    if(file===activeFile){
      if(label){
        var bar=document.querySelector('.wtab-bar,.wiki-tabs');
        var btn=Array.from(bar?bar.querySelectorAll('.wtab,.wiki-tab'):[]).find(function(el){return tabLabelOf(el)===label});
        if(btn&&!btn.classList.contains('active')&&!btn.classList.contains('is-active')) btn.click();
        else setTabHash(label);
      }
      if(cat){
        var side=document.querySelector('.ency-side-btn[data-cat="'+cat+'"]');
        if(side) side.click();
      }
      syncMenuState();
      window.scrollTo({top:0,behavior:'smooth'});
      return
    }
    pendingFocus={label:label||'',cat:cat||''};
    updateRailActive(file);
    try{history.pushState({wiki:file},'',wikiHref(file,label))}catch(e){}
    switchTo(file);
  }
  function bindWikiMenu(){
    document.addEventListener('click',function(event){
      if(!isWikiFile(currentFile()))return;
      var title=event.target.closest&&event.target.closest('.page-title.wiki-title-art');
      if(title){
        event.preventDefault();
        toggleMenu();
        return
      }
      if(menuOpen&&menuCard&&!menuCard.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown',function(event){
      if(menuOpen&&!event.target.closest('input,textarea')&&(event.key==='ArrowUp'||event.key==='ArrowDown'||event.key==='PageUp'||event.key==='PageDown'||event.key==='Home'||event.key==='End')){
        if(!(menuCard&&menuCard.contains(event.target)))event.preventDefault();
      }
      if(event.key==='Escape'&&menuOpen){
        closeMenu();
        return
      }
      var title=event.target.closest&&event.target.closest('.page-title.wiki-title-art');
      if(!title||!isWikiFile(currentFile()))return;
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        toggleMenu();
      }
    });
    function blockBackgroundScroll(event){
      if(!menuOpen)return;
      if(menuCard&&(event.target===menuCard||menuCard.contains(event.target)))return;
      event.preventDefault();
    }
    document.addEventListener('wheel',blockBackgroundScroll,{passive:false});
    document.addEventListener('touchmove',blockBackgroundScroll,{passive:false});
    window.addEventListener('scroll',function(){if(menuOpen&&!menuLocked)placeMenu()},true);
    window.addEventListener('resize',function(){if(menuOpen) placeMenu()});
  }
  function setupWikiMenu(){
    var old=document.querySelector('.wiki-side-rail');
    if(old&&old.parentNode) old.parentNode.removeChild(old);
    document.body.classList.remove('has-wiki-rail');
    if(!isWikiFile(currentFile()))return;
    document.body.classList.add('wiki-has-menu');
    buildMenuCard();
    syncMenuState();
    syncTitleA11y();
    bindWikiMenu();
  }
  function addBottomNav(){
    if(document.querySelector('.wiki-bottom-nav'))return;
    var file=currentFile();
    var wikiActive=isWikiFile(file);
    var nav=document.createElement('nav');
    nav.className='wiki-bottom-nav';
    nav.setAttribute('aria-label','主导航');
    nav.innerHTML='<a href="index.html?skipIntro=1"><img src="icons/nav_home.png" alt=""><span>首页</span></a><a href="sects.html"><img src="icons/nav_sects.png" alt=""><span>门派</span></a><a href="conv_8.html"><img src="icons/nav_support.png" alt=""><span>智能客服</span></a><a href="char_13.html"'+(wikiActive?' class="is-active"':'')+'><img src="icons/item_07358.png" alt=""><span>百科</span></a><a href="index.html?skipIntro=1#events"><img src="icons/nav_events.png" alt=""><span>活动</span></a>';
    document.documentElement.appendChild(nav);
  }
  function bindWikiNav(){
    if(wikiBound)return;
    wikiBound=true;
    document.addEventListener('click',function(event){
      var link=event.target.closest&&event.target.closest('a.wiki-side-btn');
      if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      var file=fileFromHref(link.getAttribute('href'));
      if(!isWikiFile(file))return;
      event.preventDefault();
      navigateWiki(file,true);
    });
    document.addEventListener('pointerenter',function(event){
      var link=event.target.closest&&event.target.closest('a.wiki-side-btn');
      if(!link)return;
      prefetchWiki(fileFromHref(link.getAttribute('href')));
    },true);
    window.addEventListener('popstate',function(){
      var file=currentFile();
      if(isWikiFile(file))navigateWiki(file,false);
    });
  }
  function ensureWatermark(){
    var mark=document.querySelector('.site-watermark');
    if(!mark){
      mark=document.createElement('div');
      mark.className='site-watermark';
    }
    if(mark.parentNode!==document.body)document.body.insertBefore(mark,document.body.firstChild);
  }
  function enableImgZoom(){
    if(window.__wikiImgZoom)return;
    window.__wikiImgZoom=true;
    var box=document.createElement('div');
    box.className='img-lightbox';
    box.hidden=true;
    var pic=document.createElement('img');
    pic.alt='';
    box.appendChild(pic);
    document.body.appendChild(box);
    function close(){box.hidden=true;pic.removeAttribute('src')}
    function zoomable(img){
      if(!img||img.tagName!=='IMG')return false;
      if(img.closest('.img-lightbox,.wiki-side-rail,.wiki-bottom-nav,.page-title,.wiki-title-art,.pet-detail-overlay'))return false;
      if(!img.closest('.wrap,.page-shell'))return false;
      var src=img.getAttribute('src')||'';
      return !!src&&src.indexOf('data:')!==0
    }
    document.addEventListener('dblclick',function(e){
      var img=e.target.closest&&e.target.closest('img');
      if(!zoomable(img))return;
      e.preventDefault();
      pic.src=img.currentSrc||img.src;
      pic.alt=img.alt||'';
      box.hidden=false
    });
    box.addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  }
  function fitViewport(){
    var vp=document.querySelector('meta[name="viewport"]');
    if(!vp)return;
    var c=vp.getAttribute('content')||'';
    if(c.indexOf('viewport-fit')===-1)vp.setAttribute('content',c.replace(/\s+$/,'')+', viewport-fit=cover');
  }
  function initWiki(){
    fitViewport();
    document.body.classList.add('wiki-detail-page');
    enableImgZoom();
    ensureWatermark();
    wrapStage();
    setupWikiMenu();
    addBottomNav();
    bindWikiNav();
    setupTabs();
    applyCatQuery();
    var file=currentFile();
    if(isWikiFile(file)){
      activeFile=file;
      tagCurrentStyles(file);
      wikiPages[file]={ready:true,parked:false,title:document.title};
      try{history.replaceState({wiki:file},'',location.href)}catch(e){}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initWiki);
  else initWiki();
})();
