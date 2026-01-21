const celcatToJson = require('./celcatToJson');
const viewType = require('./viewType');
const jsonToCours = require('./jsonToCours');

class Calendar{
    /**
     * 
     * @param {[group]} groups 
     * @param {string} startDate 
     * @param {string} endDate 
     * @param {viewType} viewType 
     */
    constructor(groups, startDate, endDate, viewType){
        this.groups = groups;
        this.startDate = startDate;
        this.endDate = endDate;
        this.viewType = viewType;
    }

    addGroup(group){
        if (this.groups.indexOf(group) === -1){
            this.groups.push(group);
        }
    }
    removeGroup(group){
        const index = this.groups.indexOf(group);
        if (index !== -1){
            this.groups.splice(index, 1);
        }
    }

    getCoursWork(){
        return new Promise((resolve, reject) => {
            const coursList = [];
            for (let i = 0; i < this.groups.length; i++){
                const group = this.groups[i];
                const celcat = new celcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", this.viewType);
                celcat.getCalandarData(this.startDate, this.endDate, '103', group.groupCode, '3').then(result => {
                    const cours = new jsonToCours(result).getCoursList();
                    for (const cour of cours){
                        if (cour.title.includes(group.UECode) && !coursList.includes(cour)){
                            coursList.push(cour);
                        }
                    }
                    // console.log(coursList);
                    resolve(coursList);
                }).catch(error => {
                    console.error("Error fetching calendar data:", error);
                    reject(error);
                });
            }
        });
    }
    async getCours(){
        const cours = await this.getCoursWork();
        return cours;
    }
}
module.exports = Calendar;