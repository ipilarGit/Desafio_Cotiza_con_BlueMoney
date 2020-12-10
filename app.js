const child_process = require("child_process");
const fs = require('fs');

const argumentos = process.argv.slice(2);
const archivoCotizacion = argumentos[0];
const extension = argumentos[1];
const indicadorEconomico = argumentos[2].toLowerCase();
const valorEnPesos = argumentos[3];

const validar = () => {
    let valida = true;
    const indicadores = ['uf', 'ivp', 'dolar', 'dolar_intercambio', 'euro', 'utm', 'ipc', 'imacec', 'tpm', 'tasa_desempleo', 'libra_cobre', 'bitcoin'];
    const encontradoIndicador = indicadores.find(i => i == indicadorEconomico);

    if (!encontradoIndicador) return valida = false;
    if (!Number(valorEnPesos)) return valida = false;
    return valida;
}

const leerInstrucciones = () => {
    fs.readFile("leeme.txt", 'utf8', (err, data) => {
        err ? console.log("Upss, ha ocurrido un error en la lectura: ", error) : console.log(data);
    })
}

async function ejecutar(archivo) {
    child_process.exec(`node ${archivo} ${archivoCotizacion} ${extension} ${indicadorEconomico} ${valorEnPesos}`, function(err, result) {
        if (err) {
            console.log('Error de child process', err);
        }
        console.log('result de child process', result)
    });
}

// Async/await
const principal = async() => {
    try {
        if (!Number(valorEnPesos)) {
            leerInstrucciones();
        }
        const validacion = validar();
        console.log(validacion);
        if (validacion) {
            const respuesta = await ejecutar("index.js");
            //console.log(respuesta);
        }
    } catch (error) {
        console.log(error);
    }
};

principal();