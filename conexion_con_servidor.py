#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""@package main
Funcion principal del programa que procesa imagenes usando LSPIV
Este archivo se encarga de leer el video, procesarlo y mostrar
los resultados en una imagen.
"""

import matplotlib.pyplot as plt
import main.pruebaPIVF as PIV
import main.funciones_parseo_args as fun_pars_args
import main.rectificar_video as rect_vid
import time
import os
import sys
import pymongo as pm
from pkg_resources import resource_filename
from skimage.io import imread_collection
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import wait

def procesar2(xCoord, yCoord, xLen, yLen,img1,img2, image_index):
    return PIV.procesar(xCoord, yCoord, xLen, yLen, img1, img2, image_index)

def video2image(filename, fps=1, output="out%d.", color="gray", formato="jpg", inicio=0, duracion=0, path=resource_filename('main','static/imagenes_video/')):
    os.system("ffmpeg -loglevel 8 -ss {0} -t {1} -i {2} -vf \"fps={3}, format={4}\" {5}{6}{7}"
               .format(inicio, duracion, filename, fps, color, path, output, formato))
def calcular_caudal(matriz_x,matriz_y,matriz_u,matriz_v):
    caudal = 100
    return caudal
def conectar_con_base_datos():
    client = pm.MongoClient('mongodb://127.0.0.1:3001/meteor')
    db = client.meteor
    caudal = db.caudal
    return caudal
    
def escribir_caudal(caudal_calculado,mes,caudal_collection):
    documento = {'mes':mes,'caudal':caudal_calculado}
    caudal_collection.insert_one(documento)

def main(argv):

    """Funcion principal del programa
    Lee el archivo de video, lo descompone en imagenes jpg, segun la region
    de interes deseada.
    Obtiene por consola la cantidad de hilos a utilizar (-t).
    Va procesando las imagenes de a pares, usando un Executor para gestionar
    los hilos.
    Los resultados se guardan en diccionarios. Una vez finalizado se calcula
    el promedio de los resultados y se muestra en pantalla una imagen
    del video con los vectores encima.
    """

    start_time = time.time()

    parser = fun_pars_args.set_parser()
    args = parser.parse_args()

    if args.verbose:
        if(args.length == 0):
            print("Parametros: \n threads: {} \n region: {} x {} comenzando en [{},{}] \n tiempo: [{}s - fin del video], a {} fps"
                .format(args.threads, args.width, args.height, args.xstart, args.ystart, args.start, args.fps))
        else:
            print("Parametros: \n threads: {} \n region: {} x {} comenzando en [{},{}] \n tiempo: [{}s - {}s] a {} fps"
                .format(args.threads, args.width, args.height, args.xstart, args.ystart, args.start, args.length, args.fps))
    

    if (args.width*args.height>3600):
        if(args.threads > 2):
            prompt = input( "El tamaño a procesar es muy grande ({} x {}) para ser tratado con {} threads\n"
                            "Es posible que no se cuente con la cantidad de memoria necesaria.\n"
                            "Desea continuar de todos modos (y) o utilizar 1 thread (n)?  "
                            .format(args.width, args.height, args.threads))
            while(True):
                if (prompt == 'n'):
                    args.threads = 1
                    print("Usando 1 thread")
                    break
                elif (prompt == 'y'):
                    print("Usando {} threads".format(args.threads))
                    break
                else:
                    print("Opcion invalida, ingrese nuevamente")
                    prompt = input()


    video_path = resource_filename('main','static/vid/' + args.video)

    video2image(filename = video_path, fps = args.fps, inicio = args.start, duracion = args.length)

    directorio_imagenes = resource_filename('main','static/imagenes_video/*.jpg')

    
    imagenes = imread_collection(directorio_imagenes)

    fun_pars_args.checkInputImages(imagenes[0][:,:,0], args.xstart, args.ystart, args.width, args.height, args.threads)


    executor = ThreadPoolExecutor(max_workers=args.threads)
    future_list = []
    cuenta = 0

    for i in range(0,len(imagenes)-1,2):

        if(cuenta == args.threads):
           # print("Esperando en vuelta " + str(i))
            cuenta = 0
            wait(future_list)
        else:
            cuenta = cuenta + 1
            img1 = imagenes[i][:,:,0]
            img2 = imagenes[i+1][:,:,0]
            future = executor.submit(procesar2,args.xstart,args.ystart,args.width,args.height,img1,img2,i)
            future_list.append(future)
            
    #Espero que finalizen todas las tareas
    executor.shutdown(wait=True)
    
    #Calculo el promedio de todos los vectores
    dict_promedio = {'u':0, 'v':0}
    for i in range(len(future_list)):
        dict_aux = future_list[i]
        dict_promedio['u'] = dict_promedio['u'] + dict_aux.result()['u']
        dict_promedio['v'] = dict_promedio['v'] + dict_aux.result()['v']
    
    dict_promedio['u'] = dict_promedio['u'] / len(future_list)
    dict_promedio['v'] = -dict_promedio['v'] / len(future_list) #Doy vuelta los vectores en el eje y
    dict_promedio['x'] = dict_aux.result()['x']
    dict_promedio['y'] = dict_aux.result()['y']
    
    finish_time = time.time()
    print("El programa tarda: %.2f segundos" %(finish_time - start_time))
    
    # with open('resultados', 'a') as f:
    #     f.write("El programa tarda: %.2f segundos\n" %(finish_time - start_time))
    
    imgplot = plt.imshow(imagenes[0])
    plt.quiver(dict_promedio['x'], dict_promedio['y'], dict_promedio['u'], dict_promedio['v'], color='g')
    plt.show()

    
    #delete_images(resource_filename('main','static/vid/rectificados/*.'), formato)
    rect_vid.delete_images("static/imagenes_video/")
    
    #Calcular caudal
    caudal_calculado = calcular_caudal(dict_promedio['x'], dict_promedio['y'], dict_promedio['u'], dict_promedio['v'])
    mes = 'Enero'
    
    #Conexion con la base de datos
    caudal_collection = conectar_con_base_datos()
    escribir_caudal(caudal_calculado,mes,caudal_collection)
    
    caudal_enero = caudal_collection.find_one()
    print(caudal_enero['caudal'])

if __name__ == "__main__":
   main(sys.argv[1:])