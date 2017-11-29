if (Meteor.isClient) {
	//Ruteo de la pagina
	Router.route('/', function () {
  		this.layout('layout_home');	//use template layout_home to render multiple templates
		this.render('navbar_template', {to: 'navbar'});
		this.render('caudal_template', {to: 'contenido'});
	});
	Router.route('/modificar_parametros', function () {
			this.layout('layout_home');	//use template layout_home to render multiple templates
		this.render('navbar_template', {to: 'navbar'});
		this.render('modificar_parametros_template', {to: 'contenido'});
	});
	Router.route('/about', function () {
			this.layout('layout_home');	//use template layout_home to render multiple templates
		this.render('navbar_template', {to: 'navbar'});
		this.render('about_template', {to: 'contenido'});
	});
}

// Grafica de lineas
Template.caudal_template.onRendered(function(){
	this.autorun(function(){
	var ctx = document.getElementById("myChart").getContext('2d');
	//opciones del grafico
	var options = {

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines: true,

        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth: 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - Whether the line is curved between points
        bezierCurve: true,

        //Number - Tension of the bezier curve between points
        bezierCurveTension: 0.4,

        //Boolean - Whether to show a dot for each point
        pointDot: true,

        //Number - Radius of each point dot in pixels
        pointDotRadius: 4,

        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth: 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 20,

        //Boolean - Whether to show a stroke for datasets
        datasetStroke: true,

        //Number - Pixel width of dataset stroke
        datasetStrokeWidth: 2,

        //Boolean - Whether to fill the dataset with a colour
        datasetFill: true,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };
		var doc = Caudal.findOne();
		if (doc){
			//Datos del grafico
			var data = {
	        labels: ["January", "February", "March", "April", "May", "June", "July"],
	        datasets: [{
	            label: "My First dataset",
	            fillColor: "rgba(220,220,220,0.2)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
	            data: [Caudal.findOne({mes:'Enero'}).caudal, Caudal.findOne({mes:'Febrero'}).caudal, Caudal.findOne({mes:'Abril'}).caudal, random(), random(), random(), random()]
	        }]
	    };
			var $parent = $("#canvas_container");
			ctx.canvas.width = $parent.width();
			var myLineChart = new Chart(ctx).Line(data, options);
		}
	});
});

//Eventos
Template.modificar_parametros_template.events({
		//Agregar control de los datos
    'submit form': function(event){
				event.preventDefault();
				var steps = parseInt(event.target.steps.value);
				var interrogation_window = parseInt(event.target.interrogation_window.value);
				var XRoi = parseInt(event.target.XRoi.value);
				var YRoi = parseInt(event.target.YRoi.value);
        Parametros_procesamiento.update({ _id: Parametros_procesamiento.findOne()._id },{ $set: {steps:steps, interrogation_window:interrogation_window, XRoi:XRoi, YRoi:YRoi}});
    }
});
function random() {
    return Math.floor((Math.random() * 100) + 1);
}
