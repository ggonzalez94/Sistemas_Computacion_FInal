import { Meteor } from 'meteor/meteor';
//import { HTTP } from 'meteor/http';
import { Picker } from 'meteor/meteorhacks:picker';
//Funcion para descargar archivo
// Picker.route('/recibir', function(params, req, res){
//   console.log("hola");
//   if (req.method=='POST'){
//     console.log("chau");
//     var body='';
//     req.on('data',function(data){
//       body += data;
//       //console.log(data);
//     });
//     req.on('end', function(){
//       req.body = JSON.parse(body);
//
//     var algoAsync = function (data){
//
//             Caudal.insert({
//              mes : data.key1,
//              dia : 22,
//              caudal : data.key2
//            });
//
//       }
//       var llamar = Meteor.wrapAsync(algoAsync);
//       var result = llamar(req.body);
//       console.log(result);
//
//  });
//  res.end("thanks");
//   }
// });
/*
Meteor.methods({
  insertar: function(data){
    console.log(data);

    Caudal.insert({
     mes : data.key1,
     dia : 22,
     caudal : data.key2
   });


   }


});
/*
function insertIntoDb(data) {

  Meteor.bindEnvironment(function (error,result){
  Caudal.insert({
   mes : data.key1,
   dia : 22,
   caudal : data.key2

 });

});

}
*/
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
  /*
  this.route('recibir',{
    where:'server',
    path:'recibir',
    action:function(){

    }

  });*/
});

// Picker.route('/recibir', function(params, req, res){
//   console.log("hola");
//   if (req.method=='POST'){
//     console.log("chau");
//     var body='';
//     req.on('data',function(data){
//       body += data;
//       //console.log(data);
//     });
//     req.on('end', function(){
//       req.body = JSON.parse(body);

Router.route('/recibir', function (params,req,res) {

  //console.log(body);
  var request = this.request;
  //console.log(request);
  var dato_a_insertar = request.body;
  //console.log('aa'+dato_a_insertar);
  // console.log(request);
  console.log(dato_a_insertar.mes);
  // NodeJS  response object
  var response = this.response;
  // console.log(response);
  if(Caudal.insert({mes:parseInt(dato_a_insertar.mes),caudal:parseInt(dato_a_insertar.caudal)})){
      this.response.end('Dato insertado\n');
  }
  else{
    this.response.end('No se pudo insertar\n');
  }

}, {where: 'server'});

Meteor.startup(() => {
  if (!Caudal.findOne()){
    	console.log("No hay nada en la base de datos,iniciando con datos de prueba");
      Caudal.insert({
        mes : 0,
        caudal : 10
      });
      Caudal.insert({
        mes : 1,
        caudal : 20
      });
      Caudal.insert({
        mes : 2,
        caudal : 50
      });
      Caudal.insert({
        mes : 3,
        caudal : 50
      });
      Caudal.insert({
        mes : 4,
        caudal : 60
      });
      Caudal.insert({
        mes : 5,
        caudal : 30
      });
      Caudal.insert({
        mes : 6,
        caudal : 25
      });
      Caudal.insert({
        mes : 7,
        caudal : 60
      });
      Caudal.insert({
        mes : 8,
        caudal : 65
      });
      Caudal.insert({
        mes : 9,
        caudal : 50
      });
      Caudal.insert({
        mes : 10,
        caudal : 70
      });
      Caudal.insert({
        mes : 11,
        caudal : 75
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
