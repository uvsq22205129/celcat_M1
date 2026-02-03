const https = require('https');

class CelcatGroups{
    constructor(resType='103'){
        this.hostname = 'edt.uvsq.fr';
        this.port = 443;
        this.path = '/Home/ReadResourceListItems';
        this.resType = resType;
        //'?myResources=false&searchTerm=m1%20info&pageSize=10&pageNumber=1&resType=103'
    }

    getRessouces(ressource){
        return new Promise((resolve, reject)=>{
            const postData = `myResources=false&searchTerm=${ressource}&pageSize=15&pageNumber=1&resType=${this.resType}`;
            const options = {
                hostname: this.hostname,
                port: this.port,
                path: this.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': postData.length,
                }
            };
            const req = https.request(options, (res)=>{
                let data = '';

                // Écoute les données reçues
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // À la fin de la réponse, traite les données
                res.on('end', () => {
                    try {
                        resolve(data);
                    } catch (e) {
                        console.error('Erreur lors de la conversion en JSON:', e);
                    }
                });
            });

            req.on('error', (e) => {
                console.error(`Problème avec la requête: ${e.message}`);
            });
        
            // Écrit les données POST dans le corps de la requête
            req.write(postData);
            req.end();

        });
    }

    async getJson(ressource){
        const data = await this.getRessouces(ressource);
        return data;
    }

}

module.exports = CelcatGroups;