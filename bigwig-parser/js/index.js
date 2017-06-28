var chrom, low = 0, high = 50000, end, file, remote;
var bb, bb2;
var s, debugDiv;

document.addEventListener('DOMContentLoaded', function(){
	console.log("app loaded");

	_('low').value = low;
	_('high').value = high;

	_('chromids').onchange = function(){
		console.log("chrom: "+this.value);
		chrom = this.value;
		var id = bb2.chroms.indexOf(chrom);
	}

}, false);

function fetch(){
	remote = false;
	var values = [];
	file = document.getElementById('file').files[0];
	if(!file){ file = _('url').value; remote = true;}
	if(!file) return;

	fetchMine(file, "mytrack", remote);
}

function fetchMine(){
	debugDiv='debug1';
	s = performance.now();
	new BigWig2(file, "mytrack", remote, function(bbi,err){
		if(!bbi) console.log(err);
		else{
			var e = performance.now();
			log("fetch took "+Math.floor(e-s)+" milliSeconds");
			bb2 = bbi;
			updateView();
			fetchDalliance(file, "mytrack", remote);
		}
	});
}

function fetchDalliance(file, name, remote){
	debugDiv = 'debug2';
	s = performance.now();
	makeBwg(file, name, remote, function(b,e){
		if(b == null) log(e);
		else{
			var e = performance.now();
			log("fetch took "+Math.floor(e-s)+" milliSeconds");
			bb = b;
			//updateView();
			if(!chrom) chrom = b.idsToChroms[0];
		}
	});
}

function query1(){
	/*
	_('fetchURL').disabled = true;
	_('mine').disabled = true;
	_('dalliance').disabled = true;
	*/
	debugDiv='debug1';
	if(_('low').value) low = _('low').value;
	if(_('high').value) high = _('high').value;
	log("querying : "+chrom+" : "+low+" - "+high);
	s = performance.now();
	bb2.getValues(chrom, low, high, function(data, e){
		if(data == null) console.log(e);
		else{
			values = data;
			console.log(values);
			log("query took "+Math.floor(performance.now()-s)+" milliSeconds fetched "+values.length+" items");

			if(bb2.type=='bigwig') drawBarChart("browser1", values);
			values = [];
			_('fetchURL').disabled = false;
			_('mine').disabled = false;
			_('dalliance').disabled = false;

		}
	});
}

function query2(){
	/*
	_('fetchURL').disabled = true;
	_('mine').disabled = true;
	_('dalliance').disabled = true;
	*/
	debugDiv = 'debug2';
	if(_('low').value) low = _('low').value;
	if(_('high').value) high = _('high').value;
	log("querying : "+chrom+" : "+low+" - "+high);

	s = performance.now();
	bb.readWigData(chrom, low, high, function(d2){
		values = d2;
		console.log(values);
		log("query took "+Math.floor(performance.now()-s)+" milliSeconds , fetched "+values.length+" items");
		if(bb.type=='bigwig')  drawBarChart("browser2", values);

		values = [];
		_('fetchURL').disabled = false;
		_('mine').disabled = false;
		_('dalliance').disabled = false;
	})
}

function updateView(){
	var chroms = bb2.chroms;
	var html = "<option>select chrom</option>";
	for(var i=0;i<chroms.length;i++) html += "<option value="+chroms[i]+">"+chroms[i]+"</option>";
	//console.log(html);
	_('chromids').innerHTML = (html);
	if(!chrom) chrom = bb2.chroms[0];
	_('chromids').value = chrom;
}

function drawBarChart(id, data){
	var values = [];
	var labels = [];

	if(id=='browser1'){
		for(var i=0; i<data.length; i++){
			values.push(data[i][2]);
			labels.push(data[i][0]+" - "+data[i][1]);
		}
	}else if(id=='browser2'){
		for(var i=0; i<data.length; i++){
			values.push(data[i].score);
			labels.push(data[i].min+" - "+data[i].max);
		}
	}

	var options = {

		chart: {
			type: 'column'
		},
		title: {
			text: 'BigWig output'
		},
		xAxis: {
			  title: {
				  text:'bases'
			  },
			  categories: labels
		},
		yAxis: {
			min: 0,
			title: {
				text: 'scores'
			}
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		},
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0
			}
		},
		series: [{
			name: 'score',
			data: values
		}]
	};

	Highcharts.chart(id, options);
}

function draw(values, id){
	var max = -1;
	var min = 20000;
	if(id == 'browser2'){
		var tmp = [];
		for(var i=0;i<values.length;i++) tmp.push([values[i].min, values[i].max, values[i].score]);
		values = tmp;
	}

	for(var i = 0;i < values.length; i++){
		 if(max < values[i][2]) max = values[i][2];
		 if(min > values[i][2]) min = values[i][2];
	}

	if(values.length==0) return;
	var c = document.getElementById(id);
	var w = c.width;
	var h = c.height;
	var ctx = c.getContext('2d');
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,w,h);

	ctx.fillStyle = 'white';
	var start = values[0][0];
	for(var i=0;i<values.length;i++){
		var offset = values[i][0]-start;
		var wi = values[i][1] - values[i][0];
		var hi = values[i][2];
		ctx.fillRect(offset,h,wi,-(hi/max)*h);
		start+=wi;
	}
}

function _(id){
	return document.getElementById(id);
}

function textdraw(values){
	var t = "";
	console.log("values read: "+values.length);
	for(var i=0;i<values.length;i++){
		t+="[ "+values[i][0]+","+values[i][1]+","+values[i][2]+"]";
	}
	_("result").innerHTML = (t);
}
//utilities
function log(m){
	console.log(m);
	if(typeof(m)=='object') m = JSON.stringify(m, null, 2);
	document.getElementById(debugDiv).innerHTML += "<div class='logs'>"+m+'</div>';
}
