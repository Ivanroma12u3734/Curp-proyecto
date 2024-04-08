
const axios = require('axios');
const { MongoClient } = require('mongodb'); 
const { DateTime } = require('luxon');
const readline = require('readline');

// Conexión
async function conectarMongoDB() {
    const url = "mongodb://localhost:27017/";
    const dbName = "Datos_de_curp"; 
    
    const client = new MongoClient(url);
    await client.connect();
    return client.db(dbName).collection("personas");
}

async function obtener_curp(nombre, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, collection) {
    const url = "https://www.gob.mx/curp/api/curp"; 
    const headers = {
        "Content-Type": "application/json" 
    };
    const payload = {
        "nombre": nombre,
        "apellido_paterno": apellido_paterno,
        "apellido_materno": apellido_materno,
        "fecha_nacimiento": fecha_nacimiento,
        "estado_nacimiento": estado_nacimiento
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 200) {
            const data = response.data;
            const curp = data.curp;
            console.log("La CURP es:", curp);
        
            insertar_persona(nombre, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, curp, collection);
        } else {
            console.log("Hubo un error al obtener la CURP. Código de estado:", response.status);
        }
    } catch (error) {
        console.error("Hubo un error al realizar la solicitud:", error);
    }
}

async function insertar_persona(nombre, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, curp, collection) {
    const persona = {
        "nombre": nombre,
        "apellido_paterno": apellido_paterno,
        "apellido_materno": apellido_materno,
        "fecha_nacimiento": fecha_nacimiento,
        "estado_nacimiento": estado_nacimiento,
        "curp": curp
    };
    try {
        await collection.insertOne(persona);
        console.log("Persona insertada correctamente en MongoDB.");
    } catch (error) {
        console.error("Error al insertar la persona en MongoDB:", error);
    }
}

function leerEntrada(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}


(async () => {
    const nombre = await leerEntrada("Nombre: ");
    const apellido_paterno = await leerEntrada("Apellido paterno: ");
    const apellido_materno = await leerEntrada("Apellido materno: ");
    const fecha_nacimiento = await leerEntrada("Fecha de nacimiento (YYYY-MM-DD): ");
    const estado_nacimiento = await leerEntrada("Estado de nacimiento: ");

    const collection = await conectarMongoDB();
    obtener_curp(nombre, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, collection);
})();
