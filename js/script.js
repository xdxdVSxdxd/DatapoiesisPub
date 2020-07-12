var publication = null;

var currentsections = null;
var currentparentsections = null;
var currentindex = -1;

var converter = new showdown.Converter();

var language = "italian";


var stopwordsfiles = {
	'italian': "assets/italian_stopwords.json",
	'engllish': "assets/english_stopwords.json",
	'others': "assets/others_stopwords.getJSON",
};

var maxnode = 1;
var bow;
var graph;
var fontSizeScale;

var nodesscale;
var textsscale;
var linksscale;





$(document).ready(function () {


	loadPublication();

	$("#gototoc").click(function(){
		showTocFromContent();
	});



});



function loadPublication(){

	$.getJSON("data/publication.json",function(data){
		publication = data;

		addPrevNext();

		buildPublication();
		afterBuild();
	})
	.done(function() {
		//console.log( "second success" );
	})
	.fail(function(  jqxhr, textStatus, error ) {
		publication = null;
		//console.log(textStatus);
		showErrorInLoadingPublication();
	})
	.always(function() {
		//console.log( "complete" );
	});;

}



function showErrorInLoadingPublication(){
	$("body").html("<h1>Sorry, the publication was not found.</h1>");
}


var linear = null;

function linearize(section){
	linear.push( section );
	if(typeof section.sections != 'undefined'){
		for(var j = 0; j<section.sections.length; j++){
			linearize( section.sections[j] );
		}
	}
}

function addPrevNext(){

	linear = new Array();
	for(var i = 0; i<publication.sections.length; i++){
		linear.push( publication.sections[i] );
		if(typeof publication.sections[i].sections != 'undefined'){
			for(var j = 0; j<publication.sections[i].sections.length; j++){
				linearize( publication.sections[i].sections[j] );
			}
		}
	}

	//console.log(linear);

	/*
	for(var i = 0; i<publication.sections.length; i++){
		var next = null;
		if(typeof publication.sections[i].sections !='undefined' && publication.sections[i].sections!=null && publication.sections[i].sections.length!=0){
			next = publication.sections[i].sections[0];
		}else if(i<(publication.sections.length-1)){
			next = publication.sections[i+1];	
		}
		addPN(publication.sections[i],null,next);
	}
	*/

	var k = 0;
	for(var i = 0; i<publication.sections.length; i++){
		
		if(k<=0){
			publication.sections[i].prev = null;
		} else {
			publication.sections[i].prev = linear[k-1];
		}
		if (k>(linear.length-1)) {
			publication.sections[i].next = null;
		} else {
			publication.sections[i].next = linear[k+1];
		}
		k++;
		if(typeof publication.sections[i].sections != 'undefined'){
			for(var j = 0; j<publication.sections[i].sections.length; j++){
				k = addPN( publication.sections[i].sections[j] , k );
			}
		}
	}

}


function addPN(section,k){

	//console.log("k=" + k);
	
	/*
	section.next = nn;
	section.prev = pp;

	/*
	console.log(section);
	console.log("prev:");
	console.log(pp);
	console.log("next:");
	console.log(nn);
	console.log("------------------------");
	*/

	/*
	if(
		typeof section.sections !='undefined'
	){
		if( 
			section.sections!=null && 
			section.sections.length!=0
		){
			for(var i = 0; i<section.sections.length; i++){
				var next = null;

				// se section.sections[i] ha la sections --> mettici il primo
				if(typeof section.sections[i].sections != 'undefined' && section.sections[i].sections.length>0 ){
					next = section.sections[i].sections[0];
				}
				// altrimenti, se i+1<section.sections.length --> mettici section.sections[i+1]
				else if( (i+1)<section.sections.length ){
					next = section.sections[i+1];
				}

		
				addPN(section.sections[i],section,next);
			}
		}
	}
	*/

		if(k<=0){
			section.prev = null;
		} else {
			section.prev = linear[k-1];
		}
		if (k>(linear.length-1)) {
			section.next = null;
		} else {
			section.next = linear[k+1];
		}
		k++;
		if(typeof section.sections != 'undefined'){
			for(var j = 0; j<section.sections.length; j++){
				k = addPN( section.sections[j] , k );
			}
		}

		return k;

}


function afterBuild(){
	//
	$("#cover").click(function(){
		showTocFromCover();
	});

	$(".fromdatapoiesis").click(function(){
		showContentFromDatapoiesis();
	});

	$(".todatapoiesis").click(function(){
		showDatapoiesisFromContent();
	});

	$("#next").click(function(){
		var ns = $(this).data("section");

		$("#content").fadeOut(1000,function(){
			loadSectionInContent(ns);
			$("#content").fadeIn(1000,function(){
					
			});				
		});

		
	});

	$("#prev").click(function(){
		var ns = $(this).data("section");

		$("#content").fadeOut(1000,function(){
			loadSectionInContent(ns);
			$("#content").fadeIn(1000,function(){
					
			});				
		});


	});

	$("#zoomin").click(function(){
		if(svg!=null && zoom_handler!=null){
			zoom_handler.scaleBy(svg,1.5);
		}
	});

	$("#zoomout").click(function(){
		if(svg!=null && zoom_handler!= null){
			zoom_handler.scaleBy(svg,0.8);
		}
	});

}



function showTocFromCover(){

	$("#cover").fadeOut(1000,function(){
		$("#cover").css("display","none");
		//$("#toc").css("display","block");
		$("#toc").fadeIn(1000,function(){
		});
	});

}

function showContentFromToc(){
	$("#toc").fadeOut(1000,function(){
		$("#toc").css("display","none");
		//$("#content").css("display","block");
		$("#content").fadeIn(1000,function(){
			
		});
	});	
}

function showTocFromContent(){
	$("#content").fadeOut(1000,function(){
		$("#content").css("display","none");
		//$("#toc").css("display","block");
		$("#toc").fadeIn(1000,function(){
		});
	});		
}

function showDatapoiesisFromContent(){
	$("#bow").html("");
	$("#graph").html("");
	$("#content").fadeOut(1000,function(){
		$("#content").css("display","none");
		//$("#datapoiesis").css("display","block");
		$("#datapoiesis").fadeIn(1000,function(){
			compute();
		});
	});	
}

function showContentFromDatapoiesis(){
	simulation.stop();
	simulation = null;
	$("#bow").html("");
	$("#graph").html("");
	$("#datapoiesis").fadeOut(1000,function(){
		$("#datapoiesis").css("display","none");
		//$("#content").css("display","block");
		$("#content").fadeIn(1000,function(){
				
		});
	});	
}



function buildPublication(){


	var coverhook = d3.select("#cover_padded");

	// make cover
	var coverpage = coverhook.append("div")
			.attr("class","page coverpage")
			.style("width","100%")
			.style("height","100%");

	if(publication.configuration.coverimage!="none"){
		coverpage.style("background-image", "url(" + publication.configuration.coverimage + ")")
	}

	var tcontainer = coverpage.append("div")
		.attr("class","titlecontainer");


	tcontainer.append("div")
		.attr("class","titleblock")
		.text( publication.configuration.title );

	$("#publicationtitle").text( publication.configuration.title );

	$("#publicationtitle").click(function(){
		$("#content").fadeOut(1000,function(){
			$("#content").css("display","none");
			//$("#toc").css("display","block");
			$("#cover").fadeIn(1000,function(){
			});
		});
	});	

	tcontainer.append("div")
		.attr("class","subtitleblock")
		.text( publication.configuration.subtitle );



	// make index
	var tochook = d3.select("#toc_padded");
	makeIndex(tochook);

	currentsections = publication.sections;
	currentparentsections = null;
	currentindex = -1;

}


function makeIndex(contenthook){
	var indexpage = contenthook.append("div")
			.attr("class","page indexpage")
			.style("width","100%");
			//.style("height",publication.configuration.pageheight);

	var indexcontainer = indexpage.append("div")
			.attr("class","indexcontainer");

	indexcontainer.append("div")
			.attr("id","publicationtitletoc");

	$("#publicationtitletoc").text( publication.configuration.title );

	$("#publicationtitletoc").click(function(){
		$("#toc").fadeOut(1000,function(){
			$("#toc").css("display","none");
			//$("#toc").css("display","block");
			$("#cover").fadeIn(1000,function(){
			});
		});
	});	

	contenthook.append("div")
			.attr("id","indeximagebox");
	processindexlevel(publication.sections,indexcontainer);
}

function processindexlevel(sections,container){

	
	var list = container.append("ul").attr("class","indexlevel1");
	for(var i = 0; i<sections.length; i++){
		var item = list.append("li").append("span").attr("class","tocmenuitem");
		item.text(sections[i].title);
		$(item.node()).data("section", sections[i]);
		item.on("mousedown",function(d){
			d3.event.stopPropagation();
						
			var ns = $(this).data("section");

			loadSectionInContent(ns);

		});
		if(sections[i].sections && sections[i].sections.length>0 ){
			var subcontainer = list.append("li").append("div").attr("class","indexsublevelcontainer");
			processindexlevel( sections[i].sections , subcontainer );
		}

	}
}



function loadSectionInContent(ns){
			//console.log(ns.datafile);
			$("#sectiontitle").text(  ns.title );
			$("#nextsections").html("");
			if( typeof ns.sections !== 'undefined' ){
				$("#gotosubsections").css("display","block");
				$("#nextsections").css("display","block");
				processindexlevel( ns.sections ,  d3.select("#nextsections") );
			} else {
				$("#gotosubsections").css("display","none");
				$("#nextsections").css("display","none");
			}

			if(typeof ns.next != 'undefined' && ns.next!=null){
				$("#next").data("section",ns.next);
				$("#next").css("display","block");
			} else {
				$("#next").css("display","none");
			}

			if(typeof ns.prev != 'undefined' && ns.prev!=null){
				$("#prev").data("section",ns.prev);
				$("#prev").css("display","block");
			} else {
				$("#prev").css("display","none");
			}


			if( typeof ns.datafile !== 'undefined' ){
				$("#sectioncontent").text("");
				loadcontentindiv("#sectioncontent",ns.datafile);
			} else {
				$("#sectioncontent").text("");
				loadcontentindiv("#sectioncontent",ns.datafile);
			}
}


function makeSection(section ,toAppend){

	//console.log(section.datafile);
	
	var sectionPage = toAppend.append("div")
		.attr("class","page sectionpage");
	
	sectionPage.append("div")
		.attr("class","sectiontitle")
		.text(section.title);

	if(section.datafile){
		var contentpage = toAppend.append("div")
			.attr("class","page contentpage");
		loadcontentinpage(contentpage,section);
	}

	if(section.sections){
		for(var i = 0; i<section.sections.length; i++){
			makeSection(section.sections[i],toAppend);
		}
	}
}

var ligthboxinstance = null;
function addlabeltoimages(){
	$("#sectioncontent img").after(function(){
		return "<span class='imagelabel'>Nell'immagine: " + $(this).attr("title") + "</span>";
	});

	$("#sectioncontent a").attr("target","_blank");

	var www = $("body").width() - parseInt($("#contents_padded").css("padding-left").replace("px",""))  - parseInt($("#contents_padded").css("padding-right").replace("px","")) ;
	var hhh = Math.floor(9*www/16);
	$("#sectioncontent iframe").attr("width", "");
	$("#sectioncontent iframe").attr("height", "");
	$("#sectioncontent iframe").css("width", www + "px");
	$("#sectioncontent iframe").css("height", hhh + "px");

	$("#sectioncontent img").wrap(function(d){
		var src = $(this).attr("src");
		return "<a class='lighboxed' href='" + src + "'></a>";
	});
	if(ligthboxinstance!=null){
		ligthboxinstance.destroy();
	}
	ligthboxinstance = null;
	ligthboxinstance = Chocolat(document.querySelectorAll('.lighboxed'), {
	    fullScreen : false
	});

}


function loadcontentindiv(divid,urlo){
	//console.log(urlo);
	if( typeof urlo != 'undefined'){
		$.ajax({
			url: urlo
		})
		.done(function(data){

			var formatted = formattext(data);

			$("#textcontent").val( formatted );

			$(divid).html(formatted);

			showContentFromToc();

			addlabeltoimages();

			window.scrollTo(0, 0);

		});	
	} else {
			showContentFromToc();

			addlabeltoimages();

			window.scrollTo(0, 0);
	}
	
}


function loadcontentinpage(contentpage,section){
	$.ajax({
		url: section.datafile
	})
	.done(function(data){
		contentpage.text(data);
	});
}



function formattext(data){


	//var withparagraphs = replaceBreaksWithParagraphs(data);
	var withparagraphs = converter.makeHtml(data);

	return withparagraphs;
}



function replaceBreaksWithParagraphs(input) {
    input = filterEmpty(input.split('\n')).join('</p><p>');
    return '<p>' + input + '</p>';
}


function filterEmpty(arr) {
    var new_arr = [];
    
    for (var i = arr.length-1; i >= 0; i--)
    {
        if (arr[i] != "")
            new_arr.push(arr.pop());
        else
            arr.pop();
    }
    
    return new_arr.reverse();
};






// Datapoiesis



function compute(){
	$.getJSON( stopwordsfiles[language],function(stopwords){
		//console.log(stopwords);
		var corpus = $("#textcontent").val();

		corpus = corpus.replace(/<\/?[^>]+(>|$)/g, " ");

		maxnode = 1;

		// elimina punteggiatura e sostituisci new line a ongni punto
		// elimina stop words
		var prog = corpus.replace(/\./g,'\n');
		var prog = prog.replace(/\n\n/g,'\n');
		var progs = prog.split("\n");
		for(var i = 0; i<progs.length; i++){
			//progs[i] = progs[i].replace(/[^0-9a-zòàéèìù]/gi, ' ');
			progs[i] = progs[i].replace(/[^a-zòàéèìù]/gi, ' ');
			progs[i] = progs[i].trim();


			for(var k = 0; k<stopwords.length; k++){
				//console.log(stopwords[k]);
				progs[i] = progs[i].toUpperCase();
				progs[i] = progs[i].replace("À","A");
				progs[i] = progs[i].replace("Á","A");
				progs[i] = progs[i].replace("È","E");
				progs[i] = progs[i].replace("É","E");
				progs[i] = progs[i].replace("Ê","E");
				progs[i] = progs[i].replace("Ì","I");
				progs[i] = progs[i].replace("Í","I");
				progs[i] = progs[i].replace("Ò","O");
				progs[i] = progs[i].replace("Ó","O");
				progs[i] = progs[i].replace("Ù","U");
				progs[i] = progs[i].replace("Ú","U");
				progs[i] = progs[i].replace("Ü","U");
				progs[i] = progs[i].replace(new RegExp( "\\b" + stopwords[k] + "\\b" , 'gi')," ");
				progs[i] = progs[i].replace("è"," ");
				progs[i] = progs[i].replace("È"," ");
			}

			progs[i] = progs[i].replace(/\s\s+/g, ' ');
			

			// console.log(progs[i]);	
		}



		
		// calcola bag of words
		// calcola graph partendo da ogni linea
		bow = new Array();
		graph = {
			nodes: [],
			links: []
		};
		for(var i = 0; i<progs.length; i++){
			var parts = progs[i].split(" ");
			for(var k = 0; k<parts.length;k++){
				var found = false;
				for(var j = 0; j<bow.length && !found;j++){
					if( parts[k]==bow[j].word ){
						found = true;
						bow[j].c = bow[j].c + 1;
						graph.nodes[j].c = graph.nodes[j].c + 1;
						if(maxnode < graph.nodes[j].c ){
							maxnode = graph.nodes[j].c;
						}
					}
				}
				if(!found && !parts[k]==""){
					bow.push(
						{
							word : parts[k],
							c : 1
						}
					);

					graph.nodes.push(
						{
							id : parts[k],
							word : parts[k],
							c : 1
						}
					);
				}

				var id1 = parts[k];
				var id1idx = findNodeInGraph(id1);
				
				for(var j = 0; j<parts.length;j++){
					if(k!=j && id1!="" && parts[j]!="" ){
						var id2 = parts[j];
						var id2idx = findNodeInGraph(id2);
						var found2 = false;
						for(var z=0; z<graph.links.length && !found2 ;  z++){
							if( 
								(graph.links[z].source==id1idx && graph.links[z].target==id2idx ) ||
								(graph.links[z].source==id2idx && graph.links[z].target==id1idx )
							){
								graph.links[z].c = graph.links[z].c + 1;
								found2 = true;
							}
						}
						if(!found2 && id1idx!=-1 && id2idx!=-1 ){
							graph.links.push(
								{
									source: id1idx,
									target: id2idx,
									c: 1
								}
							);
						}

					}
				}
			}
		}

		//console.log( graph );


		nodesscale = d3.scaleLinear().domain([0,maxnode]).range([8,50]);
		textsscale = d3.scaleLinear().domain([0,maxnode]).range([8,40]);
		linksscale = d3.scaleLinear().domain([0,maxnode]).range([0.2,3]);

		drw();

	});
}


function findNodeInGraph(id){
	var res = -1;

	if(graph && graph.nodes){
		var found = false;
		for(var i = 0; i<graph.nodes.length&&!found;i++){
			if(graph.nodes[i].word==id){
				res = i;
				found = true;
			}
		}
	}

	return res;
}

function drw(){

	//drawBOW();
	drawGRAPH();

}

function drawBOW(){
	$("#bow").html("");
	var od = d3.select("#bow");


	// console.log("maxnode:" + maxnode );

	fontSizeScale = d3.scaleLinear()
	  .domain([0, maxnode])
	  .range([5,40]);

	
	  
	od.selectAll(".words")
		.data(bow)
		.enter()
		.append("div")
		.attr("class","words")
		.style("font-size",function(d){
			// console.log("a:" + d.c );
			// console.log("b:" + fontSizeScale(d.c) );
			// console.log("-------------------------");
			return fontSizeScale( d.c ) + "px";
		})
		.text(function(d){
			return d.word;
		});
}



var svg = null;
var simulation = null;
var g = null;
var link = null;
var node = null;
var labels = null;
var wwidth;
var hheight;
var zoom_handler= null;
function drawGRAPH(){
	wwidth = $("#graph").width();
	hheight = $("#graph").height();

	zoom_handler = null;

	svg = null;
	$("#graph").html("");
	simulation = null;
	g = null;

	if(svg == null){
		svg = d3.select("#graph").append("svg")
		.style("width", $("#graph").width() + 'px')
  		.style("height", $("#graph").height() + 'px');
	}
	if(simulation == null){
		simulation = d3.forceSimulation(graph.nodes)
		    .force("charge", d3.forceManyBody().strength(-500))
		    .force("link", d3.forceLink(graph.links).distance(60))
		    .force("collide",d3.forceCollide( function(d){return d.r + 8 }).iterations(16) )
		    .force("x", d3.forceX())
		    .force("y", d3.forceY())
		    .alphaTarget(1)
		    .on("tick", ticked);
	}

	if(g==null){
		var gg = svg.append("g").attr("transform", "translate(" + wwidth / 2 + "," + hheight / 2 + ")");
		g = gg.append("g");
	    link = g.append("g").selectAll(".link");
	    node = g.append("g").selectAll(".node");
	    labels = g.append("g").selectAll(".label");	
	}


		var dragstarted = function(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        var dragged = function(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        
        var dragended = function(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 


		node = node.data(graph.nodes, function(d) { return d.id;});

		node.exit().transition()
		  .attr("r", 0)
		  .remove();

		node = node.enter().append("circle")
		  .attr("class","node")
		  .attr("r", function(d) {
		  	//console.log(d); 
		  	var ww = +(d.c); 
		  	//console.log("ww:" + ww + "-->" + nodesscale( ww ) );
		  	return nodesscale( ww); 
		  })
		  //.call(function(nn) { console.log(nn); nn.transition().attr("r", nn.weight); })
		  .call(d3.drag()
	                .on("start", dragstarted)
	                .on("drag", dragged)
	                .on("end", dragended))
		.merge(node);


		labels = labels.data(graph.nodes, function(d) { return d.id;});

		labels.exit().transition()
		  .attr("opacity", 0)
		  .remove();

		labels = labels.enter().append("text")
		  .attr("x", function(d) { return d.x; })
		  .attr("y", function(d) { return d.y; })
		  .attr("class","label")
		  .text(function(d){
		  	return d.id;
		  })
		  .attr("font-size",function(d){
		  	var ww = +(d.c);
		  	return textsscale( ww ) + "px";
		  })
		  //.call(function(node) { node.transition().attr("font-size", "10px"); })
		.merge(node);


		link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });

		// Keep the exiting links connected to the moving remaining nodes.
		link.exit().transition()
		  .attr("stroke-opacity", 0)
		  .attrTween("x1", function(d) { return function() { return d.source.x; }; })
		  .attrTween("x2", function(d) { return function() { return d.target.x; }; })
		  .attrTween("y1", function(d) { return function() { return d.source.y; }; })
		  .attrTween("y2", function(d) { return function() { return d.target.y; }; })
		  .remove();

		link = link.enter().append("line")
		  .call(function(link) { 
		  	link.attr("class","link");
		  	link.transition().attr("stroke-width", function(d){ 
		  		var ww = +(d.c) ;
		  		return linksscale(ww); 
		  	} ); 
		  })
		.merge(link);

		//add zoom capabilities 
		zoom_handler = d3.zoom()
			// .filter(function () {
			//    return d3.event.altKey;
			//})
		    .on("zoom", zoom_actions);

		zoom_handler(svg);

		// Update and restart the simulation.
		simulation.nodes(graph.nodes);
		simulation.force("link").links(graph.links);
		simulation.alpha(1).restart();

}



function zoom_actions(){
    g.attr("transform", d3.event.transform)
}

function ticked() {
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  labels.attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
}
