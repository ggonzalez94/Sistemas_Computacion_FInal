import { Meteor } from 'meteor/meteor';

//Funcion para descargar archivo
Router.map(function() {
  this.route('txtFile', {
    where: 'server',
    path: '/text',
    action: function() {
      var steps = Parametros_procesamiento.findOne().steps;
      var interrogation_window = Parametros_procesamiento.findOne().interrogation_window;
      var XRoi = Parametros_procesamiento.findOne().XRoi;
      var YRoi = Parametros_procesamiento.findOne().YRoi;
      var text = "Steps: " + steps + "\n" + "Interrogation Window: " + interrogation_window +"\n";
      text = text + "XRoi: " + XRoi + "\n" + "YRoi: " + YRoi;
      var filename = 'textfile' + '.txt';

      var headers = {
        'Content-Type': 'text/plain',
        'Content-Disposition': "attachment; filename=" + filename
      };

      this.response.writeHead(200, headers);
      return this.response.end(text);
    }
  })
});

Meteor.startup(() => {
  if (!Caudal.findOne()){
    	console.log("No hay nada en la base de datos,iniciando con datos de prueba");
      Caudal.insert({
        mes : "Enero",
        caudal : 10
      });
      Caudal.insert({
        mes : "Febrero",
        caudal : 20
      });
      Caudal.insert({
        mes : "Abril",
        caudal : 50
      });
  }
  if (!Parametros_procesamiento.findOne()){
    Parametros_procesamiento.insert({
        name : "Procesamiento1",
        steps : 2,
        interrogation_window : 128,
        XRoi : 500,
        YRoi : 500
    });
  }
});
