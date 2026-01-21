const https = require('https');
const viewType = require("./viewType");

class celcatToJson {
    /**
     * 
     * @property {string} url - URL du planning Celcat
     * @property {viewType} viewType - Type de vue (day, week, month)
    */
    constructor(url, viewType){
        this.url = url;
        this.viewType = viewType;
    }

    /**
     * @property {string} start
     * @property {string} end
     * @property {string} resType
     * @property {string} groupisd
     * @property {string} colourScheme
     * @returns {string} - Données du calendrier en JSON
     */
    postCalandarData(start, end, resType, groupid, colourScheme){
        return new Promise((resolve, reject) => {
            const postData = `start=${start}&end=${end}&resType=${resType}&federationIds%5B%5D=${groupid}&colourScheme=${colourScheme}&calView=${this.viewType}`;
            const options = {
                hostname: 'edt.uvsq.fr',
                port: 443,
                path: '/Home/GetCalendarData',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': postData.length,
                }
            };
            const req = https.request(options, (res) => {
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
            }
        );
    }
    async getCalandarData(start, end, resType, groupid, colourScheme){
        const data = await this.postCalandarData(start, end, resType, groupid, colourScheme);
        return JSON.parse(data);
    }
}

module.exports = celcatToJson;