window.appWillLaunch = function () {yum.enable(false);yum.define([],function(){class Model extends Pi.Model.Abstract{instances(){};init(){super.init(Pi.Url.create(App.getConfig('netune.api'),'/musica'));};validators(add){add({});};initWithJson(json){super.initWithJson(json);return this;};actions(add){super.actions(add);add({get:'GET:/get?id=:id',all:'GET:/all'});}};Pi.Export('Music.Model',Model);});yum.define([],function(){class Automato extends Pi.Class{instances(){this.nodes=[];this.done=-1;this.reset();};add(from,to,events){for(let i=0;i<events.length;i++){const event=events[i];this.nodes[`${from}:${event}`]=to;};return this;};doneOn(done){this.done=done;return this;};onStart(cb){this._cbStart=cb;};onStep(cb){this._cbStep=cb;};onDone(cb){this._cbDone=cb;};onInvalid(cb){this._cbInvalid=cb;};trigger(event){if(!this.exist(this.current,event)){this.current=-1;if(this._cbInvalid)this._cbInvalid();return;};const from=this.current;const to=this.get(from,event);if(from==0&&to>0){this.reset();if(this._cbStart)this._cbStart(event);}else if(from>0&&to>0){if(this._cbStep)this._cbStep(event);};this.events.push(event);this.current=to;if(this.isDone()){if(this._cbDone)this._cbDone();this.reset();}};reset(){this.current=0;this.events=[];return this;};get(from,event){return this.nodes[`${from}:${event}`];};exist(from,event){return this.get(from,event)!==undefined;};isValid(){return this.current!=-1;};isDone(){return this.current==this.done;}};Pi.Export('Lexicon.Automate',Automato);});yum.define([],function(){class Lyrics extends Pi.Class{instances(){this._titulo='';this._versao='';this._youtube='';this._tokens=[];this._numCoro=0;this._numEstrofe=0;this._numPonte=0;};get text(){var text=[];text.push(`nome\n${this.titulo}`);text.push(`\nversao\n${this.versao}\n`);for(let i=0;i<this._tokens.length;i++){const token=this._tokens[i];const key=token.key.replace(/\d+/gi,'');if(token.value.length==0){text.push(`\n${key}`);}else{text.push(`${key}\n${token.value}`);}};return text.join('\n');};trocarTom(newTom){if(newTom.length==0)return;if(newTom==this._tom)return;var escalaMaiorNatural={'A':['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'],'A#':['A#','B','C','C#','D','D#','E','F','F#','G','G#','A'],'B':['B','C','C#','D','D#','E','F','F#','G','G#','A','A#'],'C':['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],'C#':['C#','D','D#','E','F','F#','G','G#','A','A#','B','C'],'D':['D','D#','E','F','F#','G','G#','A','A#','B','C','C#'],'D#':['D#','E','F','F#','G','G#','A','A#','B','C','C#','D'],'E':['E','F','F#','G','G#','A','A#','B','C','C#','D','D#'],'F':['F','F#','G','G#','A','A#','B','C','C#','D','D#','E'],'F#':['F#','G','G#','A','A#','B','C','C#','D','D#','E','F'],'G':['G','G#','A','A#','B','C','C#','D','D#','E','F','F#'],'G#':['G#','A','A#','B','C','C#','D','D#','E','F','F#','G']};var oldNotes=escalaMaiorNatural[this._tom];var newNotes=escalaMaiorNatural[newTom];for(let i=0;i<this._tokens.length;i++){const token=this._tokens[i];if(token.isTitle){token.value=token.value.replace(/[A-G]#?b?/g,(note)=>{var index=oldNotes.indexOf(note);return newNotes[index];});}else{token.key=token.key.replace(/[A-G]#?b?/g,(note)=>{var index=oldNotes.indexOf(note);return newNotes[index];});}};this._tom=newTom;};add(field,value){this[field]=this.clear(value);};set youtube(value){this._youtube=value[0];};get tokens(){return this._tokens;};set musica(value){this._titulo=value[0];};set nome(value){this._titulo=value[0];};set titulo(value){this._titulo=value[0];};get titulo(){return this._titulo||'';};get versao(){return this._versao||'';};get tom(){return this._tom||'';};set versao(value){this._versao=value[0];};set intro(value){this._tokens.push({key:'INTRO',value:value[0],isBreakable:true,isTitle:true,});};set tom(value){this._tom=value[0];this._tokens.push({key:'TOM',value:value[0],isBreakable:true,isTitle:true});};addEstrofe(nome,arr,tag=''){this._tokens.push({key:nome,value:'',isBreakable:true,isTitle:true});for(let i=0;i<arr.length;i+=2){this._tokens.push({key:arr[i],value:arr[i+1],isBreakable:i>0,isTitle:false,tag:tag});}};set estrofe(estrofe){this._numEstrofe++;this.addEstrofe(`ESTROFE ${this._numEstrofe}`,this.clear(estrofe),'ESTROFE');};set ponte(ponte){this._numPonte++;this.addEstrofe(`PONTE ${this._numPonte}`,this.clear(ponte),'PONTE');};set coro(coro){this._numCoro++;this.addEstrofe(`CORO ${this._numCoro}`,this.clear(coro),'CORO');};clear(arr){for(var i=arr.length-1;i>=0;i--){if(this.isEmpty(arr[i])){arr.pop()}else{break;}};return arr;};isEmpty(linha){linha=linha.replace(/\s/gi,'');linha=linha.replace(/\t/gi,'');return linha.length==0;}};Pi.Export('Music.Lyrics',Lyrics);});yum.define([Pi.Url.create('Music','/lyrics.js'),Pi.Url.create('Lexicon','/automate.js')],function(){class Parser extends Pi.Class{instances(){this.automate=new Lexicon.Automate();this.tags=['youtube','nome','musica','titulo','intro','tom','versao','estrofe','ponte','coro'];this.automate.add(0,0,['[empty]']);this.automate.add(0,1,['estrofe','ponte','coro']);this.automate.add(1,2,['[text]']);this.automate.add(1,4,['[empty]']);this.automate.add(4,4,['[empty]']);this.automate.add(4,2,['[text]']);this.automate.add(2,2,['[text]','[empty]']);this.automate.add(2,3,['[empty]']);this.automate.add(2,3,['[done]']);this.automate.add(2,3,this.tags);this.automate.add(0,4,['youtube','nome','musica','titulo','intro','tom','versao']);this.automate.add(4,5,['[text]']);this.automate.add(4,6,['[empty]']);this.automate.add(6,6,['[empty]']);this.automate.add(6,5,['[text]']);this.automate.add(5,3,['[empty]']);this.automate.add(5,3,['[done]']);this.automate.add(5,3,this.tags);this.automate.doneOn(3);};parse(text){var lyrics=new Music.Lyrics();var linhas=text.replace(/\r/gi,'').split('\n');var values=[];this.automate.onStart(()=>{values=[];});this.automate.onDone(()=>{const events=this.automate.events;lyrics.add(events[0],values);});for(let i=0;i<linhas.length;i++){const linhaRaw=linhas[i];const linha=this.clear(linhaRaw);const event=this.convertToEvent(linha);this.automate.onStep(()=>{values.push(linhaRaw);});this.automate.onInvalid(()=>{throw'Erro na linha '+(i+1);});this.automate.trigger(event);};this.automate.onStep(null);this.automate.trigger('[done]');return lyrics;};convertToEvent(linha){if(this.tags.indexOf(linha)>-1)return linha;if(linha.length==0)return'[empty]';return'[text]';};isEmpty(linha){return linha.length==0;};clear(linha){linha=linha.replace(/\s/gi,'');linha=linha.replace(/\t/gi,'');return linha.toLowerCase();}};Pi.Export('Music.Parser',Parser);});yum.define([],function(){class Model extends Pi.Model.Abstract{instances(){};init(){super.init(Pi.Url.create(App.getConfig('netune.api'),'/musica'));};validators(add){add({});};initWithJson(json){super.initWithJson(json);return this;};actions(add){super.actions(add);add({get:'GET:/get?id=:id',all:'GET:/all'});}};Pi.Export('Music.Model',Model);});yum.define([Pi.Url.create('Music','/parser.js')],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="page"><div class="navbar"><div class="navbar-bg"></div><div class="navbar-inner"><div class="left"><a href="javascript:void(0)"id="backPage"class="link back"><i class="icon icon-back"></i></a></div><div class="title"id="title">T�tulo</div><div class="right"><a href="javascript:void(0)"id="save"class="link back"><i class="fas fa-save"style="font-size: 26px; color: #6200ee;"></i></a></div></div></div><div class="page-content"><textarea placeholder="\nMusica\nGrande � o Senhor\n\nTom\nA\n\nEstrofe\nA\nGrande � o senhor e muito digno de louvor\nD                  E\nNa cidade do nosso Deus, seu santo monte\nA\nAlegria de toda terra\n\nEstrofe\nA\nGrande � o senhor em quem n�s temos a vit�ria\nD              E       A   \nQue nos ajuda contra o inimigo\nA                         Bm7     A/C#\nPor isso diante dele nos prostramos\n\nCoro\nA                      C#m\nQueremos o seu nome engrandecer\nA           A/C#       D             E            \nE agradecer-te por tua obra em nossa vida\nA                         C#m7\nConfiamos em teu infinito amor\n      D         A/C#        Bm7        E       A\nPois s� tu �s o Deus eterno sobre toda terra e c�us"id="textarea"style="width: 100%; height: 100%"></textarea></div></div>`);};viewDidLoad(){super.viewDidLoad();};set(musica){this.musica=musica;this.view.get('title').set(this.musica.nome);this.view.get('textarea').set(musica.lyrics);};events(listen){super.events(listen);listen({'#save click'(){if(this.musica==null)return;try{var parser=new Music.Parser();var letra=this.view.textarea.get();var lyrics=parser.parse(letra);this.musica.nome=lyrics.titulo;this.musica.versao=lyrics.versao;this.musica.tom=lyrics.tom;this.musica.lyrics=letra;if(this.musica.nome.length==0){throw'Informe o nome da m�sica';};if(this.musica.tom.length==0){throw'Informe o tom da m�sica';};if(this.musica.versao.length==0){this.musica.versao='Original';};app.loading(true);this.musica.save().ok(()=>{app.loading(false);app.event.trigger('save:music',this.musica);app.popPage();});}catch(error){var n=app.f7.notification.create({title:'Aten��o!',subtitle:'Cifra n�o esta formatada corretamente',text:error,closeButton:true,});n.open();}},'#backPage click':function(){app.popPage();}});}};Pi.Export('Music.Editor',Control);});yum.define([Pi.Url.create('Music','/lyrics.js'),Pi.Url.create('Lexicon','/automate.js')],function(){class Parser extends Pi.Class{instances(){this.automate=new Lexicon.Automate();this.tags=['youtube','nome','musica','titulo','intro','tom','versao','estrofe','ponte','coro'];this.automate.add(0,0,['[empty]']);this.automate.add(0,1,['estrofe','ponte','coro']);this.automate.add(1,2,['[text]']);this.automate.add(1,4,['[empty]']);this.automate.add(4,4,['[empty]']);this.automate.add(4,2,['[text]']);this.automate.add(2,2,['[text]','[empty]']);this.automate.add(2,3,['[empty]']);this.automate.add(2,3,['[done]']);this.automate.add(2,3,this.tags);this.automate.add(0,4,['youtube','nome','musica','titulo','intro','tom','versao']);this.automate.add(4,5,['[text]']);this.automate.add(4,6,['[empty]']);this.automate.add(6,6,['[empty]']);this.automate.add(6,5,['[text]']);this.automate.add(5,3,['[empty]']);this.automate.add(5,3,['[done]']);this.automate.add(5,3,this.tags);this.automate.doneOn(3);};parse(text){var lyrics=new Music.Lyrics();var linhas=text.replace(/\r/gi,'').split('\n');var values=[];this.automate.onStart(()=>{values=[];});this.automate.onDone(()=>{const events=this.automate.events;lyrics.add(events[0],values);});for(let i=0;i<linhas.length;i++){const linhaRaw=linhas[i];const linha=this.clear(linhaRaw);const event=this.convertToEvent(linha);this.automate.onStep(()=>{values.push(linhaRaw);});this.automate.onInvalid(()=>{throw'Erro na linha '+(i+1);});this.automate.trigger(event);};this.automate.onStep(null);this.automate.trigger('[done]');return lyrics;};convertToEvent(linha){if(this.tags.indexOf(linha)>-1)return linha;if(linha.length==0)return'[empty]';return'[text]';};isEmpty(linha){return linha.length==0;};clear(linha){linha=linha.replace(/\s/gi,'');linha=linha.replace(/\t/gi,'');return linha.toLowerCase();}};Pi.Export('Music.Parser',Parser);});yum.define([],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="swiper-container"><div class="swiper-pagination swiper-pagination-bullets"></div><!--Slides wrapper--><div class="swiper-wrapper"id="slides"></div></div>`);};load(lyrics,lineHeight=22){if(this._swiper){this.view.get('slides').html('');this._swiper.destroy();};var pageHeight=this.view.element.parent().query().height()+2;var maxlines=pageHeight/lineHeight;var rows=this.createRows(lyrics);var pages=this.createPages(rows,maxlines);for(let i=0;i<pages.length;i++){this.createSlide(pages[i].join(''));};this.createSwiper();};createPages(rows,maxlines){var pages=[];var pageNumber=0;for(let i=0;i<rows.length;i++){const row=rows[i];if(pages[pageNumber]==undefined){pages[pageNumber]=[];};if(pages[pageNumber].length>=maxlines-1){pages[pageNumber+1]=[];if(!row.isBreakable){for(var j=i-1;j>=0;j--){if(!rows[j].isMoveable)continue;if(rows[j].isBreakable){for(let w=j;w<pages[pageNumber].length;){pages[pageNumber+1].push(pages[pageNumber][w]);pages[pageNumber].splice(w,1);};break;}}};pageNumber++;};pages[pageNumber].push(row.content);};return pages;};createRows(lyrics){var rows=[];for(let i=0;i<lyrics.tokens.length;i++){const token=lyrics.tokens[i];if(token.isTitle){rows.push({isMoveable:false,isBreakable:false,content:'\n'});rows.push({isMoveable:true,isBreakable:true,content:`\n<span style="background-color: #ffff00;color: #333; font-weight: bold;">${token.key}</span>`});if(token.value.length>0){rows.push({isMoveable:true,isBreakable:false,content:`\n<span style="color: #ff0000; font-weight: bold;">${token.value}</span>`});}}else{rows.push({isMoveable:true,isBreakable:token.isBreakable,content:`\n<span style="color: #ff0000; font-weight: bold;">${token.key}</span>`});if(token.tag=='CORO'){rows.push({isMoveable:true,isBreakable:false,content:`\n<span style="color: #19b861">${token.value}</span>`});}else{rows.push({isMoveable:true,isBreakable:false,content:`\n<span style="">${token.value}</span>`});}}};return rows;};createSlide(text){this.view.get('slides').append(`<div class="swiper-slide"><pre>${text}</pre></div>`);};createSwiper(){this._swiper=app.f7.swiper.create('#'+this.view.id,{});};destroy(){this._swiper.destroy();super.destroy();}};Pi.Export('Music.Slider',Control);});yum.define([],function(){class Model extends Pi.Model.Abstract{instances(){};init(){super.init(Pi.Url.create(App.getConfig('netune.api'),'/musica'));};validators(add){add({});};initWithJson(json){super.initWithJson(json);return this;};actions(add){super.actions(add);add({get:'GET:/get?id=:id',all:'GET:/all'});}};Pi.Export('Music.Model',Model);});yum.define([],function(){class Client extends Pi.Class{instances(){super.instances();this.event=new Pi.Event();this._cn=null;this.url='';};enter(group){this.send({type:'omni.listen',group:group});};open(){this._cn=new WebSocket(App.getConfig('omni.url')||this.url);this.listen();};listen(){this._cn.onmessage=(e)=>{var payload=JSON.parse(e.data);if(payload.type=='ommi.connected'){this.event.trigger('connected');return;};if(payload.type=='omni.event'){this.event.trigger(payload.event,payload.data);return;}}};trigger(event,group,message={}){this.send({type:'omni.trigger',event:event,group:group,data:message});};send(message){this._cn.send(JSON.stringify(message));}};Pi.Export('Omni.Client',Client);});yum.define([],function(){class Model extends Pi.Model.Abstract{instances(){};init(){super.init(Pi.Url.create(App.getConfig('netune.api'),'/musica'));};validators(add){add({});};initWithJson(json){super.initWithJson(json);return this;};actions(add){super.actions(add);add({get:'GET:/get?id=:id',all:'GET:/all'});}};Pi.Export('Music.Model',Model);});yum.define([Pi.Url.create('Music','/parser.js')],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="page"><div class="navbar"><div class="navbar-bg"></div><div class="navbar-inner"><div class="left"><a href="javascript:void(0)"id="backPage"class="link back"><i class="icon icon-back"></i></a></div><div class="title"id="title">T�tulo</div><div class="right"><a href="javascript:void(0)"id="save"class="link back"><i class="fas fa-save"style="font-size: 26px; color: #6200ee;"></i></a></div></div></div><div class="page-content"><textarea placeholder="\nMusica\nGrande � o Senhor\n\nTom\nA\n\nEstrofe\nA\nGrande � o senhor e muito digno de louvor\nD                  E\nNa cidade do nosso Deus, seu santo monte\nA\nAlegria de toda terra\n\nEstrofe\nA\nGrande � o senhor em quem n�s temos a vit�ria\nD              E       A   \nQue nos ajuda contra o inimigo\nA                         Bm7     A/C#\nPor isso diante dele nos prostramos\n\nCoro\nA                      C#m\nQueremos o seu nome engrandecer\nA           A/C#       D             E            \nE agradecer-te por tua obra em nossa vida\nA                         C#m7\nConfiamos em teu infinito amor\n      D         A/C#        Bm7        E       A\nPois s� tu �s o Deus eterno sobre toda terra e c�us"id="textarea"style="width: 100%; height: 100%"></textarea></div></div>`);};viewDidLoad(){super.viewDidLoad();};set(musica){this.musica=musica;this.view.get('title').set(this.musica.nome);this.view.get('textarea').set(musica.lyrics);};events(listen){super.events(listen);listen({'#save click'(){if(this.musica==null)return;try{var parser=new Music.Parser();var letra=this.view.textarea.get();var lyrics=parser.parse(letra);this.musica.nome=lyrics.titulo;this.musica.versao=lyrics.versao;this.musica.tom=lyrics.tom;this.musica.lyrics=letra;if(this.musica.nome.length==0){throw'Informe o nome da m�sica';};if(this.musica.tom.length==0){throw'Informe o tom da m�sica';};if(this.musica.versao.length==0){this.musica.versao='Original';};app.loading(true);this.musica.save().ok(()=>{app.loading(false);app.event.trigger('save:music',this.musica);app.popPage();});}catch(error){var n=app.f7.notification.create({title:'Aten��o!',subtitle:'Cifra n�o esta formatada corretamente',text:error,closeButton:true,});n.open();}},'#backPage click':function(){app.popPage();}});}};Pi.Export('Music.Editor',Control);});yum.define([Pi.Url.create('Music','/model.js')],function(){class Model extends Pi.Model.Abstract{instances(){};init(){super.init(Pi.Url.create(App.getConfig('netune.api'),'/workspace'));};validators(add){add({});};initWithJson(json){super.initWithJson(json);for(let i=0;i<this.musicas.length;i++){this.musicas[i]=Music.Model.create().initWithJson(this.musicas[i]);};return this;};actions(add){super.actions(add);add({'current':'GET:/current','save':'POST:/save',});}};Pi.Export('Workspace.Model',Model);});yum.define([Pi.Url.create('Music','/slider.js'),Pi.Url.create('Music','/parser.js'),Pi.Url.create('Music','/editor.js')],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="page"><div class="navbar"><div class="navbar-bg"></div><div class="navbar-inner"><div class="left"><a href="javascript:void(0)"id="backPage"class="link back"><i class="icon icon-back"></i></a></div><div class="title"id="title">Título</div><div class="right"><a href="javascript:void(0)"id="youtube"class="link back"><i class="ffab fa-youtube"style="font-size: 32px; color: #ff3300;"></i></a><a href="javascript:void(0)"id="trocaTom"class="link back"><i class="fas fa-wrench"style="font-size: 26px; color: #333;"></i></a></div></div></div><div at="slider"class="page-content"></div><div class="fab fab-extended fab-right-bottom"><a id="editMusic"href="javascript:void(0)"><i class="icon material-icons md-only">edit</i></a></div></div>`);this.slider=new Music.Slider();this.parser=new Music.Parser();};viewDidLoad(){this.set(this.musica);super.viewDidLoad();};trocarTom(newTom){this.musica.tom=newTom;this.musica.save();this.updateTom(newTom);app.omni.trigger('new:tom',app.workspace.name,this.musica);};updateTom(newTom){this.lyrics.trocarTom(newTom);this.slider.load(this.lyrics);this.musica.lyrics=this.lyrics.text;};set(musica){this.musica=musica;this.lyrics=this.parser.parse(this.musica.lyrics);this.lyrics.trocarTom(this.musica.tom);if(this.lyrics._youtube.length==0){this.view.get('youtube').hide()};this.view.get('title').set(this.musica.nome);this.slider.load(this.lyrics);};events(listen){super.events(listen);listen({'#backPage click'(){app.popPage();},'#editMusic click'(){var page=new Music.Editor();page.set(this.musica);app.addPage(page);},'(app) save:music'(musica){if(this.musica.id==musica.id){this.set(musica);app.omni.trigger('update:musica',app.workspace.name,musica);}},'(app.omni) new:tom'(musica){if(this.musica.id==musica.id){this.updateTom(musica.tom);}},'(app.omni) update:musica'(musica){if(this.musica.id==musica.id){this.musica.inject(musica);this.set(this.musica);}},'#youtube click'(){var p=app.f7.popup.create({content:`<div class="popup"><div class="navbar"><div class="navbar-bg"></div><div class="navbar-inner"><div class="left"><a href="#"class="link popup-close"><i class="icon icon-back"></i></a></div><div class="title">Youtube</div><div class="right"></div></div></div><div class="block"><div class="yt-container"><iframe width="320"src="${this.lyrics._youtube}"frameborder="0"allowfullscreen class="video"></iframe></div></div></div>`,swipeToClose:true,});p.open();},'#trocaTom click'(){var action=app.f7.actions.create({buttons:[{text:'C',onClick:()=>{this.trocarTom('C');}},{text:'C#',onClick:()=>{this.trocarTom('C#');}},{text:'D',onClick:()=>{this.trocarTom('D');}},{text:'D#',onClick:()=>{this.trocarTom('D#');}},{text:'E',onClick:()=>{this.trocarTom('E');}},{text:'F',onClick:()=>{this.trocarTom('F');}},{text:'F#',onClick:()=>{this.trocarTom('F#');}},{text:'G',onClick:()=>{this.trocarTom('G');}},{text:'G#',onClick:()=>{this.trocarTom('G#');}},{text:'A',onClick:()=>{this.trocarTom('A');}},{text:'A#',onClick:()=>{this.trocarTom('A#');}},{text:'B',onClick:()=>{this.trocarTom('B');}}]});action.open();}});}};Pi.Export('Music.Page',Control);});yum.define([Pi.Url.create('Music','/model.js')],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="page popup"><div class="navbar"><div class="navbar-bg"></div><div class="navbar-inner"><div class="left"><a href="javascript:void(0)"id="backPage"class="link back"><i class="icon icon-back"></i></a></div><div class="title">Music List</div><div class="right"><a href="javascript:void(0)"id="add"class="link back"><i class="icon material-icons md-only"style="color: #6200ee;">add</i></a></div></div></div><div class="page-content"style="padding-bottom: 0px; height: auto; margin-top: 0px;"><div style="padding: 10px;"><div at="_tags"></div></div></div><div class="page-content"style="padding-top: 0px;"><div style="margin-top: 0px;"class="list media-list no-hairlines"><ul at="_list"></ul></div></div></div>`);this._tags=new Pi.ElementList({template:`<div class="chip"style="margin:4px;"><div class="chip-media bg-color-pink">@{tag}</div><div class="chip-label">@{nome}</div><a href="#"data-event-click="@{id}"class="chip-delete"></a></div>`});this._list=new Pi.ElementList({template:`<li><a href="javascript:void(0)"class="item-link item-content"data-event-click="@{id}"><div class="item-inner"><div class="item-title-row"><div class="item-title">@{nome}</div><div class="item-after"style="color: #6200ee;"></div></div><div class="item-subtitle">@{versao}</div></div></a></li>`});};viewDidLoad(){this.createPopup();super.viewDidLoad();};open(){this.popup.open();this.load();return this;};load(){var model=new Music.Model();app.loading(true);model.all().ok((musicas)=>{app.loading(false);this._list.load(musicas);});};createPopup(){this.popup=app.f7.popup.create({content:'#'+this.view.id,swipeToClose:true,});};destroy(){this.popup.close();};events(listen){super.events(listen);listen({'{_list} click'(_,music){if(this._tags.exist((m)=>m.id==music.id))return;music.tag=music.versao[0];this._tags.add(music);},'(app) save:music'(){this.load();},'{_tags} click'(_,music,el){this._tags.remove(el.parent());},'#add click'(){this.event.trigger('choose',this._tags.all());this._tags.clear();this.destroy();},'#backPage click'(){this.destroy();}});}};Pi.Export('Music.Popup',Control);});yum.define([],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="sheet-modal"style="height: auto"><div class="sheet-modal-inner"><div class="swipe-handler"></div><div class="page-content"><div class="block"><div class="block-title block-title-medium margin-top">Repertório</div><div class="list media-list no-hairlines"><ul at="_list"></ul></div></div></div></div></div>`);this._list=new Pi.ElementList({template:`<li><a href="javascript:void(0)"class="item-link item-content"data-event-click="@{id}"><div class="item-inner"><div class="item-title-row"><div class="item-title">@{nome}</div><div class="item-after"style="color: #6200ee;"><i class="icon material-icons md-only">add</i></div></div><div class="item-subtitle">@{versao}</div></div></a></li>`});};viewDidLoad(){this.createSheetModal();this.loadMusics();super.viewDidLoad();};createSheetModal(){this._sheet=app.f7.sheet.create({el:'#'+this.view.id,});};loadMusics(){this._list.load([{id:1,nome:'Quebrantado',versao:'Vineard'},{id:2,nome:'Quebrantado',versao:'Vineard'},{id:10,nome:'Quebrantado',versao:'Vineard'},{id:4,nome:'Quebrantado',versao:'Vineard'},{id:5,nome:'Ruge Cruz',versao:'Aline Barros'},{id:6,nome:'Ruge Cruz',versao:'Aline Barros'},{id:7,nome:'Ruge Cruz',versao:'Aline Barros'},{id:8,nome:'Ruge Cruz',versao:'Aline Barros'},{id:9,nome:'Ruge Cruz',versao:'Aline Barros'},{id:11,nome:'Ruge Cruz',versao:'Aline Barros'},{id:3,nome:'Emaus',versao:'Morada',letraCifrada:`titulo;Mais Perto;youtube;https:tom;C;intro;C F G;estrofe;C C/E F Dm;Mais perto quero estar;C Am G;Meu Deus de Ti;coro;C C4 C;sempre ei de suplicar;C Am G4 G/B;mais perto quero estar;C G/A#F Dm;mais perto quero estar;C G F C/E Dm C;meu Deus de Ti;A/C#mais perto quero estar;A/C#mais perto quero estar;ponte;C;por amor;F;sua vida entregou;G;meu Senhor;A;humilhado foi;E;como a flor machucada;C;no jardim`},]);};open(){this._sheet.open();return this;};close(){this._sheet.close();return this;};destroy(){this._sheet.destroy();super.destroy();};events(listen){super.events(listen);listen({'{_list} click':function(_,music){this.event.trigger('choose',music);}});}};Pi.Export('Music.Choose',Control);});yum.define([],function(html){class Control extends Pi.Component{instances(){this.view=new Pi.View(`<div class="list media-list"><ul at="_list"></ul></div>`);this._list=new Pi.ElementList({template:`<li><a href="javascript:void(0)"class="item-link item-content"data-name-op="open"data-event-click="@{id}"><div class="item-media"><i style="font-size: 24px;color: #6200ee;padding: 9px;"class="fas fa-music"></i></div><div class="item-inner"><div class="item-title-row"><div class="item-title">@{nome}</div><div class="item-after"data-name-op="delete"data-event-click="@{id}"><i class="icon material-icons md-only">delete</i></div></div><div class="item-subtitle">@{versao}</div></div></a></li>`});};add(music){if(this.exist(music))return;this._list.add(music);};load(musics){for(let i=0;i<musics.length;i++){this.add(musics[i]);}};exist(music){return this._list.exist((m)=>m.id==music.id);};get(){return this._list.all();};clear(){this._list.clear();return this;};events(listen){super.events(listen);listen({'{_list} click':function(_,music,el,event){var op=el.getAttribute('data-name-op');switch(op){case'open':this.event.trigger('select',music);break;case'delete':this._list.remove(el.parents(4));event.stopPropagation();event.preventDefault();this.event.trigger('delete',music);break;}}});}};Pi.Export('Music.List',Control);});};