const group = require("./group")
const ListGroup = require("./listGroup");
const fs = require('fs');
const celcatToJson = require('./celcatToJson');
const jsonToCours = require('./jsonToCours');
const viewType = require('./viewType');

class Edt{
    /**
     * 
     * @param {String} user 
     * @param {String} view 
     * @param {String} spec 
     */
    constructor(userid, view, spec){
        this.userid = userid;
        this.view = view;
        this.spec = spec;
    }
    
    getGroup(authorId){
        const listGroup = new ListGroup();
        try {
            const data = fs.readFileSync(`src/${authorId}.edt`, 'utf8');
            const lines = data.split('\n');
            for (const line of lines) {
                if (line.trim() === '') continue; // Skip empty lines
                const [ueCode, tdNumber] = line.split(' ');
                console.log(`Loaded group for ${authorId}: UE=${ueCode}, TD=${tdNumber}`);
                const groupObj = new group(ueCode, tdNumber);
                listGroup.addGroup(groupObj);
            }
        } catch (err) {
            console.error(`Error reading file for ${authorId}:`, err);
        }
        return listGroup;
    }

    getDate(){
        let specDate = new Date();
        specDate.setHours(specDate.getHours() + 1);
        if(this.spec != null){
            if(this.spec.split('/').length == 2){
                const parts = this.spec.split('/');
                specDate.setDate(Number(parts[0]));
                specDate.setMonth(Number(parts[1]-1));
            }else{
                let mult = 1;
                if(this.view=="week"){mult=7;}
                if(this.spec.split("+").length == 2){
                    const addDay = Number(this.spec.split("+")[1]) * mult;
                    specDate.setDate(specDate.getDate() + addDay);
                }else if(this.spec.split("-").length == 2){
                    const subDay = Number(this.spec.split('-')[1]) * mult;
                    specDate.setDate(specDate.getDate() - subDay);
                }
            } 
                
        }
        const referenceDate = specDate;
        let startDate, endDate;
        
        switch(this.view){
            case "day":
                startDate = referenceDate.toISOString().split('T')[0];
                const endTime = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
                endDate = startDate;
                break;
            case "tomorrow":
                const firstDay = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
                const lastDay = new Date(referenceDate.setDate(firstDay.getDate() + 1));
                startDate = firstDay.toISOString().split('T')[0];
                endDate = startDate;
                break;
            case "week":
                const firstDayOfWeek = new Date(referenceDate.setDate(referenceDate.getDate() - referenceDate.getDay()));
                const lastDayOfWeek = new Date(referenceDate.setDate(firstDayOfWeek.getDate() + 6));
                startDate = firstDayOfWeek.toISOString().split('T')[0];
                endDate = lastDayOfWeek.toISOString().split('T')[0];
                break;
            case "month":
                const firstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
                const lastDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
                startDate = firstDayOfMonth.toISOString().split('T')[0];
                endDate = lastDayOfMonth.toISOString().split('T')[0];
                break;
            default:
                startDate = referenceDate.toISOString().split('T')[0];
                const end = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
                endDate = end.toISOString().split('T')[0];
                break;
        }
        console.log("startDate:", startDate, "endDate:", endDate);
        return {startDate, endDate};
    }

    getCoursList(startDate, endDate){
        return new Promise((resolve, reject) => {
            let coursList = [];
            const listGroups = this.getGroup(this.userid);
            const celcat = new celcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", viewType.WEEK);
            const promises = [];

            listGroups.groups.keys().forEach(groupCode => {
                const UECodes = listGroups.getUeFromGroupCode(groupCode);
                promises.push(
                    // celcat.getCalandarData(startDate,endDate,"103",`M1+Info+gr.+${groupCode}`, "3").then(datacelcat => {
                    celcat.getCalandarData(startDate,endDate,"103",`${groupCode}`, "3").then(datacelcat => {
                        const jsonCours = new jsonToCours(datacelcat);
                        jsonCours.getCoursList().forEach(
                            (jsonCours) => {
                                UECodes.forEach(ue => {
                                    console.log("checking",jsonCours.title, "for ue", ue);
                                    jsonCours.title.forEach(code=>{
                                        if(code.includes(ue)){
                                            coursList.push(jsonCours);
                                        }
                                    });
                                });
                            }
                        );

                    })
                );
            });
            // Attend que toutes les promesses soient résolues
            Promise.all(promises)
                .then(() => {
                    console.log("Voici tes cours :", coursList);
                    resolve(coursList);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async getStringEdt(rep){
        const tab = '  ';
        const {startDate, endDate} = this.getDate();
        const coursList = await this.getCoursList(startDate, endDate);
        
        coursList.sort((a, b) => {
            if (a.startDate === b.startDate) {
                return a.startTime.localeCompare(b.startTime);
            }
            return a.startDate.localeCompare(b.startDate);
        });
        let last_day = '';
        coursList.forEach(cours => {
            if(last_day !== cours.getDay()){
                rep += `- **${cours.getDay()}**:\n`;
                last_day = cours.getDay();
            }
            rep += `${tab}- ${cours.title} (${cours.getStartTime()} - ${cours.getEndTime()})\
                    \n\t${cours.description} ${cours.location}\
                    \n\t${cours.type}
                    \n`;
        });
        if(coursList.length === 0){
            rep = 'Pas de cours aujourd\'hui batard';
        }
        return rep;
    }

}

module.exports = {Edt};