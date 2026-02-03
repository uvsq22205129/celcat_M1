const https = require('https');

async function getRoomBat(bat){
    return new Promise((resolve, reject) =>{
        const getData = `searchTerm=${bat}&pageSize=1000&resType=102`;
        const options = {
            hostname: 'edt.uvsq.fr',
            port: 443,
            path: '/Home/ReadResourceListItems',
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': getData.length,
            }
        };
        const req = https.request(options, (res) =>{
            let data = '';
            res.on('data', (chunck) => {
                data += chunck;
            });

            res.on('end', () => {
                try {
                    resolve(data);
                } catch (e) {
                    reject("");
                    console.error('Erreur lors de la conversion en JSON:', e);
                }
            });
        });

        req.write(getData);
        req.end();
    });   
}

async function postRoom (room) {
    
}

async function getListSalle(bat){
    const data = await getRoomBat(bat);
    dataRoom = JSON.parse(data);
    //à finir d'implementer
    const promises = dataRoom.map(room =>postRoom(room).then());
    const rep = await Promise.all(promises);
    return rep;
}