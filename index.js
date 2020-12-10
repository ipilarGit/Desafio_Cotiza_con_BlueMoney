const https = require('https');
const fs = require('fs');

let hoy = new Date();
let fecha = hoy.toDateString();
let hora = hoy.toTimeString();

let archivo = null;
let extension = null;
let indicadorEconomico = null;
let valorEnPesos = 0;
let archivoConExtension = null;

const getIndicadores = (indicadorEconomico, valorEnPesos) => {
    https.get("https://mindicador.cl/api", (res) => {
            res.on("data", (data) => {
                const indicadores = JSON.parse(data);
                //  console.log("Indicadores: ", indicadores);
                for (ind in indicadores) {
                    let valorIndicadorApi = 0;
                    let indicadorNombre = null;
                    valorIndicadorApi = indicadores[ind].valor;
                    indicadorNombre = indicadores[ind].nombre;
                    if ((indicadorEconomico === indicadores[ind].codigo) && (indicadores[ind].unidad_medida === "Pesos")) {
                        valorConvertido = valorEnPesos / valorIndicadorApi;
                        crearArchivo(valorConvertido, indicadorNombre);
                    };
                    if ((indicadorEconomico === indicadores[ind].codigo) && (indicadores[ind].unidad_medida === "Porcentaje")) {
                        valorConvertido = "Valor no puede ser convertido a pesos";
                        crearArchivo(valorConvertido, indicadorNombre);
                    };
                    if ((indicadorEconomico === indicadores[ind].codigo) && (indicadores[ind].unidad_medida === "Dólar")) {
                        valorDolar = indicadores["dolar"].valor;
                        valorConvertido = valorEnPesos / (valorIndicadorApi * valorDolar);
                        crearArchivo(valorConvertido, indicadorNombre);
                    }
                }
            });
        })
        .on("error", (err) => {
            console.log("Error:" + err.message);
        });
}

const crearArchivo = (valorConvertido, indicadorNombre) => {
    archivoConExtension = `${archivo}.${extension}`;
    const template = `
    A la fecha: ${fecha} ${hora}
    Fue realizada la cotización con los siguientes datos:
    Cantidad de pesos a convertir: ${valorEnPesos} pesos
    Convertido a "${indicadorEconomico}" da un total de: ${valorConvertido} ${indicadorNombre}
    `

    fs.readFile("bluemoney", 'utf8', (error, data) => {
        // error ? console.log("Upss, ha ocurrido un error en la lectura: ", error) : console.log('bluemoney');

        fs.writeFile(archivoConExtension, template, 'utf8', (err) => {
            err ? console.log("Upss, ha ocurrido un error: ", error) :
                console.log("Todo salió bien, archivo creado con éxito");
            leerArchivo(archivoConExtension);
        })
        fs.writeFile("bluemoney", data + template, 'utf8', (err) => {
            err ? console.log("Upss, ha ocurrido un error: ", error) :
                console.log("Todo salió bien, archivo sobreescrito con éxito");
        })
        setTimeout(() => {
            fs.unlink(archivoConExtension, () => {
                console.log('Archivo Eliminado');
            })
        }, 2000)
    });
}

const leerArchivo = (archivoConExtension) => {
    fs.readFile(archivoConExtension, 'utf8', (err, data) => {
        err ? console.log("Upss, ha ocurrido un error en la lectura: ", error) : console.log(data);
    })
}

const argumentos = process.argv.slice(2);
if (argumentos[0]) {
    archivo = argumentos[0];
    extension = argumentos[1];
    indicadorEconomico = argumentos[2];
    valorEnPesos = argumentos[3];
    if (Number(valorEnPesos)) {
        getIndicadores(indicadorEconomico, valorEnPesos);
    }
    console.log(archivo, extension, indicadorEconomico, valorEnPesos);
} else {
    console.log('Para ejecutar este programa debes escribir por consola:');
    console.log('$node app.js <nombre_del_archivo> <extension_del_archivo> <indicador_economico> <Pesos_a_convertir>');
}